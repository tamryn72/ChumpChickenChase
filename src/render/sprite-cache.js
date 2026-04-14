// Offscreen sprite cache. Bake once at boot, blit at render.
// All sprites are procedurally drawn — no external image assets.

const cache = new Map();

export function bake(key, w, h, drawFn) {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  const ctx = c.getContext('2d');
  ctx.imageSmoothingEnabled = false;
  drawFn(ctx);
  cache.set(key, c);
  return c;
}

export function get(key) {
  return cache.get(key);
}

export function draw(ctx, key, x, y) {
  const c = cache.get(key);
  if (c) ctx.drawImage(c, x | 0, y | 0);
}

export function has(key) {
  return cache.has(key);
}
