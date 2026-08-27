import { spawnSync } from 'node:child_process';
import { makeFinding } from '../fingerprint.js';
import type { Config, Finding } from '../types.js';

// G5 — contract-profile suites. ASDLC does not own test semantics; it runs the
// repo's configured contract command (e.g. "npm test -- tests/contracts") and
// translates a failure into a finding. Unconfigured → SKIPPED, never PASS.
export function runContractsGate(root: string, config: Config): Finding[] | 'UNCONFIGURED' {
  if (!config.contracts_command) return 'UNCONFIGURED';
  const res = spawnSync(config.contracts_command, {
    cwd: root, shell: true, encoding: 'utf8', timeout: 900_000,
  });
  if (res.status === null) {
    throw new Error(`contract suite did not complete: ${res.stderr?.slice(0, 400)}`);
  }
  if (res.status !== 0) {
    return [makeFinding('contracts', 'contract-suite-failed', 'tests/contracts', '-',
      `Contract command exited ${res.status}. Tail: ${(res.stdout + res.stderr).slice(-500)}`)];
  }
  return [];
}
