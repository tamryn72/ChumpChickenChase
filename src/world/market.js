// World 2 — The Market.
// Cobblestone town square with stands, shops, a fountain, and a clock tower.
// Chump escalates to Teleport cheat here (added in M9-d).

import { Level, TILE_TYPES as T } from './level.js';
import { GRID_W, GRID_H } from '../config.js';
import { createBuilding } from '../entities/building.js';

export const name = 'The Market';
export const worldNum = 2;
export const playerStart = { col: 10, row: 13 };
export const chumpStart  = { col: 5,  row: 2  };
export const catchesNeeded = 2;
export const planTimer  = 220;
export const chaseTimer = 700;
export const cutsceneScript = 'MARKET_ESCAPE';

export function inventory() {
  // W2 unlocks Glue Pad and Corn Decoy. Inventory caps at 5 per README.
  return { net: 1, banana: 1, cage: 1, glue: 1, corn_decoy: 1 };
}

// Legend:
//   . grass    # cobblestone
//   B bakery
//   R restaurant
//   C clock tower top (cosmetic)    c clock tower base (load-bearing)
//   o fountain
//   s fruit stand    a apple cart    f fish cart
//   l flower shop
const MAP = [
  '............CC......',
  '..BB........CC......',
  '..BB........cc......',
  '............cc......',
  '............RR......',
  '............RR......',
  '####################',
  '####################',
  '####################',
  '####s####a####f####.',
  '########oo##########',
  '########oo##########',
  '##############l#####',
  '....................',
  '....................',
];

const CHAR_TO_TILE = {
  '.': T.GRASS,
  '#': T.COBBLE,
  'B': T.BAKERY,
  'R': T.RESTAURANT,
  'C': T.CLOCK_TOP,
  'c': T.CLOCK_BASE,
  'o': T.FOUNTAIN,
  's': T.FRUIT_STAND,
  'a': T.APPLE_CART,
  'f': T.FISH_CART,
  'l': T.FLOWER_SHOP,
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
    // Bakery: 4 tiles 2x2 at (2,1)-(3,2)
    createBuilding('Bakery', 3, [
      [2, 1], [3, 1], [2, 2], [3, 2],
    ]),
    // Restaurant: 4 tiles 2x2 at (12,4)-(13,5)
    createBuilding('Restaurant', 3, [
      [12, 4], [13, 4], [12, 5], [13, 5],
    ]),
    // Clock Tower: load-bearing base rows 2-3 cols 12-13, cosmetic top rows 0-1 cols 12-13
    createBuilding(
      'Clock Tower',
      5,
      [[12, 2], [13, 2], [12, 3], [13, 3]],
      [[12, 0], [13, 0], [12, 1], [13, 1]],
    ),
    // Fountain: 2x2 at (8,10)-(9,11)
    createBuilding('Fountain', 4, [
      [8, 10], [9, 10], [8, 11], [9, 11],
    ]),
    createBuilding('Fruit Stand', 1, [[4, 9]]),
    createBuilding('Apple Cart',  1, [[9, 9]]),
    createBuilding('Fish Cart',   1, [[14, 9]]),
    createBuilding('Flower Shop', 2, [[14, 12]]),
  ];
}

export function createTownies() {
  return [
    { col: 2,  row: 7,  variant: 0 },
    { col: 10, row: 7,  variant: 1 },
    { col: 17, row: 8,  variant: 2 },
    { col: 6,  row: 13, variant: 1 },
  ];
}
