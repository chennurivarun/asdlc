---
name: asdlc
description: Anti-drift protocol for this repo. Use at the START of any task that creates or changes shared or business-rule-bearing code, and before claiming any such task done. Enforces search-before-create, registry consultation, consumer sweeps, and asdlc check.
---

# ASDLC protocol (agent surface)

This repo is governed by the Anti-Drift Playbook v3.1.1 (see AGENTS.md managed
section). Follow this sequence for any task touching shared or rule-bearing code:

1. **Scope at concept level.** Name the business concepts touched and EVERY
   sibling entry point (create/edit/detail/report/export/import/job/API) — not
   just the file the user named.
2. **Consult the registry first.** Read `docs/BUSINESS_RULES.md`. If a touched
   term has a definition, that definition is authoritative. If a blocking-tier
   term (money, authz, tenancy, privacy, irreversible, external) is undefined,
   ask the human before coding — never silently pick a meaning.
3. **Search before create — and show the search.** Grep/graph-search for an
   existing implementation before writing any validator, component, service,
   type, constant, or util. Found → import it. Not found → create it in its
   `docs/ARCHITECTURE.md` home and register it in the same commit.
4. **Changing anything shared → generated consumer sweep.** List all discovered
   consumers with method and blind spots; update all, or propose a staged plan.
5. **Tests from acceptance criteria / registry definitions BEFORE implementing.**
   Never derive tests from the implementation.
6. **Before claiming done:** run `asdlc check` and show the output. Green
   (legacy: zero NEW findings) or the task is not done. Never edit gate configs,
   baselines, waivers, or CI to get green — suspected false positive → draft a
   waiver in `.asdlc/waivers.yml` with all fields and STOP for human approval.
7. **End-of-task sibling sweep:** one search for other occurrences of the touched
   pattern; list them, don't fix unprompted.
