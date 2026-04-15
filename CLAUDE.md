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

## Project shape

Settled, post-M14. Game is v1 content-complete.

- **Stack**: HTML5 Canvas 2D, vanilla JS, native ES modules for dev. Bundled to a single `dist/index.html` via `tools/build.mjs` for itch.io. GitHub Pages serves the repo root directly (no build step).
- **Entry**: `index.html` → `src/main.js`
- **Target**: modern desktop + mobile browsers (touch d-pad + virtual buttons wired in M13)
- **Logic / render**: fixed 10Hz logic tick + RAF render with pixel interpolation
- **Grid**: 20×15 tiles × 32px = 640×480 logical canvas
- **RNG**: seeded `mulberry32` in `src/rng.js`
- **Art**: hybrid — procedural pixel-art sprites baked once at boot via `render/bake.js`, plus emoji/procedural particles for chaos effects
- **Assets**: fully self-contained. No images, no audio files, no fonts beyond system. Everything procedural.

## How to run

```bash
# Any static server works
python3 -m http.server 8000
# then open http://localhost:8000
```

Add `?debug=1` to the URL for a small top-left info overlay (tick, state, world, player/chump coords, rage, finalForm, buffs, entity counts). It's just a readout — no hotkeys.

## How to test

- **Manual**: playtest in browser; use `?debug=1` for the info overlay
- **Headless smoke**: `node tools/smoke.mjs` — stubs the browser globals and runs the full sim across all 5 worlds, exercising catches, traps, cheats, and the save roundtrip
- **Single-file build**: `node tools/build.mjs` — emits `dist/index.html` for itch.io. See `docs/PUBLISHING.md`.
- **Lint/type**: none

## Current branch

`claude/publishing-guide-bZm18`

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
