# Contributing

Thanks for looking at this. Ground rules are short and unusual, because this
project governs *itself* with the same rules it ships.

## Dev setup

```bash
git clone https://github.com/chennurivarun/asdlc.git
cd asdlc/packages/cli
npm install
npm run build && npm test        # 19 governance self-tests must stay green
```

Try your build against a scratch repo: `node dist/index.js plan` in any
git directory. `plan` and `audit` are read-only — safe everywhere.

## The three rules

1. **Verdict integrity is sacred.** Any change that could make a FAIL or
   ERROR read as PASS is a bug of the highest class. If your change touches
   gate evaluation, fingerprints, waivers, or baselines, it needs a test
   proving the red path stays red. The self-test suite
   (`test/governance.test.ts`) is the contract — extend it, never weaken it.
2. **Spec changes need evidence.** The playbook (`spec/`) is frozen at
   v3.1.1. Proposals to change it must cite observed behavior — a validation
   log entry, a reproducible failure, pilot data. "It would be nicer if" is
   not evidence. (This is the project's own Rule 6 applied to itself.)
3. **Honest limits stay.** PRs that remove or soften the honest-limits
   language (README, DRIFT_SCORE.md, audit blind-spots) will be declined.
   Overclaiming is the failure mode of this entire category; we don't do it.

## Practical notes

- TypeScript, Node ≥ 20, ESM. No new runtime dependencies without discussion —
  the CLI stays thin; scanners are wrapped, not absorbed.
- Bug reports: the issue templates ask for `asdlc check --verbose` output and
  your `.asdlc/config.yml` — those two answer most questions.
- False positives from a gate are valuable data even when they're not bugs —
  file them; they feed the validation log and the next spec revision.
- Be kind, be direct, argue with evidence. Maintainer decisions follow the
  same rule as the tool: approvals leave a pointer.
