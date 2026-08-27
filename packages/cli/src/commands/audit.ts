import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import pc from 'picocolors';
import { loadConfig } from '../config.js';
import { runAllGates } from '../runner.js';
import { renderMarkdownReport, renderResults } from '../report.js';
import { writeProposedBaseline } from '../baseline.js';
import { ASDLC_DIR, readState, writeState } from '../state.js';

// "asdlc audit" — read-only diagnosis (S3 Stage 1 / Stage 4).
// Writes only reports and a PROPOSED baseline under .asdlc/; applying anything
// is a separate GOVERN operation with human approval (`asdlc baseline accept`).
export async function auditCommand(root: string): Promise<void> {
  const config = loadConfig(root);
  const date = new Date().toISOString().slice(0, 10);
  const results = await runAllGates(root, config);

  const dir = join(root, ASDLC_DIR, 'reports', date);
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, 'audit.md'), renderMarkdownReport(results, date));

  const allFindings = results.flatMap((r) => r.findings);
  const proposedPath = join(dir, 'proposed-baseline.json');
  writeProposedBaseline(root, allFindings, proposedPath);

  const state = readState(root);
  if (state) writeState(root, { ...state, last_audit: date });

  console.log(renderResults(results, false));
  console.log('');
  console.log(pc.bold(`Audit written: ${join('.asdlc/reports', date, 'audit.md')}`));
  console.log(`Proposed baseline (${allFindings.length} findings, PROPOSED_NOT_ACCEPTED): ${join('.asdlc/reports', date, 'proposed-baseline.json')}`);
  console.log(pc.dim('Accepting it is a GOVERN operation: asdlc baseline accept --from <file> --approved-by <human> --approval-ref <pointer>'));
}
