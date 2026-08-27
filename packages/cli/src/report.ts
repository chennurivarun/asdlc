import pc from 'picocolors';
import type { GateResult } from './types.js';

const ICON: Record<string, string> = {
  PASS: pc.green('PASS'),
  PASS_WITH_FINDINGS: pc.yellow('PASS*'),
  FAIL: pc.red('FAIL'),
  ERROR: pc.red('ERROR'),
  SKIPPED: pc.dim('SKIP'),
};

export function renderResults(results: GateResult[], verbose: boolean): string {
  const lines: string[] = [];
  for (const r of results) {
    const counts = r.findings.length > 0 || r.baselined > 0 || r.waived > 0
      ? pc.dim(` (${r.newFindings.length} new, ${r.baselined} baselined, ${r.waived} waived)`)
      : '';
    lines.push(`${ICON[r.status].padEnd(14)} ${r.gate}${counts}${r.error ? pc.red(` — ${r.error}`) : ''}${r.detail ? pc.dim(` — ${r.detail}`) : ''}`);
    const shown = verbose ? r.newFindings : r.newFindings.slice(0, 10);
    for (const f of shown) {
      lines.push(pc.dim(`    [${f.fingerprint}] ${f.rule}: ${f.path} — ${f.message}`));
    }
    if (!verbose && r.newFindings.length > 10) {
      lines.push(pc.dim(`    … ${r.newFindings.length - 10} more (use --verbose)`));
    }
  }
  return lines.join('\n');
}

export function renderMarkdownReport(results: GateResult[], date: string): string {
  const rows = results.map((r) =>
    `| ${r.gate} | ${r.status} | ${r.findings.length} | ${r.newFindings.length} | ${r.baselined} | ${r.waived} |${r.error ?? r.detail ?? ''}|`);
  const details = results.flatMap((r) => r.newFindings.map((f) =>
    `- \`${f.fingerprint}\` **${r.gate}/${f.rule}** ${f.path} — ${f.message}`));
  return [
    `# ASDLC audit — ${date}`,
    '',
    'Raw scanner results are evidence for review, not proof of a product defect.',
    '',
    '| Gate | Status | Findings | New | Baselined | Waived | Note |',
    '| --- | --- | ---: | ---: | ---: | ---: | --- |',
    ...rows,
    '',
    '## New findings',
    ...(details.length > 0 ? details : ['None.']),
    '',
    '## Blind spots (standing)',
    '- Clone detection finds textual similarity, not semantic equivalence.',
    '- Boundary checks prove only what the approved rules express.',
    '- Import-orphan analysis cannot see business orphans (imported but unconsumed).',
    '- Consumer discovery is evidence, not completeness.',
  ].join('\n');
}
