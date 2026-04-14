# Session Handoff

> The point of this file: the last thing a session does is jot down where things stand, so the next session starts in context. Informal is fine.

---

## Last session — 2026-04-14 (big session)

Docs scaffolded AND M0 through M5 shipped in one pass. Game is now playable: you can plan traps on the Farm, hit ENTER to start the chase, watch Chump wander/destroy your buildings, trip him with a trap, run up and catch him, and get a win/lose screen.

### What's actually running

Open `index.html` via any static server and you get:
- Pixel-art Farm tilemap (barn, coop, scarecrow, tractor, fence, hay, pond)
- Walking farmer (WASD/arrows), 4-direction with leg-bob animation
- Chump: 24×24 full-body animated orange chicken with floppy hair-piece wobble, bratty eyes, yellow beak. Walks around leaving orange goo and feathers.
- PLAN phase: click tiles to place Net (3) / Banana (2) / Cage (1). `1/2/3` select. `ENTER` starts chase. Hover cursor.
- CHASE phase: Chump actively destroys nearest alive building, greedy-paths toward it, pecks it with an attack lurch animation. HP bars appear above damaged buildings. Buildings turn to rubble when destroyed.
- Traps work: stepping on one stuns Chump (Net 30t, Cage 40t, Banana 20t + slide one tile in direction of travel).
- Catch: walk adjacent to a stunned Chump → GOTCHA → Chump respawns far away → catches++. 2 catches = VICTORY.
- Taunt system: Chump talks smack when you're close (7 TAUNTS), groans when trapped (4 STUN_BUBBLES), brags on escape (3 ESCAPE_BUBBLES), brags while destroying (4 DESTROY_BUBBLES).
- HUD with catches counter, phase timer, trap palette, state banners.
- GAMEOVER on chase timer expiry OR all buildings destroyed.
- Retry: click anywhere in VICTORY/GAMEOVER.
- Debug: `?debug=1` shows tick, state, positions, stun, building count, current destroy target.

### What's NOT yet in

- Rage meter, egg throwing, player stun (M6)
- Cat / burger pickups (M7)
- Taco truck mechanic (new, spec'd in `MEMORY.md` — needs M7-ish wiring)
- Chaos NPCs / townspeople (new)
- Escape cutscene, save state, menu, level select (M8)
- Worlds 2-5 (M9-M12)
- Sound (any)
- Mobile touch
- **The "ice hole kill" mechanic** — needs clarification, see below

### Needs clarification from user

**Ice hole kill mechanic**: user said "he can catch things and drop them in an ice hole to kill them." Two interpretations — need to confirm which:
1. **Chump** catches things (NPCs? cats?) and drops them in an ice hole as a new threat (like the cat-toss but lethal). Would probably live in a new cold-themed area.
2. **Player** catches Chump and drags him to an ice hole as an alternative kill method (supplements or replaces the "touch stunned chicken" catch, maybe only on one world).

Until confirmed, I didn't build this. It's noted as open in MEMORY.md "Still worth revisiting."

### Files touched (all live on `claude/game-docs-setup-mkNDN`)

Code:
- `index.html`
- `src/config.js`, `src/rng.js`, `src/main.js`, `src/input.js`
- `src/render/{palette, sprite-cache, tiles, sprites, bake, renderer, ui}.js`
- `src/world/{level, farm}.js`
- `src/entities/{player, chicken, trap, building}.js`
- `src/systems/{particles, bubbles}.js`

Docs:
- `CLAUDE.md`, `docs/MEMORY.md`, `docs/TIMELINE.md`, `docs/ARCHITECTURE.md`, `docs/PLAN.md`, `docs/SESSION_HANDOFF.md`

Seven commits pushed. No game code has been executed in a browser from my side — code-review-verified only. There may be runtime bugs I didn't catch.

---

## Picking this up next session

1. Skim `CLAUDE.md` → `docs/MEMORY.md` → this file
2. First priority: have the user playtest what's shipped, report bugs
3. Get clarification on the ice hole mechanic and the tacos/NPC roadmap priority
4. Next milestone candidate: **M6 — rage meter + egg throwing + player stun**
5. After that: **M7 — cats / burgers / taco truck + chaos NPCs**

Things to keep in mind:
- User provides no assets — procedural pixel sprites + emoji for chaos
- Hybrid art direction (Chump/Player procedural, particles/effects can use emoji)
- Full 5-world scope, no shortcuts — time not a constraint
- Distribution: `dist/index.html` via concat script (not built yet), publish to GitHub Pages / itch.io
