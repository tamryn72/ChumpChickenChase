// Pickup entities: cat, burger, taco.
// Spawned by the game loop on timers. Consumed on contact with player or chicken.

import { TILE } from '../config.js';

export const PICKUP_TYPES = {
  CAT:    'cat',
  BURGER: 'burger',
  TACO:   'taco',
};

export function createPickup(type, col, row) {
  return {
    type,
    col, row,
    state: 'idle',     // 'idle' | 'tossed' | 'dizzy' | 'gone'
    lifeTicks: 300,    // ~30s before self-despawn
    // cat toss animation state
    tossT: 0,
    tossFromCol: col,
    tossFromRow: row,
    tossToCol: col,
    tossToRow: row,
  };
}

export function tickPickup(p) {
  if (p.state === 'idle') {
    p.lifeTicks -= 1;
    if (p.lifeTicks <= 0) p.state = 'gone';
  } else if (p.state === 'tossed') {
    p.tossT += 1;
    if (p.tossT >= 15) {
      p.state = 'dizzy';
      p.col = p.tossToCol;
      p.row = p.tossToRow;
      p.lifeTicks = 40;
    }
  } else if (p.state === 'dizzy') {
    p.lifeTicks -= 1;
    if (p.lifeTicks <= 0) p.state = 'gone';
  }
}

export function pickupAt(pickups, col, row) {
  for (const p of pickups) {
    if (p.state !== 'idle') continue;
    if (p.col === col && p.row === row) return p;
  }
  return null;
}

export function findNearestPickup(pickups, type, col, row) {
  let best = null;
  let bestDist = Infinity;
  for (const p of pickups) {
    if (p.type !== type) continue;
    if (p.state !== 'idle') continue;
    const d = Math.abs(p.col - col) + Math.abs(p.row - row);
    if (d < bestDist) {
      bestDist = d;
      best = p;
    }
  }
  return best;
}

export function pickupPixelPos(p, alpha) {
  if (p.state === 'tossed') {
    const t = Math.min(1, (p.tossT + alpha) / 15);
    const x = (p.tossFromCol + (p.tossToCol - p.tossFromCol) * t) * TILE;
    const y = (p.tossFromRow + (p.tossToRow - p.tossFromRow) * t) * TILE;
    const arc = -Math.sin(t * Math.PI) * 28;
    return { x, y: y + arc };
  }
  return { x: p.col * TILE, y: p.row * TILE };
}
