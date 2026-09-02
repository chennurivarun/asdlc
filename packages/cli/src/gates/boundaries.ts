import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { makeFinding, normalizePath } from '../fingerprint.js';
import type { Config, Finding } from '../types.js';

// G2 — architecture boundaries via dependency-cruiser's programmatic API.
// Rules come from the repo's own .dependency-cruiser.cjs (written by `asdlc init`
// from ARCHITECTURE.md review — never invented by the tool). No rules file means
// the gate cannot express an opinion: the caller reports SKIPPED, not PASS.
export async function runBoundariesGate(root: string, config: Config): Promise<Finding[] | 'UNCONFIGURED'> {
  const ruleFile = ['.dependency-cruiser.cjs', '.dependency-cruiser.js', '.dependency-cruiser.json']
    .map((f) => join(root, f))
    .find((f) => existsSync(f));
  if (!ruleFile) return 'UNCONFIGURED';

  const { cruise } = await import('dependency-cruiser');
  const extract = await import('dependency-cruiser/config-utl/extract-depcruise-config');
  const ruleSet = await (extract.default ?? extract)(ruleFile);

  const dirs = config.source_dirs.filter((d) => existsSync(join(root, d)));
  const prevCwd = process.cwd();
  process.chdir(root);
  try {
    const result = await cruise(dirs, { ruleSet, validate: true, outputType: 'json' });
    const output = typeof result.output === 'string' ? JSON.parse(result.output) : result.output;
    const violations = (output.summary?.violations ?? []) as
      { rule: { name: string }; from: string; to: string }[];
    // The `to` path is the symbol and participates in the fingerprint —
    // canonicalize it like every other secondary path (issue #1 class).
    return violations.map((v) => {
      const to = normalizePath(v.to);
      return makeFinding('boundaries', v.rule.name, v.from, to,
        `${v.rule.name}: ${normalizePath(v.from)} → ${to}`);
    });
  } finally {
    process.chdir(prevCwd);
  }
}
