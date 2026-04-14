# Session Handoff

> The point of this file: the last thing a session does is jot down where things stand, so the next session starts in context. Informal is fine.

---

## Last session — 2026-04-14 (M12 volcano)

M12 shipped. All five worlds are now playable, and the game has a real ending. The 5-world Tier-3 scope described in PLAN.md is done — this is the first session since the docs were written that `save.gameComplete` can actually be true.

### What's actually running

The menu now shows all five worlds as unlockable:

1. **The Farm** — 2 catches, 20s plan / 60s chase, 3 nets + 2 bananas + 1 cage, Dodge only.
2. **The Market** — 2 catches, cobblestone plaza + fountain/clock tower, + Glue + Corn Decoy traps, + Teleport cheat.
3. **The Docks** — 3 catches, water + pier + lighthouse, + Pretty Hen + Burger Bait, + Swim cheat.
4. **Castle Town** — 3 catches, maze-ish castle + village + catapult, + Cat Decoy trap, + Clone cheat.
5. **The Volcano** — 3 catches, black-ash slopes with lava rivers. All four cheats on. Two new hazards: **falling rocks** drop from the peak onto the player's area (8t stun + area damage, cadence doubles in FINAL FORM), and **all thrown eggs come out as flaming eggs** (8t stun instead of 5, bigger shake, ROAST bubble). W5 final catch plays the `VOLCANO_VICTORY` cutscene (player lunges in, hoists chump, caldera erupts in confetti) and then the SCORE screen shows **GAME COMPLETE** in yellow with "ENTER for menu  R to PLAY AGAIN".

### Volcano-specific files touched this session

- `src/world/level.js` — 11 new W5 tile types. LAVA added to SOLID. Player can't cross lava; chump's SWIM now treats WATER + LAVA as passable liquids in `chicken.js isStepAcceptable`.
- `src/world/volcano.js` — new world module. Tilemap, 7 buildings, 4 townies. Exports `fallingRocks=true`, `flamingEggs=true`, `cheats=['dodge','teleport','swim','clone']`, `cutsceneScript='VOLCANO_VICTORY'`.
- `src/world/index.js` — volcano registered in slot 5. WORLD_ORDER entry flipped to `exists: true`.
- `src/render/tiles.js` + `render/bake.js` + `render/renderer.js` — 11 new procedural tile draws (ash, obsidian, lava, magma rock, volcano peak, stone hut, shrine, cauldron, crystal, lookout, forge). All baked + wired.
- `src/entities/projectile.js` — `createEgg(fromCol, fromRow, targetCol, targetRow, fiery)` 5th arg. New `createRock(tc, tr)` with straight-drop pixel path.
- `src/entities/chicken.js` — LAVA treated like WATER in `isStepAcceptable`. `maybeThrowEgg` reads `ctx.flamingEggs` and passes `fiery` flag to `hooks.spawnEgg`.
- `src/main.js` — `tickFallingRocks(g)` spawns rocks from the peak when `worldDef.fallingRocks` is on (faster during final form, 55% biased toward the player's area). Rock landings damage any building on the target tile and stun the player if within 1 tile. `chumpHooks.spawnEgg` forwards fiery. `tickChump` ctx carries `flamingEggs`. Pickup spawnable-tile whitelist extended (ASH / OBSIDIAN / DOCK / PIER / CASTLE_FLOOR — docks & castle were latent bugs too). SCORE state accepts **R** on W5 win to replay.
- `src/render/renderer.js` — `drawProjectiles` renders 3 variants: plain egg, fiery egg (glow halo), rock (dark chunk + growing red reticle shadow).
- `src/systems/cutscene.js` — `VOLCANO_VICTORY` script, 240 ticks, 6 captions.
- `src/render/cutscene.js` — `drawVolcanoVictory` choreography (walk-in → lunge → hoist → confetti → pose) + own volcano background + heat shimmer + confetti helper.
- `src/systems/save.js` — `gameComplete` + `clears` flags in DEFAULT_SAVE, bumped in `recordRun` when W5 is cleared.
- `src/render/menu.js` — score screen: **GAME COMPLETE** banner + "chump delivered — the town is saved" when worldNum===5 && won. "ENTER for menu  R to PLAY AGAIN" hint. Title-screen footer flips to "ALL WORLDS CLEARED — chump captured x N" once the save has been beaten.
- `docs/TIMELINE.md` — M12 entry + backfilled missing M8/M9/M10/M11 entries the previous session never wrote.
- `docs/PLAN.md` — M12 checkboxes marked done.

### Smoke test

`node tools/smoke.mjs` still passes. All 5 worlds boot + run 300 AI ticks each without crashing. W5 burns through buildings fast (0/7 after 300 ticks) because chump has all cheats and SWIM lets him cut straight across lava. The rock hazard path is not exercised by the smoke test (it's triggered in main.js tick routing, not in the test harness) — worth adding in a future pass.

### Still not yet in / parked

- No in-browser playtest this session — bugs likely lurking, especially anything cosmetic in render or the final cutscene's choreography (sprite offsets, caption timing).
- Sound / SFX still deferred to M13.
- Mobile touch controls still deferred.
- Single-file `dist/index.html` concat build script — not written yet.
- **Future-upgrades wishlist from PLAN.md still parked**: Executive Clucks, Red Fox minions, arctic/ice level variant, proper spit-fire animation, cook NPC at the taco truck, SpeechSynthesis spoken taunts.
- Falling-rock hazard damages buildings on its target tile — that could enable a degenerate "rocks destroy all buildings before you can trap chump" scenario on W5. Tune if it feels cheap.

### Branch

`claude/finish-volcano-level-mD4nR` — all M12 commits landed here. Base is `d19466c` (the merge of the earlier W1–W4 PR).

---

## Picking this up next session

1. Skim `CLAUDE.md` → `docs/MEMORY.md` → this file
2. **Playtest all 5 worlds in a browser.** No code has actually been run in Chrome from the Claude side yet — runtime bugs are likely. Watch especially:
   - Volcano tile rendering (11 new procedural draws)
   - Falling rock collision with player / buildings
   - Flaming egg visual + stun duration
   - `VOLCANO_VICTORY` cutscene (player sprite + chump sprite + rope line + confetti)
   - Final GAME COMPLETE score screen + R-to-replay
3. Fix anything the playtest reveals.
4. Candidate next milestones (user's call):
   - **M13 polish** — mobile touch, sound, intro screen, accessibility
   - **Future-upgrades wishlist** — Executive Clucks + Red Fox minions (the comedy payload the user parked)
   - **Dist build script** — `tools/build.mjs` concat → `dist/index.html` for GitHub Pages / itch.io publish
   - **Balance pass** — W5 in particular: chump with all cheats + rocks + flaming eggs is very mean, may need tuning
