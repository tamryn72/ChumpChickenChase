// Townsperson NPC. Wanders grass, panics and runs away when Chump is nearby.
// Cosmetic only — doesn't block movement or affect gameplay.

import { TILE } from '../config.js';

const MOVE_TICKS = 4;
const PANIC_RADIUS = 4;

const DX = [0, 1, 0, -1];
const DY = [-1, 0, 1, 0];

export function createTownie(col, row, variant = 0) {
  return {
    col, row,
    fromCol: col,
    fromRow: row,
    moveT: MOVE_TICKS,
    facing: 2,
    animFrame: 0,
    variant,
    state: 'wander', // 'wander' | 'panic'
  };
}

function manhattan(a, b) {
  return Math.abs(a.col - b.col) + Math.abs(a.row - b.row);
}

export function tickTownie(n, level, rng, chump) {
  // state detection
  if (chump && manhattan(n, chump) <= PANIC_RADIUS) {
    n.state = 'panic';
  } else {
    n.state = 'wander';
  }

  // Cook NPCs are rooted to the taco truck window — they never move, just
  // switch between idle and panic. Still animate for a little flail.
  if (n.variant === 'cook') {
    if (n.moveT < MOVE_TICKS) n.moveT += 1;
    if (n.state === 'panic' && rng.chance(0.35)) {
      n.animFrame = 1 - n.animFrame;
    }
    return;
  }

  // advance interpolation
  const pace = n.state === 'panic' ? 2 : MOVE_TICKS;
  if (n.moveT < pace) n.moveT += 1;
  if (n.moveT < pace) return;

  n.fromCol = n.col;
  n.fromRow = n.row;

  if (n.state === 'panic' && chump) {
    // run AWAY from chump
    const scored = [0, 1, 2, 3].map((d) => {
      const nc = n.col + DX[d];
      const nr = n.row + DY[d];
      return {
        d,
        walkable: level.isWalkable(nc, nr),
        dist: Math.abs(nc - chump.col) + Math.abs(nr - chump.row),
      };
    });
    scored.sort((a, b) => {
      if (a.walkable !== b.walkable) return a.walkable ? -1 : 1;
      return b.dist - a.dist;
    });
    for (const s of scored) {
      const tc = n.col + DX[s.d];
      const tr = n.row + DY[s.d];
      if (level.isWalkable(tc, tr)) {
        n.facing = s.d;
        n.col = tc;
        n.row = tr;
        n.moveT = 0;
        n.animFrame = 1 - n.animFrame;
        return;
      }
    }
    return;
  }

  // wander: mostly stay put, occasionally step
  if (rng.chance(0.6)) return;
  const dirs = [0, 1, 2, 3];
  for (let i = dirs.length - 1; i > 0; i--) {
    const j = rng.int(0, i);
    [dirs[i], dirs[j]] = [dirs[j], dirs[i]];
  }
  for (const d of dirs) {
    const tc = n.col + DX[d];
    const tr = n.row + DY[d];
    if (level.isWalkable(tc, tr)) {
      n.facing = d;
      n.col = tc;
      n.row = tr;
      n.moveT = 0;
      n.animFrame = 1 - n.animFrame;
      return;
    }
  }
}

export function towniePixelPos(n, alpha) {
  const pace = n.state === 'panic' ? 2 : MOVE_TICKS;
  const t = Math.min(1, (n.moveT + alpha) / pace);
  return {
    x: (n.fromCol + (n.col - n.fromCol) * t) * TILE,
    y: (n.fromRow + (n.row - n.fromRow) * t) * TILE,
  };
}
