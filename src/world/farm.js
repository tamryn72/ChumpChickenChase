// World 1 — The Farm. Hand-authored 20x15 tilemap.

import { Level, TILE_TYPES as T } from './level.js';
import { GRID_W, GRID_H } from '../config.js';

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
