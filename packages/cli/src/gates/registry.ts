import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { makeFinding } from '../fingerprint.js';
import { loadWaivers } from '../waivers.js';
import type { Config, Finding } from '../types.js';

// G4 — registry + waiver validation.
// The registry (docs/BUSINESS_RULES.md) is human-authored markdown; this gate
// checks structure and referential integrity, never meaning:
//  - registry file exists and has at least one concept section
//  - every `backtick/path` reference under a concept resolves in the repo
//  - waivers are well-formed; expired waivers surface as findings (suppression ended)
// Concepts with a real definition: `## <name>` sections, excluding templates.
export function countGovernedConcepts(root: string, config: Config): number {
  const regPath = join(root, config.registry_path);
  if (!existsSync(regPath)) return 0;
  const text = readFileSync(regPath, 'utf8');
  return (text.match(/^##\s+.+$/gm) ?? [])
    .filter((h) => !/example/i.test(h)).length;
}

export function runRegistryGate(root: string, config: Config): Finding[] {
  const findings: Finding[] = [];
  const regPath = join(root, config.registry_path);

  if (!existsSync(regPath)) {
    findings.push(makeFinding('registry', 'registry-missing', config.registry_path, '-',
      `Registry not found at ${config.registry_path}`));
  } else {
    const text = readFileSync(regPath, 'utf8');
    const concepts = text.match(/^##\s+.+$/gm) ?? [];
    if (concepts.length === 0) {
      findings.push(makeFinding('registry', 'registry-empty', config.registry_path, '-',
        'Registry has no concept sections (## <Concept>)'));
    }
    const pathRefs = [...text.matchAll(/`((?:src|tests|docs|supabase|packages|lib|app)\/[^`\s]+)`/g)]
      .map((m) => m[1]);
    for (const ref of new Set(pathRefs)) {
      const bare = ref.split(':')[0];
      if (!existsSync(join(root, bare))) {
        findings.push(makeFinding('registry', 'dangling-path', config.registry_path, bare,
          `Registry references ${bare}, which does not exist`));
      }
    }
  }

  const waivers = loadWaivers(root);
  for (const m of waivers.malformed) {
    const id = (m.entry as { id?: string })?.id ?? 'unknown';
    findings.push(makeFinding('registry', 'waiver-malformed', '.asdlc/waivers.yml', id,
      `Waiver ${id} missing required fields: ${m.missing.join(', ')}`));
  }
  for (const w of waivers.expired) {
    findings.push(makeFinding('registry', 'waiver-expired', '.asdlc/waivers.yml', w.id,
      `Waiver ${w.id} expired ${w.expires_on}; its finding is no longer suppressed`));
  }
  return findings;
}
