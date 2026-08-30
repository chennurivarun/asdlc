# Roadmap

Changes to the spec are **evidence-driven only** — pilot data first, editing
second. This roadmap is direction, not promise; dates are deliberately absent.

## Shipped

- **v0.1.0** (2026-08-30) — the governance CLI: `plan` / `init` / `check` /
  `audit` / `baseline accept` / `waiver draft`. Five gates (clones via jscpd,
  boundaries via dependency-cruiser, patterns via Semgrep, registry + waiver
  validation, contract-test hook). Legacy baseline ratchet, line-independent
  fingerprints, waivers with enforced expiry, ERROR-never-PASS semantics,
  governance self-tests. Validated on a production AI-built codebase
  (see `case-study/` and `docs/VALIDATION_LOG.md`).
- **v0.2.0** (2026-08-31) — the **drift score**: every audit grades the repo
  A–F, writes a shields.io badge (`.asdlc/badge.json`), `audit --score` for
  scripts.

## Next (v0.3 candidates — ordered by pull, not promise)

- **First-user fixes** — issues filed by real users always jump this queue.
- `asdlc waiver approve` — human-side counterpart to `waiver draft` (fills
  approval fields interactively, stamps the pointer).
- Severity tiers for the patterns gate (INFO rules currently gate like ERROR
  rules — see the open question in `docs/VALIDATION_LOG.md`).
- Same-file clones as a distinct rule id (`clone-internal`).
- Windows CI run (the code is path-safe by construction; it deserves proof).
- `asdlc audit --json` — machine-readable full report for integrations.

## Later

- **Python stack adapter** — import-linter for boundaries, same protocol.
- **Registry sync proposals** — audits propose implementation/consumer list
  updates as diffs (never applied without approval), per playbook Stage 4.
- **Drift-score weights v1** — recalibrated once ≥3 validated pilots exist.
- **Spec v3.2** — unfrozen only by validation-log evidence.

## The horizon: Zaya

A coding-agent harness where ASDLC is enforced by the harness itself — the
registry is injected before every task, and "done" is a machine-verified state
(the loop runs `asdlc check` and rejects red). Fork base selected
(`deepcode-cli`, MIT); design in `docs/ZAYA_EVALUATION.md`. Starts after the
CLI has real-world mileage.

## How to influence this

Open an issue. Real-usage reports outrank feature ideas, and feature ideas
with a failing case outrank opinions. That's the same evidence rule the spec
lives under.
