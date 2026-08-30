---
name: False positive
about: A gate flagged something that is genuinely fine — this is valuable validation data
labels: false-positive
---

**The finding** (paste the line from check/audit output, including the
`[fingerprint]`):


**Which gate:** duplication / boundaries / patterns / registry / contracts

**Why it's a false positive** (why the policy is wrong here — the same
reasoning a waiver would need):


**Would a default-config change fix it, or is this repo-specific?**


<!-- False positives feed docs/VALIDATION_LOG.md and future spec revisions.
     Repo-specific ones are what waivers are for; systematic ones change
     defaults. Both reports help. -->
