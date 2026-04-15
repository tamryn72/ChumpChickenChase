# Implementation Plan

> Each milestone should be **shippable** — playable in a browser, even if partial. Plan is a working draft, not a contract — reorder, cut, or expand as we learn.

## M0 — Docs & scaffolding  *(shipped)*

- [x] `CLAUDE.md`
- [x] `docs/MEMORY.md`
- [x] `docs/TIMELINE.md`
- [x] `docs/ARCHITECTURE.md`
- [x] `docs/PLAN.md`
- [x] `docs/SESSION_HANDOFF.md`
- [x] `index.html` skeleton with canvas + module entry
- [x] `src/main.js` empty game loop (BOOT → MENU)
- [x] `src/config.js` with current constants
- [x] `src/rng.js` — mulberry32
- [x] `.gitignore`

## M1 — Walking farmer  *(shipped)*

- [x] `config.js` — tile size, grid dims, tick rate
- [x] `input.js` — keyboard (touch added in M13)
- [x] Art pipeline — procedural sprites baked once at boot via `render/bake.js`
- [x] `render/renderer.js` — clear, draw tiles, draw entities by z
- [x] `world/level.js` — Level class with 2D tile array
- [x] World 1 Farm static map — split out into `world/farm.js` (no shared `worlds.js`)
- [x] `entities/player.js` — grid step, pixel interpolation, walkable check
- [x] `main.js` — boot routing through MENU into CHASE

## M2 — The chicken lives  *(shipped)*

- [x] `entities/chicken.js` — wander AI
- [x] Orange goo trail
- [x] Feather drops
- [x] Chicken idle + run animation
- [x] First speech bubble ("Quiet, piggy") on player proximity

## M3 — Two-phase level flow  *(shipped)*

- [x] State machine — MENU → PLAN → CHASE → GOTCHA → SCORE (no separate `state.js`; lives in `main.js`)
- [x] Plan phase UI: trap palette, click-to-place
- [x] Plan timer + Chase timer
- [x] Catch mechanic
- [x] Win (catches met) / lose (timer expired / all buildings destroyed) routing

## M4 — Traps that actually work  *(shipped)*

- [x] `entities/trap.js` — trap types + stun durations + lure set (no separate `trap-effects.js`; behavior lives in `chicken.js`)
- [x] Net, Banana, Cage — each with unique effect
- [x] Stun system + escape roll
- [x] Trap interaction matrix wired to chicken AI
- [x] Speech bubbles: `"I'M TRAPPED"`, `"I am the best at escape..."`
- [x] Catch triggers when player adjacent to stunned chicken

## M5 — Buildings & destruction  *(shipped)*

- [x] `entities/building.js` with hp + destroy animation
- [x] Chicken AI `DESTROY` — pick nearest protectable, path, attack
- [x] Destruction particles
- [x] Lose condition: all buildings destroyed
- [x] World 1 protectable roster

## M6 — Rage, taunts, eggs  *(shipped)*

- [x] Rage meter + addRage() (lives in `chicken.js`, no separate `systems/rage.js`)
- [x] Egg projectile with arc trajectory
- [x] Player stun on egg hit + screen shake
- [x] Taunt system with rate-limited categories
- [x] FINAL FORM visual treatment

## M7 — Cats & burgers  *(shipped)*

- [x] Pickup spawn system
- [x] Cat entity — mandatory override priority, toss animation
- [x] Burger pickup — buff state
- [x] Player can pick up burger → Burger Bait trap
- [x] Stats tracking

## M8 — Farm complete  *(shipped)*

- [x] Escape cutscene
- [x] Score / stats screen
- [x] `localStorage` save
- [x] Menu → level select

## M9 — The Market (W2)  *(shipped)*

- [x] Tilemap, protectables, cart-flipping animation
- [x] Glue Pad + Corn Decoy traps
- [x] Teleport cheat
- [x] Overturned carts become obstacles
- [x] W2 escape cutscene

## M10 — The Docks (W3)  *(shipped)*

- [x] Water tiles + Swim cheat
- [x] Barrel platform mechanic
- [x] Pretty Hen trap
- [x] Burger Bait trap
- [x] W3 escape cutscene

## M11 — Castle Town (W4)  *(shipped)*

- [x] Castle layout (no scrolling — fits the 20×15 viewport)
- [x] Player-usable catapult
- [x] Cat Decoy trap
- [x] Clone decoy cheat
- [x] Crown sprite swap
- [x] W4 escape cutscene

## M12 — The Volcano (W5) & ending  *(shipped)*

- [x] Lava tiles (solid for player, passable for chump via SWIM)
- [x] Falling rocks — peak hazard, area-stuns player, damages buildings
- [x] Flaming eggs — W5 egg variant, longer stun + bigger shake + glow halo
- [x] Swim-through-lava cheat (SWIM now covers WATER + LAVA)
- [x] Final catch → `VOLCANO_VICTORY` cutscene (player hoists chump, confetti)
- [x] Final **GAME COMPLETE** score screen + R to PLAY AGAIN

## M13 — Polish pass  *(shipped)*

- [x] Mobile touch d-pad + trap palette  *(virtual d-pad + pause + GO + tappable trap strip; touch-action:none on canvas; all menus tap-routed)*
- [x] Sound — `src/audio/sfx.js` procedural Web Audio, lazy-inited on first gesture
- [x] Audio pass 2 — peaks normalized across effects, master volume slider in settings (0..125%), two new effects (`spit_fire`, `cook_scream`)
- [x] Settings (mute / volume / reduced motion / high contrast) persisted to localStorage
- [x] Menu settings panel + in-chase pause overlay with the same toggles
- [x] Accessibility: reduced-motion clamps particle counts + kills screen shake, high-contrast overlay adds vignette + border
- [x] Headless regression harness  *(`tools/smoke.mjs` covers this; no separate sim.js)*
- [x] Dist build: `tools/build.mjs` emits a single `dist/index.html` (~265 KB, no external deps)
- [x] Menu juice, transitions, intro screen  *(staged title intro: title drops in, subtitle fades, Chump stomps in from off-screen right with dust puffs, list+settings slide in; diagonal orange wipe + banner on every state change via setState())*
- [x] Spit-fire animation  *(new directional flame cone replaces egg-splat placeholder when Chump eats a taco)*
- [x] Cook NPC  *(chef-hat sprite at the taco truck window on the Farm; flails and screams when Chump approaches)*
- [ ] Performance audit  *(still deferred — nothing currently feels slow)*

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

## M15 — Publishing  *(shipped)*

- [x] `docs/PUBLISHING.md` — GitHub Pages + itch.io paths
- [x] Public name locked as **Chump Chicken Chase** (Trumplestiltskin = repo codename only)
- [x] Title-screen subtitle, version stamp, meta tags, and Pages URL casing fixed
- [x] Pre-publish audit pass — code health, brand, doc drift swept and reconciled

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

## Resolved design calls

The big design questions from the M0 brainstorming session, with what we actually shipped. Kept here as a record so we don't re-relitigate them next session.

| # | Question | Resolution |
|---|---|---|
| 1 | Art approach (emoji / procedural / hybrid) | **Hybrid, leaning procedural.** Full-body procedural pixel-art sprites for Chump, player, foxes, NPCs, traps, pickups, projectiles. Emoji + procedural particles for chaos effects (fire, smoke, debris, goo, confetti). Sprites baked once at boot via `render/bake.js`. |
| 2 | Scope (vibe demo / Farm MVP / full 5-world / polish) | **Full game + polish.** All 5 worlds shipped (M1-M12), polish pass (M13), comedy payload (M14), publishing (M15). v1 content-complete. |
| 3 | Sound timing (M1 / M6 / M13 / skip) | **M13, then audio pass 2 in M13 ship.** Procedural Web Audio in `src/audio/sfx.js`, ~25 effects, master volume slider. Spoken taunts dropped — text-only is the direction. |
| 4 | Distribution shape | **Modules in dev, single-file build for ship.** `tools/build.mjs` emits `dist/index.html` (~265 KB). GitHub Pages serves the repo root directly; itch.io takes the bundle. |
| 5 | Real-time vs tick-based | **10Hz fixed tick + RAF render with interpolation.** Every duration in the codebase is in ticks. |
| 6 | Grid size / resolution | **640×480** (20×15 × 32px). Static viewport, no scrolling needed in any world. |
| 7 | Catch mechanic | **Touch stunned chicken.** Walk-into-stunned trigger. Never promoted past A — feels right as-is. |
| 8 | Cutscene style | **Scripted procedural animations** with sprite tweening + text bubbles + screen effects. Big juice on W1 intro and W5 GAME COMPLETE; lighter on mid-game escapes. |
| 9 | Mobile timing | **M13 ship pass.** Virtual d-pad, virtual buttons, tappable trap palette, all menus tap-routed. `touch-action: none` on the canvas. |

## Resolved smaller calls

- **Multiple cats/hens on map**: cap at 1 at a time
- **Trap inventory**: fixed per-world count, no replenishment during chase
- **Egg throw cooldown**: tuned per-world, base ~4s
- **Final Form duration**: 50 ticks (5s)
- **Title on screen**: "CHUMP CHICKEN CHASE" with "CHASE THE ORANGE MENACE" tagline subtitle
- **Difficulty curve**: easy W1, ramps from W3, peak chaos in W5 (rocks + lava + final form + flaming eggs + executive orders)
- **Color palette**: hand-tuned procedural palette in `render/palette.js` (didn't end up needing PICO-8 specifically)

## Risks (historical — kept for the record)

These were called out at M0 and all of them played out:

- **Chicken AI complexity** — managed by building incrementally across M2/M4/M6/M7 milestones rather than all at once. Final state has rage + cheats + 4 cheat modifiers + 4 executive orders + taunts + lure pathfind. Lives in one file (`chicken.js`) and is still readable.
- **Art scope creep** — real, but managed by baking at boot and reusing sprite keys. 33 modules, no pixel-art file ever broke 300 lines.
- **Particles + goo + fire perf** — handled with pooled arrays in `systems/particles.js`. Reduced-motion mode clamps the cap from ~300 to ~120. No perf complaints to date.
- **Feel IS the product** — held. Taunt cadence, signing ceremony, screen wipes, transition banners, intro animation all got real time. The bratty personality made it through.
