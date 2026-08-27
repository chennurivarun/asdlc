import pc from 'picocolors';
import { detectStack } from '../detect.js';
import { readState } from '../state.js';
import { semgrepAvailable } from '../gates/patterns.js';

// "asdlc plan" — read-only, always first (playbook S1.0). Mutates nothing.
export function planCommand(root: string): void {
  const s = detectStack(root);
  const state = readState(root);
  const mode = s.fileCount > 60 ? 'legacy' : 'greenfield';

  const lines = [
    pc.bold('ASDLC plan (read-only — nothing has been changed)'),
    '',
    `Languages:        ${s.languages.join(', ') || 'none detected'}`,
    `Package manager:  ${s.packageManager ?? 'none'}`,
    `Test runner:      ${s.testRunner ?? 'none detected'}`,
    `CI:               ${s.ci.join(', ') || pc.red('NONE — no CI means setup will be PARTIAL, not ACTIVE')}`,
    `Agent files:      ${s.agentFiles.join(', ') || 'none'}`,
    `Source dirs:      ${s.sourceDirs.join(', ') || 'none found'}`,
    `Repo size:        ~${s.fileCount} files`,
    `Git repository:   ${s.gitRepo ? 'yes' : pc.red('NO — install requires version control')}`,
    s.uncommitted !== null && s.uncommitted > 0
      ? pc.yellow(`Uncommitted:      ${s.uncommitted} changes — these will be preserved, commit them first if possible`)
      : `Uncommitted:      ${s.uncommitted ?? 'n/a'}`,
    `Existing install: ${state ? `${state.status} (playbook ${state.playbook_version})` : 'none'}`,
    '',
    pc.bold(`Proposed mode: ${mode.toUpperCase()}`),
    mode === 'legacy'
      ? '  All gates start baselined/advisory and ratchet to block-new-only (S1.3).'
      : '  Gates block from day one.',
    '',
    'Proposed tools (new dev dependencies on install): jscpd, dependency-cruiser' +
      (semgrepAvailable() ? '; semgrep found on PATH' : pc.dim('; semgrep NOT found — patterns gate will report ERROR until installed or disabled')),
    '',
    pc.bold('Next step: review the above, then run `asdlc init` to install.'),
    'This tool grants itself no authority: init only proceeds because you, the human, run it.',
  ];
  console.log(lines.join('\n'));
}
