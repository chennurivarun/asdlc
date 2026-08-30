# Vision

**ASDLC makes AI-written software trustworthy; Zaya is the coding agent that
can't ship untrustworthy software.** ASDLC is the law; Zaya is the first
citizen born under it.

---

## ASDLC

**The belief.** AI didn't just make coding faster — it broke the thing that
kept software consistent: human memory. Every AI session is a brilliant
amnesiac. The scarce resources in software are no longer typing speed; they
are **unambiguous intent** and **trustworthy verification**. The layer that
guards those is the most important layer of the AI-coding era.

**The vision.** A world where *"does it pass drift governance?"* is as boring
and universal a question as *"do the tests pass?"* — where every AI-built
repo has a registry of meaning, machine gates, and a drift grade, and merging
past a red check feels as reckless as merging failing tests does today.
ASDLC wins when nobody talks about it anymore — it just runs in every CI.

**The strategy: wedge → standard → platform.**

1. **Wedge (now).** The only tool that *cures* already-drifted AI codebases,
   with published receipts ([case study](case-study/CASE_STUDY.md)).
   Complement to Spec Kit / BMAD / Kiro; competitor to none.
2. **Standard.** The [drift score](docs/DRIFT_SCORE.md) becomes shared
   vocabulary — badges in READMEs, the metric people quote.
3. **Platform (later, if earned).** Open-core: the CLI free forever; hosted
   audits and org-wide drift dashboards paid. Walked only after the standard
   is real.

**The moat throughout: radical honesty.** Gates prove the absence of known,
expressible violation classes — not correctness, not all drift. In a category
drowning in overclaims, being the most conservative voice is the durable
differentiator. Pull requests that soften the honest-limits language are
declined on principle ([CONTRIBUTING.md](CONTRIBUTING.md)).

Concrete milestones live in [ROADMAP.md](ROADMAP.md).

---

## Zaya

**The belief.** Every coding agent today treats rules as *suggestions in a
prompt* — the agent is asked nicely to check its work. Zaya inverts that:
**the harness, not the model, holds the standards.**

**The vision.** *The first coding agent for whom "done" is not an opinion.*

- The registry of meaning is injected before every task — the agent is born
  knowing the rules instead of being asked to remember them.
- On task completion the harness itself runs `asdlc check` and **rejects
  red**. An agent cannot claim a task is finished; the gates decide.
- A drafted waiver freezes the task until a human rules on it.

Discipline isn't prompted; it's architecture.

**Why it can win against giants.** The big harnesses compete on model
intelligence — a race only frontier labs can afford. Zaya competes on **trust
architecture**, a design choice, not a compute budget. Affordable-model
economics make the expensive part structural: builder, auditor, and healer as
three separate sessions — "one context cannot police itself" built into the
loop. The model is pluggable (any OpenAI-compatible endpoint); **the harness
is the identity.**

**The gate.** Zaya starts only after the ASDLC CLI has real-world mileage —
a harness built on an unproven governance layer is just another fork.
Fork-base evaluation and architecture: [docs/ZAYA_EVALUATION.md](docs/ZAYA_EVALUATION.md).

---

## How they feed each other

ASDLC's users are Zaya's audience; Zaya is ASDLC's proof at maximum strength.
The spec stays harness-agnostic forever — Zaya must never be *required* —
which keeps ASDLC a neutral standard while Zaya is its flagship. Standard +
reference implementation: the oldest playbook in successful open source.

**The whole thing in three lines:**

- Yesterday: AI writes code fast; nobody trusts it.
- ASDLC: trust becomes checkable.
- Zaya: trust becomes unavoidable.
