# Trumplestiltskin — Claude Project Memory

> Chump Chicken Chase (project codename: Trumplestiltskin): a chaotic browser game where you chase a bratty, rage-baiting orange chicken across 5 worlds to save the town. Two-phase levels (Plan → Chase). `README.md` is the original design brief — it's our compass, not our cage.

## How to read these docs

At session start, skim these three:
1. `CLAUDE.md` (this file) — orientation & conventions
2. `docs/MEMORY.md` — current working direction, game rules, gotchas
3. `docs/SESSION_HANDOFF.md` — what the last session left for you

Reference as needed:
- `README.md` — original design brief (vibe + mechanics)
- `docs/PLAN.md` — milestones, design choices in play, open questions
- `docs/ARCHITECTURE.md` — systems, data flow, file layout
- `docs/TIMELINE.md` — chronological log of what has shipped

## Project shape (current direction)

Most of this is still open for discussion — `docs/PLAN.md` tracks what's settled vs. still in the air.

- **Stack**: HTML5 Canvas 2D, vanilla JS. Likely native ES modules for dev, possibly bundled to a single HTML for distribution — TBD.
- **Entry**: `index.html` → `src/main.js`
- **Target**: modern desktop + mobile browsers
- **Logic / render**: leaning fixed 10Hz logic tick + RAF render with interpolation, but real-time is a viable alternative
- **Grid**: leaning 20×15 tiles at 32px (640×480 logical), open to change
- **RNG**: seeded `mulberry32` in `src/rng.js` so bugs can be reproduced and AI can be sim-tested
- **Art**: leaning hybrid (emoji for effects/pickups/particles, simple procedural tiles for terrain/characters) — this is the biggest open question, see `PLAN.md`
- **Assets**: aiming for self-contained — user provides nothing, everything comes from code or system fonts

## How to run

```bash
# Any static server works
python3 -m http.server 8000
# then open http://localhost:8000
```

Add `?debug=1` to the URL for dev overlays (grid, AI state, rage meter, pathfind viz, seed display).

## How to test

- **Manual**: playtest in browser; use `?debug=1` for overlays
- **Headless AI sim** (planned, `tools/sim.js`): `node tools/sim.js --seed=42 --ticks=600` for deterministic AI regression
- **Lint/type**: none yet

## Current branch

`claude/comedy-payload`

## Code conventions (current)

- 2-space indent, semicolons, single quotes
- `camelCase` vars/functions, `PascalCase` classes, `SCREAMING_SNAKE` constants
- Files: `kebab-case.js`
- Grid coords `(col, row)`, origin top-left
- Durations in **ticks** where we can keep balance integer and testable
- Entity IDs: monotonic integers from `game.nextId()`

## Working principles

Current operating defaults, not commandments. If any of them becomes friction, raise it — all of this is revisable.

- **Vibe first.** The bratty chicken personality IS the product. Protect it when making trade-offs.
- **Ship in small chunks.** Each milestone should be browser-playable, even if partial.
- **Integer durations where possible.** Makes balance math predictable and testable.
- **Handoff hygiene.** Update `docs/SESSION_HANDOFF.md` at the end of a session so the next starts clean.
- **Route randomness through `rng.js`** so bugs can be reproduced. (If seeding becomes friction, we drop it.)
- **User provides nothing.** No graphics, no audio, no assets. Everything must come from code, system fonts, or procedural generation.
