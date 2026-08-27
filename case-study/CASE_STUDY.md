# Case study: curing concept drift in an AI-built production app

> **STATUS: DRAFT — PRIVATE. Not for publication until the owner approves the
> anonymization.** The subject is referred to only as "a production insurance
> CRM"; no company, product, ticket-system, or person names appear.

## The situation

A production insurance CRM (~660 source files, TypeScript/Next.js/Postgres) was
built almost entirely by AI coding agents across many sessions. It worked — and
then the same bugs kept coming back. Seven bug tickets, repeatedly reopened.

Hand analysis reduced all seven to **four fundamental causes**:

1. The same business rule implemented separately in different screens/routes (3 tickets)
2. Date/filter semantics defined inconsistently per screen (2 tickets)
3. Deprecated fields removed from only some screens (1 ticket)
4. An orphaned feature with no application consumer, still shipping (1 ticket)

One disease, four presentations: **rules lived inside screens instead of shared
contracts.** Notably, the test suite was green the whole time — 46 passing tests,
several of which asserted the buggy behavior, because they had been generated
from the implementation.

## What was tried: a governance protocol

The Anti-Drift Playbook (v3.1.1, in `spec/`) was installed in Legacy mode:
mechanical gates (clone detection, boundaries, patterns), a human-authored
registry of business-rule definitions, waivers with enforced expiry, and a
read-only audit protocol. The numbers:

| Layer | Result against the 7-ticket answer key |
| --- | --- |
| Mechanical gates alone | caught **1 of 7** — but ranked it the #1 risk (the largest route-pair divergence) |
| Registry-of-meaning layer | covered **7 of 7** concepts once definitions were written down |
| Cure (canonical modules + consumer migration) | **4 fully fixed, 3 partially** |
| The cure itself | **drifted**: one rule gained a second implementation, one visibility rule ended up with three mechanisms, unmigrated tests locked in old behavior |

That last row is the finding that matters: **drift is fractal.** Even the
remediation drifted. Prevention and registries are necessary; only a
*continuous* audit loop bounds the disease.

## Then the protocol became a tool

The manual steps were turned into an open-source CLI (`asdlc`) wrapping jscpd,
dependency-cruiser, and Semgrep, with the protocol's trust rules enforced in
code: crashed checks report ERROR (never PASS), baselines and waivers require a
human approval pointer, expired waivers stop suppressing.

Dogfooding the tool on the same codebase, weeks after the manual cure:

- It **independently confirmed the cure held**: the pre-cure #1 divergence
  (an 878-line route-pair clone cluster) produced zero findings.
- It **reproduced the manual audit**: 158 pattern findings vs. 156 found
  manually six weeks earlier (+2 = code added since).
- It **caught the next wave of drift live**: the newest features had already
  begun cloning routes again — new clusters that did not exist at cure time.
- On a mature hand-built OSS codebase (control run), clone density was ~2.6×
  lower per file than the AI-built app — consistent with the thesis that
  duplication is AI's default gait, not an accident.

## The lesson

AI doesn't build applications; it builds prompt-sized patches with no memory
between them. Whatever meaning isn't written down and mechanically enforced
between sessions will fragment. The fix is not a better model — it's authored
meaning, machine gates, human-owned approvals, and an audit loop that never
stops, because the drift never does.

*Built the way it preaches: the protocol was authored via adversarial
cross-review between two different AI models with a human owner; the CLI was
cross-reviewed the same way (the reviewer found three verdict-integrity bugs
before first release); and the validation data in `docs/VALIDATION_LOG.md` is
what unfroze — and will next unfreeze — the spec.*
