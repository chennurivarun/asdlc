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

// Whitespace-normalized content hash: stable when code moves, changes when the
// code itself changes — used to keep distinct matches from sharing a fingerprint.
export function contentHash(text: string): string {
  return createHash('sha256').update(text.replace(/\s+/g, ' ').trim()).digest('hex').slice(0, 8);
}

// Deterministic disambiguation for otherwise-identical findings: first
// occurrence keeps the base symbol, repeats get #1, #2, … so a NEW identical
// match can never hide behind a baselined or waived one.
export function occurrence(counts: Map<string, number>, base: string): string {
  const n = counts.get(base) ?? 0;
  counts.set(base, n + 1);
  return n === 0 ? base : `${base}#${n}`;
}

export function makeFinding(
  gate: GateId, rule: string, path: string, symbol: string, message: string,
): Finding {
  return { gate, rule, path: normalizePath(path), symbol, message,
    fingerprint: fingerprint(gate, rule, path, symbol) };
}
