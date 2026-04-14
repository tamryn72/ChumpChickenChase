// Main scene renderer. Draws level tiles, goo, entities, feathers, bubbles.
//
// Render order each frame:
//   1. clear
//   2. level tiles
//   3. goo (under entities)
//   4. entities sorted by row (painter's algorithm for top-down depth)
//   5. feathers (over entities)
//   6. speech bubbles (always on top)

import { TILE, CANVAS_W, CANVAS_H } from '../config.js';
import * as cache from './sprite-cache.js';
import { TILE_TYPES as T } from '../world/level.js';
import { playerPixelPos, FACE } from '../entities/player.js';
import { chumpPixelPos } from '../entities/chicken.js';
import { drawGoo, drawFeathers } from '../systems/particles.js';
import { drawBubbles } from '../systems/bubbles.js';

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

function drawPlayer(ctx, p, alpha) {
  const { x, y } = playerPixelPos(p, alpha);
  const key = PLAYER_KEYS[p.facing][p.animFrame];
  // 16x16 sprite centered in 32px tile
  cache.draw(ctx, key, x + 8, y + 8);
}

function drawChump(ctx, c, alpha) {
  const { x, y } = chumpPixelPos(c, alpha);
  const key = CHUMP_KEYS[c.facing][c.animFrame];
  // 24x24 sprite centered in 32px tile
  cache.draw(ctx, key, x + 4, y + 4);
}

export function render(ctx, game, alpha) {
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

  drawLevel(ctx, game.level);
  drawGoo(ctx, game.particles);

  // entities in row order (painter's algorithm)
  const entities = [];
  if (game.player) entities.push({ kind: 'player', e: game.player });
  if (game.chump)  entities.push({ kind: 'chump',  e: game.chump });
  entities.sort((a, b) => a.e.row - b.e.row);
  for (const ent of entities) {
    if (ent.kind === 'player') drawPlayer(ctx, ent.e, alpha);
    else if (ent.kind === 'chump') drawChump(ctx, ent.e, alpha);
  }

  drawFeathers(ctx, game.particles);

  // speech bubbles on top — bubble tail anchors to entity's tile top-left
  drawBubbles(ctx, game.bubbles, (entity) => {
    if (entity === game.player) return playerPixelPos(entity, alpha);
    if (entity === game.chump)  return chumpPixelPos(entity, alpha);
    return null;
  });
}
