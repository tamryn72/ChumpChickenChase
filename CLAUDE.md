# Trumplestiltskin — Claude Project Memory

> Orange Chicken Chaos: a pixel-art browser game where you chase a chaotic, rage-baiting orange chicken across 5 worlds to save the town. Two-phase levels (Plan → Chase). See `README.md` for the full design vision.

## How to read these docs

**Always load at session start, in order:**
1. `CLAUDE.md` (this file) — orientation & conventions
2. `docs/MEMORY.md` — locked decisions, gotchas, things not to re-debate
3. `docs/SESSION_HANDOFF.md` — what the last session left for you

**Reference as needed:**
- `README.md` — original design vision. Source of truth for feel. Don't modify without asking.
- `docs/PLAN.md` — milestones, current work, open questions
- `docs/ARCHITECTURE.md` — systems, data flow, file layout
- `docs/TIMELINE.md` — chronological log of what has shipped

## Project shape

- **Stack**: HTML5 Canvas 2D, vanilla JS, native ES modules. No bundler, no framework, no deps.
- **Entry**: `index.html` → `src/main.js`
- **Target**: modern desktop + mobile browsers, 60fps render
- **Logic tick**: fixed 10Hz. Render via `requestAnimationFrame` with interpolation.
- **Grid**: 20 cols × 15 rows × 32px = 640×480 logical canvas, CSS-scaled with `image-rendering: pixelated`.
- **RNG**: seeded `mulberry32` in `src/rng.js`. All randomness routes through it. Do NOT call `Math.random()` in gameplay code.
- **Assets**: no external files. All sprites are data arrays + palette, pre-rendered to offscreen canvases at boot.

## How to run

```bash
# Any static server works
python3 -m http.server 8000
# then open http://localhost:8000
```

Add `?debug=1` to the URL for dev overlays (grid, AI state, rage meter, pathfind viz, seed display).

## How to test

- **Manual**: playtest in browser; use `?debug=1` for overlays.
- **Headless AI sim** (planned, `tools/sim.js`): `node tools/sim.js --seed=42 --ticks=600` runs deterministic chicken AI against a fixed level for regression.
- **Lint/type**: none yet. TBD.

## Current branch

`claude/game-docs-setup-mkNDN` — all docs and scaffolding land here first.

## Conventions

- 2-space indent, semicolons required, single quotes for strings
- `camelCase` vars/functions, `PascalCase` classes, `SCREAMING_SNAKE` constants
- Files: `kebab-case.js`
- Grid coords are `(col, row)`, origin top-left
- Pixel coords are `(x, y)`; center of tile = `col * TILE + TILE/2`
- Durations expressed in **ticks**, not ms, wherever possible (`stunTicks`, not `stunMs`)
- Entity IDs: monotonic integers assigned by `game.nextId()`
- No `any`, no `unknown` — we're vanilla JS but keep shapes documented in JSDoc when non-obvious

## Golden rules

1. **Keep the vibe.** The chicken is bratty, rage-baiting, a constant menace. Never water down the personality to ship faster — the personality IS the product.
2. **One milestone at a time.** Ship M1 (walking farmer) before touching M2 (chicken AI). Don't batch.
3. **Ticks, not ms.** If design says "stun 3 ticks," use the tick counter, don't translate to 300ms.
4. **Ask before:** adding deps, changing grid size, breaking the ES-modules-no-build rule, or altering core feel.
5. **Update `docs/SESSION_HANDOFF.md` before ending any session.** First rule of picking up: read it. Last rule of putting down: write it.
6. **Never use `Math.random()` in gameplay code.** Always `rng.next()` so the sim harness stays deterministic.
