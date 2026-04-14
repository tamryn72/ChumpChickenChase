// Main scene renderer.
//
// Render order each frame:
//   1. clear
//   2. level tiles
//   3. goo
//   4. traps
//   5. entities sorted by row
//   6. pixel particles (feathers/debris/smoke/sparks)
//   7. speech bubbles
//   8. HUD + hover cursor + building HP bars

import { TILE, CANVAS_W, CANVAS_H } from '../config.js';
import * as cache from './sprite-cache.js';
import { TILE_TYPES as T } from '../world/level.js';
import { playerPixelPos, FACE } from '../entities/player.js';
import { chumpPixelPos } from '../entities/chicken.js';
import { buildingBoundingBox } from '../entities/building.js';
import { drawGoo, drawFeathers } from '../systems/particles.js';
import { drawBubbles } from '../systems/bubbles.js';
import { drawHUD, drawPlaceCursor } from './ui.js';
import { P } from './palette.js';

const TILE_KEY = {
  [T.GRASS]:     'tile_grass',
  [T.DIRT]:      'tile_dirt',
  [T.FENCE_H]:   'tile_fence_h',
  [T.POND]:      'tile_pond',
  [T.HAY]:       'tile_hay',
  [T.BARN_W]:    'tile_barn_w',
  [T.BARN_R]:    'tile_barn_r',
  [T.COOP]:      'tile_coop',
  [T.SCARECROW]: 'tile_scarecrow',
  [T.TRACTOR]:   'tile_tractor',
  [T.RUBBLE]:    'tile_rubble',
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

function drawPlayer(ctx, p, alpha) {
  const { x, y } = playerPixelPos(p, alpha);
  const key = PLAYER_KEYS[p.facing][p.animFrame];
  cache.draw(ctx, key, x + 8, y + 8);
}

function drawChump(ctx, c, alpha) {
  const { x, y } = chumpPixelPos(c, alpha);
  const key = CHUMP_KEYS[c.facing][c.animFrame];
  // stun shake
  let sx = 0, sy = 0;
  if (c.stunTicks > 0) {
    sx = (c.stunTicks % 2 === 0) ? 1 : -1;
  }
  // attack lurch
  if (c.attackAnim > 0) {
    const lunge = (c.attackAnim % 2 === 0) ? 2 : -1;
    if (c.facing === FACE.RIGHT) sx += lunge;
    else if (c.facing === FACE.LEFT) sx -= lunge;
    else if (c.facing === FACE.DOWN) sy += lunge;
    else if (c.facing === FACE.UP) sy -= lunge;
  }
  cache.draw(ctx, key, x + 4 + sx, y + 4 + sy);
}

function drawBuildingHPBars(ctx, buildings) {
  for (const b of buildings) {
    if (b.hp <= 0) continue;
    if (b.hp === b.maxHp) continue; // hide when pristine to reduce clutter
    const box = buildingBoundingBox(b);
    const bx = box.minC * TILE + 2;
    const by = box.minR * TILE - 5;
    const bw = (box.maxC - box.minC + 1) * TILE - 4;
    const bh = 3;
    // bg
    ctx.fillStyle = P.black;
    ctx.fillRect(bx, by, bw, bh);
    // fill
    const frac = b.hp / b.maxHp;
    ctx.fillStyle = frac > 0.5 ? P.green : frac > 0.25 ? P.yellow : P.red;
    ctx.fillRect(bx + 1, by + 1, Math.max(0, Math.floor((bw - 2) * frac)), bh - 2);
  }
}

export function render(ctx, game, alpha) {
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

  drawLevel(ctx, game.level);
  drawGoo(ctx, game.particles);
  drawTraps(ctx, game.traps);

  const entities = [];
  if (game.player) entities.push({ kind: 'player', e: game.player });
  if (game.chump)  entities.push({ kind: 'chump',  e: game.chump });
  entities.sort((a, b) => a.e.row - b.e.row);
  for (const ent of entities) {
    if (ent.kind === 'player') drawPlayer(ctx, ent.e, alpha);
    else if (ent.kind === 'chump') drawChump(ctx, ent.e, alpha);
  }

  drawFeathers(ctx, game.particles);

  if (game.buildings) drawBuildingHPBars(ctx, game.buildings);

  drawBubbles(ctx, game.bubbles, (entity) => {
    if (entity === game.player) return playerPixelPos(entity, alpha);
    if (entity === game.chump)  return chumpPixelPos(entity, alpha);
    return null;
  });

  drawPlaceCursor(ctx, game, game.hoverCol, game.hoverRow);
  drawHUD(ctx, game);
}
