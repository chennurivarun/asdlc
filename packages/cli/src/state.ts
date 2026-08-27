import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { parse, stringify } from 'yaml';
import type { State } from './types.js';

export const ASDLC_DIR = '.asdlc';

export function statePath(root: string): string {
  return join(root, ASDLC_DIR, 'state.yml');
}

export function readState(root: string): State | null {
  const p = statePath(root);
  if (!existsSync(p)) return null;
  const raw = parse(readFileSync(p, 'utf8')) as Partial<State> | null;
  if (!raw || typeof raw !== 'object') return null;
  // Marker presence alone is not installation (S0): an unreadable or
  // incomplete state file is PARTIAL, never assumed ACTIVE.
  return {
    schema_version: raw.schema_version ?? 1,
    playbook_version: raw.playbook_version ?? '3.1.1',
    status: raw.status ?? 'PARTIAL',
    mode: raw.mode ?? 'legacy',
    config_revision: raw.config_revision ?? 1,
    baseline_revision: raw.baseline_revision ?? 1,
    last_audit: raw.last_audit ?? null,
  };
}

export function writeState(root: string, state: State): void {
  writeFileSync(statePath(root), stringify(state));
}
