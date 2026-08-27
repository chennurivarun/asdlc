// Governance self-tests: the enforcement machinery proves itself before it
// judges anyone else's code. These mirror the five self-checks the playbook's
// pilot install ran: expired waiver, new finding, scanner crash, lifecycle,
// fingerprint stability.
import { describe, it, expect } from 'vitest';
import { mkdtempSync, writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { fingerprint, makeFinding } from '../src/fingerprint.js';
import { evaluateGate } from '../src/baseline.js';
import { loadWaivers, activeWaiverFingerprints } from '../src/waivers.js';
import { runAllGates, overallExitCode } from '../src/runner.js';
import { defaultConfig } from '../src/config.js';
import { readState, writeState } from '../src/state.js';

function tempRepo(): string {
  const root = mkdtempSync(join(tmpdir(), 'asdlc-test-'));
  mkdirSync(join(root, '.asdlc'), { recursive: true });
  return root;
}

describe('fingerprint stability', () => {
  it('is line-independent and stable across identical inputs', () => {
    expect(fingerprint('duplication', 'clone', 'src/a.ts', 'src/b.ts'))
      .toBe(fingerprint('duplication', 'clone', './src/a.ts', 'src/b.ts'));
  });
  it('differs when the finding actually differs', () => {
    expect(fingerprint('duplication', 'clone', 'src/a.ts', 'src/b.ts'))
      .not.toBe(fingerprint('duplication', 'clone', 'src/a.ts', 'src/c.ts'));
  });
});

describe('legacy baseline semantics', () => {
  const finding = makeFinding('duplication', 'clone', 'src/a.ts', 'src/b.ts', 'clone');
  it('baselined finding does not fail; new finding fails', () => {
    const baselined = evaluateGate('duplication', [finding], new Set([finding.fingerprint]), new Set(), 'legacy');
    expect(baselined.status).toBe('PASS_WITH_FINDINGS');
    const fresh = evaluateGate('duplication', [finding], new Set(), new Set(), 'legacy');
    expect(fresh.status).toBe('FAIL');
    expect(fresh.newFindings).toHaveLength(1);
  });
  it('greenfield mode fails on any unwaived finding, baseline or not', () => {
    const r = evaluateGate('duplication', [finding], new Set([finding.fingerprint]), new Set(), 'greenfield');
    expect(r.status).toBe('FAIL');
  });
});

describe('waiver lifecycle', () => {
  const fp = fingerprint('duplication', 'clone', 'src/a.ts', 'src/b.ts');
  const waiver = (expires: string) => `waivers:
  - id: W-0001
    gate: duplication
    scope: src/a.ts
    fingerprint: "${fp}"
    reason: intentional platform fork
    approved_by: varun
    approval_ref: "PR #1 review"
    approved_on: 2026-01-01
    expires_on: ${expires}
`;
  it('a valid waiver suppresses its finding', () => {
    const root = tempRepo();
    writeFileSync(join(root, '.asdlc/waivers.yml'), waiver('2999-01-01'));
    const active = activeWaiverFingerprints(loadWaivers(root));
    const finding = makeFinding('duplication', 'clone', 'src/a.ts', 'src/b.ts', 'clone');
    expect(evaluateGate('duplication', [finding], new Set(), active, 'legacy').status)
      .toBe('PASS_WITH_FINDINGS');
  });
  it('an EXPIRED waiver stops suppressing — the finding turns red again', () => {
    const root = tempRepo();
    writeFileSync(join(root, '.asdlc/waivers.yml'), waiver('2020-01-01'));
    const check = loadWaivers(root);
    expect(check.expired).toHaveLength(1);
    const active = activeWaiverFingerprints(check);
    const finding = makeFinding('duplication', 'clone', 'src/a.ts', 'src/b.ts', 'clone');
    expect(evaluateGate('duplication', [finding], new Set(), active, 'legacy').status).toBe('FAIL');
  });
  it('a malformed waiver is reported, not silently honored', () => {
    const root = tempRepo();
    writeFileSync(join(root, '.asdlc/waivers.yml'), 'waivers:\n  - id: W-0002\n    gate: duplication\n');
    expect(loadWaivers(root).malformed).toHaveLength(1);
  });
});

describe('crash honesty', () => {
  it('a crashed scanner reports ERROR, never PASS, and the run is red', async () => {
    const root = tempRepo();
    const config = { ...defaultConfig(), gates: {
      duplication: { enabled: true }, boundaries: { enabled: false },
      patterns: { enabled: false }, registry: { enabled: false }, contracts: { enabled: false },
    } };
    const results = await runAllGates(root, config, {
      duplication: async () => { throw new Error('scanner exploded'); },
    });
    const dup = results.find((r) => r.gate === 'duplication')!;
    expect(dup.status).toBe('ERROR');
    expect(overallExitCode(results)).toBe(1);
  });
  it('an unconfigured gate is SKIPPED with a reason — SKIPPED is not PASS', async () => {
    const root = tempRepo();
    const config = { ...defaultConfig(), gates: {
      duplication: { enabled: false }, boundaries: { enabled: false },
      patterns: { enabled: false }, registry: { enabled: false }, contracts: { enabled: true },
    }, contracts_command: null };
    const results = await runAllGates(root, config);
    const c = results.find((r) => r.gate === 'contracts')!;
    expect(c.status).toBe('SKIPPED');
    expect(c.detail).toContain('not configured');
  });
});

describe('install lifecycle', () => {
  it('missing state is null; a partial state file degrades to PARTIAL, never ACTIVE', () => {
    const root = tempRepo();
    expect(readState(root)).toBeNull();
    writeFileSync(join(root, '.asdlc/state.yml'), 'schema_version: 1\n');
    expect(readState(root)!.status).toBe('PARTIAL');
  });
  it('round-trips state', () => {
    const root = tempRepo();
    writeState(root, {
      schema_version: 1, playbook_version: '3.1.1', status: 'ACTIVE', mode: 'legacy',
      config_revision: 1, baseline_revision: 2, last_audit: '2026-08-27',
    });
    expect(readState(root)!.baseline_revision).toBe(2);
  });
});
