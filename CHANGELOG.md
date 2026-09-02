# Changelog

## 0.2.1 — 2026-09-02

Fixes [#1](https://github.com/chennurivarun/asdlc/issues/1) — thanks to
**@Sampath2439** for an exemplary report.

- **Cross-platform fingerprint stability:** on Windows, jscpd emits native
  `\` paths; the secondary clone path entered the finding symbol (and thus
  the fingerprint) unnormalized, so the same logical clone fingerprinted
  differently per OS — breaking baseline portability between Windows
  developers and Linux CI. Both paths are now canonicalized *before* sorting
  and before symbol/message construction. Fails-red note: the bug could
  resurface baselined findings as new; it could never hide a finding.
- Same-class sweep: the patterns gate now canonicalizes the path inside its
  hash input, and the boundaries gate canonicalizes the `to` path in its
  symbol/message.
- Four regression tests: identical fingerprints for `/` vs `\` inputs,
  no native separators in rendered findings, canonical pair ordering
  (normalize-then-sort), and same-file internal clones remain reportable.
- **Note:** patterns-gate fingerprints change in this release (hash-input
  canonicalization). Pre-1.0: re-run `audit` before accepting baselines.

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
