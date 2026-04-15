# Timeline

> Chronological log of what has shipped. Newest first. Format: `YYYY-MM-DD — [Milestone] — summary`.

## 2026-04-15 — M14 — Comedy payload (Executive Clucks + Red Fox minions)

The last wishlist milestone — Chump starts signing executive orders after each first catch and his four-flavor comedy layer finally lands. Game is effectively v1 content-complete after this.

- `src/main.js` — new `beginSigning(g)` picks a random order from `EXEC_ORDERS = ['speed', 'supersonic', 'foxes', 'tropical']`, activates order-specific side effects (`p.inputDelay = true` for speed, `supersonicCooldown = 60` for supersonic, `spawnDirectiveFoxes(g)` for foxes, no-op for tropical which hooks into `maybeThrowEgg`), bumps cumulative `save.ordersSeen[picked] = true`, persists the save, fires `playSfx('exec_order')`, and calls `setState(g, 'SIGNING')`. Signing ceremony is a new game state between GOTCHA and the next CHASE, 32 ticks long, skippable with Enter/Space/tap.
- `src/main.js GOTCHA tick` — after the usual 15-tick GOTCHA, checks: if catches ≥ needed → escape; else if `!execOrderSigned` → `beginSigning()`; else → normal respawn. Order signs on **first catch only**.
- `src/main.js` — per-CHASE-tick exec effects: supersonic cooldown ticks + triggers slow-mo when player is within 6 tiles, fox tick loop with contact stagger-stun, ice tint decay. New `EXEC_ORDER_INFO` (title / tagline / lines / hudLabel) used by both the signing ceremony and the HUD indicator.
- `src/main.js loadWorld` — new exec-order reset: `execOrder = null`, `execOrderSigned = false`, `signingT = 0`, `supersonicCooldown = 0`, `iceTint = 0`, `foxes.length = 0`.
- `src/main.js chumpHooks` — new `spawnIce(fc, fr, tc, tr)` hook.
- `src/main.js tickProjectiles` — handles `p.kind === 'ice'` with a 20-tick freeze stun, `g.iceTint = 22` on hit, `playSfx('ice_hit'/'ice_splat')`.
- `src/main.js CHASE taunt` — if `execOrder` is set, 50% of taunts pull from `EXEC_TAUNTS[order]` instead of the base `TAUNTS` pool.
- `src/main.js drawIceTint` — pale-blue full-screen overlay fading from alpha 0.45 → 0 over 22 ticks. Drawn between world render and menu overlays.
- `src/entities/fox.js` *(new)* — `createFox(col, row)` + `tickFox(fox, level, rng, player)` + `foxPixelPos(fox, alpha)`. Simple AI: pick the walkable neighbor with the smallest manhattan distance to the player (plus a small rng jitter so foxes don't all overlap), step there every 3 ticks, flag contact when manhattan ≤ 1. On contact, enter 10-tick recoil + bounce back one tile to avoid camping. No health — traps don't affect foxes; they clear when the level resets.
- `src/entities/player.js` — new `inputDelay` / `queuedDir` fields and `supersonicSlow` counter. `tickPlayer` reads input via the 1-tick queue when `inputDelay` is set. `movePace` returns 8 (4× slow) when `supersonicSlow > 0`. `supersonicSlow` ticks down each frame.
- `src/entities/chicken.js` — `maybeThrowEgg` has a new branch: if `ctx.execOrder === 'tropical'` and `rng.chance(0.5)`, call `hooks.spawnIce` instead of `hooks.spawnEgg`. Also exports `EXEC_TAUNTS` object with 4 lines per flavor.
- `src/entities/projectile.js` — new `createIce(fc, fr, tc, tr)` returns `{ kind: 'ice', ... }` with the same 12-tick flight path as eggs. `tickProjectile` and `projectilePixelPos` already generic for egg-like arcs, so no changes needed there.
- `src/render/sprites.js` — new `drawFox0` / `drawFox1` (16×16 orange body, red pointy hat with white band, red glowing eye, tipped tail, 2-frame leg cycle) and `drawIceCube` (8×8 pale blue cube with darker outline + white highlight).
- `src/render/bake.js` — bakes `fox_0` / `fox_1` / `ice_cube`.
- `src/render/renderer.js` — new `drawFoxes(ctx, foxes, alpha)` draws a pulsing red-eye glow halo + the fox sprite. Foxes added to the row-sorted entity draw list alongside townies. `drawPlayer` gained a Supersonic Order pulse effect: pale blue pulsing ring + interior tint while `p.supersonicSlow > 0`. `drawProjectiles` routes `p.kind === 'ice'` to the frost halo + `ice_cube` sprite path.
- `src/render/menu.js drawSigning(ctx, game)` — full signing ceremony render. Parchment scroll slides in from the right over 8 ticks, rolled end caps, header ("EXECUTIVE CLUCK"), large red order title, italic tagline, 2 description lines. Red "SIGNED" stamp slams down at `elapsed=18` growing from 2.2× → 1.0× scale. Chump sprite stands to the left dipping his beak. Skippable with "ENTER / tap to skip" hint.
- `src/render/ui.js` — new `EXEC_ORDER_HUD` label map. `drawHUD` renders a small orange order indicator directly under the catches counter when `game.execOrder` is set.
- `src/audio/sfx.js` — 5 new effects: `exec_order` (bass stamp thump + two-note melody), `supersonic` (descending sine zing), `ice_throw` (high triangle sweep), `ice_hit` (highpass crackle + descending triangle), `ice_splat` (highpass noise). All tuned into the same 3-tier peak gain scheme as the M13 audio pass.
- `src/systems/save.js` — `ordersSeen: { speed, supersonic, foxes, tropical }` added to `DEFAULT_SAVE`. Nested-merge path in `loadSave` picks it up. `cloneDefault` also copies it. Cumulative across all runs.
- `src/render/menu.js drawScore` — new "EXEC CLUCKS SEEN: X/4" row counting trues in `save.ordersSeen`. Gives the player a reason to replay.

## 2026-04-15 — M13 — Ship pass (mobile touch, menu juice, audio v2, food-truck polish)

Closing out every remaining M13 box and landing the small food-truck items on the way out.

- `src/input.js` — rewritten for touch. New `setTouchDir / injectPress / markTouchActive / isTouchActive` API. `getDir()` now merges keyboard + touch d-pad; sign-clamps the result. All keyboard handlers guarded so Node smoke tests keep importing cleanly.
- `src/main.js` — touch event handlers (`touchstart / touchmove / touchend / touchcancel`) hit-test the virtual d-pad, pause button, GO button, trap palette slots, menu rows, settings rows, and pause-menu rows. First `touchstart` flips `game.touchActive` which causes all touch UI to render. Dominant-axis selection for the d-pad avoids horizontal-priority stealing diagonal movement. `handleTouchStart` returns a role label so `touchmove` knows whether to keep updating d-pad direction, and `touchend` clears the d-pad if it was the moved-with finger.
- `src/render/ui.js` — new touch UI: virtual d-pad (bottom-left, 52px radius), pause button (bottom-right, 36×36), GO button (bottom-right, 96×52 during PLAN), and a thumb-friendly trap palette strip (54×44 slots with sprite icons + counts). `drawTouchControls(ctx, game)` is called from `drawHUD` so the renderer stays untouched. `trapPaletteSlots(game)` exports the strip layout for hit-testing. PLAN-phase desktop hint strip is suppressed when `touchActive` so the two don't overlap.
- `src/render/menu.js` — exported `menuLayout()` and `pauseMenuLayout()` for touch hit-testing. Title screen grew a staged intro animation driven by `game.menuIntroT`: title drops in with bounce (0–10t), subtitle fades in (8–18t), Chump stomps in from off-screen right with dust puffs under each step (14–34t), world list slides+fades in (30–46t), settings column slides+fades in (38–52t). Steady state at 52+ ticks. New `drawTransition(ctx, game)` renders a diagonal orange wipe + sliding label banner whenever `game.transitionT > 0`, with "PLAN" / "CHASE!" / "HE ESCAPED" labels for the player-relevant state changes. Every renderFrame path now draws the transition overlay just before the accessibility overlay.
- `src/main.js setState(g, newState)` — new helper routes **every** state change through `transitionT = 14` and, for MENU entries, resets `menuIntroT = 0`. All in-file `game.state = '...'` assignments were migrated to `setState(...)`. Menu + transition counters advance every tick regardless of the active state.
- `index.html` — canvas gets `touch-action: none` + `-webkit-tap-highlight-color: transparent` + `user-select: none` so pinch/scroll/selection don't hijack touch controls. Existing responsive sizing (`width: min(100vw, calc(100vh * 4 / 3))`) already adapts to phone viewports.
- `src/audio/sfx.js` — **Audio pass 2**. Added `BASE_MASTER = 0.5` + user `volume` (0..1.25) that multiplies the base on a single master gain node. New `setSfxVolume(v)` / `getSfxVolume()` exports. All 20-something effect peak gains were normalized into three tiers: UI ~0.16–0.20, combat ~0.22–0.28, big impacts ~0.30–0.38. Previous outliers (rock_land 0.55, building_destroy 0.55, final_form 0.5, egg_splat 0.35) were pulled down to the new ceiling of 0.38 so the mix doesn't clip during chaos. Two new effects: `spit_fire` (sawtooth sweep + highpass crackle) and `cook_scream` (two-note sawtooth yelp).
- `src/systems/save.js` — `settings.volume: 1.0` added to `DEFAULT_SAVE`. Existing nested-merge path picks it up on old saves.
- `src/main.js` + `src/render/menu.js` — menu settings column now has four rows: SOUND / VOLUME / REDUCED MOTION / HIGH CONTRAST. VOLUME shows a percentage and cycles through `[0.25, 0.5, 0.75, 1.0, 1.25]` on Enter/tap. Pause overlay gains the same VOLUME row; pause layout retuned to `PAUSE_START_Y = 150 / PAUSE_ROW_H = 28` for 6 rows.
- `src/systems/particles.js` — new `addSpitFire(particles, col, row, facing, rng)` shoots a directional flame cone in the entity's facing direction (22 `fire` particles + 5 upward smoke puffs). Fire particles render as a yellow core → orange shell → red outer as they age, for a short crackling burst.
- `src/main.js collectForChump` — when Chump eats a taco, the old egg-splat placeholder is replaced with `addSpitFire(... chump.facing ...)` + `playSfx('spit_fire')`. Shake bumped from 10 → 12.
- `src/render/sprites.js` — new `drawCookIdle` / `drawCookPanic` (16×16). White chef hat with yellow band, brown mustache, white coat with red apron buttons + dark grey button line. Idle pose holds a spatula and pan. Panic pose throws both arms up with a screaming O mouth.
- `src/render/bake.js` — bakes `cook_idle` + `cook_panic`.
- `src/entities/npc.js tickTownie` — `variant === 'cook'` branch: cook NPCs don't move, just flail animFrame while in panic state. Runs after the state-detection logic so wander/panic still flips on proximity.
- `src/render/renderer.js drawTownies` — routes `variant === 'cook'` to `cook_idle` / `cook_panic`. All other variants stay on the `townie_N_*` sprite scheme.
- `src/render/renderer.js drawBubbles` callback — now also looks up townie positions via `towniePixelPos`, so speech bubbles can attach to any NPC (not just player/chump).
- `src/world/farm.js createTownies` — adds a cook at `(12, 6)`, one tile below the taco truck window.
- `src/main.js` — townie tick loop detects wander→panic rising edge on the cook variant and plays `cook_scream` + a "MY TACOS" bubble. One-shot per entry thanks to the prev-state check.

## 2026-04-14 — M13 — Polish pass (sound, settings, accessibility, dist build)

- `src/audio/sfx.js` — new Web Audio procedural SFX module. Lazy-inits AudioContext on first user gesture (autoplay policy), silently no-ops if audio is unavailable. ~20 named effects built from oscillators + noise bursts: menu_cursor / menu_select / menu_back, trap_place / trap_snap, gotcha, egg_throw / egg_splat / egg_hit, rock_warn / rock_land, building_hit / building_destroy, pickup_taco / pickup_burger / pickup_cat, final_form, teleport, chump_squawk, cowabunga, victory, game_over, player_hit. Global mute + master gain wired to save state.
- `src/main.js` — sfx calls wired into: catch, trap place/snap, building hit/destroy, final form, teleport, egg throw/splat/hit, rock spawn+land, player hit (rock), all three pickups, timer-out / total-destruction game over, victory (cutscene enter), menu navigation.
- `systems/save.js` — `settings: { muted, reducedMotion, highContrast }` added to DEFAULT_SAVE, merged in loadSave (nested merge so new fields aren't lost on old saves). `cloneDefault` helper so mutating one save doesn't leak into another.
- `render/menu.js` — title screen now renders a **SETTINGS** column below the world list. TAB or left/right arrow jumps focus between worlds and settings. ENTER toggles a setting. Pulsing hint shows contextual controls for whichever column is focused.
- `render/menu.js drawPause` — new in-chase pause overlay. ESC or P pauses during CHASE; overlay offers RESUME + the same three toggles + QUIT TO MENU. Pause ticks halt gameplay (no player/chump/projectile/particle ticks during pause).
- `main.js tickMenu` / `tickPauseMenu` — menu + pause key handling. `toggleSetting(g, key)` centralizes mutation, persistence, and side-effects (setSfxMuted / setMotionScale). Global M-key mute works from both the title screen and in-chase.
- `main.js addShake(amt)` — new accumulator used everywhere shake was raised before. Respects `save.settings.reducedMotion`: if on, the shake is silently dropped. All direct `game.shake = Math.max(...)` writes were routed through this.
- `systems/particles.js setMotionScale(0..1)` — new motion-scale factor that multiplies all burst sizes (debris, smoke, spark, egg_splat). Reduced-motion mode sets it to 0.35 and also lowers the feather-pool cap from 300 → 120. Defaults to 1.
- `main.js drawAccessibilityOverlay` — high-contrast overlay applied after every render path: 3px white border + radial-gradient vignette so sprites pop against a darker frame. Toggleable per run.
- `tools/build.mjs` — new tiny dependency-free bundler. Walks `src/`, parses import/export statements with regex (handles named imports with `as` renames, `import * as`, grouped exports, multiline braces), topologically sorts modules, wraps each in an IIFE with `__exports`, and inlines the concatenated bundle into a copy of `index.html`. Emits `dist/index.html` at ~214 KB — single double-clickable file, no relative imports, no external deps. Verified to boot cleanly under Node with browser stubs.
- `.gitignore` — `dist/` ignored by default; commented instruction for when the user is ready to publish to GitHub Pages or itch.io.
- `tools/smoke.mjs` — still the regression harness. Passes after all changes.

## 2026-04-14 — M12 — The Volcano (World 5) + final victory

- `world/level.js` — W5 tile types: ASH, OBSIDIAN, LAVA, MAGMA_ROCK, VOLCANO_PEAK, STONE_HUT, SHRINE, CAULDRON, CRYSTAL, LOOKOUT, FORGE. Lava added to SOLID (player can't cross) but chicken.js `isStepAcceptable` treats LAVA the same as WATER so SWIM carries chump over molten rock.
- `world/volcano.js` — new world module. 20×15 ash slopes with lava rivers carving through the middle, smoking peak across the top, magma rocks walling the west. 7 buildings (Shrine, Magma Forge, Crystal Cluster, Lookout Tower, Cauldron, 2 Stone Huts). All four cheats enabled (`dodge`, `teleport`, `swim`, `clone`). Catches=3, planTimer=280, chaseTimer=900, cutsceneScript='VOLCANO_VICTORY'. New world flags: `fallingRocks=true`, `flamingEggs=true`.
- `world/index.js` — volcano registered at slot 5, `exists: true` on WORLD_ORDER.
- `render/tiles.js` + `render/bake.js` + `render/renderer.js` — 11 new procedural tile draw functions (drawAsh / drawObsidian / drawLava / drawMagmaRock / drawVolcanoPeak / drawStoneHut / drawShrine / drawCauldron / drawCrystal / drawLookout / drawForge), all baked into the sprite cache and wired into the renderer TILE_KEY.
- `entities/projectile.js` — `createEgg(..., fiery)` second flag. New `createRock(tc, tr)` for falling hazards with their own straight-drop pixel path.
- `entities/chicken.js` — `maybeThrowEgg` reads `ctx.flamingEggs` to upgrade throws into fiery eggs. LAVA treated as swimmable in isStepAcceptable.
- `main.js` — new `tickFallingRocks(g)` spawns rocks from the peak while `worldDef.fallingRocks` is on (cadence faster during FINAL FORM). Rock landings damage player (8t stun) and deal 1 damage to buildings on the target tile. `chumpHooks.spawnEgg` forwards the `fiery` flag. tickChump ctx now carries `flamingEggs`. Pickup-spawn walkable check extended with ASH / OBSIDIAN / DOCK / PIER / CASTLE_FLOOR. Rock timer reset in loadWorld. SCORE state accepts **R** to replay the volcano on final victory.
- `render/renderer.js` — `drawProjectiles` now renders 3 kinds: plain egg, fiery egg (orange/yellow glow halo), and rock (dark chunk + growing red reticle shadow on the target tile).
- `systems/cutscene.js` — `VOLCANO_VICTORY` script (240 ticks, 6 captions: cornered → unfair catch → going home → TOWN SAVED → orange chicken delivered → credits).
- `render/cutscene.js` — `drawVolcanoVictory` choreography: player pixel sprite walks in from the left, lunges, hoists chump overhead with a rope line, caldera erupts in confetti. Own volcano background + heat shimmer + stars. Routed through `drawCutscene` dispatcher.
- `systems/save.js` — `gameComplete` + `clears` flags added to DEFAULT_SAVE. `recordRun` flips `gameComplete=true` and bumps `clears` when W5 is cleared.
- `render/menu.js` — score screen shows **GAME COMPLETE** / "chump delivered — the town is saved" in yellow on W5 victory + "ENTER for menu  R to PLAY AGAIN" hint. Footer on title screen switches to "ALL WORLDS CLEARED — chump captured x N" once the game is beaten.

## 2026-04-14 — M11 — Castle Town (W4), Cat Decoy trap + Clone cheat

- `world/castle.js` — Maze-like castle interior on top (throne, crown room, kitchen, armory) with a village below (houses, inn) and a player-target catapult outside. 3 catches, 6 trap slots.
- `world/level.js` — W4 tile types: CASTLE_WALL, CASTLE_FLOOR, THRONE, CROWN_ROOM, KITCHEN, ARMORY, INN, VILLAGE_HOUSE, CATAPULT.
- `render/tiles.js` + `bake.js` + `renderer.js` — procedural tile art for all 9 W4 tiles.
- `entities/trap.js` — `CAT_DECOY` added. In main.js it drops a real cat pickup so the existing chase-cat priority handles it (mandatory override even in Final Form).
- `entities/chicken.js` — Clone cheat: on teleport, optionally leaves a fading decoy at the origin tile. `game.decoys` array + `renderer.drawDecoys` renders them with a lavender tint.
- `systems/cutscene.js` + `render/cutscene.js` — CASTLE_ESCAPE script + farm-style dispatch path.

## 2026-04-14 — M10 — The Docks (W3), water + Swim cheat, Pretty Hen + Burger Bait

- `world/docks.js` — Harbor with water tiles blocking the player, pier/dock walkable stone, lighthouse (2x2 load-bearing base + cosmetic top), boats, fish market, crane. 3 catches.
- `world/level.js` — WATER, PIER, DOCK, BOAT, WAREHOUSE, FISH_MARKET, LIGHTHOUSE_T/B, CARGO, NET_STACK, CRANE. WATER in SOLID so player can't step; chump's SWIM cheat bypasses via isStepAcceptable.
- `entities/chicken.js` — SWIM cheat honored. PRETTY_HEN + BURGER_BAIT as new lure traps (long flirt lock / bait reveal stun).
- `entities/trap.js` — PRETTY_HEN, BURGER_BAIT added to TRAP_TYPES + LURE_TRAPS + TRAP_STUN. Player `burgerBait` inventory from W1 carries in as a placeable trap here.
- Docks escape cutscene (speedboat donuts) via DOCKS_ESCAPE script in the farm-style renderer.

## 2026-04-14 — M9 — The Market (W2), Glue + Corn Decoy + Dodge + Teleport

- `world/index.js` — world registry interface. All worlds export the same shape (createLevel/createBuildings/createTownies + metadata).
- `world/market.js` — Cobblestone plaza with fountain, bakery, restaurant, clock tower (2-tile), fruit stand, 3 carts, flower shop. 2 catches.
- `entities/trap.js` — GLUE (stun 50) and CORN_DECOY (lure 50) added.
- `entities/chicken.js` — **Dodge** cheat: chance to sidestep passive traps on step. **Teleport** cheat: when cornered / high rage / player adjacent, blink to a random 3-6 tile away landing. `onTeleport` hook spawns sparkles + bubble.
- `render/cutscene.js` — bespoke `drawMarketStyleEscape`: chump kicks fruit stand → orange tidal wave rises from his goo trail → he surfs the crest yelling COWABUNGA → crashes off screen right.

## 2026-04-14 — M8 — Menu, escape cutscene, score screen, save state

- `render/menu.js` — title screen + world-select list driven by save.worldsUnlocked + drawScore overlay.
- `systems/save.js` — localStorage persistence with graceful degradation, scoreRun heuristic, recordRun advances unlocked worlds and records best stats.
- `systems/cutscene.js` + `render/cutscene.js` — cutscene state machine + FARM_ESCAPE choreography (stand → backflip → moonwalk → dab → sprint off).
- `main.js` — MENU / PLAN / CHASE / GOTCHA / ESCAPE_CUTSCENE / SCORE top-level state machine, save roundtrip, run-stats snapshot on catch.
- `tools/smoke.mjs` — headless node smoke test covering AI, pickups, cutscene, save roundtrip, cheat teleport firing, and world registry shape.

## 2026-04-14 — M7 — Taco truck, pickups (cat/burger/taco), townspeople NPCs

- `entities/pickup.js` — cat/burger/taco pickups with idle/tossed/dizzy/gone state machine, 30s self-despawn, parabolic toss arc for cats
- `entities/npc.js` — Townie entity with wander + panic states (runs away from Chump when within 4 tiles), pure cosmetic
- `world/level.js` — `TACO_TRUCK_L`, `TACO_TRUCK_R` tile types, both solid
- `world/farm.js` — taco truck placed at (12,5)-(13,5), `createFarmBuildings` includes `Taco Truck` (6hp), `createFarmTownies` returns 3 npc spawn positions
- `render/tiles.js` — procedural truck art (green awning, red trim, yellow body, window with TACOS text, door, green sign, wheels)
- `render/sprites.js` — drawCat (gray tabby), drawBurger (layered), drawTaco (crescent w/ filling), drawTownie0/1/2 idle+panic (3 color variants)
- `entities/chicken.js` — pickup priority BEFORE destroy: cat (mandatory) → taco (hate) → burger (opportunistic). Burger buff = 3 ticks/tile + 1-hit destroy + halved attack cooldown + orange glow. Taco eat = 10-tick self-stun + 30 rage + screen shake. Added CAT_BUBBLES ("grab that pussycat"), TACO_HATE_BUBBLES, BURGER_BUBBLES
- `entities/player.js` — `tacoBuff` field (80t speed buff, 1 tick/tile instead of 2, green pulsing glow), `burgerBait` inventory for M10 bridge
- `render/renderer.js` — draws pickups with dizzy-star wobble, townies in row-sorted entity list, burger buff orange glow on chump, taco buff green aura on player
- `main.js` — pickup spawn timers (taco 180t, burger 250t, cat 300t), player-side collection after move, chicken-side collection via onReachPickup hook, tacos spawn adjacent to truck, burgers/cats spawn on random grass/dirt/rubble tiles >=3 from player, townies tick each chase frame, respawn carries burger buff through catches

## 2026-04-14 — M6 — Rage meter, egg throwing, player stun, final form

- `entities/projectile.js` — createEgg + tickProjectile + parabolic arc pixel position (12-tick flight)
- Rage system inside `chicken.js`: passive +1/5s, +10 trap, +5 egg hit, +2 per building attack, cap 100. At 100 → FINAL FORM 50 ticks (5s), then resets to 0.
- Final form effects: 2x move speed (2 vs 4 ticks/tile), Net+Banana immunity, Cage reduced to 10t stun, 18-shake + bubble on trigger
- Egg throwing as a side action in tickChump: 40-60 tick cooldown, fires when player within manhattan 2-7, faces player on throw
- `entities/player.js` — stunTicks field, frozen-no-input state, flashing sprite
- `systems/particles.js` — new egg_splat kind (yellow/white burst with addEggSplat)
- `render/sprites.js` — drawEgg (8×8 white oval with yellow highlight)
- `render/renderer.js` — top-level save/translate for Math.random screen shake (render-only so doesn't touch gameplay determinism), drawChump radial red rage glow when rage > 50 or final form, drawChumpRageBar 24×2 red/white bar above chump, drawProjectiles with elliptical ground shadow for arc readability
- `main.js` — game.projectiles + game.shake, tickChump now takes a context object {level, rng, hooks, traps, buildings, player}, tickProjectiles handles landings (manhattan 1 of target = hit → 5t player stun + 14 shake + 5 rage + DIRECT HIT bubble), catch respawn carries rage + finalForm + burgerBuff

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
