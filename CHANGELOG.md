# Changelog

## 0.2.0 — 2026-08-31

- **Drift score**: every `asdlc audit` computes a 100-point score and A–F band
  from open findings, baseline debt, expired waivers, gate coverage, and
  governed-concept count. Printed in audit output and the markdown report.
- `.asdlc/badge.json` written on every audit — shields.io endpoint format for
  a live README badge.
- `asdlc audit --score` — prints just the band and score (e.g. `B 78`).

## 0.1.0 — 2026-08-30

Initial public release.

- Commands: `plan` (read-only detection), `init` (governance install),
  `check` (five gates, one exit code), `audit` (read-only diagnosis +
  proposed baseline), `baseline accept`, `waiver draft`.
- Gates: duplication (jscpd), boundaries (dependency-cruiser), patterns
  (Semgrep), registry + waiver-expiry validation, contract-test hook.
- Trust rules enforced in code: crashed checks report ERROR (never PASS);
  waivers expire and expired waivers stop suppressing; baselines and waivers
  require a human approval pointer; drafted waivers are inactive until a
  human completes them.
- Legacy mode: existing debt baselined via line-independent fingerprints;
  only NEW findings gate.
- Governance self-test suite; validated against a production AI-built
  codebase and an OSS control repo (`docs/VALIDATION_LOG.md`).
