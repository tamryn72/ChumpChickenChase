# Session Handoff

> The point of this file: the last thing a session does is jot down where things stand, so the next session starts in context. Informal is fine.

---

## Last session — 2026-04-14 (marathon)

M0 through M7 shipped in one long cook session. The Farm is now a complete playable chaos sim with everything the README brief described for W1 except cutscenes and sound.

### What's actually running

Open `index.html` via any static server. The game loop is:

**PLAN phase** — 20s to place 3 Nets, 2 Bananas, 1 Cage. `1/2/3` select, click to place, `ENTER` starts early. Hover cursor (yellow on walkable, red on solid).

**CHASE phase** — 60s to get 2 catches. During chase:
- **You** walk the Farm with WASD/arrows, pick up **tacos** for speed buffs, grab **burgers** as bait inventory, avoid thrown eggs.
- **Chump** wanders/targets prioritized by: cat (mandatory) → taco (hate, charges the truck) → burger (opportunistic) → destroy nearest building → wander.
- Chump actively pecks buildings until HP is 0, they become rubble, path opens up.
- Chump throws eggs at you with a parabolic arc when in range 2-7 tiles. Hit = 0.5s player stun + screen shake + rage spike.
- **Rage meter** builds over time and on events. At 100 Chump enters **FINAL FORM**: 2x speed, immune to Net/Banana, red glow, louder.
- **Burger buff** (if he eats one): orange glow, 3 ticks/tile, 1-hit building destroy.
- **Taco self-stun** (if he eats one — he hates them): 10t stun + rage spike + screen shake + "NOT THE TACOS" taunt.
- **Cat pickups**: Chump MUST chase them, tosses them with "grab that pussycat", cat lands dizzy a few tiles away.
- **3 townspeople** wander grass tiles and panic-run away with arms up when Chump gets within 4 tiles.

**GOTCHA** — brief freeze on catch, Chump respawns far from you (rage/final form/burger buff carry through).

**VICTORY** — 2 catches = GOT HIM. **GAMEOVER** — timer out or all buildings destroyed = HE ESCAPED. Click anywhere to retry.

### Taunt rotation

- `TAUNTS` — general bratty (QUIET PIGGY, imagine losing to a chicken)
- `STUN_BUBBLES` — when trapped (I AM TRAPPED, MY LAWYERS)
- `ESCAPE_BUBBLES` — when stun ends (I am the best at escape)
- `DESTROY_BUBBLES` — while pecking buildings (WORST BARN EVER)
- `EGG_BUBBLES` — on egg throw (EGG TIME, SPECIAL DELIVERY)
- `FINAL_FORM_BUBBLES` — on rage 100 (UNLIMITED POWER)
- `CAT_BUBBLES` — on cat toss (**grab that pussycat**, GET THE CAT)
- `TACO_HATE_BUBBLES` — on accidentally eating a taco (NOT THE TACOS, WORST FOOD EVER)
- `BURGER_BUBBLES` — on eating a burger (BURGER TIME, SO BIG)

All rate-limited per category so they feel present but not spammy.

### What's NOT yet in

- Escape cutscene, victory parade, score screen (M8)
- Menu, level select, save state (M8)
- Worlds 2-5 (M9-M12)
- Sound (not yet)
- Mobile touch controls
- Single-file `dist/index.html` build script for indie distribution
- **User wishlist — parked in PLAN.md "Future upgrades"**:
  - Executive Clucks (Order for Speed / Supersonic Order / Red Foxes Directive / Icy Executive Cluck)
  - Red fox minions
  - Ice/arctic level with ice-hole mechanic
  - Proper spit-fire animation for taco eating
  - Cook NPC at the taco truck
  - Spoken taunt experiment with SpeechSynthesis

### Files touched (branch `claude/game-docs-setup-mkNDN`)

Code:
- `index.html`
- `src/config.js`, `src/rng.js`, `src/main.js`, `src/input.js`
- `src/render/{palette,sprite-cache,tiles,sprites,bake,renderer,ui}.js`
- `src/world/{level,farm}.js`
- `src/entities/{player,chicken,trap,building,projectile,pickup,npc}.js`
- `src/systems/{particles,bubbles}.js`

Docs:
- `CLAUDE.md`, `docs/{MEMORY,TIMELINE,ARCHITECTURE,PLAN,SESSION_HANDOFF}.md`

Total this session: 11 commits on branch. No code has been run in a browser from the Claude side — bugs likely lurking.

---

## Picking this up next session

1. Skim `CLAUDE.md` → `docs/MEMORY.md` → this file
2. First priority: **have the user playtest** and report what's broken / what feels wrong
3. Fix any runtime bugs they find
4. Next milestone candidates (user's call):
   - **M8** — escape cutscene + victory parade + save state + menu/level select (finishes World 1 as a complete shippable experience)
   - **Wishlist mini-sprint** — implement Executive Clucks + Red Fox minions (comedy payload, doesn't move the roadmap forward but it's what the user is excited about)
   - **M9** — Market world (scale-up risk: another full world with new cheat + 2 new traps)

Keep in mind:
- User provides no assets — procedural pixel sprites + emoji/particles for chaos
- Full 5-world scope, time not a constraint
- Distribution: `dist/index.html` via concat script, publish to GitHub Pages / itch.io
- Personality > polish — the taunts carry the game, protect them when trading off
