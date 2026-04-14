// Particle systems. Two kinds for M2:
//   - goo : tile-bound, accumulates on tiles Chump has walked across
//   - feathers : pixel-space, short-lived, fall with gravity

import { TILE } from '../config.js';
import { P } from '../render/palette.js';

export function createParticles(level) {
  return {
    w: level.w,
    h: level.h,
    goo: new Array(level.w * level.h).fill(0), // 0..3 intensity
    feathers: [],
  };
}

export function tickParticles(particles) {
  const f = particles.feathers;
  for (let i = f.length - 1; i >= 0; i--) {
    const p = f[i];
    p.x += p.vx;
    p.y += p.vy;
    p.vx *= 0.85;
    p.vy = p.vy * 0.9 + 0.15; // gravity
    p.life -= 1;
    if (p.life <= 0) f.splice(i, 1);
  }
  // soft cap
  if (f.length > 200) f.splice(0, f.length - 200);
}

export function addGoo(particles, col, row) {
  if (col < 0 || col >= particles.w || row < 0 || row >= particles.h) return;
  const i = row * particles.w + col;
  particles.goo[i] = Math.min(3, particles.goo[i] + 1);
}

export function addFeather(particles, x, y, rng) {
  particles.feathers.push({
    x, y,
    vx: (rng.next() - 0.5) * 2.2,
    vy: -rng.next() * 1.4 - 0.2,
    life: 18 + rng.int(0, 12),
  });
}

// Draw goo tiles — goes UNDER entities
export function drawGoo(ctx, particles) {
  ctx.fillStyle = P.chumpOrange;
  for (let r = 0; r < particles.h; r++) {
    for (let c = 0; c < particles.w; c++) {
      const v = particles.goo[r * particles.w + c];
      if (v === 0) continue;
      ctx.globalAlpha = Math.min(0.8, 0.28 + v * 0.18);
      const x = c * TILE;
      const y = r * TILE;
      ctx.fillRect(x + 4, y + 6, 8, 4);
      ctx.fillRect(x + 14, y + 10, 10, 5);
      ctx.fillRect(x + 6, y + 18, 12, 5);
      ctx.fillRect(x + 22, y + 22, 6, 4);
      ctx.fillRect(x + 2, y + 14, 4, 3);
    }
  }
  ctx.globalAlpha = 1;
}

// Draw feathers — goes OVER entities
export function drawFeathers(ctx, particles) {
  for (const f of particles.feathers) {
    const alpha = Math.min(1, f.life / 22);
    ctx.globalAlpha = alpha;
    ctx.fillStyle = P.white;
    ctx.fillRect((f.x | 0) - 1, (f.y | 0), 2, 1);
    ctx.fillRect((f.x | 0), (f.y | 0) - 1, 1, 2);
    // tiny orange hue tip
    ctx.fillStyle = P.chumpOrange;
    ctx.fillRect((f.x | 0), (f.y | 0), 1, 1);
  }
  ctx.globalAlpha = 1;
}
