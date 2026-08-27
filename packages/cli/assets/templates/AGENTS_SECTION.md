[ANTI-DRIFT CONSTITUTION v3.1.1 — managed section]

# Standing Orders — read fully before any task

Invariant: **within each bounded context and contract version, every governed
business concept has one approved DEFINITION (docs/BUSINESS_RULES.md);
implementations declare the version and conformance profile they satisfy and either
import the canonical module or prove conformance via that profile's contract tests
(tests/contracts/).** Duplicated meaning is the disease; declared conforming
implementations for genuinely different contexts are legitimate.

Scope of Rules 1/2/4: shared or business-rule-bearing code — governed concepts, the
shared homes in docs/ARCHITECTURE.md, and anything multiple entry points consume.
Local glue and trivial private helpers: normal judgment.

Rule 1 — Search before create; show the search. For shared/rule-bearing validators,
components, services, types, constants, utils: search graph+grep+registry first and
show it. Found → import, or conforming implementation with declared profile +
contract tests where context requires (say why import wasn't possible). Not found →
create in its docs/ARCHITECTURE.md home + register, same commit. Unshown search =
incomplete task.

Rule 2 — Undefined business terms, by risk. Blocking tier (money, authz/visibility/
tenancy, privacy, irreversible, external, data-migration): ask first, always.
Reversible: propose, proceed, record the assumption visibly. Incidental: judgment.
Batch questions. Never silently pick a meaning for blocking-tier terms.

Rule 3 — Homes and boundaries come from docs/ARCHITECTURE.md. Follow it; propose
updates rather than deviating. Business logic stays out of routes/screens per that
document; raw errors go through the shared error mapper.

Rule 4 — Changing/removing anything shared = generated sweep. Present the consumer
list as "all discovered consumers (method, blind spots)" — never claim unqualified
completeness — update all, or propose a staged migration where same-commit is
unsafe. Updating only the named file is a bug.

Rule 5 — Tests from acceptance criteria / registry definitions, before
implementing. Never derive tests from the implementation.

Rule 6 — Checks before done; never touch them. Run `asdlc check` (functional tests,
contract-profile tests, registry + waiver-expiry validation, duplication,
architecture, patterns). Show output; green (legacy: zero NEW) or not done. Never
raise thresholds, add ignores, edit baselines, or alter CI for green. False
positive → draft a waiver (.asdlc/waivers.yml, all fields incl. fingerprint) and stop
for approval. Gate configs, baselines, waivers, rules, this file, ARCHITECTURE.md,
CI: GOVERN only — human approval with a pointer. A crashed check reports ERROR,
never PASS.

Rule 7 — Leave a trail. New shared module / changed definition / removed feature →
registry same commit (definitions by hand; implementation/consumer lists change
only via approved audit proposals).

Rule 8 — End-of-task sibling sweep: search once for other occurrences of the
touched pattern; list, don't fix unprompted.

Rule 9 — Scope discipline: work in declared, reviewable chunks; keep coupled
concepts atomic when separating them would itself create inconsistency.
