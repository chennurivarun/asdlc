import { spawnSync } from 'node:child_process';
import { readFileSync, mkdtempSync, existsSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { createRequire } from 'node:module';
import { makeFinding } from '../fingerprint.js';
import type { Config, Finding } from '../types.js';

interface JscpdDuplicate {
  firstFile: { name: string };
  secondFile: { name: string };
  lines: number;
  tokens: number;
}

// G1 — clone detection via jscpd (open-source, wrapped not rewritten).
// Returns findings or throws; the caller maps a throw to ERROR, never PASS.
export function runDuplicationGate(root: string, config: Config): Finding[] {
  // jscpd's exports map blocks package.json resolution and its ESM entry is
  // broken on Node >= 22, so resolve the package root from its main entry and
  // drive the stable CLI binary instead.
  const require = createRequire(import.meta.url);
  const entry = require.resolve('jscpd');
  const pkgRoot = entry.slice(0, entry.lastIndexOf(`${'node_modules'}/jscpd/`) + 'node_modules/jscpd'.length + 1);
  const bin = join(pkgRoot, 'bin', 'jscpd');
  if (!existsSync(bin)) throw new Error(`jscpd binary not found at ${bin}`);

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
    return (report.duplicates ?? []).map((d) => {
      const [a, b] = [d.firstFile.name, d.secondFile.name].sort();
      return makeFinding(
        'duplication', 'clone', a, b,
        `${d.lines}-line clone shared with ${b}`,
      );
    });
  } finally {
    rmSync(out, { recursive: true, force: true });
  }
}
