import type { GateResult } from './types.js';
import type { WaiverCheck } from './waivers.js';

// Drift score v0 — see docs/DRIFT_SCORE.md. Measures governance ACTIVITY,
// not correctness: a high score means the machinery runs and nothing new
// slipped past it, not that the definitions are right.
export interface DriftScore {
  score: number;
  band: 'A' | 'B' | 'C' | 'D' | 'F';
  components: {
    open: number;            // new findings (unbaselined, unwaived)
    baseline: number;        // acknowledged legacy debt
    waived: number;          // active waivers
    expired_waivers: number; // expired, unaddressed
    governed: number;        // registry concepts with a definition
    coverage: number;        // gates actually running (not SKIPPED/ERROR), of 5
  };
}

export function computeDriftScore(
  results: GateResult[],
  waivers: WaiverCheck,
  governedConcepts: number,
): DriftScore {
  const open = results.reduce((n, r) => n + r.newFindings.length, 0);
  const baseline = results.reduce((n, r) => n + r.baselined, 0);
  const waived = waivers.valid.length;
  const expired = waivers.expired.length;
  const coverage = results.filter((r) => r.status !== 'SKIPPED' && r.status !== 'ERROR').length;

  const score = Math.max(0, Math.round(
    100
    - 25 * Math.min(1, open / 10)
    - 15 * Math.min(1, baseline / 200)
    - 5 * Math.min(1, expired)
    - 25 * (1 - coverage / results.length)
    - 30 * (governedConcepts === 0 ? 1 : 0),
  ));

  const band = score >= 90 ? 'A' : score >= 75 ? 'B' : score >= 60 ? 'C' : score >= 40 ? 'D' : 'F';
  return {
    score, band,
    components: { open, baseline, waived, expired_waivers: expired, governed: governedConcepts, coverage },
  };
}

// Shields.io endpoint-badge JSON — serve this file raw and point
// https://img.shields.io/endpoint?url=<raw-url> at it.
export function badgeJson(s: DriftScore): string {
  const color = { A: 'brightgreen', B: 'green', C: 'yellow', D: 'orange', F: 'red' }[s.band];
  return JSON.stringify({
    schemaVersion: 1, label: 'drift', message: `${s.band} ${s.score}`, color,
  }, null, 2);
}
