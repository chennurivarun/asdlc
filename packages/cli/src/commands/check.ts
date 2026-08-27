import pc from 'picocolors';
import { readState } from '../state.js';
import { loadConfig } from '../config.js';
import { runAllGates, overallExitCode } from '../runner.js';
import { renderResults } from '../report.js';

// "asdlc check" — the gate wall. Green (legacy: zero NEW) or not done (S2.6).
export async function checkCommand(root: string, opts: { verbose?: boolean }): Promise<void> {
  const state = readState(root);
  if (!state) {
    console.error(pc.red('No ASDLC install found (.asdlc/state.yml missing). Run `asdlc plan`, then `asdlc init`.'));
    process.exitCode = 1;
    return;
  }
  if (state.status === 'SUSPENDED') {
    console.error(pc.yellow('Install is SUSPENDED; checks report but do not gate.'));
  }
  const config = loadConfig(root);
  const results = await runAllGates(root, config);
  console.log(renderResults(results, opts.verbose ?? false));
  const code = overallExitCode(results);
  console.log('');
  if (code === 0) {
    console.log(pc.green(`asdlc check: green (mode ${config.mode} — ${config.mode === 'legacy' ? 'zero NEW findings' : 'zero findings'})`));
  } else {
    console.log(pc.red('asdlc check: RED. Never weaken a check to pass it — fix the finding, or draft a waiver in .asdlc/waivers.yml and stop for human approval.'));
  }
  process.exitCode = state.status === 'SUSPENDED' ? 0 : code;
}
