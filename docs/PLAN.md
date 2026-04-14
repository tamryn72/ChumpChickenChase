# Implementation Plan

> Each milestone should be **shippable** — playable in a browser, even if partial. Ship M1 before touching M2.

## M0 — Docs & scaffolding  *(in progress)*

- [x] `CLAUDE.md`
- [x] `docs/MEMORY.md`
- [x] `docs/TIMELINE.md`
- [x] `docs/ARCHITECTURE.md`
- [x] `docs/PLAN.md`
- [x] `docs/SESSION_HANDOFF.md`
- [ ] `index.html` skeleton with canvas + module entry
- [ ] `src/main.js` empty game loop (BOOT → MENU black screen)
- [ ] `src/config.js` with locked constants
- [ ] `src/rng.js` — mulberry32
- [ ] `.gitignore`

## M1 — Walking farmer

Goal: load Farm tilemap, move player around with WASD, see pixel art on a real canvas.

- [ ] `config.js` — `TILE=32, GRID_W=20, GRID_H=15, TICK_HZ=10`
- [ ] `input.js` — keyboard only
- [ ] `render/sprites.js` — player (idle + 4-dir walk), grass / dirt / fence / hay tile sprites
- [ ] `render/sprite-cache.js` — offscreen pre-render
- [ ] `render/renderer.js` — clear, draw tiles, draw entities by z
- [ ] `world/level.js` — Level class with 2D tile array
- [ ] `world/worlds.js` — World 1 Farm static map (barn, fences, hay, coop, pond, scarecrow, tractor)
- [ ] `entities/player.js` — grid step, pixel interpolation, walkable check
- [ ] `main.js` — boot directly into CHASE with World 1 for dev (skip menu temporarily)

## M2 — The chicken lives

- [ ] `entities/chicken.js` — wander AI (random walk, avoid obstacles, seeded RNG)
- [ ] Orange goo trail as particle / tile state
- [ ] Feather drop particles
- [ ] Chicken sprite: idle + 4-frame run anim
- [ ] Basic speech bubble ("Quiet, piggy") on player proximity

## M3 — Two-phase level flow

- [ ] `state.js` — MENU → PLAN → CHASE state machine
- [ ] Plan phase UI: trap palette, click-to-place on grid
- [ ] Plan timer + Chase timer
- [ ] Catch mechanic stub: `Space` near chicken = "caught"
- [ ] Win (catches met) / lose (timer expired) conditions → GAMEOVER / CUTSCENE

## M4 — Traps that actually work

- [ ] `entities/trap.js` + `systems/trap-effects.js`
- [ ] Net, Banana, Cage — each with unique effect
- [ ] Stun system (`stunTicks`) + escape roll when chicken stunned
- [ ] Trap interaction matrix wired to chicken AI
- [ ] Speech bubbles rotate: `"I'M TRAPPED"`, `"I am the best at escape..."`
- [ ] Catch triggers when player adjacent to stunned chicken

## M5 — Buildings & destruction

- [ ] `entities/building.js` with hp + destroy animation
- [ ] Chicken AI `DESTROY_NEAREST` action — picks nearest protectable, paths, attacks
- [ ] Destruction particles (debris, smoke)
- [ ] Lose condition: all buildings destroyed
- [ ] World 1 protectable roster (barn 3hp, silo 2hp, feed cart 1hp, hay 1hp, coop 2hp, scarecrow 1hp)

## M6 — Rage, taunts, eggs

- [ ] `systems/rage.js`
- [ ] Egg projectile with arc trajectory (`entities/projectile.js`)
- [ ] Player stun on egg hit + screen shake
- [ ] Taunt system with rate-limited categories
- [ ] FINAL FORM visual (head scale, red glow, hair flop)

## M7 — Cats & burgers

- [ ] Pickup spawn system on valid tiles (timed)
- [ ] Cat entity — chicken `CHASE_CAT` override, toss animation, cat lands dizzy
- [ ] Burger pickup — buff state (red glow, +speed, 1-hit destroy)
- [ ] Player can pick up burger → converts to Burger Bait trap (bridge to M10)
- [ ] Stats tracking (burgers eaten, cats tossed)

## M8 — Farm complete

- [ ] Escape cutscene (backflip → moonwalk → dab)
- [ ] Score / stats screen
- [ ] `localStorage` save (worldsUnlocked, bestStats)
- [ ] Menu → level select (W1 only at this point)

## M9 — The Market (W2)

- [ ] Tilemap, protectables, cart-flipping animation
- [ ] Glue Pad + Corn Decoy traps
- [ ] Teleport cheat (when cornered or high rage)
- [ ] Overturned carts become obstacles
- [ ] W2 escape cutscene (orange tidal wave surf)

## M10 — The Docks (W3)

- [ ] Water tiles + Swim cheat (chicken can path through water)
- [ ] Barrel platform mechanic
- [ ] Pretty Hen trap (flirt lock state)
- [ ] Burger Bait trap (lure → stun reveal)
- [ ] W3 escape cutscene (speedboat donuts)

## M11 — Castle Town (W4)

- [ ] Maze-like castle layout (may need scrolling camera — decide here)
- [ ] Player-usable catapult (launches net projectile)
- [ ] Cat Decoy trap (mandatory AI override)
- [ ] Clone decoy cheat (decoy catches whiff)
- [ ] Crown sprite swap for chicken during W4
- [ ] W4 escape cutscene (catapult → hay cart → "FREEDOM")

## M12 — The Volcano (W5) & ending

- [ ] Lava tiles damage player if adjacent too long
- [ ] Falling rocks (random path blocking)
- [ ] Flaming eggs projectile variant
- [ ] Swim-through-lava cheat (W5 only)
- [ ] ALL cheats active
- [ ] Final catch → victory cutscene (punt into crater, eruption, parade, key to city)
- [ ] Final score screen with full stats + PLAY AGAIN

## M13 — Polish pass

- [ ] Mobile touch d-pad + trap palette
- [ ] SFX (Web Audio beeps) — optional, toggleable
- [ ] Menu juice, phase transitions, intro screen
- [ ] Accessibility: high-contrast toggle, reduced-motion (damp screen shake & rage pulsing)
- [ ] Headless `tools/sim.js` regression harness
- [ ] Performance audit — particle caps, sprite cache hit rates, GC pressure

---

## Discussion — proposed changes to README vision

These are the deltas I want sign-off on before writing any code.

### 1. ES modules, not a single HTML file

README says *"single HTML file, all Canvas-rendered"*. I want to keep `index.html` as a tiny entry point that imports native ES modules from `src/`. **No bundler, no build step** — the browser does all the loading. Deliverable is still a single-folder download, still serves from any static host. The "single file" constraint was about avoiding an asset pipeline, which we still avoid.

**Tradeoff**: marginally slower first load (a few more HTTP requests). **Win**: way more iterable, way easier for Claude to navigate in later sessions.

### 2. Fixed 10Hz logic tick + RAF render

README mentions "delta-time accumulator for chicken movement speed." I want to lock **logic at 10Hz** (100ms per tick) and interpolate rendering at RAF. The design doc already speaks in "stun 3 ticks" — making ticks real integer counters (not ms-converted) keeps trap/cheat math exact and reproducible.

### 3. Seeded RNG (not in README)

Every bit of randomness routes through `src/rng.js` (mulberry32). Lets us:
- Replay AI bugs from a seed
- Run a headless sim harness against chicken AI for regression
- Optionally offer "daily seed" runs for replay

### 4. Grid & resolution lock

**20 × 15 tiles × 32px = 640×480 logical canvas**, CSS-scaled to viewport. Classic pixel-art ratio, clean scaling to modern displays, works on mobile. README doesn't specify. OK to lock this?

### 5. Mobile polish moved to M13

README calls out mobile d-pad as a core feature. I want to ship **desktop playable through M12** first, then mobile touch overlay in M13 polish. Reduces risk on the AI/trap/cheat work. OK?

### 6. Camera strategy

Worlds 1-3 fit in 20×15 → static camera. Worlds 4-5 may want **scrolling camera** for maze / volcano verticality. Alternative: redesign W4/W5 to also fit 20×15 with denser layouts. I have a mild preference for scrolling because it makes the Castle feel bigger.

---

## Open questions (need your answers)

1. **Cutscenes**: scripted tweens (more work, more juice) or keyframe-image style with floating text (lighter)? My vote: tweens for W1 (dab intro) and W5 (ending); keyframe-style for W2-W4.
2. **Sound**: in scope? ~50 lines of Web Audio beeps would add a ton of feel. I'd slot it in M13.
3. **Multiple cats/hens**: cap at 1 on-map at a time, or allow multiple simultaneously? (Design impact: multiple cats = multiple AI targets = more chaos; 1-at-a-time = cleaner pacing.)
4. **Trap inventory**: fixed per-world count (current assumption) or replenishable over time in chase phase?
5. **Egg throw cooldown**: my default ~4s / 40 ticks. Feel right?
6. **Final Form duration**: my default ~5s / 50 ticks. Confirm?
7. **Game title on screen**: repo is `Trumplestiltskin`, but game concept is `ORANGE CHICKEN CHAOS`. Which goes on the title screen? Both? (Could do "Trumplestiltskin: Orange Chicken Chaos" as title / subtitle.)
8. **Difficulty curve**: should the chicken be comically easy in W1 and gradually brutal in W5, or maintain constant menace? My vote: easy W1 to let the feel/vibe land, ramp hard from W3.

---

## Risks (unprompted — flagging early)

- **Chicken AI is the central risk.** Behavior tree + cheats + rage + distraction priorities + speech bubbles + per-world variation is a lot of state machine. Mitigation: build incrementally (M2 wander → M4 trap escape → M5 destroy → M6 taunts+eggs → M7 distraction → per-world cheat layers).
- **Programmatic pixel art is tedious.** Drawing sprites as data arrays is fast for tiles (easy shapes) but slow for character animation. Budget real authoring time in M1-M2 and W2/W3/W4/W5.
- **Unbounded particles + goo trail + fire** can tank perf. Pool everything, cap counts, profile early.
- **Feel IS the product.** Leave real time in M6, M8, M13 for taunt writing, speech-bubble timing, cutscene choreography. Don't rush it.
