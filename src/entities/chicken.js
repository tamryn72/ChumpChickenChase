// Chump the chicken. Wander AI + trap interaction for M2/M4.

import { TILE } from '../config.js';
import { FACE } from './player.js';
import { TRAP_STUN, TRAP_TYPES } from './trap.js';

const MOVE_TICKS = 4; // Chump is slower than the player by default

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

export const STUN_BUBBLES = [
  'I AM TRAPPED',
  'this is unfair',
  'MY LAWYERS',
  'UNRIG THIS TRAP',
];

export const ESCAPE_BUBBLES = [
  'I am the best at escape',
  'no one escapes like I do',
  'HAHAHA LOSER',
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
    stunTicks: 0,
    escapeInvul: 0,
  };
}

export function tickChump(c, level, rng, hooks, traps) {
  // stunned: don't move
  if (c.stunTicks > 0) {
    c.stunTicks -= 1;
    if (c.stunTicks === 0) {
      c.escapeInvul = 8;
      hooks.onEscape?.(c);
    }
    return;
  }
  if (c.escapeInvul > 0) c.escapeInvul -= 1;

  // advance interpolation
  if (c.moveT < MOVE_TICKS) c.moveT += 1;
  if (c.moveT < MOVE_TICKS) return;

  // arrived at the destination tile
  c.fromCol = c.col;
  c.fromRow = c.row;

  if (c.wanderCooldown > 0) {
    c.wanderCooldown -= 1;
    return;
  }

  if (rng.chance(0.12)) {
    c.wanderCooldown = rng.int(2, 5);
    return;
  }

  // shuffled direction list with bias toward current facing
  const dirs = [0, 1, 2, 3];
  for (let i = dirs.length - 1; i > 0; i--) {
    const j = rng.int(0, i);
    [dirs[i], dirs[j]] = [dirs[j], dirs[i]];
  }
  if (rng.chance(0.6)) {
    const idx = dirs.indexOf(c.facing);
    if (idx > 0) [dirs[0], dirs[idx]] = [dirs[idx], dirs[0]];
  }

  for (const d of dirs) {
    const tc = c.col + DX[d];
    const tr = c.row + DY[d];
    if (!level.isWalkable(tc, tr)) continue;

    c.facing = d;
    c.col = tc;
    c.row = tr;
    c.moveT = 0;
    c.animFrame = 1 - c.animFrame;

    hooks.addGoo(c.fromCol, c.fromRow);
    if (rng.chance(0.5)) {
      hooks.addFeather(
        c.fromCol * TILE + TILE / 2 + rng.int(-4, 4),
        c.fromRow * TILE + TILE / 2,
        rng,
      );
    }

    // check for trap on the arrival tile
    if (c.escapeInvul === 0 && traps) {
      const trap = traps.find(
        (t) => !t.triggered && t.col === c.col && t.row === c.row,
      );
      if (trap) {
        trap.triggered = true;
        c.stunTicks = TRAP_STUN[trap.type];
        hooks.onTrapped?.(c, trap);

        // banana slide: one free tile in the direction of travel
        if (trap.type === TRAP_TYPES.BANANA) {
          const sc = c.col + DX[d];
          const sr = c.row + DY[d];
          if (level.isWalkable(sc, sr)) {
            c.fromCol = c.col;
            c.fromRow = c.row;
            c.col = sc;
            c.row = sr;
            c.moveT = 0;
          }
        }
      }
    }
    return;
  }

  // nowhere to go
  c.wanderCooldown = 2;
}

export function chumpPixelPos(c, alpha) {
  const t = Math.min(1, (c.moveT + alpha) / MOVE_TICKS);
  return {
    x: (c.fromCol + (c.col - c.fromCol) * t) * TILE,
    y: (c.fromRow + (c.row - c.fromRow) * t) * TILE,
  };
}
