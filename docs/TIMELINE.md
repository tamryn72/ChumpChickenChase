# Timeline

> Chronological log of what has shipped. Newest first. Format: `YYYY-MM-DD — [Milestone] — summary`.

## 2026-04-14 — M0 — Docs revised to drop rigid framing

- Revised `CLAUDE.md`, `docs/MEMORY.md`, `docs/PLAN.md`, `docs/SESSION_HANDOFF.md` to remove "locked / don't debate" language
- Reframed as working direction open to discussion, not contracts
- Expanded `PLAN.md` "Design calls" section with real multi-option analysis: art approach (full emoji vs procedural vs hybrid), scope tiers, sound timing, distribution shape, real-time vs ticks, catch mechanic, cutscene style, mobile timing
- Added explicit note: user provides no assets — everything from code
- No game code yet

## 2026-04-14 — M0 — Foundational docs

- Created `CLAUDE.md` at repo root — always-load session orientation
- Created `docs/MEMORY.md` — current working direction, game rules, design intents
- Created `docs/TIMELINE.md` — this file
- Created `docs/ARCHITECTURE.md` — systems map, file layout, core loop, AI priority tree, trap matrix
- Created `docs/PLAN.md` — 13 milestones + design discussion
- Created `docs/SESSION_HANDOFF.md` — handoff protocol
- **Current direction**: ES modules during dev, 10Hz logic tick, 20×15 grid at 32px, seeded mulberry32 RNG — all open to change
- Branch: `claude/game-docs-setup-mkNDN`
