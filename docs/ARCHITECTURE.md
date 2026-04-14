# Architecture

## Stack

- HTML5 Canvas 2D
- Vanilla JS, native ES modules
- No build step, no deps, no external assets
- ~15-25 small modules in `src/`, each < 300 lines

## Target file layout

```
index.html
src/
  main.js              # boot, RAF loop, state dispatch
  config.js            # TILE, GRID_W, GRID_H, TICK_HZ, palette, tuning
  rng.js               # seeded PRNG (mulberry32)
  input.js             # keyboard + touch + d-pad → unified API
  state.js             # top-level state machine
  game.js              # current level / run glue
  world/
    level.js           # Level data structure, tile type enum
    worlds.js          # all 5 world definitions (tilemaps, spawns, protectables)
  entities/
    entity.js          # base
    player.js
    chicken.js
    building.js        # protectables with hp
    trap.js
    pickup.js          # burger, cat, hen
    projectile.js      # eggs (and W5 flaming eggs)
  systems/
    tick.js            # fixed-step accumulator
    movement.js        # grid step, pixel interpolation
    pathfind.js        # A* / greedy pathing for chicken targets
    ai.js              # chicken behavior priority tree
    cheats.js          # dodge / teleport / swim / clone modifiers
    rage.js            # rage meter + FINAL FORM
    fire.js            # fire spread tick
    particles.js       # pooled particle system
    bubbles.js         # speech bubble queue
    collision.js
    trap-effects.js    # trap × chicken interaction matrix
  render/
    sprites.js         # sprite data arrays + palettes
    sprite-cache.js    # offscreen pre-render & blit helpers
    renderer.js        # draw tiles + entities + particles + UI
    camera.js          # viewport, shake
    ui.js              # HUD, plan-phase trap palette, timers
    cutscene.js        # scripted escape/victory sequences
  audio/
    sfx.js             # Web Audio beeps (optional, M13)
tools/
  sim.js               # headless AI regression harness (Node)
docs/
  CLAUDE.md, MEMORY.md, TIMELINE.md, ARCHITECTURE.md, PLAN.md, SESSION_HANDOFF.md
README.md
```

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

## State machine

```
BOOT → MENU ⇄ PLAN → CHASE ┬─→ CUTSCENE → next level  (W1-W4)
                            ├─→ VICTORY             (W5 final catch)
                            └─→ GAMEOVER            (all buildings destroyed / timer out)
```

- **PLAN**: time paused. Player clicks tiles from trap palette. Confirm → CHASE.
- **CHASE**: 10Hz ticks. Chicken active. Player can still place from limited chase supply.
- **CUTSCENE**: scripted tween sequence, input disabled except skip.
- **GAMEOVER**: retry current level with fresh plan phase.

## Entity model

```js
/**
 * @typedef {Object} Entity
 * @property {number} id
 * @property {string} type         - 'player' | 'chicken' | 'building' | 'trap' | 'pickup' | 'projectile'
 * @property {number} col, row     - grid coords
 * @property {number} px, py       - interpolated pixel coords (tween between ticks)
 * @property {number} facing       - 0=up 1=right 2=down 3=left
 * @property {number} hp
 * @property {string} state        - per-type FSM state
 * @property {number} stunTicks
 * @property {string} sprite       - key into sprite cache
 * @property {number} z            - render order
 */
```

- **Dynamic**: player, chicken, projectiles, spawned pickups (cat/burger), particles
- **Static**: buildings, placed traps, terrain features
- **Tile data** lives separately in `level.tiles[row][col]` = `{ terrain, walkable, flammable, onFire, goo }`

## Chicken AI — priority utility tree

Each tick, pick the highest-priority action whose preconditions are met:

| # | Action          | Condition                                              |
|---|-----------------|--------------------------------------------------------|
| 1 | ESCAPE_TRAP     | `stunTicks > 0` and escape roll succeeds              |
| 2 | CHASE_CAT       | any cat entity on map (mandatory override)           |
| 3 | EAT_BURGER      | burger on map AND chicken not currently buffed       |
| 4 | FLIRT_HEN       | pretty hen in LOS AND not on flirt cooldown          |
| 5 | FINAL_FORM      | `rage === 100`                                        |
| 6 | DESTROY_NEAREST | any protectable building within pathing range        |
| 7 | THROW_EGG       | player in LOS AND egg cooldown ready                 |
| 8 | RAMPAGE         | default wander + mischief (kick buckets, dance, etc) |

**Cheats are modifiers** applied on top of the chosen action:

- `DODGE` — when stepping into a trap tile OR adjacent to player, roll for sidestep
- `TELEPORT` — when cornered (≤1 valid move) OR high rage, jump to random valid tile within N
- `SWIM` — movement treats water tiles as walkable
- `CLONE` — every N ticks spawns a decoy that runs simple wander AI; a player "catch" on a decoy whiffs and triggers the `"I am the best at escape..."` taunt

## Rage meter

- `+1` passive per second
- `+10` per trap caught
- `+5` per egg hit landed on player
- `+2` per building destroyed
- At `100` → enter FINAL_FORM for ~5s, then reset to 0
- Visual scaling: head size ×(1 + rage/200), hair flop amplitude, red glow alpha

## Trap × chicken interaction matrix

| Trap        | Normal         | vs Dodge   | vs Teleport | vs Final Form |
|-------------|----------------|------------|-------------|---------------|
| Net         | stun 3         | sidestep   | escape fast | immune        |
| Banana      | stun 2 + slide | triggered  | escape fast | immune        |
| Cage        | stun 4         | sidestep   | no escape   | stun 1        |
| Glue Pad    | stun 5         | still hits | no escape   | stun 2        |
| Corn Decoy  | lure 6         | lure       | lure        | ignore        |
| Pretty Hen  | lure 6+        | lure       | lure        | lure 3        |
| Burger Bait | lure → stun 4  | lure       | lure        | ignore        |
| Cat Decoy   | mandatory      | mandatory  | mandatory   | mandatory     |

## Rendering

- **Sprites**: 16×16 pixel data arrays, palette-indexed. Authored as ASCII or numeric grids in `sprites.js`.
- **Pre-render**: at boot, each sprite frame is drawn once to an `OffscreenCanvas`. Render loop just blits.
- **Animation**: frame arrays + fixed frame duration in ticks (e.g. chicken run = 4 frames × 2 ticks each).
- **Z-order**: terrain → goo → buildings → traps → pickups → player/chicken (sorted by row) → projectiles → particles → UI.
- **Camera**: static viewport for most worlds (map fits in 20×15). W4/W5 may need scrolling — TBD.
- **Screen shake**: `(dx, dy)` decayed each frame, applied via `ctx.translate` before draw.

## Particles

- **Pool-allocated** arrays (no per-frame GC). Cap total particles around 300.
- **Types**: `feather`, `goo`, `fire`, `smoke`, `confetti`, `egg_trail`, `stars`, `spark`
- Each has: `lifetime`, `vx`, `vy`, `ax`, `ay`, `size`, `colorOrEmoji`
- Emoji particles are valid (feels retro + readable for a jam-scale game)

## Speech bubbles

- Queue per entity; max **1 active** bubble per entity
- **Rate-limited by emotion category**: `taunt`, `escape`, `destroy`, `egg`, `brag`, `hit`. Each has its own cooldown in ticks.
- Typewriter reveal optional (cheap juice, probably M13 polish)
- Auto-reposition if bubble would clip the canvas edge

## Input

- **Desktop**: WASD / arrows for movement, `Space` to place selected trap, number keys `1`-`7` to select, `ESC` to pause, `Enter` to confirm plan phase
- **Mobile**: touch d-pad (bottom-right), trap palette (bottom-left). Tap-to-place in plan phase.
- **Unified API**: `input.getAxis()`, `input.wasPressed(key)`, `input.pointer()`. Consumers don't know the source.

## Persistence

```js
localStorage['trumplestiltskin'] = {
  worldsUnlocked: 1,        // 1-5
  bestStats: { ... },       // per-world: catches, traps used, buildings saved, time
  seed: null,               // if set, forces deterministic runs (dev)
  audioMuted: false,
};
```

## Debug mode (`?debug=1`)

- Grid overlay
- Chicken AI state label above sprite
- Rage / cheat status indicators
- Pathfinding visualization (when targeting)
- FPS + tick counter
- Pause / step-tick hotkeys (`P` / `.`)
- Seed display + reseed hotkey
- Time scale slider (slowmo for debugging)

## Headless sim harness (`tools/sim.js`)

Runs N ticks with seeded chicken AI against a fixed level map, logs events (catches, trap triggers, buildings destroyed, taunts). Used to regression-test AI changes without opening a browser. Node-only, imports the same `src/systems/ai.js` modules via ES module imports.
