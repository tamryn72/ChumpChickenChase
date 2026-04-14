// Main scene renderer.

import { TILE, CANVAS_W, CANVAS_H } from '../config.js';
import * as cache from './sprite-cache.js';
import { TILE_TYPES as T } from '../world/level.js';
import { playerPixelPos, FACE } from '../entities/player.js';
import { chumpPixelPos } from '../entities/chicken.js';
import { buildingBoundingBox } from '../entities/building.js';
import { projectilePixelPos } from '../entities/projectile.js';
import { pickupPixelPos } from '../entities/pickup.js';
import { towniePixelPos } from '../entities/npc.js';
import { drawGoo, drawFeathers } from '../systems/particles.js';
import { drawBubbles } from '../systems/bubbles.js';
import { drawHUD, drawPlaceCursor } from './ui.js';
import { P } from './palette.js';

const TILE_KEY = {
  [T.GRASS]:        'tile_grass',
  [T.DIRT]:         'tile_dirt',
  [T.FENCE_H]:      'tile_fence_h',
  [T.POND]:         'tile_pond',
  [T.HAY]:          'tile_hay',
  [T.BARN_W]:       'tile_barn_w',
  [T.BARN_R]:       'tile_barn_r',
  [T.COOP]:         'tile_coop',
  [T.SCARECROW]:    'tile_scarecrow',
  [T.TRACTOR]:      'tile_tractor',
  [T.RUBBLE]:       'tile_rubble',
  [T.TACO_TRUCK_L]: 'tile_taco_l',
  [T.TACO_TRUCK_R]: 'tile_taco_r',
};

const PLAYER_KEYS = {
  [FACE.UP]:    ['player_up_0',    'player_up_1'],
  [FACE.RIGHT]: ['player_right_0', 'player_right_1'],
  [FACE.DOWN]:  ['player_down_0',  'player_down_1'],
  [FACE.LEFT]:  ['player_left_0',  'player_left_1'],
};

const CHUMP_KEYS = {
  [FACE.UP]:    ['chump_up_0',    'chump_up_1'],
  [FACE.RIGHT]: ['chump_right_0', 'chump_right_1'],
  [FACE.DOWN]:  ['chump_down_0',  'chump_down_1'],
  [FACE.LEFT]:  ['chump_left_0',  'chump_left_1'],
};

const PICKUP_KEY = {
  cat:    'pickup_cat',
  burger: 'pickup_burger',
  taco:   'pickup_taco',
};

function drawLevel(ctx, level) {
  for (let r = 0; r < level.h; r++) {
    for (let c = 0; c < level.w; c++) {
      const key = TILE_KEY[level.at(c, r)] || 'tile_grass';
      cache.draw(ctx, key, c * TILE, r * TILE);
    }
  }
}

function drawTraps(ctx, traps) {
  for (const t of traps) {
    const key = 'trap_' + t.type + (t.triggered ? '_triggered' : '');
    cache.draw(ctx, key, t.col * TILE + 8, t.row * TILE + 8);
  }
}

function drawPickups(ctx, pickups, alpha) {
  for (const p of pickups) {
    if (p.state === 'gone') continue;
    const pos = pickupPixelPos(p, alpha);
    const key = PICKUP_KEY[p.type];
    if (!key) continue;
    let ox = 0, oy = 0;
    if (p.state === 'dizzy') {
      // little wobble
      const phase = Math.floor((p.lifeTicks / 2)) % 2;
      ox = phase === 0 ? 1 : -1;
    }
    cache.draw(ctx, key, pos.x + 8 + ox, pos.y + 8 + oy);
    // dizzy stars
    if (p.state === 'dizzy') {
      ctx.fillStyle = P.yellow;
      ctx.fillRect(pos.x + 12, pos.y + 4, 1, 1);
      ctx.fillRect(pos.x + 16, pos.y + 6, 1, 1);
      ctx.fillRect(pos.x + 20, pos.y + 4, 1, 1);
    }
  }
}

function drawTownies(ctx, townies, alpha) {
  for (const n of townies) {
    const { x, y } = towniePixelPos(n, alpha);
    const state = n.state === 'panic' ? 'panic' : 'idle';
    const key = `townie_${n.variant % 3}_${state}`;
    cache.draw(ctx, key, x + 8, y + 8);
  }
}

function drawPlayer(ctx, p, alpha) {
  const { x, y } = playerPixelPos(p, alpha);
  // taco buff glow
  if (p.tacoBuff > 0) {
    ctx.globalAlpha = 0.35 + Math.sin(p.tacoBuff * 0.3) * 0.15;
    ctx.fillStyle = P.green;
    ctx.beginPath();
    ctx.arc(x + 16, y + 16, 12, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
  }
  const key = PLAYER_KEYS[p.facing][p.animFrame];
  if (p.stunTicks > 0 && p.stunTicks % 2 === 0) {
    ctx.globalAlpha = 0.4;
  }
  cache.draw(ctx, key, x + 8, y + 8);
  ctx.globalAlpha = 1;
}

function drawChump(ctx, c, alpha) {
  const { x, y } = chumpPixelPos(c, alpha);
  // rage / burger glow
  const burger = c.burgerBuff > 0;
  if (c.rage > 50 || c.finalForm > 0 || burger) {
    const intensity = c.finalForm > 0 ? 1 : (burger ? 0.8 : (c.rage - 50) / 50);
    ctx.globalAlpha = intensity * 0.45;
    ctx.fillStyle = burger && c.finalForm === 0 ? P.orange : P.red;
    ctx.beginPath();
    ctx.arc(x + 16, y + 16, 14 + intensity * 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
  }

  const key = CHUMP_KEYS[c.facing][c.animFrame];
  let sx = 0, sy = 0;
  if (c.stunTicks > 0) {
    sx = (c.stunTicks % 2 === 0) ? 1 : -1;
  }
  if (c.attackAnim > 0) {
    const lunge = (c.attackAnim % 2 === 0) ? 2 : -1;
    if (c.facing === FACE.RIGHT) sx += lunge;
    else if (c.facing === FACE.LEFT) sx -= lunge;
    else if (c.facing === FACE.DOWN) sy += lunge;
    else if (c.facing === FACE.UP) sy -= lunge;
  }
  cache.draw(ctx, key, x + 4 + sx, y + 4 + sy);
}

function drawChumpRageBar(ctx, c, alpha) {
  if (c.rage <= 0 && c.finalForm <= 0) return;
  const { x, y } = chumpPixelPos(c, alpha);
  const bx = x + 4;
  const by = y - 4;
  const bw = 24;
  const bh = 2;
  ctx.fillStyle = P.black;
  ctx.fillRect(bx, by, bw, bh);
  const frac = c.finalForm > 0 ? 1 : c.rage / 100;
  ctx.fillStyle = c.finalForm > 0 ? P.white : P.red;
  ctx.fillRect(bx, by, Math.floor(bw * frac), bh);
}

function drawProjectiles(ctx, projectiles, alpha) {
  for (const p of projectiles) {
    const pos = projectilePixelPos(p, alpha);
    const groundFrac = Math.min(1, (p.t + alpha) / p.totalTicks);
    const groundX = ((p.fromCol + (p.targetCol - p.fromCol) * groundFrac)) * TILE + TILE / 2;
    const groundY = ((p.fromRow + (p.targetRow - p.fromRow) * groundFrac)) * TILE + TILE / 2 + 4;
    ctx.fillStyle = 'rgba(0,0,0,0.35)';
    ctx.beginPath();
    ctx.ellipse(groundX, groundY, 4, 1.5, 0, 0, Math.PI * 2);
    ctx.fill();
    cache.draw(ctx, 'egg', (pos.x | 0) - 4, (pos.y | 0) - 4);
  }
}

function drawBuildingHPBars(ctx, buildings) {
  for (const b of buildings) {
    if (b.hp <= 0) continue;
    if (b.hp === b.maxHp) continue;
    const box = buildingBoundingBox(b);
    const bx = box.minC * TILE + 2;
    const by = box.minR * TILE - 5;
    const bw = (box.maxC - box.minC + 1) * TILE - 4;
    const bh = 3;
    ctx.fillStyle = P.black;
    ctx.fillRect(bx, by, bw, bh);
    const frac = b.hp / b.maxHp;
    ctx.fillStyle = frac > 0.5 ? P.green : frac > 0.25 ? P.yellow : P.red;
    ctx.fillRect(bx + 1, by + 1, Math.max(0, Math.floor((bw - 2) * frac)), bh - 2);
  }
}

export function render(ctx, game, alpha) {
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

  const shakeAmt = game.shake || 0;
  const sx = shakeAmt > 0 ? (Math.random() - 0.5) * shakeAmt : 0;
  const sy = shakeAmt > 0 ? (Math.random() - 0.5) * shakeAmt : 0;

  ctx.save();
  ctx.translate(sx, sy);

  drawLevel(ctx, game.level);
  drawGoo(ctx, game.particles);
  drawTraps(ctx, game.traps);
  if (game.pickups) drawPickups(ctx, game.pickups, alpha);

  // entities in row order
  const entities = [];
  if (game.townies) {
    for (const n of game.townies) entities.push({ kind: 'townie', e: n });
  }
  if (game.player) entities.push({ kind: 'player', e: game.player });
  if (game.chump)  entities.push({ kind: 'chump',  e: game.chump });
  entities.sort((a, b) => a.e.row - b.e.row);
  for (const ent of entities) {
    if (ent.kind === 'player') drawPlayer(ctx, ent.e, alpha);
    else if (ent.kind === 'chump') drawChump(ctx, ent.e, alpha);
    else if (ent.kind === 'townie') drawTownies(ctx, [ent.e], alpha);
  }

  if (game.projectiles) drawProjectiles(ctx, game.projectiles, alpha);

  drawFeathers(ctx, game.particles);

  if (game.buildings) drawBuildingHPBars(ctx, game.buildings);
  if (game.chump) drawChumpRageBar(ctx, game.chump, alpha);

  drawBubbles(ctx, game.bubbles, (entity) => {
    if (entity === game.player) return playerPixelPos(entity, alpha);
    if (entity === game.chump)  return chumpPixelPos(entity, alpha);
    return null;
  });

  drawPlaceCursor(ctx, game, game.hoverCol, game.hoverRow);

  ctx.restore();

  drawHUD(ctx, game);
}
