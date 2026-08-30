# Zaya fork-candidate evaluation — 2026-08-27

Three-point checklist: (a) MIT/Apache license, (b) hookable task-completion
path, (c) real tool-calling loop.

## Candidate 1 — `lessweb/deepcode-cli` (Deep Code CLI) → **SELECTED**

- (a) **MIT** ✅ (`@vegamo/deepcode-monorepo`)
- (c) **Real harness** ✅ — `packages/core/src/` has a genuine tool system:
  `tools/executor.ts`, bash/web-search/read-image handlers, a **skill-handler**
  (it already has a skills concept to hang the ASDLC protocol on), plus
  `session.ts` / `prompt.ts`. ~80 TS source files across `cli` + `core` +
  a VS Code companion. Node/TypeScript — same language as `asdlc`, so the
  governance middleware can run **in-process** (import our gate runner
  directly, no shelling out).
- (b) Completion hook: `session.ts` is the seam — turn-end is where
  `asdlc check` gates "done". Detailed wiring is Phase 5 build work.
- DeepSeek-native: prompt/tool tuning for DeepSeek models already done upstream.
- Health check (2026-08-31): MIT confirmed via API, 2,224 stars, pushed within
  the last 2 days, 132 open issues — actively maintained, viable fork base.

## Candidate 2 — `fenwii/deepseek-cli` → rejected

- (a) Apache-2.0 ✅, but (c) fails: **10 source files** — a thin chat wrapper
  with a small WorkflowEngine, not an agent harness. Would mean building the
  loop ourselves, which is what forking was meant to avoid.

## Fallback

Pi (MIT, built-to-fork) if deepcode-cli's session loop proves too entangled
during integration — decide within the first two days of Phase 5 build.

## Names

- npm `asdlc`: **available** (checked 2026-08-27).
- npm `zaya`: **taken** (v0.0.2 placeholder) → options: `zaya-cli`, a scoped
  package, or contact the holder. Trademark search still pending — required
  before anything public uses the name.

## Architecture (locked)

Fork deepcode-cli → keep its loop/UI/DeepSeek client → add governance
middleware (~500 lines): pre-task registry injection into context; turn-end
interception that runs the asdlc gate runner in-process and rejects "done" on
red; waiver-draft → hard halt for the human. Model pluggable via
OpenAI-compatible endpoint config; the harness is the identity, not the model.
