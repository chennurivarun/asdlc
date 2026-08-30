// Governance self-tests: the enforcement machinery proves itself before it
// judges anyone else's code. These mirror the five self-checks the playbook's
// pilot install ran: expired waiver, new finding, scanner crash, lifecycle,
// fingerprint stability.
import { describe, it, expect } from 'vitest';
import { mkdtempSync, writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { fingerprint, makeFinding, contentHash, occurrence } from '../src/fingerprint.js';
import { tokenizeCommand } from '../src/gates/contracts.js';
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
  it('content hash ignores whitespace/moves but changes with content', () => {
    expect(contentHash('const a = 1;\n  const b = 2;')).toBe(contentHash('const a = 1; const b = 2;'));
    expect(contentHash('const a = 1;')).not.toBe(contentHash('const a = 2;'));
  });
  it('identical matches get deterministic distinct symbols — a NEW duplicate cannot hide behind a baselined one', () => {
    const counts = new Map<string, number>();
    const s1 = occurrence(counts, 'abc');
    const s2 = occurrence(counts, 'abc');
    const s3 = occurrence(counts, 'abc');
    expect(new Set([s1, s2, s3]).size).toBe(3);
    // Deterministic across runs: same sequence yields same symbols.
    const counts2 = new Map<string, number>();
    expect([occurrence(counts2, 'abc'), occurrence(counts2, 'abc')]).toEqual([s1, s2]);
  });
});

describe('contracts command tokenization (no shell)', () => {
  it('splits words and preserves quoted args, without shell metacharacter power', () => {
    expect(tokenizeCommand('npm test -- tests/contracts')).toEqual(['npm', 'test', '--', 'tests/contracts']);
    expect(tokenizeCommand('vitest run "my dir/contracts"')).toEqual(['vitest', 'run', 'my dir/contracts']);
    // `;` survives only as a literal argument, never as a command separator.
    expect(tokenizeCommand('echo hi; rm -rf /')).toEqual(['echo', 'hi;', 'rm', '-rf', '/']);
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
    approved_by: reviewer
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

describe('waiver draft protocol', () => {
  it('a drafted waiver is malformed (inactive) until a human fills the approval fields', async () => {
    const { waiverDraftCommand } = await import('../src/commands/waiver.js');
    const root = tempRepo();
    writeFileSync(join(root, '.asdlc/waivers.yml'), 'waivers: []\n');
    waiverDraftCommand(root, {
      fingerprint: 'abcdef0123456789', gate: 'duplication',
      scope: 'src/a.ts', reason: 'intentional platform fork',
    });
    const check = loadWaivers(root);
    expect(check.valid).toHaveLength(0);       // not suppressing anything
    expect(check.malformed).toHaveLength(1);   // flagged red until approved
    expect(check.malformed[0].missing).toEqual(
      expect.arrayContaining(['approved_by', 'approval_ref', 'approved_on']));
  });
});

describe('drift score', () => {
  const emptyWaivers = { valid: [], expired: [], malformed: [] };
  const gate = (over: Partial<import('../src/types.js').GateResult>): import('../src/types.js').GateResult => ({
    gate: 'duplication', status: 'PASS', findings: [], newFindings: [], baselined: 0, waived: 0, ...over,
  });
  const fiveGates = (over?: Partial<import('../src/types.js').GateResult>) => [
    gate({ gate: 'duplication', ...over }), gate({ gate: 'boundaries' }), gate({ gate: 'patterns' }),
    gate({ gate: 'registry' }), gate({ gate: 'contracts' }),
  ];

  it('fully governed green repo scores A', async () => {
    const { computeDriftScore } = await import('../src/score.js');
    const s = computeDriftScore(fiveGates(), emptyWaivers, 5);
    expect(s.score).toBe(100);
    expect(s.band).toBe('A');
  });
  it('no registry costs 30 points — meaning living nowhere is the cardinal gap', async () => {
    const { computeDriftScore } = await import('../src/score.js');
    const s = computeDriftScore(fiveGates(), emptyWaivers, 0);
    expect(s.score).toBe(70);
    expect(s.band).toBe('C');
  });
  it('open findings and dead gates drag the score', async () => {
    const { computeDriftScore } = await import('../src/score.js');
    const finding = makeFinding('duplication', 'clone', 'a.ts', 'b.ts', 'x');
    const results = fiveGates({ status: 'FAIL', newFindings: Array(10).fill(finding) });
    results[2] = { ...results[2], status: 'ERROR' };
    results[4] = { ...results[4], status: 'SKIPPED' };
    const s = computeDriftScore(results, emptyWaivers, 3);
    // 100 − 25 (10 open) − 10 (coverage 3/5) = 65
    expect(s.score).toBe(65);
    expect(s.band).toBe('C');
    expect(s.components.coverage).toBe(3);
  });
  it('badge json is shields-endpoint shaped', async () => {
    const { computeDriftScore, badgeJson } = await import('../src/score.js');
    const b = JSON.parse(badgeJson(computeDriftScore(fiveGates(), emptyWaivers, 5)));
    expect(b).toMatchObject({ schemaVersion: 1, label: 'drift', message: 'A 100', color: 'brightgreen' });
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
