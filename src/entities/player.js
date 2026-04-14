// Player entity. Grid movement with pixel interpolation between tiles.

import { TILE } from '../config.js';
import { input } from '../input.js';

const BASE_MOVE_TICKS = 2;

export const FACE = { UP: 0, RIGHT: 1, DOWN: 2, LEFT: 3 };

export function createPlayer(col, row) {
  return {
    col, row,
    fromCol: col,
    fromRow: row,
    moveT: BASE_MOVE_TICKS,
    facing: FACE.DOWN,
    animFrame: 0,
    stunTicks: 0,
    tacoBuff: 0,   // ticks remaining of speed+buff from taco
    burgerBait: 0, // reserved inventory — player picks up burgers as bait trap (M10 bridge)
  };
}

function movePace(p) {
  return p.tacoBuff > 0 ? 1 : BASE_MOVE_TICKS;
}

export function tickPlayer(p, level) {
  if (p.tacoBuff > 0) p.tacoBuff -= 1;

  if (p.stunTicks > 0) {
    p.stunTicks -= 1;
    return;
  }

  const pace = movePace(p);
  if (p.moveT < pace) p.moveT += 1;
  if (p.moveT < pace) return;

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
  const pace = movePace(p);
  const t = Math.min(1, (p.moveT + alpha) / pace);
  return {
    x: (p.fromCol + (p.col - p.fromCol) * t) * TILE,
    y: (p.fromRow + (p.row - p.fromRow) * t) * TILE,
  };
}
