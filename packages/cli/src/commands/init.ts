import { mkdirSync, writeFileSync, existsSync, readFileSync, appendFileSync, readdirSync, cpSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import pc from 'picocolors';
import { detectStack } from '../detect.js';
import { ASDLC_DIR, writeState } from '../state.js';
import { defaultConfig } from '../config.js';
import { stringify } from 'yaml';
import type { Mode } from '../types.js';

const ASSETS = join(dirname(fileURLToPath(import.meta.url)), '..', '..', 'assets');

function writeIfAbsent(path: string, content: string): boolean {
  if (existsSync(path)) return false;
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, content);
  return true;
}

const MARKER = '[ANTI-DRIFT CONSTITUTION v3.1.1 — managed section]';

// "asdlc init" — scaffolds governance. Existing files are never overwritten;
// AGENTS.md gets the managed section appended under a marker (playbook S1.2).
export function initCommand(root: string, opts: { mode?: Mode }): void {
  const s = detectStack(root);
  if (!s.gitRepo) {
    console.error(pc.red('Refusing to install: not a git repository. Run `git init` first.'));
    process.exitCode = 1;
    return;
  }
  const mode: Mode = opts.mode ?? (s.fileCount > 60 ? 'legacy' : 'greenfield');
  const created: string[] = [];
  const skipped: string[] = [];
  const track = (path: string, wrote: boolean) => (wrote ? created : skipped).push(path);

  mkdirSync(join(root, ASDLC_DIR, 'semgrep'), { recursive: true });
  mkdirSync(join(root, ASDLC_DIR, 'reports'), { recursive: true });

  const config = { ...defaultConfig(), mode, source_dirs: s.sourceDirs.length > 0 ? s.sourceDirs : ['src'] };
  track('.asdlc/config.yml', writeIfAbsent(join(root, ASDLC_DIR, 'config.yml'), stringify(config)));
  track('.asdlc/waivers.yml', writeIfAbsent(join(root, ASDLC_DIR, 'waivers.yml'),
    readFileSync(join(ASSETS, 'templates', 'waivers.yml'), 'utf8')));
  track('.asdlc/baseline.json', writeIfAbsent(join(root, ASDLC_DIR, 'baseline.json'),
    JSON.stringify({ accepted: [] }, null, 2)));

  for (const [asset, dest] of [
    ['BUSINESS_RULES.md', 'docs/BUSINESS_RULES.md'],
    ['ARCHITECTURE.md', 'docs/ARCHITECTURE.md'],
    ['semgrep-example.yml', '.asdlc/semgrep/example.yml.disabled'],
    ['dependency-cruiser.starter.cjs', '.dependency-cruiser.cjs'],
  ] as const) {
    track(dest, writeIfAbsent(join(root, dest), readFileSync(join(ASSETS, 'templates', asset), 'utf8')));
  }

  // AGENTS.md: create, or merge by appending under the marker — keep all prior instructions.
  const agentsPath = join(root, 'AGENTS.md');
  const section = readFileSync(join(ASSETS, 'templates', 'AGENTS_SECTION.md'), 'utf8');
  if (!existsSync(agentsPath)) {
    writeFileSync(agentsPath, section);
    created.push('AGENTS.md');
  } else if (!readFileSync(agentsPath, 'utf8').includes(MARKER)) {
    appendFileSync(agentsPath, `\n\n${section}`);
    created.push('AGENTS.md (managed section appended — review the diff)');
  } else {
    skipped.push('AGENTS.md (managed section already present)');
  }

  // CI is the real wall — hooks are skippable (S1.4).
  let ciWired = false;
  if (s.ci.includes('GitHub Actions') || existsSync(join(root, '.github'))) {
    ciWired = writeIfAbsent(join(root, '.github', 'workflows', 'asdlc.yml'),
      readFileSync(join(ASSETS, 'templates', 'ci-github.yml'), 'utf8'));
    track('.github/workflows/asdlc.yml', ciWired);
    if (!ciWired) ciWired = true; // workflow already exists
  }

  // No CI = setup incomplete → status PARTIAL, reported in bold (S1.4).
  const status = ciWired ? 'ACTIVE' : 'PARTIAL';
  writeState(root, {
    schema_version: 1, playbook_version: '3.1.1', status, mode,
    config_revision: 1, baseline_revision: 1, last_audit: null,
  });
  created.push('.asdlc/state.yml');

  console.log([
    pc.bold(`ASDLC installed — status ${status === 'ACTIVE' ? pc.green(status) : pc.bold(pc.yellow(status))}, mode ${mode.toUpperCase()}`),
    '',
    'Created:', ...created.map((f) => `  + ${f}`),
    ...(skipped.length > 0 ? ['Preserved (already existed):', ...skipped.map((f) => `  = ${f}`)] : []),
    '',
    status === 'PARTIAL'
      ? pc.bold(pc.yellow('NO CI DETECTED — pre-commit hooks are skippable; setup is incomplete until a CI runs `asdlc check`.'))
      : 'CI workflow in place. Merge nothing past a red check.',
    '',
    mode === 'legacy'
      ? 'Legacy mode: run `asdlc audit` next to capture the proposed baseline, review it, then accept with `asdlc baseline accept`.'
      : 'Greenfield: gates block from the first commit. Run `asdlc check`.',
  ].join('\n'));
}
