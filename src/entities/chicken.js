// Chump the chicken. Wander AI for M2.
// Deliberately dumb — this is the foundation we layer smarter behavior onto later.

import { TILE } from '../config.js';
import { FACE } from './player.js';

const MOVE_TICKS = 4; // Chump is a bit slower than the player by default

const DX = [0, 1, 0, -1]; // matches FACE.UP, RIGHT, DOWN, LEFT
const DY = [-1, 0, 1, 0];

export const TAUNTS = [
  'QUIET, PIGGY',
  'no eggs for you, loser',
  'I am the Golden Goose',
  'no one runs faster than me',
  'imagine losing to a chicken',
  'THIS FARM MINE NOW',
  'I am the best, the absolute best',
];

export function createChump(col, row) {
  return {
    col, row,
    fromCol: col,
    fromRow: row,
    moveT: MOVE_TICKS,
    facing: FACE.DOWN,
    animFrame: 0,
    wanderCooldown: 0,
  };
}

export function tickChump(c, level, rng, hooks) {
  // advance interpolation
  if (c.moveT < MOVE_TICKS) {
    c.moveT += 1;
  }
  if (c.moveT < MOVE_TICKS) return;

  // arrived
  c.fromCol = c.col;
  c.fromRow = c.row;

  if (c.wanderCooldown > 0) {
    c.wanderCooldown -= 1;
    return;
  }

  // occasional idle pause
  if (rng.chance(0.12)) {
    c.wanderCooldown = rng.int(2, 5);
    return;
  }

  // build a shuffled direction list, biased toward continuing same direction
  const dirs = [0, 1, 2, 3];
  for (let i = dirs.length - 1; i > 0; i--) {
    const j = rng.int(0, i);
    [dirs[i], dirs[j]] = [dirs[j], dirs[i]];
  }
  // 60% chance to prefer current facing
  if (rng.chance(0.6)) {
    const idx = dirs.indexOf(c.facing);
    if (idx > 0) [dirs[0], dirs[idx]] = [dirs[idx], dirs[0]];
  }

  for (const d of dirs) {
    const tc = c.col + DX[d];
    const tr = c.row + DY[d];
    if (level.isWalkable(tc, tr)) {
      c.facing = d;
      c.col = tc;
      c.row = tr;
      c.moveT = 0;
      c.animFrame = 1 - c.animFrame;
      // leave goo on the tile we just left
      hooks.addGoo(c.fromCol, c.fromRow);
      // occasional feather drop
      if (rng.chance(0.5)) {
        hooks.addFeather(
          c.fromCol * TILE + TILE / 2 + rng.int(-4, 4),
          c.fromRow * TILE + TILE / 2,
          rng,
        );
      }
      return;
    }
  }

  // nowhere to go, brief idle
  c.wanderCooldown = 2;
}

export function chumpPixelPos(c, alpha) {
  const t = Math.min(1, (c.moveT + alpha) / MOVE_TICKS);
  return {
    x: (c.fromCol + (c.col - c.fromCol) * t) * TILE,
    y: (c.fromRow + (c.row - c.fromRow) * t) * TILE,
  };
}
