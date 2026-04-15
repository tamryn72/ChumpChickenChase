# Architecture

> Snapshot of how the code is actually organized after M14. The original M0 doc described an aspirational layout with a dozen `systems/` modules; reality is leaner. This file is the current truth.

## Stack

- HTML5 Canvas 2D, vanilla JS
- Native ES modules in `src/` for dev (33 modules, mostly < 300 lines)
- No runtime dependencies, no external assets — every sprite, sound, and tile is procedural
- Ships two ways: served from the repo root (GitHub Pages) or bundled into a single `dist/index.html` via `tools/build.mjs` (itch.io). See `docs/PUBLISHING.md`.

## File layout

```
index.html                 # canvas + module entry, meta tags
src/
  config.js                # TILE, GRID_W/H, TICK_HZ, URL flag helpers
  rng.js                   # mulberry32 seeded PRNG
  input.js                 # keyboard + touch d-pad/buttons → unified API
  main.js                  # boot, RAF loop, state dispatch, Executive Cluck orchestration
  audio/
    sfx.js                 # Web Audio procedural effects, lazy-init on first gesture
  entities/
    player.js              # 16×16 player, grid step + interpolation, inputDelay queue
    chicken.js             # Chump AI, rage, final form, priority tree, taunts
    fox.js                 # M14: Red Foxes Directive minions, contact stagger-stun
    npc.js                 # townies (civilian + cook variant), wander → panic
    building.js            # protectables with hp + destroy animation
    trap.js                # trap type enum + stun durations + lure set
    pickup.js              # burger, taco, cat
    projectile.js          # eggs, ice cubes (M14 Tropical), W5 falling rocks
  systems/
    save.js                # localStorage persistence with nested merge
    particles.js           # pooled particles (feather/goo/fire/smoke/spark/confetti/etc)
    bubbles.js             # speech bubble queue, rate-limited per emotion category
    cutscene.js            # scripted escape + victory sequences
  render/
    palette.js             # color constants
    sprites.js             # procedural sprite drawing (per-key drawFn)
    tiles.js               # procedural tile drawing (terrain per world)
    bake.js                # at-boot bakeAll(): pre-render every sprite/tile to OffscreenCanvas
    sprite-cache.js        # bake() + draw() blit helpers
    renderer.js            # main render dispatch, z-sorting, screen shake
    ui.js                  # HUD, trap palette, touch d-pad/buttons, Executive Order badge
    menu.js                # MENU/PAUSE/SCORE/SIGNING screens, transitions
    cutscene.js            # escape/victory animation rendering
  world/
    level.js               # Level class, TILE_TYPES enum, walkable check
    index.js               # WORLD_ORDER + getWorldDef(num)
    farm.js, market.js, docks.js, castle.js, volcano.js   # per-world builders
tools/
  smoke.mjs                # headless regression harness (Node)
  build.mjs                # single-file ESM bundler (Node)
docs/
  CLAUDE.md, MEMORY.md, PLAN.md, ARCHITECTURE.md, TIMELINE.md, SESSION_HANDOFF.md, PUBLISHING.md
README.md                  # original design brief
```

There is no `state.js`, `game.js`, `pathfind.js`, `collision.js`, `cheats.js`, `rage.js`, `fire.js`, `camera.js`, or `tools/sim.js`. All of that is folded into `main.js` and the entity files. The "monolith + small entities" shape is intentional for a jam-scale game.

## Core loop

```js
// main.js (simplified)
let accumulator = 0;
const TICK_MS = 1000 / TICK_HZ; // 100ms

function frame(now) {
  accumulator += now - last;
  last = now;
  while (accumulator >= TICK_MS) {
    tick(game);
    accumulator -= TICK_MS;
  }
  render(game, accumulator / TICK_MS); // alpha for interpolation
  requestAnimationFrame(frame);
}
```

Fixed 10Hz logic tick + RAF render with pixel interpolation. Every duration in the codebase is in ticks; 30 ticks = ~3 seconds.

## State machine

```
MENU ──► PLAN ──► CHASE ──► GOTCHA ──► SIGNING ──► CHASE   (first catch of level only)
                    │           │
                    │           └────► CHASE                (subsequent catches)
                    │
                    ├──► ESCAPE_CUTSCENE ──► SCORE ──► MENU (W1-W4 final catch)
                    │
                    └──► SCORE ──► MENU                     (timer expires / all buildings destroyed)
```

State responsibilities:

- **MENU** — title screen + world select + settings panel. Has its own intro animation (Chump stomps in, list slides in).
- **PLAN** — time paused. Player places traps from a palette. Tap GO / press Enter → CHASE.
- **CHASE** — 10Hz simulation. Chicken active. Player can still place from a limited chase supply. ESC/P opens an in-place pause overlay (not a separate state — sim halts but state stays CHASE).
- **GOTCHA** — short victory beat after a catch. Hard-paused (no AI, no particles, no projectile motion).
- **SIGNING** — M14 Executive Cluck ceremony. 32 ticks. Fires only on the **first** catch of each level. Parchment scroll slides in, SIGNED stamp slams down, beak dip. Skippable. Hard-paused.
- **ESCAPE_CUTSCENE** — scripted escape sequence (W1-W4) or volcano victory (W5). Input limited to skip.
- **SCORE** — per-level results screen. Shows catches, traps used, buildings saved, time, EXEC CLUCKS SEEN: X/4, plus best stats.

Every transition routes through `setState(g, newState)` in `main.js`, which sets `transitionT = 14` so `drawTransition()` in `menu.js` can paint a diagonal orange wipe + sliding banner. Direct `game.state = ...` assignment is forbidden.

## Entity model

No base class, no `Entity` superclass. Every entity is a plain object created by a factory function (`createPlayer`, `createChump`, `createTrap`, `createFox`, etc.). Common-ish fields:

```js
{
  col, row,        // grid coords
  px, py,          // interpolated pixel coords (tweened between ticks)
  facing,          // 0=up 1=right 2=down 3=left
  moveT,           // 0..pace counter for grid-step interpolation
  stunTicks,       // 0 = active
  // ...per-type state lives directly on the object
}
```

- **Dynamic**: player, chump, foxes, projectiles, pickups, particles, townies
- **Static**: buildings, placed traps, terrain features
- **Tile data**: `level.tiles[row][col]` carries `{ terrain, walkable, flammable, onFire, goo }`. Buildings are separate entities, not tile flags.

## Chicken AI — `tickChump()` in `src/entities/chicken.js`

Each tick runs in this order. Side actions (egg throw, teleport) can fire in parallel with movement; the main decision tree only runs on the movement step.

**Per-tick housekeeping:**

1. Decay timers — `attackAnim`, `burgerBuff`, `teleportFlash`
2. Final form clock — at `rage ≥ 100`, enter `finalForm = 50` ticks; on expiry reset rage to 0
3. Passive rage — `+1` every 50 ticks (~5 seconds)
4. **Side action: egg throw** — `maybeThrowEgg()`. If player in range [2..7 tiles] and cooldown ready, throw an egg. **M14**: if `ctx.execOrder === 'tropical'`, 50% chance to launch an ice cube instead (same arc, freezes player 20 ticks on hit).
5. **Side action: teleport** — `maybeTeleport()`. Fires when cornered (≤1 valid move), `rage ≥ 70`, or player adjacent. With CLONE cheat unlocked, also drops a decoy.
6. Stun recovery — decrement `stunTicks`; on reaching 0, grant 8t invulnerability window
7. Movement interpolation — advance `moveT` until ready for next grid step
8. Attack cooldown hold — skip the decision tree if mid-attack

**Main decision tree (priority order, runs only on movement step):**

| # | Action | Condition |
|---|---|---|
| 1 | **PICKUP** | Cat > Taco > Burger (if not already buffed). Path → consume on arrival. |
| 2 | **LURE TRAP** | Nearest CORN_DECOY / PRETTY_HEN / BURGER_BAIT in pathable range. Path → trigger lock-in stun on arrival. |
| 3 | **DESTROY** | Attack adjacent building (1-hit if burger-buffed, otherwise per-attack hp damage), else path to nearest building. |
| 4 | **WANDER** | Random walk biased toward current facing + small mischief actions. |

Pathing is **simple Manhattan-distance neighbor selection**, not A*. Chump can get stuck behind walls in pathological maps; in practice he doesn't because every level is laid out to keep him moving.

## Cheat modifiers

Set per-world via `ctx.cheats` (an array of cheat names). Each is a modifier on Chump's behavior, not a separate state:

- **DODGE** — when about to step onto a passive trap tile, 70% sidestep roll. Lure traps are exempt (Chump *wants* those).
- **TELEPORT** — fires from `maybeTeleport()`. Triggers when cornered, raging, or player-adjacent. Jumps 3-6 tiles to a random valid tile, ~60t cooldown. With CLONE, also leaves a decoy.
- **SWIM** — water tiles (W3 docks) and lava tiles (W5 volcano) become walkable. Player still can't enter them.
- **CLONE** — when teleporting, spawn a wander-AI decoy. Player catching the decoy whiffs and triggers the `"I am the best at escape..."` taunt.

Per-world unlock schedule:

| World | Cheats |
|---|---|
| W1 Farm | Dodge |
| W2 Market | Dodge + Teleport |
| W3 Docks | Dodge + Teleport + Swim |
| W4 Castle | Dodge + Teleport + Clone |
| W5 Volcano | All four (Swim now covers lava) |

## Rage meter

`addRage(c, amount)` is the only way rage moves. Sources (grep `addRage(`):

| Source | Amount | File |
|---|---|---|
| Passive drip | +1 every 50 ticks (~5s) | `chicken.js:401` |
| Trap triggered | +10 | `chicken.js:291` |
| Building destroyed | +2 | `chicken.js:487` |
| Egg hit lands on player | +5 | `main.js:942` |
| Catch / escape kicker | +30 | `main.js:812` |

At `rage ≥ 100`, Chump enters `finalForm` for **50 ticks** (5s). Final form is faster, immune to NET/BANANA, and reduces CAGE stun to 10 ticks. On expiry, rage resets to 0.

Visuals: head scale, hair flop amplitude, and red glow alpha all derive from `rage / 100`.

## Trap × chicken interaction matrix

Stun durations from `TRAP_STUN` in `src/entities/trap.js`. 10 ticks = 1 second.

| Trap | Stun | Lure? | Final Form |
|---|---|---|---|
| NET | 30t | — | immune |
| BANANA | 20t + slide 1 tile | — | immune |
| CAGE | 40t | — | reduced to 10t |
| GLUE | 50t | — | normal |
| CORN_DECOY | 50t (eating lock) | yes | normal |
| PRETTY_HEN | 60t (flirt lock) | yes | normal |
| BURGER_BAIT | 40t (bait reveal) | yes | normal |
| CAT_DECOY | mandatory override | yes | mandatory |

DODGE applies to non-lure traps only (70% sidestep roll). Cat Decoy is the only absolute — even FINAL FORM can't ignore it.

Per-world trap inventory:

| World | New traps unlocked | Inventory size |
|---|---|---|
| W1 | Net, Banana, Cage | 3 |
| W2 | + Glue, Corn Decoy | 5 |
| W3 | + Pretty Hen, Burger Bait | 5 |
| W4 | + Cat Decoy | 6 |
| W5 | all | 7 |

## Executive Orders (M14)

After the **first catch of each level**, the SIGNING state fires and Chump signs one random Executive Order. The flavor lives on `game.execOrder` until the level ends, then clears. The HUD draws an "ORDER: …" badge under the catches counter while active. Orchestration is in `main.js`; the per-flavor effects live where the affected behavior already lives.

| Flavor | Effect | Implementation |
|---|---|---|
| **speed** | Player inputs queue one tick late | `player.inputDelay = true` + `queuedDir` in `entities/player.js` |
| **supersonic** | When player within 6 tiles, Chump triggers a 20-tick 4× slow on the player. 140-tick cooldown after each fire. Pale blue pulse halo while active. | `main.js` chase tick (~lines 1066-1078) |
| **foxes** | Spawn 3 red-hatted fox minions. Move toward player every 3 ticks, stagger-stun on contact (5t stun + 10t recoil + 1-tile bounce). Cleared on level end. | `entities/fox.js` + spawn in `main.js` SIGNING entry + tick in `main.js` chase loop |
| **tropical** | 50/50 chance Chump's egg-throw becomes an ice cube. Same arc, but on hit freezes player 20 ticks and triggers a fading pale blue screen tint. | `maybeThrowEgg()` in `chicken.js` checks `ctx.execOrder === 'tropical'` |

Order-flavored taunts live in `EXEC_TAUNTS` in `chicken.js` — 4 lines per flavor. While an order is active, ~50% of CHASE-tick taunts pull from the flavored pool.

`save.ordersSeen = { speed, supersonic, foxes, tropical }` is cumulative across runs and surfaces on the SCORE screen as `EXEC CLUCKS SEEN: X/4`.

## Rendering pipeline

**Two-stage**: bake at boot, blit per frame.

1. **`render/bake.js` `bakeAll()`** runs once at boot. For every sprite key (chump frames, player frames, traps, pickups, buildings, NPCs, projectiles, foxes, ice cube, etc.) it asks `sprite-cache.bake(key, w, h, drawFn)` to:
   - create a small offscreen canvas at sprite size
   - call the procedural `drawFn` from `render/sprites.js` once
   - cache the resulting bitmap in a Map keyed by name
2. **`render/sprite-cache.js` `draw(ctx, key, x, y)`** is the per-frame blit. Renderer never re-runs `drawFn`.
3. Tiles work the same way through `render/tiles.js` — every terrain variant is baked once and stamped.

**`render/renderer.js`** is the per-frame dispatch. Z-order, top to bottom of stack:

terrain → goo → buildings → traps → pickups → player + chump (sorted by row for fake depth) → foxes → projectiles → particles → UI overlay

**Camera** is static viewport for every world (everything fits in 20×15). No scrolling. **Screen shake** lives on `game.shake` and is applied via `ctx.translate()` before the world draw, then decayed each frame. Reduced-motion mode kills shake entirely.

**Render loop entry** is `renderFrame(game, alpha)` from `main.js`, called inside RAF. The `alpha` argument carries the partial-tick interpolation factor for tweening pixel positions between grid cells.

## Particles

`src/systems/particles.js` is a pool-allocated array, no per-frame GC. Cap is ~300 normally, clamped to ~120 under reduced-motion. Active types:

`feather`, `goo`, `fire`, `smoke`, `spark`, `confetti`, `egg_trail`, `stars`, `dust`, `spit_fire`

Each particle carries `lifetime`, `vx`, `vy`, `ax`, `ay`, `size`, `color`. Drawing is procedural — no sprite cache lookup per particle.

`setMotionScale(0..1)` multiplies all burst sizes; reduced-motion sets it to 0.35.

## Speech bubbles

`src/systems/bubbles.js` queues at most **one active bubble per entity**, rate-limited by emotion category: `taunt`, `escape`, `destroy`, `egg`, `brag`, `hit`, `npc_panic`. Each category has its own cooldown. The rendering callback in `renderer.js` looks up entity positions (player, chump, foxes, townies) and reflows bubbles that would clip the canvas edge.

## Input

`src/input.js` exposes a unified API consumers don't have to branch on. Keyboard and touch both feed the same `input.getAxis()` / `input.wasPressed(key)` / `input.pointer()` reads.

**Keyboard:**

| Key | Action |
|---|---|
| WASD / Arrow keys | Move player |
| 1-8 | Select trap from palette |
| Space | Place selected trap (or as fallback in PLAN) |
| Enter | Confirm PLAN, dismiss SCORE, skip SIGNING |
| Esc / P | Pause overlay (CHASE only) |
| M | Toggle global mute |
| R | Replay (after W5 GAME COMPLETE only) |
| Tab / ←→ | Jump column on title screen (worlds ⇄ settings) |

**Touch** (auto-enabled on first touch, sets `game.touchActive`):

- **CHASE**: virtual d-pad bottom-left (52px radius, 10px deadzone, dominant-axis selection). Pause button bottom-right.
- **PLAN**: tap-to-place on the grid. Tappable trap palette strip across the bottom (54×44 slots with sprite + count). Big orange GO button bottom-right.
- **MENU / SCORE / PAUSE**: row-level tap routing via `menuLayout()` / `pauseMenuLayout()` exported from `menu.js`.

`index.html` sets `touch-action: none` on the canvas so the browser doesn't intercept touches as scroll/zoom.

## Persistence

```js
localStorage['chump_chicken_chase_v1'] = {
  worldsUnlocked: 1,        // 1-5
  bestStats: { ... },       // per-world: catches, traps used, buildings saved, time
  totalPlays: 0,
  gameComplete: false,      // true once W5 is cleared
  clears: 0,                // how many times W5 has been beaten
  ordersSeen: {             // M14: cumulative Executive Cluck flavors seen
    speed: false, supersonic: false, foxes: false, tropical: false,
  },
  settings: {
    muted: false, volume: 1.0, reducedMotion: false, highContrast: false,
  },
};
```

`loadSave()` in `src/systems/save.js` uses a nested-merge pattern so old saves pick up new fields on upgrade without losing their existing state. Storage failures (incognito, sandboxed iframe) silently degrade to in-memory state.

## Audio

`src/audio/sfx.js` is a small procedural Web Audio module. It lazy-inits its `AudioContext` on the first user gesture (autoplay-policy compliant) and silently no-ops if audio is unavailable. ~25 named effects built from oscillators + filtered noise:

- UI: `menu_cursor`, `menu_select`, `menu_back`
- Plan/Chase: `trap_place`, `trap_snap`, `gotcha`
- Combat: `egg_throw`, `egg_splat`, `egg_hit`, `player_hit`, `rock_warn`, `rock_land`
- Building: `building_hit`, `building_destroy`
- Pickups: `pickup_taco`, `pickup_burger`, `pickup_cat`
- Chump: `final_form`, `teleport`, `chump_squawk`, `spit_fire`
- NPC: `cook_scream`
- M14: `exec_order`, `supersonic`, `ice_throw`, `ice_hit`, `ice_splat`
- State: `victory`, `game_over`

Master gain = `BASE_MASTER (0.5)` × `save.settings.volume (0..1.25)`. Mute and volume both persist in save.

## Debug mode (`?debug=1`)

Adds a small info overlay in the top-left of the canvas via the frame loop in `main.js`. Shows: tick count, current state, world number, player & chump grid coords, rage, finalForm, burgerBuff, tacoBuff, and counts of buildings / pickups / projectiles / townies.

It is **just an overlay** — there are no debug hotkeys. The "pause / step-tick / seed display / pathfind viz / time scale slider" wishlist from the original M0 doc was never built. If those become useful, they're additions, not lost features.

## Tooling

- **`tools/smoke.mjs`** — headless regression harness. Stubs `window`, `document`, `localStorage`, and friends; runs the full simulation across all 5 worlds; exercises catches, trap triggers, cheats, food trucks, cook townie rising-edge detection; verifies the save roundtrip. Chicken AI is imported directly from `src/entities/chicken.js` (there is no separate `ai.js`). Run with `node tools/smoke.mjs`.

- **`tools/build.mjs`** — dependency-free single-file ESM bundler tailored to this codebase's import patterns. Walks `src/`, regex-parses imports/exports (named imports with `as` renames, `import * as`, grouped exports, multiline braces), topologically sorts modules from `src/main.js`, wraps each in an IIFE with a `__exports` object, and inlines the concatenation into `dist/index.html`. Output is one double-clickable file (~265 KB) suitable for itch.io. Run with `node tools/build.mjs`. Limitations: no `export default`, no `export *`, no dynamic `import()`. After significant src/ changes, grep `dist/index.html` for `^(import |export )` to confirm nothing leaked.

See `docs/PUBLISHING.md` for the GitHub Pages and itch.io deploy paths.
