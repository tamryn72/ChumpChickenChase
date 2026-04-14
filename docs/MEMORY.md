# Memory — Locked Decisions & Gotchas

> Things already decided. Don't re-debate without explicit user ask. Update by appending, not rewriting.

## Architecture (locked)

- **Module system**: native ES modules (`<script type="module">`). NO bundler, NO build step.
- **Rendering**: single `<canvas>`, 2D context. Logical resolution **640×480** (20×15 tiles × 32px). CSS-scaled to viewport with `image-rendering: pixelated`.
- **Tick rate**: logic **10Hz fixed**. Render at RAF with position interpolation (alpha = accumulator / TICK_MS).
- **RNG**: seeded **mulberry32**. All gameplay randomness routes through `src/rng.js`. Sim harness depends on this being clean.
- **State machine**: top-level states = `BOOT, MENU, PLAN, CHASE, CUTSCENE, VICTORY, GAMEOVER`.
- **No external assets**: sprites are data arrays + palette, pre-rendered to `OffscreenCanvas` at boot. Keeps the whole game a <1MB single-folder download.
- **No external deps**: vanilla JS only. Ask before introducing even a small helper lib.

## Game rules (canon from README)

- **5 worlds**, 2-phase per level (Plan → Chase)
- **Catches per world**: W1=2, W2=2, W3=3, W4=3, W5=3
- Player can place traps in **both** phases (chase supply is limited)
- **Egg hit** on player → 0.5s freeze + screen shake
- **Orange goo** is walkable but slows player slightly
- **Fire spreads** tick-by-tick to adjacent flammable tiles
- **Rage 0-100**: scales speed, aggression, head scale, hair flop. 100 = temporary FINAL FORM (faster, immune to basic traps, decays back to 0).
- **Chicken always escapes W1-W4** no matter what. Only the W5 final catch ends the game.

## Cheat unlock schedule

| World | Cheats active                          |
|-------|----------------------------------------|
| W1    | Dodge                                  |
| W2    | Dodge + Teleport                       |
| W3    | Dodge + Teleport + Swim                |
| W4    | Dodge + Teleport + Clone decoy         |
| W5    | ALL (Dodge, Teleport, Swim, Clone)     |

## Trap unlock schedule

| World | New traps unlocked      | Inventory slots |
|-------|-------------------------|-----------------|
| W1    | Net, Banana, Cage       | 3               |
| W2    | + Glue, Corn Decoy      | 5               |
| W3    | + Pretty Hen, Burger    | 5               |
| W4    | + Cat Decoy             | 6               |
| W5    | all                     | 7               |

## Gotchas / non-obvious rules

- **Chicken chasing a cat OVERRIDES all other AI.** This is intentional and exploitable by the player. Don't "fix" it.
- **Burger buff** should make chicken destroy buildings in **one hit** while active. It's a timer pressure mechanic — player must stop him fast or the map crumbles.
- **Pretty Hen lock duration** is 6+ ticks — minimum 6, scales slightly with low rage (more distracted when calm).
- **Cat Decoy is mandatory targeting** — chicken MUST chase it regardless of rage/FINAL FORM. Only exception to the priority tree.
- **Speech bubbles** should feel bratty and frequent, not spammy. Rate-limit per emotion category (taunt, escape, destroy, egg-throw, brag). Cooldown per category, not global.
- **Final Form** is time-limited (~5s). It's a panic button the chicken gets, not a permanent upgrade.
- **Goo trail is permanent within a level** — accumulates as a visual and slightly affects player movement. Cleared between levels.
- **Feathers** are pure cosmetic particles, no gameplay effect.

## Out of scope (don't build)

- Multiplayer / netcode
- Level editor
- User accounts / cloud saves
- Ad integration
- Analytics beyond anonymous `localStorage` stats
- Any external API calls

## Open questions

See `docs/PLAN.md` → **Discussion** section. Resolve these with user before locking them here.
