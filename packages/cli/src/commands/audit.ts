import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import pc from 'picocolors';
import { loadConfig } from '../config.js';
import { runAllGates } from '../runner.js';
import { renderMarkdownReport, renderResults } from '../report.js';
import { writeProposedBaseline } from '../baseline.js';
import { ASDLC_DIR, readState, writeState } from '../state.js';
import { loadWaivers } from '../waivers.js';
import { countGovernedConcepts } from '../gates/registry.js';
import { computeDriftScore, badgeJson } from '../score.js';

// "asdlc audit" — read-only diagnosis (S3 Stage 1 / Stage 4).
// Writes only reports, a PROPOSED baseline, and the drift-score badge under
// .asdlc/; applying anything is a separate GOVERN operation with human
// approval (`asdlc baseline accept`).
export async function auditCommand(root: string, opts: { score?: boolean } = {}): Promise<void> {
  const config = loadConfig(root);
  const date = new Date().toISOString().slice(0, 10);
  const results = await runAllGates(root, config);

  const drift = computeDriftScore(results, loadWaivers(root), countGovernedConcepts(root, config));

  if (opts.score) {
    // Script-friendly: exactly one line on stdout.
    console.log(`${drift.band} ${drift.score}`);
    return;
  }

  const dir = join(root, ASDLC_DIR, 'reports', date);
  mkdirSync(dir, { recursive: true });
  const scoreLine = [
    '',
    `## Drift score: ${drift.band} (${drift.score}/100)`,
    '',
    `open ${drift.components.open} · baseline ${drift.components.baseline} · waived ${drift.components.waived}` +
    ` · expired waivers ${drift.components.expired_waivers} · governed concepts ${drift.components.governed}` +
    ` · gate coverage ${drift.components.coverage}/${results.length}`,
    '',
    '_The score measures governance activity, not correctness — see docs/DRIFT_SCORE.md._',
  ].join('\n');
  writeFileSync(join(dir, 'audit.md'), renderMarkdownReport(results, date) + scoreLine);
  writeFileSync(join(root, ASDLC_DIR, 'badge.json'), badgeJson(drift));

  const allFindings = results.flatMap((r) => r.findings);
  const proposedPath = join(dir, 'proposed-baseline.json');
  writeProposedBaseline(root, allFindings, proposedPath);

  const state = readState(root);
  if (state) writeState(root, { ...state, last_audit: date });

  console.log(renderResults(results, false));
  console.log('');
  const bandColor = drift.band === 'A' || drift.band === 'B' ? pc.green : drift.band === 'C' ? pc.yellow : pc.red;
  console.log(pc.bold(`Drift score: ${bandColor(`${drift.band} (${drift.score}/100)`)}`) +
    pc.dim(` — open ${drift.components.open}, baseline ${drift.components.baseline}, coverage ${drift.components.coverage}/${results.length}, governed ${drift.components.governed}`));
  console.log(pc.bold(`Audit written: ${join('.asdlc/reports', date, 'audit.md')}`) +
    pc.dim(` · badge: .asdlc/badge.json (shields.io endpoint format)`));
  console.log(`Proposed baseline (${allFindings.length} findings, PROPOSED_NOT_ACCEPTED): ${join('.asdlc/reports', date, 'proposed-baseline.json')}`);
  console.log(pc.dim('Accepting it is a GOVERN operation: asdlc baseline accept --from <file> --approved-by <human> --approval-ref <pointer>'));
}
