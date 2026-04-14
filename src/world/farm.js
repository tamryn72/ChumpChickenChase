// World 1 — The Farm. Hand-authored 20x15 tilemap + building definitions.

import { Level, TILE_TYPES as T } from './level.js';
import { GRID_W, GRID_H } from '../config.js';
import { createBuilding } from '../entities/building.js';

// Legend:
//   . grass    , dirt    F fence_h    W pond      H hay
//   B barn_w   R barn_r  C coop       S scarecrow T tractor
const MAP = [
  '....RRRR............',
  '....BBBB............',
  '....BBBB......C.....',
  '....BBBB............',
  '.S..................',
  '....................',
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
};

export function createFarm() {
  const tiles = new Array(GRID_W * GRID_H);
  for (let row = 0; row < GRID_H; row++) {
    for (let col = 0; col < GRID_W; col++) {
      const ch = MAP[row]?.[col] ?? '.';
      tiles[row * GRID_W + col] = CHAR_TO_TILE[ch] ?? T.GRASS;
    }
  }
  return new Level(GRID_W, GRID_H, tiles);
}

export function createFarmBuildings() {
  return [
    // The barn — biggest, most HP. Walls in rows 1-3 cols 4-7, roof in row 0.
    createBuilding(
      'Barn',
      12,
      [
        [4, 1], [5, 1], [6, 1], [7, 1],
        [4, 2], [5, 2], [6, 2], [7, 2],
        [4, 3], [5, 3], [6, 3], [7, 3],
      ],
      [[4, 0], [5, 0], [6, 0], [7, 0]], // roof
    ),
    createBuilding('Coop',      4, [[14, 2]]),
    createBuilding('Scarecrow', 2, [[1, 4]]),
    createBuilding('Tractor',   5, [[6, 7]]),
    createBuilding('Fence',     3, [[4, 10], [5, 10], [6, 10], [7, 10]]),
    createBuilding('Hay 1',     2, [[16, 7]]),
    createBuilding('Hay 2',     2, [[18, 7]]),
    createBuilding('Hay 3',     2, [[1, 12]]),
  ];
}
