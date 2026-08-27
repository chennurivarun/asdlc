import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { parse } from 'yaml';
import { ASDLC_DIR } from './state.js';
import type { Waiver } from './types.js';

export interface WaiverCheck {
  valid: Waiver[];
  expired: Waiver[];
  malformed: { entry: unknown; missing: string[] }[];
}

const REQUIRED: (keyof Waiver)[] = [
  'id', 'gate', 'scope', 'fingerprint', 'reason',
  'approved_by', 'approval_ref', 'approved_on', 'expires_on',
];

export function loadWaivers(root: string, today = new Date()): WaiverCheck {
  const p = join(root, ASDLC_DIR, 'waivers.yml');
  const result: WaiverCheck = { valid: [], expired: [], malformed: [] };
  if (!existsSync(p)) return result;
  const doc = parse(readFileSync(p, 'utf8')) as { waivers?: unknown[] } | null;
  for (const entry of doc?.waivers ?? []) {
    const w = entry as Partial<Waiver>;
    const missing = REQUIRED.filter((k) => !w[k] || String(w[k]).trim() === '');
    if (missing.length > 0) {
      result.malformed.push({ entry, missing });
      continue;
    }
    // Expiry ends suppression: the finding turns red until renewed or fixed (SW).
    if (new Date(w.expires_on as string) < today) result.expired.push(w as Waiver);
    else result.valid.push(w as Waiver);
  }
  return result;
}

export function activeWaiverFingerprints(check: WaiverCheck): Set<string> {
  return new Set(check.valid.map((w) => w.fingerprint));
}
