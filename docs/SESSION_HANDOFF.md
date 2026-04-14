# Session Handoff

> Protocol: the **last thing** a session does is update this file. The **first thing** the next session does is read it.

---

## Last session — 2026-04-14

**Summary**: Foundational docs only. No game code written yet. Awaiting user sign-off on discussion points in `PLAN.md` before starting M0 scaffolding.

**Files touched**:
- `CLAUDE.md` (new)
- `docs/MEMORY.md` (new)
- `docs/TIMELINE.md` (new)
- `docs/ARCHITECTURE.md` (new)
- `docs/PLAN.md` (new)
- `docs/SESSION_HANDOFF.md` (new, this file)

**Locked decisions** (see `MEMORY.md`):
- Native ES modules, no build step
- Logic tick fixed at 10Hz, render at RAF with interpolation
- Grid 20×15 tiles × 32px = 640×480 logical canvas
- Seeded mulberry32 RNG, all gameplay randomness routes through it
- No external deps, no external assets
- `claude/game-docs-setup-mkNDN` is the working branch

**Open with user** (resolve before coding):
- Proposed deltas to README: ES modules, 10Hz tick, seeded RNG, grid 20×15, mobile → M13, scrolling camera for W4/W5
- 8 open questions in `PLAN.md` → "Open questions"

---

## Next session should

1. Read `CLAUDE.md` → `docs/MEMORY.md` → this file (in that order)
2. Check with user on any unresolved items from `PLAN.md` → "Discussion" and "Open questions"
3. Begin **M0 scaffolding** — create the files in this order:
   1. `.gitignore`
   2. `src/config.js` (locked constants only)
   3. `src/rng.js` (mulberry32)
   4. `src/main.js` (empty game loop, BOOT → MENU black screen)
   5. `index.html` (canvas + module entry)
4. Commit each file / logical unit separately — don't batch M0 into one commit
5. Manual browser smoke test: serve static, open, see black canvas, no console errors
6. Update `docs/TIMELINE.md` with what shipped
7. Update this file with the new "Last session" block

## Next session should NOT

- Start M1 until M0 is reviewed and all open questions are resolved
- Rename or rewrite `README.md` (source of truth for vision)
- Introduce any dependencies (npm, CDN, asset files)
- Use `Math.random()` anywhere in gameplay code — always `rng.next()`
- Break the "no build step" rule to add tooling
