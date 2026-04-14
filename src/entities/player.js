// Player entity. Grid movement with pixel interpolation between tiles.

import { TILE } from '../config.js';
import { input } from '../input.js';

const MOVE_TICKS = 2; // logic ticks to cross one tile

export const FACE = { UP: 0, RIGHT: 1, DOWN: 2, LEFT: 3 };

export function createPlayer(col, row) {
  return {
    col, row,
    fromCol: col,
    fromRow: row,
    moveT: MOVE_TICKS, // starts "arrived"
    facing: FACE.DOWN,
    animFrame: 0,
  };
}

export function tickPlayer(p, level) {
  // advance interpolation
  if (p.moveT < MOVE_TICKS) {
    p.moveT += 1;
  }
  if (p.moveT < MOVE_TICKS) return;

  // arrived — accept new input
  p.fromCol = p.col;
  p.fromRow = p.row;

  const { dx, dy } = input.getDir();
  if (dx === 0 && dy === 0) return;

  if (dx === 1)       p.facing = FACE.RIGHT;
  else if (dx === -1) p.facing = FACE.LEFT;
  else if (dy === 1)  p.facing = FACE.DOWN;
  else if (dy === -1) p.facing = FACE.UP;

  const tc = p.col + dx;
  const tr = p.row + dy;
  if (level.isWalkable(tc, tr)) {
    p.col = tc;
    p.row = tr;
    p.moveT = 0;
    p.animFrame = 1 - p.animFrame;
  }
}

export function playerPixelPos(p, alpha) {
  const t = Math.min(1, (p.moveT + alpha) / MOVE_TICKS);
  return {
    x: (p.fromCol + (p.col - p.fromCol) * t) * TILE,
    y: (p.fromRow + (p.row - p.fromRow) * t) * TILE,
  };
}
