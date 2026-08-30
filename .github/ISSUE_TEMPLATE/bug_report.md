---
name: Bug report
about: Something crashed, misbehaved, or produced a wrong verdict
labels: bug
---

**What happened**


**What you expected**


**Verdict-integrity check** (tick if applicable — these get top priority):
- [ ] A check that should have been RED showed green/PASS
- [ ] A crashed or missing scanner showed PASS instead of ERROR
- [ ] A new finding was wrongly treated as baselined or waived

**Reproduction**
- Command run:
- Output of `asdlc check --verbose` (or `audit`):
- Your `.asdlc/config.yml`:
- OS / Node version:
