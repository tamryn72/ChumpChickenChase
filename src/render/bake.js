// Bake all sprites into the offscreen cache at boot.

import * as cache from './sprite-cache.js';
import { TILE } from '../config.js';
import * as tiles from './tiles.js';
import * as sprites from './sprites.js';

export function bakeAll() {
  // --- tiles (32x32) ---
  cache.bake('tile_grass',     TILE, TILE, tiles.drawGrass);
  cache.bake('tile_dirt',      TILE, TILE, tiles.drawDirt);
  cache.bake('tile_fence_h',   TILE, TILE, tiles.drawFenceH);
  cache.bake('tile_pond',      TILE, TILE, tiles.drawPond);
  cache.bake('tile_hay',       TILE, TILE, tiles.drawHay);
  cache.bake('tile_barn_w',    TILE, TILE, tiles.drawBarnWall);
  cache.bake('tile_barn_r',    TILE, TILE, tiles.drawBarnRoof);
  cache.bake('tile_coop',      TILE, TILE, tiles.drawCoop);
  cache.bake('tile_scarecrow', TILE, TILE, tiles.drawScarecrow);
  cache.bake('tile_tractor',   TILE, TILE, tiles.drawTractor);

  // --- player (16x16) ---
  cache.bake('player_up_0',    16, 16, sprites.drawPlayerUp0);
  cache.bake('player_up_1',    16, 16, sprites.drawPlayerUp1);
  cache.bake('player_right_0', 16, 16, sprites.drawPlayerRight0);
  cache.bake('player_right_1', 16, 16, sprites.drawPlayerRight1);
  cache.bake('player_down_0',  16, 16, sprites.drawPlayerDown0);
  cache.bake('player_down_1',  16, 16, sprites.drawPlayerDown1);
  cache.bake('player_left_0',  16, 16, sprites.drawPlayerLeft0);
  cache.bake('player_left_1',  16, 16, sprites.drawPlayerLeft1);
}
