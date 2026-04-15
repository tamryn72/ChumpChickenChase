// World 1 — The Farm. Hand-authored 20x15 tilemap + building definitions.
// Exports the uniform world interface — see world/index.js for the contract.

import { Level, TILE_TYPES as T } from './level.js';
import { GRID_W, GRID_H } from '../config.js';
import { createBuilding } from '../entities/building.js';

export const name = 'The Farm';
export const worldNum = 1;
export const playerStart = { col: 10, row: 7 };
export const chumpStart  = { col: 14, row: 5 };
export const catchesNeeded = 2;
export const planTimer  = 200;
export const chaseTimer = 600;
export const cutsceneScript = 'FARM_ESCAPE';
export const cheats = ['dodge'];

export function inventory() {
  return { net: 3, banana: 2, cage: 1 };
}

// Legend:
//   . grass       , dirt        F fence_h    W pond      H hay
//   B barn_w      R barn_r      C coop       S scarecrow T tractor
//   k taco_truck_left           K taco_truck_right
const MAP = [
  '....RRRR............',
  '....BBBB............',
  '....BBBB......C.....',
  '....BBBB............',
  '.S..................',
  '............kK......',
  '.....,,,,,,.........',
  '.....,T,,,,.....H.H.',
  '.....,,,,,,.........',
  '....................',
  '....FFFF............',
  '..............WWW...',
  '.H............WWW...',
  '..............WWW...',
  '....................',
];

const CHAR_TO_TILE = {
  '.': T.GRASS,
  ',': T.DIRT,
  'F': T.FENCE_H,
  'W': T.POND,
  'H': T.HAY,
  'B': T.BARN_W,
  'R': T.BARN_R,
  'C': T.COOP,
  'S': T.SCARECROW,
  'T': T.TRACTOR,
  'k': T.TACO_TRUCK_L,
  'K': T.TACO_TRUCK_R,
};

export function createLevel() {
  const tiles = new Array(GRID_W * GRID_H);
  for (let row = 0; row < GRID_H; row++) {
    for (let col = 0; col < GRID_W; col++) {
      const ch = MAP[row]?.[col] ?? '.';
      tiles[row * GRID_W + col] = CHAR_TO_TILE[ch] ?? T.GRASS;
    }
  }
  return new Level(GRID_W, GRID_H, tiles);
}

export function createBuildings() {
  return [
    createBuilding(
      'Barn',
      12,
      [
        [4, 1], [5, 1], [6, 1], [7, 1],
        [4, 2], [5, 2], [6, 2], [7, 2],
        [4, 3], [5, 3], [6, 3], [7, 3],
      ],
      [[4, 0], [5, 0], [6, 0], [7, 0]],
    ),
    createBuilding('Coop',       4, [[14, 2]]),
    createBuilding('Scarecrow',  2, [[1, 4]]),
    createBuilding('Tractor',    5, [[6, 7]]),
    createBuilding('Fence',      3, [[4, 10], [5, 10], [6, 10], [7, 10]]),
    createBuilding('Hay 1',      2, [[16, 7]]),
    createBuilding('Hay 2',      2, [[18, 7]]),
    createBuilding('Hay 3',      2, [[1, 12]]),
    createBuilding('Taco Truck', 6, [[12, 5], [13, 5]]),
  ];
}

export function createTownies() {
  return [
    { col: 3,  row: 11, variant: 0 },
    { col: 17, row: 12, variant: 1 },
    { col: 10, row: 13, variant: 2 },
    // Cook — stands at the taco truck window (truck is at row 5, cook
    // stands on the tile just below the left half of the truck)
    { col: 12, row: 6,  variant: 'cook' },
  ];
}

// --- Legacy aliases (still imported by older code paths — safe to keep) ---
export { createLevel as createFarm };
export { createBuildings as createFarmBuildings };
export { createTownies as createFarmTownies };
