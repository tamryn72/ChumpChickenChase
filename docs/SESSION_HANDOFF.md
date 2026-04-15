# Session Handoff

> The point of this file: the last thing a session does is jot down where things stand, so the next session starts in context. Informal is fine.

---

## Last session — 2026-04-15 (M14 comedy payload)

Executive Clucks + Red Fox minions shipped. This was the last wishlist milestone; the base game is effectively v1 content-complete. Branch `claude/comedy-payload`, based on `claude/m13-polish-ship-2fGFd`.

### What's new

**Signing ceremony + SIGNING state**. New game state between GOTCHA and CHASE. Triggers on the **first catch of a level only** — subsequent catches use the existing GOTCHA→CHASE flow. 32 ticks long, skippable with Enter/Space/tap. Parchment scroll slides in from the right over 8 ticks, Chump stands to the left dipping his beak, red "SIGNED" stamp slams down at elapsed=18 growing from 2.2× to 1.0×. Transition overlay is drawn *behind* the signing scroll so it doesn't obscure the slide-in.

**Four executive order flavors**, picked at random each time the ceremony fires:

- **Order for Speed** — `p.inputDelay = true` flips player input reading to a 1-tick queue. Each movement tick uses the previous tick's direction and then stores the current. Noticeable sluggishness, not broken.
- **Supersonic Order** — `g.supersonicCooldown` starts at 60 (6s warmup). Every CHASE tick it ticks down; when it hits 0 and the player is within 6 tiles, Chump sets `p.supersonicSlow = 20` and resets the cooldown to 140. `movePace` returns 8 (4× slow) while the flag is nonzero. Blue pulsing halo around the player while active. Plays `supersonic` SFX on trigger.
- **Red Foxes Directive** — `spawnDirectiveFoxes(g)` drops 3 foxes on random walkable tiles ≥ 4 manhattan from the player. Fox AI lives in `src/entities/fox.js` — moves every 3 ticks toward the player (with tiny rng jitter so they don't overlap), stagger-stuns on contact (5-tick stun, 10-tick recoil, bounces back one tile). No health, not dispatchable, cleared when the level resets.
- **Tropical Order** — `maybeThrowEgg` in `chicken.js` checks `ctx.execOrder === 'tropical'` and rolls 50/50 to call `hooks.spawnIce` instead of `hooks.spawnEgg`. Ice cubes fly with the same parabolic arc as eggs but freeze the player for 20 ticks (2 sec) on direct hit. `g.iceTint = 22` draws a pale blue full-screen overlay that fades out over 22 ticks.

**HUD indicator**. `drawHUD` renders a small orange "ORDER: SPEED/SUPERSONIC/RED FOXES/TROPICAL" badge directly under the CATCHES counter when `game.execOrder` is set.

**Exec-flavored taunts**. `EXEC_TAUNTS` in `chicken.js` has 4 lines per flavor (e.g. "for efficiency reasons", "going supersonic, folks", "ITS THE RED FOXES", "beautiful weather"). The CHASE-tick taunt cooldown now pulls from the flavored pool ~50% of the time when an order is active.

**Cumulative `save.ordersSeen`**. Nested-merged on `loadSave` (so old saves don't lose anything on upgrade). Four booleans. `drawScore` adds a new "EXEC CLUCKS SEEN: X/4" stat row that counts trues. Gives the player a reason to replay and see all four flavors.

**New SFX** (5): `exec_order` (bass stamp thump + 2-note melody), `supersonic` (descending sine zing), `ice_throw` (high triangle sweep), `ice_hit` (highpass crackle + descending triangle), `ice_splat` (highpass noise). All tuned into the same 3-tier peak scheme as M13 audio pass.

**New sprites**: `fox_0` / `fox_1` (16×16 orange body, red pointy hat with white band, red glowing eye, 2-frame leg cycle), `ice_cube` (8×8 pale blue cube with white highlight).

### Design decisions locked in this session

- **A1**: Signing triggers on the **first catch only**. One order per level, not per catch.
- **B**: Foxes **persist through the whole level** (through catches 2-3, pause, etc.). Only clear on level end.
- **C1**: Signing **hard-pauses** the game — no particles, no AI, no projectiles advance. Same treatment as GOTCHA.
- **D**: Renamed **Icy Executive Cluck** → **Tropical Order** to match the "opposite of effect" naming convention. Red Foxes Directive kept on-the-nose (the joke is the blatantness).
- **E**: Taunt lines locked as the ones I pitched (plus a few extras). 4 per flavor in `EXEC_TAUNTS`.
- **F**: `ordersSeen` tracked cumulatively across all runs, shown on the SCORE screen. Not persisted per-run.

### Files touched (branch `claude/comedy-payload`)

- `src/entities/fox.js` *(new)*
- `src/entities/player.js` *(input queue + supersonic slow)*
- `src/entities/chicken.js` *(Tropical ice branch + EXEC_TAUNTS)*
- `src/entities/projectile.js` *(createIce)*
- `src/audio/sfx.js` *(5 new effects)*
- `src/main.js` *(beginSigning, tickSigning, order effects, chumpHooks.spawnIce, iceTint render, ordersSeen save)*
- `src/render/menu.js` *(drawSigning ceremony, EXEC CLUCKS SEEN score row)*
- `src/render/renderer.js` *(drawFoxes, Supersonic pulse, ice-cube projectile)*
- `src/render/sprites.js` *(drawFox0/1, drawIceCube)*
- `src/render/bake.js` *(fox + ice_cube bakes)*
- `src/render/ui.js` *(EXEC_ORDER_HUD indicator)*
- `src/systems/save.js` *(ordersSeen nested merge)*
- `docs/PLAN.md`, `docs/MEMORY.md`, `docs/TIMELINE.md`, `docs/SESSION_HANDOFF.md`, `CLAUDE.md`

### Smoke + build

- `node tools/smoke.mjs` → OK. Fox ticking isn't exercised directly (smoke doesn't go through main.js state machine), but all imports/exports resolve and the world sweep still passes.
- `node tools/build.mjs` → `dist/index.html` at ~264 KB (up from 242 KB).
- Bundle parses under `new Function(js)` — 0 leaked imports/exports.

### Risks worth flagging

- **Volume balance still headless.** I haven't heard any of the new SFX (exec_order thump, supersonic zing, ice effects). Ear-test on first playtest.
- **Order for Speed feels sluggish at the movement-cycle granularity, not per-tick.** The player tick only reads input when `moveT >= pace`, so the queue effectively delays by one movement step (~200ms at BASE_MOVE_TICKS=2), not one game tick (100ms). Feels sluggish in practice. If it's too mild, I can tick the queue every game tick regardless.
- **Red Fox AI is very simple.** They path by picking the walkable neighbor with min manhattan distance — no actual pathfinding. They can get stuck behind walls or oscillate. If that happens in playtest I'll upgrade them to BFS pathing. For now, simple is intentional.
- **Supersonic cooldown + the signing ceremony are both timer-driven with no indication to the player.** After signing, the slow-mo can fire 6 seconds later with nothing warning. The blue pulse ring + SFX is the indication *as it happens*. Might want a "going supersonic…" warning bubble 1 tick before trigger — easy to add if it feels unfair.
- **Foxes can spawn on the player's PLAN-phase position.** The 4-tile minimum manhattan check runs against the player's *current* position, which is fine — they won't spawn on top of you. But they can spawn on grass near the taco truck etc. where you're about to be. Not a bug, just a design note.
- **Signing only fires once per level.** If you want more signings per run (e.g. one per catch with replacement, not stacking), that's a small change — grep `execOrderSigned` and gate differently.
- **The regex bundler is still regex-based.** Same caveat every session: no `export default`, grep the bundle after changes.

### Not yet in / parked

The wishlist is empty. Only remaining items:

- **Arctic / ice level variant** — still deferred. Could be W6 or a W5 sub-biome. No design pressure to ship.
- **Taco trucks on W2-W5** — still a small gap; the Farm is the only world with a taco truck + cook.
- **Performance audit** — still not needed.

The base game is effectively **v1 content-complete**. Next direction is up to you: publish to GitHub Pages / itch.io, polish pass 3, new content milestone, or call it done.

---

## Previous session — 2026-04-15 (M13 ship pass)

Closed out every M13 box that was still open, plus the two food-truck wishlist items on the way out. Branch `claude/m13-polish-ship-2fGFd`. Everything smoke- and build-verified; no real browser playtest from this side.

### What's new

**Mobile touch**. `src/input.js` rewritten with a new touch API (`setTouchDir`, `injectPress`, `markTouchActive`, `isTouchActive`). `src/main.js` wires `touchstart/move/end/cancel` listeners on the canvas, hit-tests against virtual d-pad / pause button / GO button / trap palette slots / menu rows, and feeds the result back through input. First touch flips `game.touchActive` which lets `ui.js` draw the touch UI. `index.html` gets `touch-action: none` + user-select none.

- **CHASE**: virtual d-pad at `(76, CH-76)` with 52px radius and 10px deadzone, dominant-axis selection (so diagonals don't get eaten by horizontal priority). Pause button bottom-right (36×36).
- **PLAN**: tap-to-place grid, tappable trap palette strip at the bottom (54×44 slots with sprite + count), big orange "START" button bottom-right. Top-HUD desktop palette text is still shown for keyboard users.
- **MENU / SCORE / PAUSE**: row-level tap routing via `menuLayout()` / `pauseMenuLayout()` exported from `menu.js`. Tap a world row to launch; tap a settings row to toggle.

**Menu juice**. Title screen has a staged intro driven by `game.menuIntroT`. Title drops in with a bounce (ticks 0-10), subtitle fades in (8-18), Chump stomps in from off-screen right with dust puffs under each step (14-34), world list and settings slide+fade in (30-52). Steady state at 52+ ticks, which is when `menuIntroT` stops advancing. Intro replays every time you return to MENU (quit from pause, finish a score screen, etc.).

**State transitions**. New `setState(g, newState)` helper in `main.js` routes every state change through `transitionT = 14`. All direct `game.state = '...'` writes were migrated. `drawTransition(ctx, game)` in `menu.js` renders a diagonal orange wipe + a big sliding banner label for PLAN / CHASE! / HE ESCAPED — the player-relevant state changes. Every renderFrame path draws the overlay just before the accessibility overlay.

**Audio pass 2**. `src/audio/sfx.js` gets `BASE_MASTER = 0.5` + user `volume` (0..1.25) on a single master gain. All effect peaks were normalized: UI ~0.16-0.20, combat ~0.22-0.28, big impacts ~0.30-0.38. The old outliers at 0.55 are gone. New slider row in both the title-screen settings column and the pause overlay, cycling through 25/50/75/100/125%. Values persist in `save.settings.volume` with nested merge. **I still can't ear-test in this environment** — the first playtest should confirm the mix feels right, adjust master + individual peaks as needed.

**Spit-fire animation**. When Chump eats a taco, `addSpitFire(particles, col, row, facing, rng)` in `particles.js` shoots a directional flame cone of 22 `fire` particles + 5 smoke puffs along his facing direction. Fire particles render as yellow core → orange shell → red outer as they age. Replaces the old egg-splat placeholder. Shake bumped 10→12. New `spit_fire` SFX (sawtooth sweep + highpass crackle).

**Cook NPC**. New `drawCookIdle` / `drawCookPanic` sprites in `sprites.js` — white chef hat with yellow band, brown mustache, white coat with red apron buttons, holds a spatula + pan when calm, arms-up-screaming when panicked. Baked as `cook_idle` / `cook_panic`. `tickTownie` gained a `variant === 'cook'` branch that skips movement entirely (cooks are rooted to their tile). `drawTownies` routes the cook variant to `cook_*` sprite keys. Farm's `createTownies` adds `{ col: 12, row: 6, variant: 'cook' }` right below the taco truck. Main's townie tick detects the wander→panic rising edge for cooks and fires `cook_scream` SFX + a "MY TACOS" speech bubble. `drawBubbles` callback in renderer now looks up townie positions too so NPC bubbles actually render.

**Executive Clucks / Red Fox minions — deferred**. Explicitly scheduled for the next session as the comedy payload. See PLAN.md. Once-per-level (not per-catch, not stacking), four flavors, clears on level end. Speed flavor reworked from "2s input delay" to "inputs queue one tick late" so stacking isn't a problem.

### Files touched (branch `claude/m13-polish-ship-2fGFd`)

- `src/input.js` *(rewrite)*
- `src/main.js`
- `src/render/ui.js`
- `src/render/menu.js`
- `src/render/renderer.js`
- `src/render/sprites.js`
- `src/render/bake.js`
- `src/audio/sfx.js`
- `src/systems/save.js`
- `src/systems/particles.js`
- `src/entities/npc.js`
- `src/world/farm.js`
- `index.html`
- `docs/PLAN.md`, `docs/MEMORY.md`, `docs/TIMELINE.md`, `docs/SESSION_HANDOFF.md`

### Smoke + build

- `node tools/smoke.mjs` → OK (all 5 worlds tick, save roundtrip, cheats fire, cook townie runs the full 900-tick loop without issues)
- `node tools/build.mjs` → `dist/index.html` at ~242 KB
- Bundle parses cleanly under `new Function(js)` — no leaked imports/exports

### Risks worth flagging

- **Volume balance is still ear-test-dependent.** I adjusted ratios + added the master slider, but I have no ears. First playtest should confirm nothing clips under chaos (especially building_destroy + rock_land + egg_hit stacking on W5).
- **Touch handlers haven't run in a real browser.** The hit-test math is right on paper but the `touchPointToCanvas` coordinate translation should be sanity-checked on a phone — especially with the responsive `width: min(100vw, calc(100vh * 4 / 3))` sizing that can produce non-integer scale factors.
- **Cook NPC is Farm-only.** Other worlds don't have a taco truck yet (per `docs/MEMORY.md`, the design is that every world from W1 has one; we only shipped W1's). Adding trucks to the other four worlds is a separate small task.
- **Intro animation doesn't skip.** If you mash Enter during the title intro, the keypress is consumed but the animation keeps playing. Not a bug per se — `menuIntroT` is cosmetic — but if the 5-second intro feels too long, let me know and I'll gate `wasPressed('Enter')` to jump `menuIntroT` to MENU_INTRO_LEN.
- **The dist bundler is still regex-based.** Same caveat as last session: if anyone later adds an `export default` or similar unsupported pattern, the build will silently leak an `export` statement. Keep grepping the bundle after changes.

### Not yet in / parked

Everything in the "Future upgrades" wishlist in `docs/PLAN.md` except the food-truck items just shipped. Next session target:

- **Executive Clucks** — once-per-level (clears on level end), 4 flavors (Order for Speed = queued-input variant, Supersonic Order, Red Foxes Directive, Icy Executive Cluck), paper-scroll signing ceremony UI
- **Red Fox minion entity** — tied to Red Foxes Directive (and optionally a standalone high-rage summon)

Still deeper in the freezer:

- Taco trucks on W2-W5
- Arctic / ice level variant (W6 or W5 sub-biome)
- Performance audit (still not needed)
- Menu intro juice pass 2 — currently minimal chump stomp-in, could use more chaos (eggs flying in, townies running across foreground, etc.) if the vibe demands it

---

## Picking this up next session

1. Skim `CLAUDE.md` → `docs/MEMORY.md` → this file
2. **Playtest M13 in a real browser** — open `dist/index.html` directly (file://) or serve `index.html`:
   - Volume balance across all 5 worlds under chaos (especially W5 final form + rocks + buildings)
   - Mobile touch on a phone viewport if possible — d-pad feel, palette tappability, GO button position
   - Menu intro feels right / not too long
   - Transition wipe doesn't obscure anything important
3. Start the **Executive Clucks** milestone (new branch recommended, e.g. `m14-exec-clucks`). Design pass before coding — scroll-signing ceremony, icons for each order type, how the 4 orders compose with existing AI.

---

## Previous session — 2026-04-14 (M13 polish pass)

M13 polish pass — sound, settings, accessibility, in-chase pause, dist build. Most of PLAN.md's M13 checkboxes now have good answers. Mobile touch is still parked.

### What's new

**Sound**. `src/audio/sfx.js` is a small procedural Web Audio module. It lazy-inits its AudioContext on the first user gesture (respecting the autoplay policy) and silently no-ops if audio is unavailable. About 20 named effects are built from oscillators + filtered noise:

- UI: `menu_cursor`, `menu_select`, `menu_back`
- Plan/Chase: `trap_place`, `trap_snap`, `gotcha`
- Combat: `egg_throw`, `egg_splat`, `egg_hit`, `player_hit`, `rock_warn`, `rock_land`
- Building: `building_hit`, `building_destroy`
- Pickups: `pickup_taco`, `pickup_burger`, `pickup_cat`
- Chump: `final_form`, `teleport`, `chump_squawk`
- State: `victory`, `game_over`

Call sites are wired through `main.js` — every major event now cues a sound. Global mute lives in save state and can be toggled with **M** at any time.

**Settings persisted to save**. New nested object on the save:

```js
settings: { muted: false, reducedMotion: false, highContrast: false }
```

`systems/save.js` merges nested settings on load so existing saves pick up new fields without losing their state.

**Menu settings column**. The title screen now has a **SETTINGS** panel below the world list. **Tab** / left / right jumps focus between the two columns; up/down cycles rows; Enter toggles the highlighted setting. The pulsing hint line shows contextual controls for whichever column is focused.

**In-chase pause**. **ESC** or **P** during CHASE pops a pause overlay with `RESUME / SOUND / REDUCED MOTION / HIGH CONTRAST / QUIT TO MENU`. Ticks halt entirely while paused — no chump movement, no particles, no projectile advance.

**Reduced motion** actually does something:

- `addShake(amt)` is a new helper that wraps all screen-shake raises. Under reduced motion, shake is dropped entirely.
- `systems/particles.js setMotionScale(0..1)` multiplies all burst sizes and lowers the feather-pool cap from 300 → 120. Default scale is 1; reduced motion sets it to 0.35.
- Applied at boot and whenever the setting is toggled.

**High contrast** is a post-render overlay: a 3px white border around the canvas + a radial-gradient vignette that darkens the edges so sprites pop.

**Dist build**. `tools/build.mjs` is a tiny dependency-free ESM bundler tailored to this codebase. It walks `src/`, regex-parses imports and exports (named imports with `as` renames, `import * as`, grouped exports, multiline braces all handled), topologically sorts modules, wraps each in an IIFE with a `__exports` object, and inlines the concatenation into a copy of `index.html`. Output is a single double-clickable `dist/index.html` at ~214 KB.

Run locally:

```bash
node tools/build.mjs
```

`dist/` is in `.gitignore` with a comment explaining how to undo that when ready to publish.

### Files touched (branch `claude/m13-polish-pass`)

- `src/audio/sfx.js` *(new)*
- `src/main.js`
- `src/render/menu.js`
- `src/systems/save.js`
- `src/systems/particles.js`
- `tools/build.mjs` *(new)*
- `.gitignore`
- `docs/PLAN.md`, `docs/TIMELINE.md`, `docs/SESSION_HANDOFF.md`

### Smoke test

`node tools/smoke.mjs` — OK. All 5 worlds boot and tick.
`node tools/build.mjs` — emits `dist/index.html` at 214 KB and the bundle parses + boots cleanly under node browser stubs.

### Not yet in / parked

From PLAN.md's M13 list, still outstanding:

- **Mobile touch d-pad + trap palette.** The biggest unchecked item. Needs touch event listeners, an on-screen d-pad + trap selector, and responsive layout. Probably a full session by itself.
- **Menu juice / transitions / intro screen.** Title still just fades in as text. Could use a proper opening animation with chump stomping in and eggs flying.
- **Performance audit.** Nothing currently feels slow. Defer until someone actually reports a slowdown.

Still parked from earlier sessions (future upgrades wishlist, see `docs/PLAN.md`):

- Executive Clucks (Order for Speed, Supersonic Order, Red Foxes Directive, Icy Executive Cluck)
- Red Fox minion mob
- Proper spit-fire animation when chump eats a taco
- Cook NPC at the taco truck
- Spoken taunt experiment with SpeechSynthesis
- Arctic / ice level variant

### Risks worth flagging

- No in-browser playtest from the Claude side this session. Sound effects are tuned by ear elsewhere but these are generated by ratios I pulled out of thin air — **first playtest should mute-check and volume-check every effect**. A runaway oscillator with the wrong peak gain will be unpleasant.
- `AudioContext` is created on first user gesture. If a setting toggle happens before that gesture (it shouldn't — you need to click/key to toggle anyway), the sfx will silently no-op.
- The dist bundler is regex-based. If anyone adds a default export (`export default`) or an export pattern the regex doesn't recognize, the build will silently leak an `export` statement. `tools/build.mjs` throws if the entry's imports can't be resolved, but it won't catch syntactic oddities mid-file. Grep the output for `^(import |export )` to sanity check.

---

## Picking this up next session

1. Skim `CLAUDE.md` → `docs/MEMORY.md` → this file
2. **Playtest with sound.** First real audio pass — expect to retune a few effects. Volume-balance the master gain if things are too loud/quiet.
3. Test the accessibility toggles on the title screen and in-chase pause.
4. Run `node tools/build.mjs` and open `dist/index.html` directly (file:// URL) to confirm the single-file bundle actually works in a browser, not just under node stubs.
5. Candidates for next milestone (user's call):
   - **Mobile touch** — the big remaining M13 item
   - **Intro / menu juice** — chump stomping in, title bounce, transition into PLAN
   - **Wishlist mini-sprint** — Executive Clucks + Red Fox minions (the comedy payload)
   - **Audio pass 2** — balance, more variants, maybe SpeechSynthesis experiment
