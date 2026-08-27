import { spawnSync } from 'node:child_process';
import { existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { makeFinding } from '../fingerprint.js';
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
      ...config.source_dirs.filter((d) => existsSync(join(root, d)))],
    { cwd: root, encoding: 'utf8', timeout: 600_000, maxBuffer: 64 * 1024 * 1024 },
  );
  if (res.status === null || !res.stdout) {
    throw new Error(`semgrep crashed: ${res.stderr?.slice(0, 400)}`);
  }
  const report = JSON.parse(res.stdout) as {
    results?: { check_id: string; path: string; extra?: { message?: string } }[];
  };
  return (report.results ?? []).map((r) =>
    makeFinding('patterns', r.check_id, r.path, '-',
      r.extra?.message ?? r.check_id),
  );
}
