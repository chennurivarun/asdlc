# ASDLC — Build Plan v1

**Product:** ASDLC — an open-source CLI that implements the Anti-Drift Playbook v3.1.1
protocol: it installs, checks, and audits anti-drift governance in AI-built codebases.

**Positioning:** the drift-governance layer for agentic coding. Workflow-agnostic —
complements Spec Kit / BMAD / Kiro / plain Claude Code, competes with none of them.

**Decisions locked (2026-08-27):**
- Name: **ASDLC** (spec = the ASDLC methodology; CLI = `asdlc`)
- Form: CLI tool first (Node 22 + TypeScript), other surfaces later
- Publishing: **private repo until launch-ready**, then Apache-2.0 public launch
- The insurance portal is a **private test bed only** — never published, never named;
  any case-study material derived from it is anonymized and owner-approved first

---

## Phase 0 — Foundation (repo + spec)

- [ ] `git init` this folder; private GitHub repo
- [ ] Layout:
  ```
  spec/            ANTI_DRIFT_PLAYBOOK_v3.1.1.md (frozen) + ASDLC_OVERVIEW.md
  packages/cli/    the asdlc CLI (TypeScript)
  templates/       AGENTS.md constitution, BUSINESS_RULES.md, ARCHITECTURE.md,
                   waivers.yml, gate configs, CI workflow (all de-branded)
  docs/            adoption guide, honest-limits, drift-score definition
  case-study/      (private until anonymized + approved)
  ```
- [ ] `ASDLC_OVERVIEW.md` — the five principles:
  1. Meaning is authored, code is derived
  2. Builder / auditor / healer are separate sessions
  3. Verification is continuous and adversarial (tests from criteria, never from code)
  4. Authority is explicit (agents propose, humans approve, approvals leave pointers)
  5. Detection bounds what prevention misses (drift may be written; it must not survive)
- [ ] Apache-2.0 license, CONTRIBUTING.md, spec-vs-CLI versioning policy

## Phase 1 — CLI v0.1 (read-only before mutating, mirroring the protocol's own trust model)

Commands, built in this order:

- [ ] **`asdlc plan`** (read-only): detect languages, package manager, test runner, CI,
      existing AGENTS.md/CLAUDE.md, repo size, uncommitted changes; propose mode
      (greenfield = blocking / legacy = baselined-advisory) and exact tool set. Report only.
- [ ] **`asdlc init`**: scaffold `.asdlc/` (state.yml with PLANNED→PARTIAL→ACTIVE machine,
      waivers.yml, empty baseline), docs templates, gate configs, AGENTS.md managed-section
      merge (never overwrite), CI workflow, pre-commit hook. Refuses to run without a
      reviewed plan. Honest PARTIAL status when CI can't be verified.
- [ ] **`asdlc check`**: run gates —
      G1 clones (jscpd), G2 boundaries (dependency-cruiser), G3 patterns (Semgrep + fixtures),
      G4 registry + waiver-expiry validation, G5 contract-test hook.
      One exit code. Legacy mode = zero-NEW vs fingerprint baseline.
      **A crashed gate reports ERROR, never PASS.**
- [ ] **`asdlc audit`** (read-only): Stage-1/Stage-4 diagnosis — clone triage
      (POSSIBLE_DIVERGENCE / TEXTUAL_DUPLICATION / ADAPTER_CANDIDATE), orphan candidates
      (import-orphans; business-orphans flagged as manual-review), registry sync diff,
      expired waivers, drift metrics. Outputs report + PROPOSED diff; never applies anything.

Core modules: stack detector · fingerprint engine (`gate:rule:path:symbol`, line-independent)
· baseline store · waiver validator (expiry ends suppression) · state machine ·
**governance self-tests** (expired waiver, new finding, scanner crash, lifecycle, fingerprint
stability — the CLI tests its own enforcement on every run, as the pilot install did).

Scope limit v0.1: JS/TS stacks. Other stacks = documented adapter interface, contributions.

## Phase 2 — Agent + CI surfaces

- [ ] `asdlc init` ships the S4 AGENTS.md constitution (search-before-create, risk tiers,
      consumer sweeps, tests-from-criteria, GOVERN rules)
- [ ] Claude Code skill wrapper (`/asdlc` protocol rituals for the agent side)
- [ ] GitHub Action wrapping `asdlc check` (the PR gate + drift-score badge)

## Phase 3 — Private validation loop

- [ ] Dogfood the CLI on the insurance portal (private): must reproduce/exceed the manual
      2026-08-14 Phase A results. Score against the seven-ticket answer key.
- [ ] Run on 1–2 unrelated repos (an OSS project) to kill portal-overfitting
- [ ] Record the §3.4 metrics: misses, false positives, interruptions, time cost
- [ ] Findings that need spec changes → proposed **v3.2** (unfrozen only by this evidence)

## Phase 4 — Launch package

- [ ] Case study, anonymized ("a production insurance CRM"), owner-approved:
      the arc *7 recurring bugs → gates caught 1/7 → registry covered 7/7 →
      cure 4 full + 3 partial → the cure itself drifted → audit caught it*
- [ ] Drift-score badge spec (open divergences, governed-concept coverage, baseline burn-down)
- [ ] README led by the case study; honest-limits section kept prominent
- [ ] Flip public + npm publish + launch posts

## Phase 5 — Zaya (the governed harness)

Our own coding-agent harness, DeepSeek-powered, with ASDLC enforced by the
harness itself — not by prompts. "Done" is a machine-verified state: the loop
runs `asdlc check` on completion and rejects red; registry is injected into
context pre-task; waiver drafts halt for the human. First harness that can't
ship drift.

- [ ] Evaluate fork candidates (30-min clone-and-read each):
      1. `lessweb/deepcode-cli` (Deep Code CLI — Node, DeepSeek-V4-native)
      2. `fenwii/deepseek-cli`
      Fallback: Pi (MIT, built-to-fork) + our own DeepSeek client.
      Checklist per candidate: (a) MIT/Apache license, (b) clean hook on the
      task-completion path, (c) real tool-calling loop (files/shell/search).
- [ ] Governance middleware (~500 lines): pre-task registry injection,
      completion gate via in-process asdlc gate runner, waiver-halt.
- [ ] Model pluggable (DeepSeek default, any OpenAI-compatible endpoint) —
      the harness is the identity, not the model.
- [ ] Name check: "Zaya" trademark/collision review before anything public.
- [ ] Positioning: ASDLC = the standard (harness-agnostic); Zaya = the
      reference harness where it's native.

Gate: starts only after Phase 3 (portal dogfood) and Phase 4 (launch) are done.

---

## Roles

- **Varun (owner):** all GOVERN approvals, definitions, name/npm/org choices, launch call
- **Claude (builder/analyst):** implementation, extraction, docs, case-study drafting
- **Codex (adversarial reviewer):** cross-reviews CLI code before merge — the same
  builder-vs-verifier separation the protocol prescribes

## Deferred decisions (resolve when reached)

- npm package name availability (`asdlc`) — check at first publish
- GitHub org (personal vs cyepro-solutions) — decide at first push
- Case-study detail level — owner approval before anything portal-derived leaves private
