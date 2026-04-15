// Red Fox minion. Spawned by the Red Foxes Directive (Executive Cluck).
// Simple AI: roam toward the player, stagger-stun on contact, bounce back a
// tile so they don't camp. No health — traps don't affect them; they clear
// when the level ends along with the directive.

import { TILE } from '../config.js';
import { FACE } from './player.js';

const MOVE_TICKS = 3;

const DX = [0, 1, 0, -1];
const DY = [-1, 0, 1, 0];

export function createFox(col, row) {
  return {
    col, row,
    fromCol: col,
    fromRow: row,
    moveT: MOVE_TICKS,
    facing: FACE.DOWN,
    animFrame: 0,
    // brief recoil after contact — prevents the fox from immediately
    // re-stunning the player on consecutive ticks
    recoil: 0,
  };
}

function manhattan(a, b) {
  return Math.abs(a.col - b.col) + Math.abs(a.row - b.row);
}

// Returns true if the fox is in a tile adjacent to (or on) the player this
// tick and should apply a stagger-stun. Main.js handles the actual stun.
export function tickFox(fox, level, rng, player) {
  if (fox.recoil > 0) fox.recoil -= 1;
  if (fox.moveT < MOVE_TICKS) fox.moveT += 1;
  if (fox.moveT < MOVE_TICKS) return false;

  fox.fromCol = fox.col;
  fox.fromRow = fox.row;

  // pick the direction that minimizes distance to player
  let best = -1;
  let bestD = 999;
  for (let d = 0; d < 4; d++) {
    const tc = fox.col + DX[d];
    const tr = fox.row + DY[d];
    if (!level.isWalkable(tc, tr)) continue;
    const dist = Math.abs(tc - player.col) + Math.abs(tr - player.row);
    // small random jitter so foxes don't all overlap
    const score = dist + rng.next() * 0.4;
    if (score < bestD) {
      bestD = score;
      best = d;
    }
  }
  if (best === -1) return false;

  fox.facing = best;
  fox.col += DX[best];
  fox.row += DY[best];
  fox.moveT = 0;
  fox.animFrame = 1 - fox.animFrame;

  // contact check: if now adjacent (or on) the player and not in recoil
  if (fox.recoil === 0 && manhattan(fox, player) <= 1) {
    fox.recoil = 10;
    // bounce back one tile in the opposite direction (if walkable)
    const bx = fox.col - DX[best];
    const by = fox.row - DY[best];
    if (level.isWalkable(bx, by)) {
      fox.col = bx;
      fox.row = by;
    }
    return true;
  }
  return false;
}

export function foxPixelPos(fox, alpha) {
  const t = Math.min(1, (fox.moveT + alpha) / MOVE_TICKS);
  return {
    x: (fox.fromCol + (fox.col - fox.fromCol) * t) * TILE,
    y: (fox.fromRow + (fox.row - fox.fromRow) * t) * TILE,
  };
}
