# ASDLC — Agentic Software Development Lifecycle

**The governance layer for agentic software development.**

AI agents can write code quickly, but they do not inherit the shared understanding
that keeps a software system coherent. Each session can make a locally reasonable
change while quietly changing the system's meaning: the same business rule appears
five different ways, fields are only half removed, tests mirror bugs, and features
lose their consumers. That is *concept drift* — and it compounds across agents,
sessions, and releases.

ASDLC gives agentic teams a durable control loop: humans define the meaning that
must not drift; agents work within it; machines verify every change; audits find
what prevention missed. It is a CLI + protocol for making AI-assisted development
governable.

- **Define what must remain true** — a human-owned registry
  (`docs/BUSINESS_RULES.md`) records the business concepts, invariants, and
  boundaries agents must preserve.
- **Verify every agent change** — `asdlc check` runs five gates (clone detection,
  architecture boundaries, pattern rules, registry/waiver validation, contract
  tests) with one exit code. A crashed check reports **ERROR, never PASS**.
- **Continuously measure drift** — `asdlc audit` re-diagnoses the whole repository
  on a schedule and emits a **drift score** (A–F badge, see
  [docs/DRIFT_SCORE.md](docs/DRIFT_SCORE.md)).

**Agentic software development needs more than prompts and tests.** Prompts are
not durable policy; tests do not prove that independently generated changes still
mean the same thing. ASDLC makes the rules explicit, enforces them in CI, and
keeps a reviewable record of the human decisions behind exceptions.

It wraps proven open-source scanners (jscpd, dependency-cruiser, Semgrep) rather
than reinventing them, and implements the frozen
[Anti-Drift Playbook v3.1.1](spec/ANTI_DRIFT_PLAYBOOK_v3.1.1.md) protocol.
Workflow- and agent-agnostic: it complements Spec Kit, BMAD, Kiro, Claude Code,
Cursor, and any coding harness.

## Try it in 60 seconds

```bash
cd your-repo
npx asdlc-cli plan    # read-only: changes nothing, tells you what governance would look like here
```

## Quickstart

```bash
npm install -g asdlc-cli   # installs the `asdlc` command
cd your-repo
asdlc plan     # read-only: detects stack, proposes greenfield/legacy mode
asdlc init     # installs .asdlc/, registry templates, AGENTS.md rules, CI gate
asdlc audit    # read-only diagnosis → report + PROPOSED baseline
asdlc baseline accept --from .asdlc/reports/<date>/proposed-baseline.json \
  --approved-by <you> --approval-ref "<where you approved it>"
asdlc check    # the wall: green (legacy: zero NEW findings) or exit 1
```

Legacy repos start fully baselined — existing debt is recorded, only **new** drift
blocks. Suppression happens only via waivers (`.asdlc/waivers.yml`), each requiring
a human approval pointer and an expiry date. **Expired waivers stop suppressing.**

## Trust model

This tool grants itself no authority. Agents draft; humans approve; approvals leave
pointers. An agent cannot accept its own baseline or waiver. Gate configs,
baselines, waivers, and CI are GOVERN-only surfaces.

## Honest limits

Gates prove the absence of *known, expressible* violation classes — not all drift,
and not correctness. Clone detection finds textual similarity, not semantic
equivalence; import analysis cannot see business orphans; consumer discovery is
evidence, not completeness. The registry of human-authored definitions is the
load-bearing part. Contract tests can encode a wrong definition — domain review
still matters.

## Project

- [Vision](VISION.md) — where this is going, and why Zaya comes next
- [Master checklist](MASTER_CHECKLIST.md) — the whole journey on one page
- [Roadmap](ROADMAP.md) — shipped, next, and the Zaya horizon
- [Changelog](CHANGELOG.md)
- [Contributing](CONTRIBUTING.md) — three rules, the first is verdict integrity
- [Wiki](../../wiki) — getting started, how the gates work, FAQ
- [Case study](case-study/CASE_STUDY.md) — the seven-bug arc with numbers

## Repo layout

- `spec/` — the frozen protocol + [ASDLC overview](spec/ASDLC_OVERVIEW.md)
- `packages/cli/` — the `asdlc` CLI (Node ≥ 20)
- `packages/cli/assets/templates/` — everything `init` installs
- `surfaces/` — agent-side surfaces (Claude Code skill)

License: Apache-2.0
