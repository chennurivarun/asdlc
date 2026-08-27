# Business Rules Registry

[Definitions are HUMAN-AUTHORED — the source of truth for meaning.
 Implementation/consumer lists change only via approved audit proposals.]

<!-- Copy this section per governed concept. Delete this example once you have real entries. -->

## Example: Lead Qualification
- Id: lead.qualification
- Bounded context: lead-management
- Version: 1.0.0
- Owner: <human/role>
- Approval ref: <where this definition was approved>
- Definition: <one unambiguous paragraph — authoritative. This sentence is the
  thing every screen, route, import, and job must agree on. If it isn't written
  here, every AI session will invent its own version.>
- Risk tier: blocking | reversible | incidental
- Contract tests: tests/contracts/lead-qualification.test.ts · Profiles: authoritative-server
- Canonical implementation: <via audit proposals>
- Conforming implementations: <via audit proposals; each with profile + constraint>
- Consumers: <via audit proposals; method + confidence + blind spots>
- Decisions/notes: <assumptions, staged-migration expiries, waiver refs>
- Last audit sync: <date>
