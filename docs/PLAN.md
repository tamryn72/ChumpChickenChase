# Implementation Plan

> Each milestone should be **shippable** — playable in a browser, even if partial. Plan is a working draft, not a contract — reorder, cut, or expand as we learn.

## M0 — Docs & scaffolding  *(in progress)*

- [x] `CLAUDE.md`
- [x] `docs/MEMORY.md`
- [x] `docs/TIMELINE.md`
- [x] `docs/ARCHITECTURE.md`
- [x] `docs/PLAN.md`
- [x] `docs/SESSION_HANDOFF.md`
- [ ] `index.html` skeleton with canvas + module entry
- [ ] `src/main.js` empty game loop (BOOT → MENU)
- [ ] `src/config.js` with current constants
- [ ] `src/rng.js` — mulberry32
- [ ] `.gitignore`

## M1 — Walking farmer

Goal: load Farm tilemap, move player around, see something on a real canvas.

- [ ] `config.js` — tile size, grid dims, tick rate
- [ ] `input.js` — keyboard (touch later)
- [ ] Art pipeline (whatever we land on in "Art approach" below)
- [ ] `render/renderer.js` — clear, draw tiles, draw entities by z
- [ ] `world/level.js` — Level class with 2D tile array
- [ ] `world/worlds.js` — World 1 Farm static map (barn, fences, hay, coop, pond, scarecrow, tractor)
- [ ] `entities/player.js` — grid step, pixel interpolation, walkable check
- [ ] `main.js` — boot directly into CHASE with World 1 for dev

## M2 — The chicken lives

- [ ] `entities/chicken.js` — wander AI
- [ ] Orange goo trail
- [ ] Feather drops
- [ ] Chicken idle + run animation (or emoji substitute)
- [ ] First speech bubble ("Quiet, piggy") on player proximity

## M3 — Two-phase level flow

- [ ] `state.js` — MENU → PLAN → CHASE
- [ ] Plan phase UI: trap palette, click-to-place
- [ ] Plan timer + Chase timer
- [ ] Catch mechanic stub
- [ ] Win (catches met) / lose (timer expired) → GAMEOVER / CUTSCENE

## M4 — Traps that actually work

- [ ] `entities/trap.js` + `systems/trap-effects.js`
- [ ] Net, Banana, Cage — each with unique effect
- [ ] Stun system + escape roll
- [ ] Trap interaction matrix wired to chicken AI
- [ ] Speech bubbles: `"I'M TRAPPED"`, `"I am the best at escape..."`
- [ ] Catch triggers when player adjacent to stunned chicken

## M5 — Buildings & destruction

- [ ] `entities/building.js` with hp + destroy animation
- [ ] Chicken AI `DESTROY_NEAREST` — pick nearest protectable, path, attack
- [ ] Destruction particles
- [ ] Lose condition: all buildings destroyed
- [ ] World 1 protectable roster

## M6 — Rage, taunts, eggs

- [ ] `systems/rage.js`
- [ ] Egg projectile with arc trajectory
- [ ] Player stun on egg hit + screen shake
- [ ] Taunt system with rate-limited categories
- [ ] FINAL FORM visual treatment

## M7 — Cats & burgers

- [ ] Pickup spawn system
- [ ] Cat entity — `CHASE_CAT` override, toss animation
- [ ] Burger pickup — buff state
- [ ] Player can pick up burger → Burger Bait trap (bridge to M10)
- [ ] Stats tracking

## M8 — Farm complete

- [ ] Escape cutscene (backflip → moonwalk → dab)
- [ ] Score / stats screen
- [ ] `localStorage` save
- [ ] Menu → level select

## M9 — The Market (W2)

- [ ] Tilemap, protectables, cart-flipping animation
- [ ] Glue Pad + Corn Decoy traps
- [ ] Teleport cheat
- [ ] Overturned carts become obstacles
- [ ] W2 escape cutscene (orange tidal wave surf)

## M10 — The Docks (W3)

- [ ] Water tiles + Swim cheat
- [ ] Barrel platform mechanic
- [ ] Pretty Hen trap
- [ ] Burger Bait trap
- [ ] W3 escape cutscene (speedboat donuts)

## M11 — Castle Town (W4)

- [ ] Maze-like castle layout (maybe scrolling camera — decide here)
- [ ] Player-usable catapult
- [ ] Cat Decoy trap
- [ ] Clone decoy cheat
- [ ] Crown sprite swap
- [ ] W4 escape cutscene (catapult → hay cart → "FREEDOM")

## M12 — The Volcano (W5) & ending  *(shipped)*

- [x] Lava tiles (solid for player, passable for chump via SWIM)
- [x] Falling rocks — peak hazard, area-stuns player, damages buildings
- [x] Flaming eggs — W5 egg variant, longer stun + bigger shake + glow halo
- [x] Swim-through-lava cheat (SWIM now covers WATER + LAVA)
- [x] Final catch → `VOLCANO_VICTORY` cutscene (player hoists chump, confetti)
- [x] Final **GAME COMPLETE** score screen + R to PLAY AGAIN

## M14 — Comedy payload  *(shipped)*

Executive Clucks + Red Fox minions. The last "make it feel like Chump" layer.

- [x] Executive Cluck signing ceremony — parchment scroll slides in, big red SIGNED stamp, Chump dips his beak, 32-tick duration, skippable.
- [x] New SIGNING game state between GOTCHA and the next CHASE, fires on **first catch of the level only**. Order clears on level end.
- [x] **Order for Speed** — player inputs queue one tick late. `p.inputDelay` flag in `player.js`, `p.queuedDir` stores the previous tick's direction.
- [x] **Supersonic Order** — Chump triggers 20-tick slow-mo on the player when they're within 6 tiles, 140-tick cooldown. `p.supersonicSlow` drops movePace to 8 (4× slow). Pale blue pulsing ring around the player while active.
- [x] **Red Foxes Directive** — spawns 3 red-hatted fox minions (`src/entities/fox.js`). AI walks toward the player every 3 ticks, stagger-stuns (5 ticks) on contact, bounces back one tile so they don't camp. No health, clear on level end.
- [x] **Tropical Order** — Chump's egg-throw has a 50/50 chance to launch ice cubes instead. Direct hit freezes player for 20 ticks. Pale blue screen tint on impact.
- [x] HUD indicator showing the active order (top-left strip under catches counter).
- [x] Order-flavored taunts — 4 per flavor in `EXEC_TAUNTS`. During CHASE with an order active, 50% of taunts pull from the order-flavored pool.
- [x] Cumulative `save.ordersSeen` tracking + "EXEC CLUCKS SEEN: X/4" line on the SCORE screen.
- [x] New SFX: `exec_order` (ceremonial thump), `supersonic`, `ice_throw`, `ice_hit`, `ice_splat`.
- [x] New sprites: `fox_0` / `fox_1` (16×16 red-hat minion with red eye), `ice_cube` (8×8 pale-blue cube projectile).

## M13 — Polish pass  *(shipped)*

- [x] Mobile touch d-pad + trap palette  *(virtual d-pad + pause + GO + tappable trap strip; touch-action:none on canvas; all menus tap-routed)*
- [x] Sound — `src/audio/sfx.js` procedural Web Audio, lazy-inited on first gesture
- [x] Audio pass 2 — peaks normalized across effects, master volume slider in settings (0..125%), two new effects (`spit_fire`, `cook_scream`)
- [x] Settings (mute / volume / reduced motion / high contrast) persisted to localStorage
- [x] Menu settings panel + in-chase pause overlay with the same toggles
- [x] Accessibility: reduced-motion clamps particle counts + kills screen shake, high-contrast overlay adds vignette + border
- [x] Headless regression harness  *(`tools/smoke.mjs` covers this; no separate sim.js)*
- [x] Dist build: `tools/build.mjs` emits a single `dist/index.html` (~242 KB, no external deps)
- [x] Menu juice, transitions, intro screen  *(staged title intro: title drops in, subtitle fades, Chump stomps in from off-screen right with dust puffs, list+settings slide in; diagonal orange wipe + banner on every state change via setState())*
- [x] Spit-fire animation  *(new directional flame cone replaces egg-splat placeholder when Chump eats a taco)*
- [x] Cook NPC  *(chef-hat sprite at the taco truck window on the Farm; flails and screams when Chump approaches)*
- [ ] Performance audit  *(still deferred — nothing currently feels slow)*

---

## Future upgrades (user wishlist — not scheduled yet)

Comedy / mechanics parked here, to be wired in once the base game is stable.
**Most of the wishlist landed in M14. Only the arctic level is still parked.**

### ~~Executive Clucks~~ *(shipped in M14)*

Shipped with adjustments from the original pitch:
- **One order per level** (not one per catch — no stacking, clears on level end)
- **Order for Speed** reworked as "inputs queue one tick late" instead of 2-second blocking delay (the original design would have compounded across stacked catches into an unplayable input lag)
- **Icy Executive Cluck** renamed **Tropical Order** to match the "opposite of effect" naming convention the other two flavors already had
- **Signed on the first catch only** — subsequent catches in the same level use the existing flow
- All four flavors live — Speed, Supersonic, Red Foxes Directive, Tropical

### ~~Red Fox Minions~~ *(shipped in M14)*

Shipped as part of the Red Foxes Directive. 16×16 procedural sprite with red pointy hat and glowing red eye. Basic AI: move toward player every 3 ticks, contact = 5-tick stagger-stun, bounce back one tile on contact. Not dispatchable — just avoidable. Cleared on level end.

### Arctic / Ice level

Was going to be the ice-hole kill mechanic but we're deferring that whole
thing to a future **ice-themed level** (maybe a new world 6, or a variant
section of the Volcano). The ice hole would be a 1-tile hazard you can bait
Chump into (or he baits townspeople into). Details TBD.

### Other parked ideas

- ~~**Spit-fire animation** when Chump eats a taco~~ *(shipped in M13 ship pass — `addSpitFire` fires a directional flame cone in Chump's facing direction)*
- ~~**Cook NPC** standing at the taco truck window~~ *(shipped in M13 ship pass — chef-hat townie variant at the Farm taco truck, flails + screams when Chump gets close)*
- **Spoken taunt experiment** using `SpeechSynthesis` API. Dropped for v1
  — text-only taunts are the direction for now. Can revisit if/when we
  want voice. Tech note: the API can only tune pitch/rate on system
  voices, so it wouldn't produce a real impression anyway.

---

## Design calls worth talking through

These are real open questions with multiple viable answers. I'll present options and my lean, but the point is for us to decide together.

### 1. Art approach — the biggest question

You're providing no assets, so every visual comes from code. Three paths:

**A. Full emoji.** Whole game renders as emoji glyphs on a grid. Chicken = 🐔, player = 🧑‍🌾, barn = 🏚️, fire = 🔥, burger = 🍔, eggs = 🥚, cat = 🐈. Your README is already emoji-native — the design practically wrote this for us.
- *Pros*: zero art work, ships fastest, instantly readable, works everywhere, dead-simple iteration.
- *Cons*: emoji look slightly different per OS (Apple's chicken ≠ Google's chicken), less custom feel, some layout fiddliness.

**B. Procedural pixel art.** I author every sprite as numeric grids with palettes, pre-render to offscreen canvases.
- *Pros*: consistent across platforms, true pixel-art feel, custom personality.
- *Cons*: slow to author (character animation especially), runs the risk of looking programmer-arty, big time sink per world.

**C. Hybrid.** Procedural pixel art for tiles + player + chicken (need consistent look/animation). Emoji for everything else — pickups, particles, destruction effects, cutscenes.
- *Pros*: consistent characters, zero-effort props, smaller art budget.
- *Cons*: needs to feel cohesive across two styles.

**My lean**: **Start with full emoji (A)** for the vibe demo. If it feels right, ship that. If the chicken doesn't feel punchy enough as 🐔, promote him + player to procedural sprites while keeping everything else emoji (→ C). The pure-emoji version is dramatically faster to playable and might honestly be the funniest version of the game.

### 2. Scope — how much of the 5-world vision, and when?

- **Tier 1 — Vibe Demo**: World 1 only, basic chicken AI, 3 traps, working chase, chicken talks smack, one catch ends it. ~M1-M4. Proves the feel.
- **Tier 2 — Farm MVP**: Tier 1 + buildings/destruction, rage/eggs, cat/burger spawns, escape cutscene, save state. ~M1-M8. A complete, replayable W1 experience.
- **Tier 3 — Full Game**: All 5 worlds + ending. M1-M12.
- **Tier 4 — Polish**: M13.

**My lean**: Commit to Tier 2 as the near-term target. If the Farm feels great, push to Tier 3. Shipping a great Farm is way better than shipping a mediocre 5-world game.

### 3. Sound — in from the start, or polish only?

- **A. From M1**: ~100 lines of Web Audio procedural synth (squawks, splats, snaps, footsteps). Zero assets. Games without sound feel dead.
- **B. From M6**: Add when rage/eggs land so new mechanics have audio feedback.
- **C. M13**: Ship silent until polish.

**Bonus**: `SpeechSynthesis` API for spoken taunts — browser literally speaks "Quiet, piggy" in a silly voice. Cross-platform but voices vary. Easy to try, easy to rip out.

**My lean**: Sound from M1 even if minimal, because silent games feel flat. Spoken taunts experiment in M6 — fun gamble.

### 4. Distribution — what's the shippable artifact?

- **A. Single `index.html`**, everything inline. Double-clickable, email-able, host-anywhere. Annoying for dev.
- **B. Served folder** with `src/` modules. Iterable but needs a static host (GitHub Pages is free).
- **C. Dev as modules, ship as single file** via tiny Node concat script (~20 lines, no deps). Best of both.

**My lean**: **C**. You get a `dist/index.html` you can share anywhere, and I get clean iterable modules. If the build script ever becomes friction, we collapse to A.

**Hosting**: once we have a `dist/index.html`, GitHub Pages is the no-effort default — it's already a GitHub repo and publishing is one button.

### 5. Real-time vs tick-based logic

- **A. 10Hz fixed tick + interpolated render**. Grid-snappy, integer balance ("stun 3 ticks"), easy headless sim.
- **B. Continuous real-time** (60fps, everything in seconds). Smoother, harder to sim deterministically.
- **C. Hybrid**: chicken + player move continuously in pixel space, traps/placement tile-bound. Most fluid, pathing harder.

**My lean**: **A** — the game is grid-based by design and the README thinks in ticks. 10Hz is plenty snappy when render is smooth.

### 6. Grid size / resolution

- **640×480** (20×15 × 32px) — retro 4:3, classic
- **800×600** (25×18 × 32px) — more room, same vibe
- **480×360** (15×11 × 32px) — tighter chase feel

**My lean**: 640×480. Room for protectables + chase without feeling cluttered. If we go full-emoji, bigger tiles (48px) read better.

### 7. Catch mechanic

- **A. Touch stunned chicken** — walk into him while caught in a trap = catch. Simple.
- **B. Throw a lasso** — button press in-range, higher success when stunned. Adds skill.
- **C. Place a "capture" trap on a stunned chicken** — more ceremony, more strategy.

**My lean**: **A** for simplicity; promote to B if catching feels too trivial.

### 8. Cutscenes — since we have no assets

- **A. Scripted emoji animations** — chicken emoji slides across the screen doing a dab, text bubbles, screen flashes. Matches the vibe, zero assets.
- **B. Keyframe-style static scenes** with floating text. Lighter work.
- **C. Mix**: scripted emoji tweens for W1 intro + W5 ending, keyframe style for mid-game escapes.

**My lean**: **C**. Big juice on the bookends, lighter in the middle.

### 9. Mobile — when?

- **A. M1** — design mobile-first from day one
- **B. Mid-game** (~M6/M7) — once core loop is stable
- **C. M13 polish** — desktop-first, mobile last

**My lean**: **B**. Desktop-first is risk-reduction, but leaving mobile to the very end usually means it ships half-broken.

---

## Smaller calls (I'll pick defaults if you don't care)

- **Multiple cats/hens on map**: cap at 1 at a time, or allow stacking chaos?
- **Trap inventory**: fixed per-world count, or replenishable over chase time?
- **Egg throw cooldown**: default ~4s
- **Final Form duration**: default ~5s
- **Title on screen**: "Trumplestiltskin: Orange Chicken Chaos" (title + subtitle)?
- **Difficulty curve**: easy W1 for vibe, ramp from W3?
- **Color palette** (if we go procedural): leaning PICO-8 16-color (iconic, free, looks great).

---

## Risks I'm flagging early

- **Chicken AI is the central risk.** Behavior tree + cheats + rage + distractions + taunts is a lot of state. Mitigation: build incrementally across milestones, not in one shot.
- **Art scope creep.** If we go procedural, animation is a real time sink. Full-emoji sidesteps this entirely.
- **Unbounded particles + goo + fire** can tank perf. Pool everything, profile early.
- **Feel IS the product.** Leave real time for taunts, bubble timing, and cutscene choreography — don't rush the personality work.
