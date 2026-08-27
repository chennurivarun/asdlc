# Architecture

<!-- Written from what THIS repo actually does — never prescribed by a tool.
     Fill in the real homes; the boundaries you write here become enforceable
     dependency-cruiser rules. User approves before gates enforce it. -->

## Where things live in this repo

| Concern | Home | Rule |
| --- | --- | --- |
| Business rules / domain logic | `src/lib/` (example) | Screens and routes import from here; never reimplement inline |
| Shared UI components | `src/components/ui/` (example) | One component per concept; variants via props, not copies |
| Data access | `src/lib/` or `src/services/` (example) | Routes/screens never query storage directly |
| Shared types | `src/types/` (example) | One declaration per entity |
| Constants / config | `src/lib/constants` (example) | No magic values in screens |
| Error mapping | one shared error mapper | Raw provider/DB errors never reach a client response |

## Boundary rules this structure implies

<!-- These become .dependency-cruiser.cjs rules. Examples: -->
- Views/components must not import from `src/app/api/` internals.
- API routes must not import UI components.
- Nothing imports from another module's private internals (`**/internal/**`).

## Change rule

Propose updates to this document rather than deviating from it. Changes are
GOVERN operations: human approval with a pointer.
