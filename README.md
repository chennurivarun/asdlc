# ASDLC

**The anti-drift governance layer for AI-built codebases.**

AI coding agents are amnesiac contributors: every session writes locally good code
with no memory of what the last session built. The result is *concept drift* — the
same business rule implemented five different ways, half-removed fields, tests that
mirror bugs, features nobody consumes. Bugs that keep reopening.

ASDLC is a CLI + protocol that makes drift governable:

- **Meaning is authored once** — a human-owned registry (`docs/BUSINESS_RULES.md`)
  defines every governed concept; agents consult it instead of inventing semantics.
- **Machines guard the door** — `asdlc check` runs five gates (clone detection,
  architecture boundaries, pattern rules, registry/waiver validation, contract
  tests) with one exit code. A crashed check reports **ERROR, never PASS**.
- **Detection bounds what prevention misses** — `asdlc audit` re-diagnoses the
  whole repo on a schedule, because drift is fractal: even cures drift. Each
  audit emits a **drift score** (A–F badge, see [docs/DRIFT_SCORE.md](docs/DRIFT_SCORE.md)).

It wraps proven open-source scanners (jscpd, dependency-cruiser, Semgrep) rather
than reinventing them, and implements the frozen
[Anti-Drift Playbook v3.1.1](spec/ANTI_DRIFT_PLAYBOOK_v3.1.1.md) protocol.
Workflow-agnostic: complements Spec Kit, BMAD, Kiro, Claude Code, Cursor.

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

## Repo layout

- `spec/` — the frozen protocol + [ASDLC overview](spec/ASDLC_OVERVIEW.md)
- `packages/cli/` — the `asdlc` CLI (Node ≥ 20)
- `packages/cli/assets/templates/` — everything `init` installs
- `surfaces/` — agent-side surfaces (Claude Code skill)

License: Apache-2.0
