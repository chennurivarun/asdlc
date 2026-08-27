import { spawnSync } from 'node:child_process';
import { makeFinding } from '../fingerprint.js';
import type { Config, Finding } from '../types.js';

// Tokenize a command string without a shell: whitespace-split with double/single
// quote grouping. No metacharacter interpretation — config cannot smuggle
// `;`/`&&`/backticks into a shell (defense-in-depth; config is GOVERN-owned).
export function tokenizeCommand(command: string): string[] {
  const tokens = command.match(/"[^"]*"|'[^']*'|\S+/g) ?? [];
  return tokens.map((t) => t.replace(/^(["'])(.*)\1$/, '$2'));
}

// G5 — contract-profile suites. ASDLC does not own test semantics; it runs the
// repo's configured contract command (e.g. "npm test -- tests/contracts") and
// translates a failure into a finding. Unconfigured → SKIPPED, never PASS.
export function runContractsGate(root: string, config: Config): Finding[] | 'UNCONFIGURED' {
  if (!config.contracts_command) return 'UNCONFIGURED';
  const [cmd, ...args] = tokenizeCommand(config.contracts_command);
  if (!cmd) return 'UNCONFIGURED';
  const res = spawnSync(cmd, args, {
    cwd: root, shell: false, encoding: 'utf8', timeout: 900_000,
  });
  if (res.error || res.status === null) {
    throw new Error(`contract suite could not run: ${res.error?.message ?? res.stderr?.slice(0, 400)}`);
  }
  if (res.status !== 0) {
    return [makeFinding('contracts', 'contract-suite-failed', 'tests/contracts', '-',
      `Contract command exited ${res.status}. Tail: ${(res.stdout + res.stderr).slice(-500)}`)];
  }
  return [];
}
