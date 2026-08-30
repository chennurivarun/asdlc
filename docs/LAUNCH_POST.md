# Launch post (Show HN / dev.to / LinkedIn) — draft for owner review

**Title options (pick one):**
1. Show HN: My AI-built app had 7 recurring bugs from one disease — I open-sourced the cure
2. Show HN: ASDLC — drift governance for AI-built codebases (with receipts)
3. AI wrote my app fast. Then the same bugs kept coming back. Here's what actually fixed it.

---

My production app was built almost entirely by AI coding agents. It worked —
and then the same bugs kept reopening. Seven tickets, again and again. The test
suite was green the whole time: 46 passing tests, several of which asserted the
buggy behavior, because the AI had generated them from the code it just wrote.

When I root-caused all seven, they were one disease wearing four costumes:
**business rules living inside individual screens instead of shared contracts.**
Every AI session is an amnesiac contributor — locally competent, globally blind.
Whatever meaning isn't written down between sessions fragments. Duplication
isn't a shortcut AI takes under pressure; it's its default gait.

So I did an experiment with a known answer key (my 7 tickets):

- Mechanical scanners (clone detection, dependency rules) caught **1 of 7** —
  useful, but the disease is semantic, not textual.
- Writing every business rule's definition down ONCE, in a human-owned
  registry, and forcing every session to consult it: covered **7 of 7**.
- After curing the codebase... the cure itself started drifting within weeks
  (the fix rule grew a second implementation; new features started cloning
  routes again). **Drift is fractal. Only a continuous audit loop bounds it.**

I turned the whole protocol into an open-source CLI: **asdlc**.

- `asdlc plan` — read-only, tells you what governance would look like in your repo
- `asdlc init` — installs the registry, agent rules (AGENTS.md), and a CI gate
- `asdlc check` — five gates, one exit code; legacy repos baseline existing
  debt so only NEW drift blocks
- `asdlc audit` — scheduled re-diagnosis, because the drift never stops

It wraps jscpd, dependency-cruiser, and Semgrep rather than reinventing them.
The interesting parts are the trust rules, enforced in code:

- A crashed check reports **ERROR, never PASS**
- Silenced warnings **expire** — suppression ends on a date, and the finding
  comes back red
- An AI **cannot approve its own shortcuts**: baselines and waivers physically
  require a human's name plus a pointer to where approval was given

It was also built the way it preaches: the protocol was authored by two AI
models adversarially reviewing each other with me as judge, the CLI was
cross-reviewed by a rival model (which found 3 real verdict-integrity bugs
before release), and the tool's own validation caught a spec-conformance bug
in itself. Full pilot numbers are in the case study in the repo.

Honest limits, because this space is drowning in overclaims: gates prove the
absence of known, expressible violation classes — not correctness, and not all
drift. Clone detection sees textual similarity, not semantic equivalence. The
human-authored registry is the load-bearing part; the tool is the enforcement.

Repo: https://github.com/chennurivarun/asdlc · `npx asdlc-cli plan` is
read-only and changes nothing — that's the whole trial cost.

---

**Posting checklist (launch day):**
- [x] Repo flipped public (2026-08-30)
- [x] `npm publish` done — live as `asdlc-cli@0.1.0` (command stays `asdlc`)
- [ ] HN Show HN — **DEFERRED**: account under new-account Show HN restriction.
      Plan: participate genuinely for 2–4 weeks (comment on threads you actually
      know about — AI coding, code quality), then submit. Never work around the
      restriction; never coordinate upvotes (both get accounts banned).
- [x] dev.to cross-post — LIVE (2026-08-31)
- [x] LinkedIn — LIVE (2026-08-31)
- [-] X thread — skipped by owner decision
- [ ] Watch HN comments for the first 3 hours — answering questions early is
      half the launch
