import { createHash } from 'node:crypto';
import type { Finding, GateId } from './types.js';

// Fingerprints are gate:rule:path:symbol — deliberately line-independent so
// edits elsewhere in a file don't churn baselines or waivers (playbook S1.3).
export function fingerprint(gate: GateId, rule: string, path: string, symbol: string): string {
  const key = [gate, rule, normalizePath(path), symbol].join(':');
  return createHash('sha256').update(key).digest('hex').slice(0, 16);
}

export function normalizePath(p: string): string {
  return p.replace(/\\/g, '/').replace(/^\.\//, '');
}

export function makeFinding(
  gate: GateId, rule: string, path: string, symbol: string, message: string,
): Finding {
  return { gate, rule, path: normalizePath(path), symbol, message,
    fingerprint: fingerprint(gate, rule, path, symbol) };
}
