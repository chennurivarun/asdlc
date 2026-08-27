import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import pc from 'picocolors';
import { ASDLC_DIR } from '../state.js';
import type { GateId } from '../types.js';

const GATES: GateId[] = ['duplication', 'boundaries', 'patterns', 'registry', 'contracts'];

// "asdlc waiver draft" — the agent-side half of the waiver protocol: drafts an
// entry with every field the agent can honestly fill, and leaves approved_by /
// approval_ref EMPTY. An incomplete waiver is malformed, so the registry gate
// flags it red until a human fills in the approval — "draft and stop for
// approval" enforced by construction, not by convention.
export function waiverDraftCommand(
  root: string,
  opts: { fingerprint?: string; gate?: string; scope?: string; reason?: string; expiresInDays?: string },
): void {
  if (!opts.fingerprint || !opts.gate || !opts.scope || !opts.reason) {
    console.error(pc.red('Required: --fingerprint <16-hex from check output> --gate <gate> --scope <path> --reason "<why the policy is wrong here>"'));
    process.exitCode = 1;
    return;
  }
  if (!GATES.includes(opts.gate as GateId)) {
    console.error(pc.red(`--gate must be one of: ${GATES.join(', ')}`));
    process.exitCode = 1;
    return;
  }
  const path = join(root, ASDLC_DIR, 'waivers.yml');
  mkdirSync(dirname(path), { recursive: true });
  const existing = existsSync(path) ? readFileSync(path, 'utf8') : 'waivers: []\n';

  const ids = [...existing.matchAll(/id:\s*W-(\d+)/g)].map((m) => Number(m[1]));
  const nextId = `W-${String((ids.length > 0 ? Math.max(...ids) : 0) + 1).padStart(4, '0')}`;
  const days = Number(opts.expiresInDays ?? 90);
  const expires = new Date(Date.now() + days * 86_400_000).toISOString().slice(0, 10);

  const block = [
    `  - id: ${nextId}`,
    `    gate: ${opts.gate}`,
    `    scope: ${opts.scope}`,
    `    fingerprint: "${opts.fingerprint}"`,
    `    reason: "${opts.reason.replace(/"/g, '\\"')}"`,
    `    approved_by: ""            # HUMAN: fill in`,
    `    approval_ref: ""           # HUMAN: pointer to where approval was given`,
    `    approved_on: ""            # HUMAN: YYYY-MM-DD`,
    `    expires_on: ${expires}`,
    `    compensating_control: ""`,
    `    retirement_condition: ""`,
    '',
  ].join('\n');

  // String-level append preserves the file's instructional comments.
  const updated = /waivers:\s*\[\]/.test(existing)
    ? existing.replace(/waivers:\s*\[\]/, `waivers:\n${block}`)
    : `${existing.trimEnd()}\n${block}`;
  writeFileSync(path, updated);

  console.log([
    pc.green(`Draft waiver ${nextId} written to .asdlc/waivers.yml (expires ${expires}).`),
    pc.bold(pc.yellow('It is NOT active: approved_by / approval_ref / approved_on are empty,')),
    pc.yellow('so the registry gate will flag it as malformed until a human fills them in.'),
    'This is the protocol: agents draft, humans approve, the approval leaves a pointer.',
  ].join('\n'));
}
