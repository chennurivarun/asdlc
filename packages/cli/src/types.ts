export type GateId = 'duplication' | 'boundaries' | 'patterns' | 'registry' | 'contracts';

// A crashed or missing check reports ERROR, never PASS (playbook S0).
export type GateStatus =
  | 'PASS'
  | 'PASS_WITH_FINDINGS' // findings exist but all are baselined or waived (legacy mode)
  | 'FAIL'               // new, unwaived findings
  | 'ERROR'              // scanner crashed, missing, or unparseable output
  | 'SKIPPED'            // explicitly disabled/unconfigured, with reason
  ;

export interface Finding {
  gate: GateId;
  rule: string;
  path: string;
  symbol: string;       // second path, symbol name, or '-' when not applicable
  message: string;
  fingerprint: string;  // gate:rule:path:symbol digest — line-independent
}

export interface GateResult {
  gate: GateId;
  status: GateStatus;
  findings: Finding[];
  newFindings: Finding[];      // not in baseline, not waived
  baselined: number;
  waived: number;
  error?: string;
  detail?: string;
}

export interface Waiver {
  id: string;
  gate: GateId;
  scope: string;
  fingerprint: string;
  reason: string;
  approved_by: string;
  approval_ref: string;
  approved_on: string;
  expires_on: string;
  compensating_control?: string;
  retirement_condition?: string;
}

export type InstallStatus = 'PLANNED' | 'PARTIAL' | 'ACTIVE' | 'ERROR' | 'SUSPENDED';
export type Mode = 'greenfield' | 'legacy';

export interface State {
  schema_version: number;
  playbook_version: string;
  status: InstallStatus;
  mode: Mode;
  config_revision: number;
  baseline_revision: number;
  last_audit: string | null;
}

export interface Config {
  mode: Mode;
  gates: Record<GateId, { enabled: boolean }>;
  source_dirs: string[];
  min_tokens: number;
  exclude: string[];
  registry_path: string;
  architecture_path: string;
  contracts_command: string | null;
  semgrep_rules_dir: string;
}
