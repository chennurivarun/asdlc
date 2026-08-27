# ASDLC — Agentic Software Development Lifecycle

Every SDLC generation answered a shifted bottleneck: Waterfall managed scarce
compute, Agile managed changing requirements, DevOps managed the gap between
writing and running code. Agentic coding shifts it again: **code production is
nearly free, so the scarce resources are unambiguous intent and trustworthy
verification.** ASDLC is a lifecycle built for that reality.

## The five principles

1. **Meaning is authored, code is derived.** Definitions of business concepts live
   in one human-owned artifact (the registry). Whatever meaning isn't written down
   and enforced between sessions will fragment.

2. **Builder, auditor, and healer are separate sessions.** One context cannot
   police itself. The session that writes code never certifies it; a separate
   verifier checks, and a human owns intent.

3. **Verification is continuous and adversarial.** Tests come from acceptance
   criteria before code exists — never derived from the implementation, because
   tests written from code certify its bugs. Audits re-run on a schedule.

4. **Authority is explicit.** Agents propose; humans approve; approvals leave
   pointers. A crashed check reports ERROR, never PASS. Suppressions expire.

5. **Detection bounds what prevention misses.** Drift will be written — attention
   drifts, sessions forget. The guarantee worth having is not "no drift is ever
   written" but "no drift survives the next audit." Drift is fractal: cures drift
   too, which is why the audit loop never ends.

## Why drift is the default in AI development

- Agents code at the scope of the prompt, not the system; sibling entry points
  outside the context window never get updated.
- Generation is cheaper than search: writing a fresh validator is one forward
  pass; finding and reusing the canonical one can fail. Duplication is the
  model's path of least resistance.
- Undefined terms get silently filled with a *plausible* meaning per session —
  and plausible is not consistent.
- Agents are additive: nothing prompts deletion or asks "does anything consume
  this?"
- Agent-written tests mirror the code that was just written: green suite,
  broken product.

These are not bugs in any one model. They are structural properties of
session-scoped development — the same disease human teams have always had
(Conway's law, shotgun surgery, turnover), with the social immune systems
(code review, tribal memory, the grumpy senior dev) removed. ASDLC rebuilds
those institutions in explicit, machine-enforceable form.

## The protocol

The normative protocol is the frozen
[Anti-Drift Playbook v3.1.1](ANTI_DRIFT_PLAYBOOK_v3.1.1.md). The `asdlc` CLI
implements its setup (S1), gate (S2.6/G1–G5), waiver (SW), and audit (S3 Stage
1/4) machinery. The playbook's S2 feature protocol and S3 cure protocol are
agent-and-human workflow; the CLI enforces their checkable parts.

Changes to the spec are evidence-driven only: pilot data first, editing second.
