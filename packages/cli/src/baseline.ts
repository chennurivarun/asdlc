import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { ASDLC_DIR } from './state.js';
import type { Finding, GateResult, GateId, Mode } from './types.js';

interface BaselineFile {
  accepted: string[]; // fingerprints
}

export function baselinePath(root: string): string {
  return join(root, ASDLC_DIR, 'baseline.json');
}

export function loadBaseline(root: string): Set<string> {
  const p = baselinePath(root);
  if (!existsSync(p)) return new Set();
  const doc = JSON.parse(readFileSync(p, 'utf8')) as BaselineFile;
  return new Set(doc.accepted ?? []);
}

export function writeProposedBaseline(root: string, findings: Finding[], file: string): void {
  const doc: BaselineFile = { accepted: [...new Set(findings.map((f) => f.fingerprint))].sort() };
  writeFileSync(file, JSON.stringify(doc, null, 2));
}

// Pure evaluation: given raw findings, decide the gate verdict.
// Greenfield: any unwaived finding fails. Legacy: only NEW (unbaselined, unwaived) fails.
export function evaluateGate(
  gate: GateId,
  findings: Finding[],
  baseline: Set<string>,
  waived: Set<string>,
  mode: Mode,
): GateResult {
  const unwaived = findings.filter((f) => !waived.has(f.fingerprint));
  const newFindings = mode === 'legacy'
    ? unwaived.filter((f) => !baseline.has(f.fingerprint))
    : unwaived;
  const waivedCount = findings.length - unwaived.length;
  const baselinedCount = mode === 'legacy'
    ? unwaived.length - newFindings.length
    : 0;
  const status = newFindings.length > 0
    ? 'FAIL'
    : findings.length > 0 ? 'PASS_WITH_FINDINGS' : 'PASS';
  return { gate, status, findings, newFindings, baselined: baselinedCount, waived: waivedCount };
}
