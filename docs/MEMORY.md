# Memory — Current Direction

> Working answers to design and tech questions — best current thinking, not commandments. Anything here is open to change; raise it if it becomes friction.

## Decided this conversation

Things that landed firmly — not locked forever, but these are our real direction now:

- **Game title**: **Chump Chicken Chase**
- **Chicken name**: **Chump**
- **Art approach**: **hybrid, leaning procedural**. Chump, the Player, and chaos NPCs are **full-body procedural animated pixel-art sprites** with multi-frame walk / run / idle / action animations. Emoji + procedural particles handle environmental chaos (fire, smoke, debris, eggs, goo, confetti) and background pickups. The "just emoji for the chicken" idea is out — Chump needs a real animated body.
- **Scope**: **full 5-world game** (M1 through M12 + polish). Time is not a constraint. Do it right.
- **Distribution**: dev as ES modules in `src/`, ship as a single `dist/index.html` built by a tiny concat script. Publish as an **indie game** on **GitHub Pages** and/or **itch.io**.
- **Chaos vibe**: real chaos, not just a 1-on-1 chase. Townsperson NPCs running and screaming, buildings on fire, debris flying, particles everywhere. The world should feel like it's falling apart wherever Chump goes.
- **Grid**: 20×15 tiles × 32px = 640×480 logical canvas. Current working size.
- **Entry point scaffolded**: `index.html` + `src/{config,rng,main}.js` render the title screen and tick counter. Verified boot-ready.

## New mechanic: Tacos & the Mexican food truck

Player's counterpart to Chump's burger buff. Adds a race/defense layer to every level.

- A **Mexican food truck** is parked on every map from W1 onward, staffed by a pixel **cook NPC**.
- The cook periodically produces **tacos** on the truck window / nearby tiles on a timer.
- **Player eats a taco** → short-duration buff: speed +, catch radius +, possible egg-stun immunity. Glow + particle flourish while buffed.
- **Chump HATES tacos**. High-priority AI target — he aggressively goes for the truck and any loose tacos to destroy them. Priority sits between `CHASE_CAT` (mandatory) and `DESTROY_NEAREST`.
- **If Chump eats a taco himself** → it backfires. Brief self-stun with a spit-fire animation + rage spike + taunt ("NOT THE TACOS!" / "MY BEAK, IT BURNS!"). Opens a catch window for the player.
- **The food truck is protectable** — if Chump destroys it, no more tacos that level. Player wants to keep it alive.
- Taco-specific Chump taunts: `"THIS TRUCK MINE NOW"`, `"QUIET, PIGGY, THE TACOS BELONG TO ME"`, `"I HATE TACOS, I HATE TACOS!"`, `"worst food, the absolute worst food, believe me"`.
- The cook NPC has her own sprite + scream animation when Chump approaches.

## Chaos NPCs (cosmetic but critical to feel)

- Townspeople wander maps in calm state (farmer, shopkeeper, kid, tourist per world)
- When Chump is within N tiles → they switch to PANIC state: run away, arms-up animation, occasional scream bubbles
- No gameplay interaction with player — pure vibe
- 2-3 NPC archetypes per world (minimum), varied palettes

## Architecture (current direction)

- **Modules during dev**: native ES modules in `src/` for iteration sanity. How we ship (single HTML file vs served folder vs bundled) is still being discussed — see `PLAN.md` → "Design calls worth talking through."
- **Rendering**: single `<canvas>`, 2D context. Logical resolution leaning 640×480; exact grid is in play.
- **Tick rate**: leaning fixed 10Hz logic + RAF render with interpolation. Real-time (no ticks, seconds everywhere) is a viable alternative.
- **RNG**: seeded `mulberry32`. Useful for reproducing AI bugs and optional daily-seed mode. Fine to drop if it becomes friction.
- **State machine**: top-level `BOOT, MENU, PLAN, CHASE, CUTSCENE, VICTORY, GAMEOVER`.
- **Art source**: under discussion — leaning hybrid (emoji + simple procedural tiles). Full-emoji and full-procedural are both on the table. See `PLAN.md` → "Art approach."
- **External deps**: none currently planned; fine to add if one earns its weight.
- **External assets**: aiming self-contained so nothing breaks on share. Emoji from the system font counts as "built-in."

## Game rules (from the README design brief)

These are from the README and are our current target. The README is a compass, not a contract — we can adjust any rule if it turns out not to be fun.

- 5 worlds, 2-phase per level (Plan → Chase)
- Catches per world: W1=2, W2=2, W3=3, W4=3, W5=3
- Player can place traps in both phases (chase supply limited)
- Egg hit on player → short freeze + screen shake
- Orange goo is walkable but slows player slightly
- Fire spreads tick-by-tick to adjacent flammable tiles
- Rage 0-100; 100 triggers temporary FINAL FORM (faster, immune to basic traps)
- Chicken always escapes W1-W4. Only the W5 final catch ends the game.

## Cheat unlock (current plan)

| World | Cheats                                   |
|-------|------------------------------------------|
| W1    | Dodge                                    |
| W2    | Dodge + Teleport                         |
| W3    | Dodge + Teleport + Swim                  |
| W4    | Dodge + Teleport + Clone                 |
| W5    | All (Dodge, Teleport, Swim, Clone)       |

## Trap unlock (current plan)

| World | New traps            | Inventory |
|-------|----------------------|-----------|
| W1    | Net, Banana, Cage    | 3         |
| W2    | + Glue, Corn Decoy   | 5         |
| W3    | + Pretty Hen, Burger | 5         |
| W4    | + Cat Decoy          | 6         |
| W5    | all                  | 7         |

## Design intents (things we probably shouldn't lose without thinking)

These are design calls baked into the feel of the game. Not untouchable, but each exists for a reason.

- **Cat distraction overrides all other AI.** It's the player's primary "exploit" lever — the chicken can't resist chasing a cat, and you can use that against him.
- **Burger buff is one-hit destroy + speed.** It creates timer pressure — if you don't stop him, the map crumbles fast.
- **Pretty Hen distraction is a long lock** (~6+ ticks). Strong because her window is the player's best single catch opportunity.
- **Cat Decoy trap is mandatory override** even in FINAL FORM. The only absolute.
- **Speech bubbles are frequent, rate-limited per emotion.** Bratty, not spammy. The taunting IS the game's personality.
- **Final Form is a time-limited panic button** for the chicken, not a permanent upgrade.
- **Goo trail accumulates within a level** (cosmetic + mild slow), clears between levels.
- **Feathers are cosmetic.** Pure juice particles.

## Not currently planned (parked, not forbidden)

- Multiplayer / netcode
- Level editor
- Cloud saves / accounts
- Ads
- External analytics beyond `localStorage` stats

## Things actively worth revisiting

All of these have open discussion in `docs/PLAN.md`:

- Art approach (full emoji / procedural pixel art / hybrid)
- Distribution shape (single HTML / served folder / dev-as-modules-ship-as-single)
- Logic tick rate (10Hz grid / continuous real-time)
- Scope tiers (vibe demo / Farm MVP / full 5-world game)
- Sound scope (from M1 / from M6 / M13 / skip)
- Cutscene style, catch mechanic, mobile timing, difficulty curve
