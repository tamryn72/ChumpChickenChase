# Timeline

> Chronological log of what has shipped. Newest first. Format: `YYYY-MM-DD — [Milestone] — summary`.

## 2026-04-14 — M5 — Buildings with HP, Chump destroys them

- `entities/building.js` — cluster-of-tiles buildings with shared HP, bounding box, nearest-tile helpers, destroy-to-rubble conversion
- `world/level.js` — added RUBBLE tile type (walkable)
- `world/farm.js` — `createFarmBuildings` returning 8 buildings (Barn 12hp, Coop, Scarecrow, Tractor, Fence, 3x Hay) totaling ~32hp
- `render/tiles.js` — rubble tile (darker debris + soot + dust)
- `entities/chicken.js` — full priority rewrite: stunned → attackCooldown → destroy target adjacent-attack → greedy path toward target → wander fallback. Chump now actively seeks and demolishes the nearest alive building.
- `systems/particles.js` — extended pool with `kind` flag (feather/debris/smoke/spark). `addDebrisBurst` for destruction, `addAttackSpark` for each peck.
- `render/renderer.js` — drawChump does stun shake AND attack lurch in facing direction. `drawBuildingHPBars` shows green/yellow/red HP bars above damaged buildings.
- `main.js` — wires buildings into game, destroys tiles to rubble on HP=0, GAMEOVER if all destroyed, resetLevel rebuilds tilemap so damage doesn't persist.

## 2026-04-14 — M3 + M4 — Plan/Chase phase flow + working traps + catch mechanic

- `entities/trap.js` — Net / Banana / Cage with distinct stun durations (30 / 20 / 40 ticks). Banana also slides Chump one tile forward in direction of travel.
- State machine: `PLAN → CHASE → GOTCHA → VICTORY | GAMEOVER` with a click-anywhere retry.
- Click-to-place traps during PLAN. `1`/`2`/`3` select trap type. `ENTER` starts chase early.
- Catch mechanic: player manhattan-adjacent to stunned Chump → catches++, brief GOTCHA freeze, Chump respawns far from player. 2 catches → VICTORY. Timer out → GAMEOVER.
- `render/ui.js` — full HUD: catches counter, phase + timer banner, trap palette with selected highlight, bottom hint during PLAN, centered win/lose overlay.
- Hover cursor: yellow rect on walkable tiles, red on solids.
- Chump escape invulnerability after stun ends so he can't immediately re-trigger the same trap.
- `STUN_BUBBLES` and `ESCAPE_BUBBLES` lists for bratty reactions.

## 2026-04-14 — M2 — Chump lives, animated chicken + goo + feathers + first taunts

- `render/sprites.js` — Chump 24×24 full-body procedural sprite with 4-direction walk, floppy hair-piece wobble per frame, bratty eyes, yellow beak, wings, belly fluff, alternating leg-frame toes.
- `entities/chicken.js` — wander AI with seeded RNG, bias toward continuing same direction, occasional idle pauses, movement slower than player.
- `systems/particles.js` — pooled particle system. Goo (tile-bound, accumulates 0-3 intensity, orange splats under entities) and feathers (pixel-space with gravity, white+orange tip).
- `systems/bubbles.js` — speech bubble queue with rate-limited cooldowns per emotion category. Bordered white bubbles with tail.
- `main.js` — spawns Chump, ticks AI, triggers a taunt when player gets within 3 tiles.
- 7-entry TAUNTS list seeded from the README.

## 2026-04-14 — M1 — Walking farmer on Farm tilemap

- `render/palette.js` — PICO-8 16-color + Chump signature orange.
- `render/sprite-cache.js` — offscreen sprite cache (bake once, blit forever).
- `render/tiles.js` — procedural drawing for grass, dirt, fence, pond, hay, barn wall, barn roof, coop, scarecrow, tractor.
- `render/sprites.js` — pixel farmer (16×16), 4-direction walk with 2-frame leg bob.
- `render/bake.js` — centralizes all boot-time sprite baking.
- `render/renderer.js` — draws level tiles + player each frame.
- `input.js` — keyboard (arrows + WASD), horizontal-priority 4-directional.
- `world/level.js` — `Level` class with walkability + SOLID tile set.
- `world/farm.js` — hand-authored 20×15 Farm tilemap (barn, fence, coop, scarecrow, tractor, hay, pond).
- `entities/player.js` — grid movement with 2-tick-per-tile pixel interpolation.
- `main.js` — boot loop, fixed-timestep tick + RAF render, direct boot into Farm for dev.

## 2026-04-14 — M0 — Runnable boot scaffold

- `.gitignore`, `index.html` with pixel-scaled canvas, `src/config.js` with TILE/GRID/TICK constants, `src/rng.js` with seeded mulberry32, `src/main.js` with the empty fixed-timestep loop.
- Locked-in: hybrid art (Chump = procedural animated pixel sprite, environment chaos uses emoji/particles), full 5-world scope, indie distribution via GitHub Pages/itch.io.
- New mechanic: Tacos & Mexican food truck (documented in MEMORY.md).

## 2026-04-14 — M0 — Docs revised to drop rigid framing

- Revised `CLAUDE.md`, `docs/MEMORY.md`, `docs/PLAN.md`, `docs/SESSION_HANDOFF.md` to remove "locked / don't debate" language
- Reframed as working direction open to discussion, not contracts
- Expanded `PLAN.md` "Design calls" section with real multi-option analysis: art approach (full emoji vs procedural vs hybrid), scope tiers, sound timing, distribution shape, real-time vs ticks, catch mechanic, cutscene style, mobile timing
- Added explicit note: user provides no assets — everything from code
- No game code yet

## 2026-04-14 — M0 — Foundational docs

- Created `CLAUDE.md` at repo root — always-load session orientation
- Created `docs/MEMORY.md` — current working direction, game rules, design intents
- Created `docs/TIMELINE.md` — this file
- Created `docs/ARCHITECTURE.md` — systems map, file layout, core loop, AI priority tree, trap matrix
- Created `docs/PLAN.md` — 13 milestones + design discussion
- Created `docs/SESSION_HANDOFF.md` — handoff protocol
- **Current direction**: ES modules during dev, 10Hz logic tick, 20×15 grid at 32px, seeded mulberry32 RNG — all open to change
- Branch: `claude/game-docs-setup-mkNDN`
