import { copyFileSync, existsSync } from 'node:fs';
import pc from 'picocolors';
import { baselinePath } from '../baseline.js';
import { readState, writeState } from '../state.js';

// GOVERN: accepting a baseline requires a human approval pointer. An agent
// cannot approve its own governance change (playbook S0) — the CLI enforces
// the record-keeping; the human enforces the truth of it.
export function baselineAcceptCommand(
  root: string,
  opts: { from?: string; approvedBy?: string; approvalRef?: string },
): void {
  if (!opts.from || !existsSync(opts.from)) {
    console.error(pc.red('Provide --from <proposed-baseline.json> produced by `asdlc audit`.'));
    process.exitCode = 1;
    return;
  }
  if (!opts.approvedBy || !opts.approvalRef) {
    console.error(pc.red('Baseline acceptance is a GOVERN operation: --approved-by <human> and --approval-ref <pointer to where approval was given> are required.'));
    process.exitCode = 1;
    return;
  }
  copyFileSync(opts.from, baselinePath(root));
  const state = readState(root);
  if (state) {
    writeState(root, { ...state, baseline_revision: state.baseline_revision + 1 });
  }
  console.log(pc.green(`Baseline accepted (rev ${state ? state.baseline_revision + 1 : '?'}) — approved by ${opts.approvedBy}, ref: ${opts.approvalRef}`));
  console.log('From here, only NEW findings gate. Burn the baseline down via audits.');
}
