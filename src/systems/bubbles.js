// Speech bubble system. Each bubble is attached to an entity and floats above it.
// Rate-limited per emotion category so taunts feel bratty but not spammy.

import { P } from '../render/palette.js';

export function createBubbles() {
  return {
    active: [],              // { entity, text, life }
    cooldowns: new Map(),    // category -> ticks remaining
  };
}

export function tickBubbles(bubbles) {
  const a = bubbles.active;
  for (let i = a.length - 1; i >= 0; i--) {
    a[i].life -= 1;
    if (a[i].life <= 0) a.splice(i, 1);
  }
  for (const key of bubbles.cooldowns.keys()) {
    const v = bubbles.cooldowns.get(key);
    if (v > 0) bubbles.cooldowns.set(key, v - 1);
  }
}

// Say something. Returns true if the bubble was actually shown.
export function say(bubbles, entity, text, category, cooldownTicks, lifeTicks = 28) {
  const cd = bubbles.cooldowns.get(category) || 0;
  if (cd > 0) return false;
  // replace any existing bubble on this entity
  bubbles.active = bubbles.active.filter((b) => b.entity !== entity);
  bubbles.active.push({ entity, text, life: lifeTicks });
  bubbles.cooldowns.set(category, cooldownTicks);
  return true;
}

// entityPixelPos is a callback: entity -> { x, y } (top-left of its tile in px)
export function drawBubbles(ctx, bubbles, entityPixelPos) {
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  for (const b of bubbles.active) {
    const pos = entityPixelPos(b.entity);
    if (!pos) continue;
    const text = b.text;
    ctx.font = '8px ui-monospace, Menlo, monospace';
    const tw = Math.ceil(ctx.measureText(text).width);
    const padX = 4, padY = 3;
    const w = tw + padX * 2;
    const h = 8 + padY * 2;
    const bx = Math.round(pos.x + 16 - w / 2);
    const by = Math.round(pos.y - h - 4);

    // bubble bg
    ctx.fillStyle = P.white;
    ctx.fillRect(bx + 1, by, w - 2, h);
    ctx.fillRect(bx, by + 1, w, h - 2);
    // outline
    ctx.fillStyle = P.black;
    ctx.fillRect(bx + 1, by, w - 2, 1);
    ctx.fillRect(bx + 1, by + h - 1, w - 2, 1);
    ctx.fillRect(bx, by + 1, 1, h - 2);
    ctx.fillRect(bx + w - 1, by + 1, 1, h - 2);
    // tail
    ctx.fillStyle = P.white;
    ctx.fillRect(bx + (w >> 1) - 1, by + h, 2, 2);
    ctx.fillStyle = P.black;
    ctx.fillRect(bx + (w >> 1) - 2, by + h, 1, 1);
    ctx.fillRect(bx + (w >> 1) + 1, by + h, 1, 1);
    ctx.fillRect(bx + (w >> 1) - 1, by + h + 2, 2, 1);

    // text
    ctx.fillStyle = P.black;
    ctx.fillText(text, bx + w / 2, by + h - padY - 1);
  }
}
