import { spawnSync } from 'node:child_process';
import { existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { makeFinding, contentHash, occurrence, normalizePath } from '../fingerprint.js';
import type { Config, Finding } from '../types.js';

// G3 — governed pattern rules via Semgrep (external binary; Python tool).
// Missing binary or missing rules → the caller reports SKIPPED/ERROR, never PASS.
export function semgrepAvailable(): boolean {
  const res = spawnSync('semgrep', ['--version'], { encoding: 'utf8', timeout: 20_000 });
  return res.status === 0;
}

export function runPatternsGate(root: string, config: Config): Finding[] | 'UNCONFIGURED' | 'TOOL_MISSING' {
  const rulesDir = join(root, config.semgrep_rules_dir);
  if (!existsSync(rulesDir) || readdirSync(rulesDir).filter((f) => /\.ya?ml$/.test(f)).length === 0) {
    return 'UNCONFIGURED';
  }
  if (!semgrepAvailable()) return 'TOOL_MISSING';

  const res = spawnSync(
    'semgrep',
    ['scan', '--config', rulesDir, '--json', '--quiet', '--metrics', 'off',
      // Top-level `exclude` is global across gates (issue #3).
      ...config.exclude.flatMap((g) => ['--exclude', g]),
      ...config.source_dirs.filter((d) => existsSync(join(root, d)))],
    { cwd: root, encoding: 'utf8', timeout: 600_000, maxBuffer: 64 * 1024 * 1024 },
  );
  // A nonzero exit is a scanner problem, not a clean scan: parsing its (possibly
  // empty) JSON as findings could turn an error into PASS. ERROR, never PASS.
  if (res.status !== 0 || !res.stdout) {
    throw new Error(`semgrep exited ${res.status ?? 'by signal'}: ${(res.stderr ?? '').slice(0, 400)}`);
  }
  const report = JSON.parse(res.stdout) as {
    results?: { check_id: string; path: string; extra?: { message?: string; lines?: string } }[];
  };
  // Symbol = hash of the matched code (line-independent), with deterministic
  // #n suffixes for identical matches so distinct violations never share a
  // fingerprint — a new match must not pass as an already-baselined one.
  const counts = new Map<string, number>();
  return (report.results ?? []).map((r) => {
    // Path canonicalized inside the hash input too — same cross-platform
    // fingerprint-stability requirement as the duplication gate (issue #1).
    const base = contentHash(`${r.check_id} ${normalizePath(r.path)} ${r.extra?.lines ?? ''}`);
    return makeFinding('patterns', r.check_id, r.path, occurrence(counts, base),
      r.extra?.message ?? r.check_id);
  });
}
