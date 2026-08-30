# Drift score (badge spec, v0)

A repo-level number that makes drift governance visible — the way coverage
badges made testing visible. Computed by `asdlc audit`; displayed as a badge.

## Components (per audit)

| Metric | Meaning |
| --- | --- |
| `open` | new findings not baselined, not waived (should be 0 on a green repo) |
| `baseline` | acknowledged legacy debt remaining (burn-down target) |
| `waived` | active waivers (each expiring, each human-approved) |
| `governed` | concepts in the registry with a definition |
| `coverage` | gates actually running (not SKIPPED/ERROR) out of 5 |

## The score

```
drift_score = 100
  − 25 × min(1, open / 10)          # new drift is the cardinal sin
  − 15 × min(1, baseline / 200)     # debt drags, but is survivable
  −  5 × min(1, expired_waivers)    # expired waivers unaddressed = red flag
  − 25 × (1 − coverage / 5)         # gates not running = not governed
  − 30 × (governed == 0 ? 1 : 0)    # no registry = meaning lives nowhere
```

Bands: **A ≥ 90 · B ≥ 75 · C ≥ 60 · D ≥ 40 · F < 40**

## Honest-limits clause (non-negotiable in any rendering)

The score measures *governance activity*, not correctness and not the absence
of semantic drift. A high score means the machinery is running and nothing new
slipped past it — not that the definitions are right. That remains human work.

Status: shipped in v0.2 — `asdlc audit` prints the score and writes
`.asdlc/badge.json` (shields.io endpoint format); `asdlc audit --score`
prints just `"B 78"` for scripts. Weights remain provisional until three or
more validated pilots exist (see `docs/VALIDATION_LOG.md`).

Badge usage once `.asdlc/badge.json` is committed:
`https://img.shields.io/endpoint?url=<raw URL to your .asdlc/badge.json>`
