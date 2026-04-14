// Projectile entities. For M6: eggs.
// Pixel-space with a parabolic arc trajectory from chicken to player.

import { TILE } from '../config.js';

export function createEgg(fromCol, fromRow, targetCol, targetRow) {
  return {
    kind: 'egg',
    fromCol,
    fromRow,
    targetCol,
    targetRow,
    t: 0,
    totalTicks: 12, // ~1.2s flight time
  };
}

// Returns true when the projectile has reached its target and should be removed.
export function tickProjectile(p) {
  p.t += 1;
  return p.t >= p.totalTicks;
}

export function projectilePixelPos(p, alpha) {
  const t = Math.min(1, (p.t + alpha) / p.totalTicks);
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
