import { spawnSync } from 'node:child_process';
import { readFileSync, mkdtempSync, existsSync, rmSync } from 'node:fs';
import { join, dirname, basename } from 'node:path';
import { tmpdir } from 'node:os';
import { createRequire } from 'node:module';
import { makeFinding, contentHash, occurrence, normalizePath } from '../fingerprint.js';
import type { Config, Finding } from '../types.js';

export interface JscpdDuplicate {
  firstFile: { name: string };
  secondFile: { name: string };
  lines: number;
  tokens: number;
  fragment?: string;
}

// jscpd's exports map blocks package.json resolution and its ESM entry is
// broken on Node >= 22, so locate the package root by walking up from the
// resolved entry (path-separator agnostic) and drive the stable CLI binary.
function resolveJscpdBin(): string {
  const require = createRequire(import.meta.url);
  let dir = dirname(require.resolve('jscpd'));
  while (basename(dir) !== 'jscpd' && dirname(dir) !== dir) dir = dirname(dir);
  const bin = join(dir, 'bin', 'jscpd');
  if (basename(dir) !== 'jscpd' || !existsSync(bin)) {
    throw new Error(`jscpd binary not found (searched from ${dir})`);
  }
  return bin;
}

// Maps jscpd duplicates to findings. Both paths are canonicalized BEFORE
// sorting and before entering the symbol/message: jscpd emits native
// separators on Windows, both paths participate in the fingerprint, and the
// same logical clone must fingerprint identically on every OS (issue #1).
// Distinct clone groups between the same file pair must not share a
// fingerprint (a new clone would pass as baselined): identity includes a
// hash of the cloned fragment, with deterministic #n suffixes as backstop.
export function mapClones(duplicates: JscpdDuplicate[]): Finding[] {
  const counts = new Map<string, number>();
  return duplicates.map((d) => {
    const [a, b] = [d.firstFile.name, d.secondFile.name].map(normalizePath).sort();
    const frag = contentHash(d.fragment ?? `${d.lines}:${d.tokens}`);
    return makeFinding(
      'duplication', 'clone', a, occurrence(counts, `${b}@${frag}`),
      `${d.lines}-line clone shared with ${b}`,
    );
  });
}

// G1 — clone detection via jscpd (open-source, wrapped not rewritten).
// Returns findings or throws; the caller maps a throw to ERROR, never PASS.
export function runDuplicationGate(root: string, config: Config): Finding[] {
  const bin = resolveJscpdBin();
  const out = mkdtempSync(join(tmpdir(), 'asdlc-jscpd-'));
  try {
    const args = [
      bin,
      ...config.source_dirs.filter((d) => existsSync(join(root, d))),
      '--reporters', 'json',
      '--output', out,
      '--min-tokens', String(config.min_tokens),
      '--silent',
      '--ignore', config.exclude.join(','),
    ];
    const res = spawnSync(process.execPath, args, { cwd: root, encoding: 'utf8', timeout: 300_000 });
    const reportPath = join(out, 'jscpd-report.json');
    if (!existsSync(reportPath)) {
      throw new Error(`jscpd produced no report (exit ${res.status}): ${res.stderr?.slice(0, 400)}`);
    }
    const report = JSON.parse(readFileSync(reportPath, 'utf8')) as { duplicates?: JscpdDuplicate[] };
    return mapClones(report.duplicates ?? []);
  } finally {
    rmSync(out, { recursive: true, force: true });
  }
}
