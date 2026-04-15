// Red Fox minion. Spawned by the Red Foxes Directive (Executive Cluck).
// Simple AI: roam toward the player, stagger-stun on direct collision, then
// bounce back a tile so they don't camp. No health — traps don't affect
// them; they clear when the level ends along with the directive.

import { TILE } from '../config.js';
import { FACE } from './player.js';

// Foxes move slightly slower than the player (player = 2 ticks/tile) so the
// directive is dangerous but not inescapable. With 3 foxes originally and a
// 1-tile stun radius they could spam-stun the player forever; both were
// tuned down (see main.js spawn count and the collision check below).
const MOVE_TICKS = 4;

const DX = [0, 1, 0, -1];
const DY = [-1, 0, 1, 0];

// Recoil keeps a fox from re-stunning the player in back-to-back moves.
// Long enough that the player has time to actually escape before the fox
// can land another hit.
const RECOIL_TICKS = 22;

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

// Returns true if the fox stepped onto the player's tile this tick and
// should apply a stagger-stun. Main.js handles the actual stun. We only
// trigger on a direct collision (same tile), not adjacency, so the player
// can slip past a fox that's one tile away — previously the 1-tile radius
// made the directive effectively inescapable with multiple foxes.
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

  // Collision check: fox stepped onto the player's tile and isn't in recoil.
  if (fox.recoil === 0 && fox.col === player.col && fox.row === player.row) {
    fox.recoil = RECOIL_TICKS;
    // bounce back one tile in the opposite direction (if walkable) so the
    // fox isn't sitting on top of the player when the stun ends
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
