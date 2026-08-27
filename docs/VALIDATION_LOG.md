# Validation log

Per the playbook's frozen mandate: changes to the spec are evidence-driven only.
This log records pilot data. Repos are referred to generically; the private test
bed is never named in public material.

## Run 1 — private production app (AI-built insurance CRM, ~664 files) — 2026-08-27

| Gate | Tool result | Manual 2026-08-14 audit (human+agent) | Verdict |
| --- | --- | --- | --- |
| Detection (`plan`) | TS/npm/vitest/GH-Actions, legacy proposed, 145 uncommitted flagged | n/a | correct |
| Duplication | 104 production-code clone findings | 181 blocks (pre-cure, different excludes) | plausible; post-cure reduction visible |
| — biggest pre-cure cluster (org-create route pair, 19 blocks/878 lines) | **0 findings on those routes** | flagged as #1 risk, then cured | tool independently confirms the cure held |
| — new clusters (password-reset routes, target-plans vs target-proposals) | flagged | did not exist in August | drift regrowth caught live |
| Boundaries | PASS against repo's own dependency-cruiser rules | PASS_DIAGNOSTIC | consistent |
| Patterns (same rule file) | **158** elevated-client findings | **156** | reproduced (+2 = code growth since August) |
| Registry | validated existing BUSINESS_RULES.md (10 concepts), PASS | n/a (registry written by hand then) | correct |
| Mutation | none (reports only) | — | read-only honored |

## Run 2 — hono (public OSS TypeScript framework, ~456 files) — 2026-08-27

- Detection: TypeScript / **bun** / vitest / GH Actions — correct on a non-npm stack.
- Duplication: 216 findings initially → exposed an implementation bug: the
  playbook's S1.3 default excludes (tests, fixtures) were missing from the
  tool's defaults. Fixed to match spec → **28 production-code findings**.
- Registry gate correctly red on a repo with no registry (registry-missing).

## Findings → actions

1. **Bug found by validation, fixed:** default excludes now match playbook S1.3
   (tests/specs/stories/mocks/fixtures excluded from clone detection).
2. **Comparative stat:** AI-built production app ≈ 104 clone findings/664 files;
   mature hand-built OSS framework ≈ 28/456 files (~2.6× per-file density).
   Crude, but consistent with the thesis that duplication is AI's default gait.
3. **Fingerprint scheme changed once pre-release** (content-hash + occurrence
   suffix, from Codex review). Any baseline captured before that is stale.
   Acceptable pre-release; after v0.1 ships, fingerprint changes require a
   migration note.

## Time cost (this machine)

- Private app (~79k LOC): audit ≈ 60–90 s (jscpd dominates).
- hono: audit ≈ 30 s.

## Open questions for v3.2 (evidence needed before any spec edit)

- Should same-file clones be a distinct rule id (`clone-internal`)?
- Minimum-severity threshold for Semgrep findings to gate (INFO rules currently
  gate like ERROR rules; the playbook's advisory ratchet may want severity tiers).
