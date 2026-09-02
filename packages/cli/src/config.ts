import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { parse } from 'yaml';
import { ASDLC_DIR } from './state.js';
import type { Config, GateId } from './types.js';

// Playbook S1.3 default excludes: node_modules, dist/build, tests, migrations,
// generated, vendor, lockfiles. Tests are excluded from clone detection —
// test boilerplate similarity is not business-rule drift.
export const DEFAULT_EXCLUDES = [
  '**/node_modules/**', '**/dist/**', '**/build/**', '**/.next/**',
  '**/coverage/**', '**/vendor/**', '**/*.min.*', '**/generated/**',
  '**/migrations/**', '**/*.lock', '**/package-lock.json', '**/.asdlc/**',
  '**/*.test.*', '**/*.spec.*', '**/__tests__/**', '**/tests/**', '**/test/**',
  '**/*.stories.*', '**/__mocks__/**', '**/fixtures/**',
];

export function defaultConfig(): Config {
  return {
    mode: 'legacy',
    gates: {
      duplication: { enabled: true },
      boundaries: { enabled: true },
      patterns: { enabled: true },
      registry: { enabled: true },
      contracts: { enabled: false },
    },
    source_dirs: ['src'],
    min_tokens: 60,
    exclude: DEFAULT_EXCLUDES,
    registry_path: 'docs/BUSINESS_RULES.md',
    architecture_path: 'docs/ARCHITECTURE.md',
    contracts_command: null,
    semgrep_rules_dir: '.asdlc/semgrep',
  };
}

// One meaning for `exclude` across every gate (issue #3): gates that speak
// glob get the globs verbatim; dependency-cruiser speaks regex, so convert.
export function globToRegex(glob: string): string {
  let g = glob;
  const leading = g.startsWith('**/');
  if (leading) g = g.slice(3);
  const trailing = g.endsWith('/**');
  if (trailing) g = g.slice(0, -3);
  let r = g
    .replace(/[.+^${}()|[\]\\]/g, '\\$&')
    .replace(/\*\*/g, '.*')
    .replace(/\*/g, '[^/]*');
  r = leading ? `(^|/)${r}` : `^${r}`;
  r = trailing ? `${r}(/|$)` : `${r}$`;
  return r;
}

export function loadConfig(root: string): Config {
  const p = join(root, ASDLC_DIR, 'config.yml');
  const base = defaultConfig();
  if (!existsSync(p)) return base;
  const raw = (parse(readFileSync(p, 'utf8')) ?? {}) as Partial<Config> & {
    gates?: Partial<Record<GateId, { enabled: boolean }>>;
  };
  return {
    ...base,
    ...raw,
    gates: { ...base.gates, ...(raw.gates ?? {}) },
    exclude: raw.exclude ?? base.exclude,
    source_dirs: raw.source_dirs ?? base.source_dirs,
  };
}
