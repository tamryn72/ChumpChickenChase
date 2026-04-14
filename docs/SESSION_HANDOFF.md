# Session Handoff

> The point of this file: the last thing a session does is jot down where things stand, so the next session starts in context. Informal is fine.

---

## Last session — 2026-04-14

**Summary**: Foundational docs scaffolded, then revised to drop rigid "locked / don't debate" framing. No game code yet — we're actively discussing big design calls (art approach, scope tier, sound, distribution) before touching M0.

**Files touched**:
- `CLAUDE.md` (new, then revised)
- `docs/MEMORY.md` (new, then revised)
- `docs/TIMELINE.md` (new)
- `docs/ARCHITECTURE.md` (new)
- `docs/PLAN.md` (new, then revised with real design options)
- `docs/SESSION_HANDOFF.md` (new, this file)

**Current direction** (see `MEMORY.md`, all open to revision):
- ES modules during dev; distribution shape TBD
- Leaning 10Hz logic + RAF render, 20×15 grid at 32px, seeded mulberry32 RNG
- Self-contained build — user provides no assets, everything from code
- Branch: `claude/game-docs-setup-mkNDN`

**Active discussion** (see `PLAN.md` → "Design calls worth talking through"):
1. Art approach — full emoji / procedural pixel art / hybrid
2. Scope tier — vibe demo / Farm MVP / full 5-world
3. Sound — from M1 / from M6 / M13
4. Distribution — single HTML / served folder / dev-as-modules-ship-as-single
5. Logic model — 10Hz ticks / real-time / hybrid
6. Grid size / resolution
7. Catch mechanic
8. Cutscene style
9. Mobile timing

---

## Picking this up next session

1. Skim `CLAUDE.md` → `MEMORY.md` → this file
2. Check with user on the active discussion items (or pick up wherever they left off)
3. Once the big calls are settled, start M0 scaffolding:
   - `.gitignore`
   - `src/config.js`
   - `src/rng.js`
   - `src/main.js` (empty loop)
   - `index.html`
4. Smoke-test in a browser
5. Update `TIMELINE.md` with what shipped, update this file with a fresh "Last session" block

Things to keep in mind:
- User provides no assets — everything must come from code, system fonts, or procedural generation
- README is a design compass, not a contract — adjust rules if they turn out not to be fun
- Personality and vibe carry the game; protect them when making trade-offs
