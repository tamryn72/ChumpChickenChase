// World 5 — The Volcano.
// Black-ash slopes threaded with rivers of lava, bubbling cauldrons, magma
// forge, crystal clusters, a lookout tower peering at the smoking peak, and
// a few stone villager huts huddled on the cooler obsidian platforms.
//
// Chump runs the table here: he has ALL cheats. Swim now treats LAVA as
// passable, teleports freely, and spawns clone decoys. Rocks fall from the
// peak and his eggs come out as flaming eggs — both hazards the previous
// worlds did not have.
//
// Catches needed: 3. Final catch ends the game (no escape cutscene — chump
// is finally delivered).

import { Level, TILE_TYPES as T } from './level.js';
import { GRID_W, GRID_H } from '../config.js';
import { createBuilding } from '../entities/building.js';

export const name = 'The Volcano';
export const worldNum = 5;
export const playerStart = { col: 10, row: 13 };
export const chumpStart  = { col: 16, row: 5  };
export const catchesNeeded = 3;
export const planTimer  = 280;
export const chaseTimer = 900;
export const cutsceneScript = 'VOLCANO_VICTORY';
export const cheats = ['dodge', 'teleport', 'swim', 'clone'];

// W5 gimmicks flipped ON — main.js inspects these flags.
export const fallingRocks = true;  // rocks fall from the sky every ~60 ticks
export const flamingEggs  = true;  // all thrown eggs come out as flaming eggs

export function inventory() {
  // W5: all traps unlocked. 7 total per README.
  return {
    net: 1,
    banana: 1,
    cage: 1,
    glue: 1,
    corn_decoy: 1,
    pretty_hen: 1,
    cat_decoy: 1,
  };
}

// Legend:
//   # magma_rock (solid wall)         P volcano_peak (solid, cosmetic peak)
//   . ash (walkable)                  o obsidian (walkable path)
//   L lava (solid for player)
//   H stone_hut (1hp)                 S shrine (2hp)
//   K cauldron (1hp)                  X crystal (1hp)
//   T lookout (2hp)                   F forge (3hp)
//
// Layout: smoking peak up top, lava rivers carving across the middle, a
// magma forge on the west, lookout on the east, huts + shrine clustered on
// the southern obsidian platform. Player spawns near the huts.
const MAP = [
  '####PPPPPP##########',
  '###PPPPPPPP##.......',
  '##.PPPPPPPP.........',
  '##...LL...LL........',
  '##....LL.LL..XX.....',
  '#..SS..LLL...XX.....',
  '#..SS..LL....oo.....',
  '#.FF...LL....TT.....',
  '#.FF..LLL....TT.....',
  '#..oo.LL......K.....',
  '..ooooLL.oooooooo...',
  '..oooLLLLoooooooo...',
  '...HH......HH.......',
  '...HH......HH.......',
  '....................',
];

const CHAR_TO_TILE = {
  '.': T.ASH,
  'o': T.OBSIDIAN,
  '#': T.MAGMA_ROCK,
  'P': T.VOLCANO_PEAK,
  'L': T.LAVA,
  'H': T.STONE_HUT,
  'S': T.SHRINE,
  'K': T.CAULDRON,
  'X': T.CRYSTAL,
  'T': T.LOOKOUT,
  'F': T.FORGE,
};

export function createLevel() {
  const tiles = new Array(GRID_W * GRID_H);
  for (let row = 0; row < GRID_H; row++) {
    for (let col = 0; col < GRID_W; col++) {
      const ch = MAP[row]?.[col] ?? '.';
      tiles[row * GRID_W + col] = CHAR_TO_TILE[ch] ?? T.ASH;
    }
  }
  return new Level(GRID_W, GRID_H, tiles);
}

export function createBuildings() {
  return [
    // West side — shrine + magma forge
    createBuilding('Shrine',     2, [[3, 5], [4, 5], [3, 6], [4, 6]]),
    createBuilding('Magma Forge', 3, [[2, 7], [3, 7], [2, 8], [3, 8]]),
    // East side — crystal cluster + lookout + cauldron
    createBuilding('Crystal Cluster A', 1, [[13, 4], [14, 4], [13, 5], [14, 5]]),
    createBuilding('Lookout Tower',     2, [[13, 7], [14, 7], [13, 8], [14, 8]]),
    createBuilding('Cauldron', 1, [[14, 9]]),
    // Southern obsidian platform — 2 villager huts
    createBuilding('Stone Hut A', 1, [[3, 12], [4, 12], [3, 13], [4, 13]]),
    createBuilding('Stone Hut B', 1, [[11, 12], [12, 12], [11, 13], [12, 13]]),
  ];
}

export function createTownies() {
  return [
    { col: 6,  row: 13, variant: 0 },
    { col: 14, row: 13, variant: 1 },
    { col: 8,  row: 11, variant: 2 },
    { col: 16, row: 11, variant: 0 },
  ];
}
