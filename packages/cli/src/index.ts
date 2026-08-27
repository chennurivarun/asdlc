import { Command } from 'commander';
import { planCommand } from './commands/plan.js';
import { initCommand } from './commands/init.js';
import { checkCommand } from './commands/check.js';
import { auditCommand } from './commands/audit.js';
import { baselineAcceptCommand } from './commands/baseline.js';
import { waiverDraftCommand } from './commands/waiver.js';

const program = new Command();

program
  .name('asdlc')
  .description('ASDLC — anti-drift governance for AI-built codebases (Anti-Drift Playbook v3.1.1)')
  .version('0.1.0');

program.command('plan')
  .description('Read-only: detect the stack and propose an install plan. Changes nothing.')
  .action(() => planCommand(process.cwd()));

program.command('init')
  .description('Install governance: .asdlc/, registry templates, AGENTS.md section, CI workflow.')
  .option('--mode <mode>', 'greenfield | legacy (default: auto-detect)')
  .action((opts) => initCommand(process.cwd(), { mode: opts.mode }));

program.command('check')
  .description('Run all gates. Exit 0 only when green (legacy: zero NEW findings). ERROR never passes.')
  .option('-v, --verbose', 'show all new findings')
  .action((opts) => checkCommand(process.cwd(), opts));

program.command('audit')
  .description('Read-only diagnosis: full gate sweep, markdown report, PROPOSED baseline.')
  .action(() => auditCommand(process.cwd()));

const baseline = program.command('baseline').description('Baseline governance (GOVERN operations).');
baseline.command('accept')
  .description('Accept a proposed baseline. Requires a human approval pointer.')
  .option('--from <file>', 'proposed-baseline.json from an audit')
  .option('--approved-by <human>', 'the approving human')
  .option('--approval-ref <ref>', 'pointer to where approval was given (message/PR/decision note)')
  .action((opts) => baselineAcceptCommand(process.cwd(), opts));

const waiver = program.command('waiver').description('Waiver protocol: agents draft, humans approve.');
waiver.command('draft')
  .description('Draft a waiver for a finding. It stays inactive (and flagged) until a human fills the approval fields.')
  .option('--fingerprint <fp>', 'the 16-hex fingerprint from check output')
  .option('--gate <gate>', 'duplication | boundaries | patterns | registry | contracts')
  .option('--scope <path>', 'file or area the finding is in')
  .option('--reason <text>', 'why the policy is wrong here')
  .option('--expires-in-days <n>', 'days until expiry (default 90)')
  .action((opts) => waiverDraftCommand(process.cwd(), opts));

program.parseAsync(process.argv);
