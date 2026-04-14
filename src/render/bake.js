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
  cache.bake('tile_rubble',    TILE, TILE, tiles.drawRubble);
  cache.bake('tile_taco_l',    TILE, TILE, tiles.drawTacoTruckL);
  cache.bake('tile_taco_r',    TILE, TILE, tiles.drawTacoTruckR);

  // W2 Market
  cache.bake('tile_cobble',      TILE, TILE, tiles.drawCobble);
  cache.bake('tile_fruit_stand', TILE, TILE, tiles.drawFruitStand);
  cache.bake('tile_apple_cart',  TILE, TILE, tiles.drawAppleCart);
  cache.bake('tile_fish_cart',   TILE, TILE, tiles.drawFishCart);
  cache.bake('tile_bakery',      TILE, TILE, tiles.drawBakery);
  cache.bake('tile_restaurant',  TILE, TILE, tiles.drawRestaurant);
  cache.bake('tile_flower_shop', TILE, TILE, tiles.drawFlowerShop);
  cache.bake('tile_fountain',    TILE, TILE, tiles.drawFountain);
  cache.bake('tile_clock_top',   TILE, TILE, tiles.drawClockTop);
  cache.bake('tile_clock_base',  TILE, TILE, tiles.drawClockBase);

  // --- player (16x16) ---
  cache.bake('player_up_0',    16, 16, sprites.drawPlayerUp0);
  cache.bake('player_up_1',    16, 16, sprites.drawPlayerUp1);
  cache.bake('player_right_0', 16, 16, sprites.drawPlayerRight0);
  cache.bake('player_right_1', 16, 16, sprites.drawPlayerRight1);
  cache.bake('player_down_0',  16, 16, sprites.drawPlayerDown0);
  cache.bake('player_down_1',  16, 16, sprites.drawPlayerDown1);
  cache.bake('player_left_0',  16, 16, sprites.drawPlayerLeft0);
  cache.bake('player_left_1',  16, 16, sprites.drawPlayerLeft1);

  // --- chump (24x24) ---
  cache.bake('chump_up_0',     24, 24, sprites.drawChumpUp0);
  cache.bake('chump_up_1',     24, 24, sprites.drawChumpUp1);
  cache.bake('chump_right_0',  24, 24, sprites.drawChumpRight0);
  cache.bake('chump_right_1',  24, 24, sprites.drawChumpRight1);
  cache.bake('chump_down_0',   24, 24, sprites.drawChumpDown0);
  cache.bake('chump_down_1',   24, 24, sprites.drawChumpDown1);
  cache.bake('chump_left_0',   24, 24, sprites.drawChumpLeft0);
  cache.bake('chump_left_1',   24, 24, sprites.drawChumpLeft1);

  // --- traps (16x16) ---
  cache.bake('trap_net',              16, 16, sprites.drawTrapNet);
  cache.bake('trap_net_triggered',    16, 16, sprites.drawTrapNetTriggered);
  cache.bake('trap_banana',           16, 16, sprites.drawTrapBanana);
  cache.bake('trap_banana_triggered', 16, 16, sprites.drawTrapBananaTriggered);
  cache.bake('trap_cage',             16, 16, sprites.drawTrapCage);
  cache.bake('trap_cage_triggered',   16, 16, sprites.drawTrapCageTriggered);
  cache.bake('trap_glue',                  16, 16, sprites.drawTrapGlue);
  cache.bake('trap_glue_triggered',        16, 16, sprites.drawTrapGlueTriggered);
  cache.bake('trap_corn_decoy',            16, 16, sprites.drawTrapCornDecoy);
  cache.bake('trap_corn_decoy_triggered',  16, 16, sprites.drawTrapCornDecoyTriggered);

  // --- projectiles (8x8) ---
  cache.bake('egg', 8, 8, sprites.drawEgg);

  // --- pickups (16x16) ---
  cache.bake('pickup_cat',    16, 16, sprites.drawCat);
  cache.bake('pickup_burger', 16, 16, sprites.drawBurger);
  cache.bake('pickup_taco',   16, 16, sprites.drawTaco);

  // --- townspeople (16x16) ---
  cache.bake('townie_0_idle',  16, 16, sprites.drawTownie0Idle);
  cache.bake('townie_0_panic', 16, 16, sprites.drawTownie0Panic);
  cache.bake('townie_1_idle',  16, 16, sprites.drawTownie1Idle);
  cache.bake('townie_1_panic', 16, 16, sprites.drawTownie1Panic);
  cache.bake('townie_2_idle',  16, 16, sprites.drawTownie2Idle);
  cache.bake('townie_2_panic', 16, 16, sprites.drawTownie2Panic);
}
