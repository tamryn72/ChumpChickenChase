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

  // W3 Docks
  cache.bake('tile_water',           TILE, TILE, tiles.drawWater);
  cache.bake('tile_pier',            TILE, TILE, tiles.drawPier);
  cache.bake('tile_dock',            TILE, TILE, tiles.drawDock);
  cache.bake('tile_boat',            TILE, TILE, tiles.drawBoat);
  cache.bake('tile_warehouse',       TILE, TILE, tiles.drawWarehouse);
  cache.bake('tile_fish_market',     TILE, TILE, tiles.drawFishMarket);
  cache.bake('tile_lighthouse_t',    TILE, TILE, tiles.drawLighthouseTop);
  cache.bake('tile_lighthouse_b',    TILE, TILE, tiles.drawLighthouseBase);
  cache.bake('tile_cargo',           TILE, TILE, tiles.drawCargo);
  cache.bake('tile_net_stack',       TILE, TILE, tiles.drawNetStack);
  cache.bake('tile_crane',           TILE, TILE, tiles.drawCrane);

  // W4 Castle
  cache.bake('tile_castle_wall',   TILE, TILE, tiles.drawCastleWall);
  cache.bake('tile_castle_floor',  TILE, TILE, tiles.drawCastleFloor);
  cache.bake('tile_throne',        TILE, TILE, tiles.drawThrone);
  cache.bake('tile_crown_room',    TILE, TILE, tiles.drawCrownRoom);
  cache.bake('tile_kitchen',       TILE, TILE, tiles.drawKitchen);
  cache.bake('tile_armory',        TILE, TILE, tiles.drawArmory);
  cache.bake('tile_inn',           TILE, TILE, tiles.drawInn);
  cache.bake('tile_village_house', TILE, TILE, tiles.drawVillageHouse);
  cache.bake('tile_catapult',      TILE, TILE, tiles.drawCatapult);

  // W5 Volcano
  cache.bake('tile_ash',          TILE, TILE, tiles.drawAsh);
  cache.bake('tile_obsidian',     TILE, TILE, tiles.drawObsidian);
  cache.bake('tile_lava',         TILE, TILE, tiles.drawLava);
  cache.bake('tile_magma_rock',   TILE, TILE, tiles.drawMagmaRock);
  cache.bake('tile_volcano_peak', TILE, TILE, tiles.drawVolcanoPeak);
  cache.bake('tile_stone_hut',    TILE, TILE, tiles.drawStoneHut);
  cache.bake('tile_shrine',       TILE, TILE, tiles.drawShrine);
  cache.bake('tile_cauldron',     TILE, TILE, tiles.drawCauldron);
  cache.bake('tile_crystal',      TILE, TILE, tiles.drawCrystal);
  cache.bake('tile_lookout',      TILE, TILE, tiles.drawLookout);
  cache.bake('tile_forge',        TILE, TILE, tiles.drawForge);

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
  cache.bake('trap_pretty_hen',            16, 16, sprites.drawTrapPrettyHen);
  cache.bake('trap_pretty_hen_triggered',  16, 16, sprites.drawTrapPrettyHenTriggered);
  cache.bake('trap_burger_bait',           16, 16, sprites.drawTrapBurgerBait);
  cache.bake('trap_burger_bait_triggered', 16, 16, sprites.drawTrapBurgerBaitTriggered);
  cache.bake('trap_cat_decoy',             16, 16, sprites.drawTrapCatDecoy);
  cache.bake('trap_cat_decoy_triggered',   16, 16, sprites.drawTrapCatDecoyTriggered);

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

  // --- cook NPC (16x16) — stands at the taco truck window ---
  cache.bake('cook_idle',  16, 16, sprites.drawCookIdle);
  cache.bake('cook_panic', 16, 16, sprites.drawCookPanic);
}
