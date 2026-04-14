// Main scene renderer. Draws level tiles + entities each frame.

import { TILE, CANVAS_W, CANVAS_H } from '../config.js';
import * as cache from './sprite-cache.js';
import { TILE_TYPES as T } from '../world/level.js';
import { playerPixelPos, FACE } from '../entities/player.js';

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
  // 16x16 sprite centered in 32x32 tile
  cache.draw(ctx, key, x + 8, y + 8);
}

export function render(ctx, game, alpha) {
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
  drawLevel(ctx, game.level);
  drawPlayer(ctx, game.player, alpha);
}
