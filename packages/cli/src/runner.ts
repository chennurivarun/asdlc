import { loadBaseline, evaluateGate } from './baseline.js';
import { loadWaivers, activeWaiverFingerprints } from './waivers.js';
import { runDuplicationGate } from './gates/duplication.js';
import { runBoundariesGate } from './gates/boundaries.js';
import { runPatternsGate } from './gates/patterns.js';
import { runRegistryGate } from './gates/registry.js';
import { runContractsGate } from './gates/contracts.js';
import type { Config, GateId, GateResult, Finding } from './types.js';

type Collector = () => Promise<Finding[] | 'UNCONFIGURED' | 'TOOL_MISSING'>;

export async function runAllGates(
  root: string,
  config: Config,
  overrides?: Partial<Record<GateId, Collector>>, // test seam: governance self-tests inject crashing/canned collectors
): Promise<GateResult[]> {
  const baseline = loadBaseline(root);
  const waivers = activeWaiverFingerprints(loadWaivers(root));

  const collectors: Record<GateId, Collector> = {
    duplication: async () => runDuplicationGate(root, config),
    boundaries: () => runBoundariesGate(root, config),
    patterns: async () => runPatternsGate(root, config),
    registry: async () => runRegistryGate(root, config),
    contracts: async () => runContractsGate(root, config),
    ...overrides,
  };

  const results: GateResult[] = [];
  for (const gate of Object.keys(collectors) as GateId[]) {
    if (!config.gates[gate]?.enabled) {
      results.push({ gate, status: 'SKIPPED', findings: [], newFindings: [],
        baselined: 0, waived: 0, detail: 'disabled in .asdlc/config.yml' });
      continue;
    }
    try {
      const out = await collectors[gate]();
      if (out === 'UNCONFIGURED') {
        results.push({ gate, status: 'SKIPPED', findings: [], newFindings: [],
          baselined: 0, waived: 0, detail: 'not configured — SKIPPED is not PASS' });
      } else if (out === 'TOOL_MISSING') {
        // Enabled but tool absent: the check cannot run, so it reports ERROR, never PASS.
        results.push({ gate, status: 'ERROR', findings: [], newFindings: [],
          baselined: 0, waived: 0, error: 'scanner not installed (e.g. semgrep missing from PATH)' });
      } else {
        results.push(evaluateGate(gate, out, baseline, waivers, config.mode));
      }
    } catch (err) {
      results.push({ gate, status: 'ERROR', findings: [], newFindings: [],
        baselined: 0, waived: 0, error: err instanceof Error ? err.message : String(err) });
    }
  }
  return results;
}

export function overallExitCode(results: GateResult[]): number {
  return results.some((r) => r.status === 'FAIL' || r.status === 'ERROR') ? 1 : 0;
}
