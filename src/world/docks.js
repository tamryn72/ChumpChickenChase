// World 3 — The Docks.
// Harbor with water, fishing boats, pier, lighthouse, warehouse, cargo, crane.
// Chump unlocks the Swim cheat here and can wade through water tiles
// that block the player.

import { Level, TILE_TYPES as T } from './level.js';
import { GRID_W, GRID_H } from '../config.js';
import { createBuilding } from '../entities/building.js';

export const name = 'The Docks';
export const worldNum = 3;
export const playerStart = { col: 10, row: 12 };
export const chumpStart  = { col: 6,  row: 8  };
export const catchesNeeded = 3;
export const planTimer  = 240;
export const chaseTimer = 750;
export const cutsceneScript = 'DOCKS_ESCAPE';
export const cheats = ['dodge', 'teleport', 'swim'];

export function inventory() {
  // W3 unlocks Pretty Hen + Burger Bait. 5 total per README.
  return {
    net: 1,
    glue: 1,
    corn_decoy: 1,
    pretty_hen: 1,
    burger_bait: 1,
  };
}

// Legend:
//   W water      p pier       d dock (walkable stone)
//   b boat       H warehouse  M fish market
//   l lighthouse_top (cosmetic)   L lighthouse_base (load-bearing)
//   c cargo      N net stack  C crane
//   . grass (southern edge)
const MAP = [
  'WWWWWWWWWWWWWWWWWWWW',
  'WWWWWWWWWWWWWWWWWWWW',
  'WWbbWWWWbbWWWWbbWWWW',
  'WWbbWWWWbbWWWWbbWWWW',
  'WWWWWWWWWWWWWWWWWWWW',
  'WWWWWWWWppWWWWWWWWWW',
  'dddddddddddddddddddd',
  'ddHHdddddddMMdddllDD',
  'ddHHdddddddMMddLLDDD',
  'dddddddddddddddLLdDD',
  'ddccddddNNdddddddddd',
  'ddccddddNNdddddddddd',
  'ddddddddddCCdddddddd',
  'ddddddddddCCdddddddd',
  '....................',
];

const CHAR_TO_TILE = {
  '.': T.GRASS,
  'W': T.WATER,
  'p': T.PIER,
  'd': T.DOCK,
  'D': T.DOCK,       // alias, used where L and l cosmetically overlap
  'b': T.BOAT,
  'H': T.WAREHOUSE,
  'M': T.FISH_MARKET,
  'l': T.LIGHTHOUSE_T,
  'L': T.LIGHTHOUSE_B,
  'c': T.CARGO,
  'N': T.NET_STACK,
  'C': T.CRANE,
};

export function createLevel() {
  const tiles = new Array(GRID_W * GRID_H);
  for (let row = 0; row < GRID_H; row++) {
    for (let col = 0; col < GRID_W; col++) {
      const ch = MAP[row]?.[col] ?? 'd';
      tiles[row * GRID_W + col] = CHAR_TO_TILE[ch] ?? T.DOCK;
    }
  }
  return new Level(GRID_W, GRID_H, tiles);
}

export function createBuildings() {
  return [
    // Boats: 3 fishing boats, 2x2 tiles each, 2hp each
    createBuilding('Boat A', 2, [[2, 2], [3, 2], [2, 3], [3, 3]]),
    createBuilding('Boat B', 2, [[8, 2], [9, 2], [8, 3], [9, 3]]),
    createBuilding('Boat C', 2, [[14, 2], [15, 2], [14, 3], [15, 3]]),
    // Warehouse 2x2 at (2,7)-(3,8), 3hp
    createBuilding('Warehouse', 3, [[2, 7], [3, 7], [2, 8], [3, 8]]),
    // Fish Market 2x2 at (11,7)-(12,8), 1hp (fragile per README)
    createBuilding('Fish Market', 1, [[11, 7], [12, 7], [11, 8], [12, 8]]),
    // Lighthouse: 2x2 load-bearing base (16-17 cols, 8-9 rows) + cosmetic top
    createBuilding(
      'Lighthouse',
      3,
      [[16, 8], [17, 8], [15, 9], [16, 9]],
      [[16, 7], [17, 7]],
    ),
    // Cargo 2x2 at (2,10)-(3,11), 1hp
    createBuilding('Cargo', 1, [[2, 10], [3, 10], [2, 11], [3, 11]]),
    // Net Stack 2x2 at (8,10)-(9,11), 1hp
    createBuilding('Net Stack', 1, [[8, 10], [9, 10], [8, 11], [9, 11]]),
    // Crane 2x2 at (10,12)-(11,13), 2hp
    createBuilding('Crane', 2, [[10, 12], [11, 12], [10, 13], [11, 13]]),
  ];
}

export function createTownies() {
  return [
    { col: 5,  row: 13, variant: 0 },
    { col: 13, row: 11, variant: 1 },
    { col: 7,  row: 9,  variant: 2 },
  ];
}
