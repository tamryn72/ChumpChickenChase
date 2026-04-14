// Particle systems:
//   - goo     : tile-bound, accumulates where Chump has walked
//   - feathers: pixel-space, short-lived, gravity — also doubles as the
//               pool for debris/spark particles via a kind flag

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
    p.vx *= p.drag ?? 0.85;
    p.vy = p.vy * (p.drag ?? 0.9) + (p.gravity ?? 0.15);
    p.life -= 1;
    if (p.life <= 0) f.splice(i, 1);
  }
  if (f.length > 300) f.splice(0, f.length - 300);
}

export function addGoo(particles, col, row) {
  if (col < 0 || col >= particles.w || row < 0 || row >= particles.h) return;
  const i = row * particles.w + col;
  particles.goo[i] = Math.min(3, particles.goo[i] + 1);
}

export function addFeather(particles, x, y, rng) {
  particles.feathers.push({
    kind: 'feather',
    x, y,
    vx: (rng.next() - 0.5) * 2.2,
    vy: -rng.next() * 1.4 - 0.2,
    life: 18 + rng.int(0, 12),
  });
}

export function addDebrisBurst(particles, col, row, rng, count = 14) {
  const cx = col * TILE + TILE / 2;
  const cy = row * TILE + TILE / 2;
  for (let i = 0; i < count; i++) {
    particles.feathers.push({
      kind: 'debris',
      x: cx + rng.int(-4, 4),
      y: cy + rng.int(-4, 4),
      vx: (rng.next() - 0.5) * 5,
      vy: -rng.next() * 2.5 - 1,
      life: 22 + rng.int(0, 16),
      drag: 0.9,
      gravity: 0.25,
    });
  }
  // add a few smoke puffs that float up
  for (let i = 0; i < 6; i++) {
    particles.feathers.push({
      kind: 'smoke',
      x: cx + rng.int(-6, 6),
      y: cy + rng.int(-6, 6),
      vx: (rng.next() - 0.5) * 0.8,
      vy: -rng.next() * 0.8 - 0.2,
      life: 30 + rng.int(0, 20),
      drag: 0.95,
      gravity: -0.03,
    });
  }
}

export function addAttackSpark(particles, col, row, rng) {
  const cx = col * TILE + TILE / 2;
  const cy = row * TILE + TILE / 2;
  for (let i = 0; i < 4; i++) {
    particles.feathers.push({
      kind: 'spark',
      x: cx + rng.int(-4, 4),
      y: cy + rng.int(-4, 4),
      vx: (rng.next() - 0.5) * 2.5,
      vy: -rng.next() * 1.5 - 0.3,
      life: 10 + rng.int(0, 6),
      drag: 0.88,
      gravity: 0.1,
    });
  }
}

// Draw goo tiles — UNDER entities
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

// Draw pixel-space particles (feathers, debris, smoke, sparks) — OVER entities
export function drawFeathers(ctx, particles) {
  for (const f of particles.feathers) {
    const px = f.x | 0;
    const py = f.y | 0;
    if (f.kind === 'debris') {
      ctx.globalAlpha = Math.min(1, f.life / 30);
      ctx.fillStyle = P.brown;
      ctx.fillRect(px - 1, py - 1, 2, 2);
      ctx.fillStyle = P.chumpDeep;
      ctx.fillRect(px, py, 1, 1);
    } else if (f.kind === 'smoke') {
      ctx.globalAlpha = Math.min(0.7, f.life / 50);
      ctx.fillStyle = P.lightGrey;
      ctx.fillRect(px - 1, py - 1, 3, 3);
    } else if (f.kind === 'spark') {
      ctx.globalAlpha = Math.min(1, f.life / 14);
      ctx.fillStyle = P.yellow;
      ctx.fillRect(px, py, 1, 1);
      ctx.fillStyle = P.white;
      ctx.fillRect(px - 1, py, 1, 1);
      ctx.fillRect(px + 1, py, 1, 1);
    } else {
      // feather
      ctx.globalAlpha = Math.min(1, f.life / 22);
      ctx.fillStyle = P.white;
      ctx.fillRect(px - 1, py, 2, 1);
      ctx.fillRect(px, py - 1, 1, 2);
      ctx.fillStyle = P.chumpOrange;
      ctx.fillRect(px, py, 1, 1);
    }
  }
  ctx.globalAlpha = 1;
}
