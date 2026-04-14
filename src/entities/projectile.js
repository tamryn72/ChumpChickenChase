// Projectile entities.
//   egg      — standard chump egg, parabolic arc chicken → player
//   egg fiery— same but trailing flame particles, longer stun on hit (W5)
//   rock     — W5 hazard dropping from above onto a target tile

import { TILE } from '../config.js';

export function createEgg(fromCol, fromRow, targetCol, targetRow, fiery = false) {
  return {
    kind: fiery ? 'egg_fiery' : 'egg',
    fromCol,
    fromRow,
    targetCol,
    targetRow,
    t: 0,
    totalTicks: 12, // ~1.2s flight time
  };
}

// A rock hazard "falls" from above onto targetCol/targetRow over totalTicks.
// Source col/row is cosmetic (we use it only for the arc's start point).
export function createRock(targetCol, targetRow) {
  return {
    kind: 'rock',
    fromCol:    targetCol,
    fromRow:    targetRow,
    targetCol,
    targetRow,
    t: 0,
    totalTicks: 18, // ~1.8s warning + drop
  };
}

// Returns true when the projectile has reached its target and should be removed.
export function tickProjectile(p) {
  p.t += 1;
  return p.t >= p.totalTicks;
}

export function projectilePixelPos(p, alpha) {
  const t = Math.min(1, (p.t + alpha) / p.totalTicks);
  if (p.kind === 'rock') {
    // straight vertical drop from ~2 tiles above
    const tx = p.targetCol * TILE + TILE / 2;
    const ty = p.targetRow * TILE + TILE / 2;
    // ease-in fall so the first half of the warning is slow, then accelerates
    const fall = t * t;
    return { x: tx, y: ty - (1 - fall) * TILE * 2.2 };
  }
  const fx = p.fromCol * TILE + TILE / 2;
  const fy = p.fromRow * TILE + TILE / 2;
  const tx = p.targetCol * TILE + TILE / 2;
  const ty = p.targetRow * TILE + TILE / 2;
  const x = fx + (tx - fx) * t;
  const linY = fy + (ty - fy) * t;
  // parabolic arc — peaks at midflight
  const arcHeight = 28;
  const arc = -Math.sin(t * Math.PI) * arcHeight;
  return { x, y: linY + arc };
}
