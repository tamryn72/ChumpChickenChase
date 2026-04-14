// World 4 — Castle Town.
// Castle interior on top (throne, crown, armory, kitchen), village below
// (houses, inn, catapult). Chump unlocks the Clone decoy cheat here.

import { Level, TILE_TYPES as T } from './level.js';
import { GRID_W, GRID_H } from '../config.js';
import { createBuilding } from '../entities/building.js';

export const name = 'Castle Town';
export const worldNum = 4;
export const playerStart = { col: 10, row: 12 };
export const chumpStart  = { col: 5,  row: 3  };
export const catchesNeeded = 3;
export const planTimer  = 260;
export const chaseTimer = 800;
export const cutsceneScript = 'CASTLE_ESCAPE';
export const cheats = ['dodge', 'teleport', 'clone'];

export function inventory() {
  // W4 unlocks Cat Decoy. 6 total per README.
  return {
    net: 1,
    cage: 1,
    glue: 1,
    corn_decoy: 1,
    pretty_hen: 1,
    cat_decoy: 1,
  };
}

// Legend:
//   # castle_wall     f castle_floor (walkable interior)
//   T throne (2x2)    X crown room (2x2)
//   K kitchen (2x2)   A armory (2x2)
//   H village house (2x2)   I inn (2x2)
//   C catapult (2x2)  . grass (courtyard / outside)
const MAP = [
  '####################',
  '#TTffffffffffXX....#',
  '#TTffffffffffXX....#',
  '#ffffffffffffff....#',
  '#KKffffffffffAA....#',
  '#KKffffffffffAA....#',
  '#ffffffffffffff....#',
  '#####ffff######fff##',
  '....................',
  '.HH...HH....II..HH..',
  '.HH...HH....II..HH..',
  '....................',
  '....................',
  '..............CC....',
  '..............CC....',
];

const CHAR_TO_TILE = {
  '.': T.GRASS,
  '#': T.CASTLE_WALL,
  'f': T.CASTLE_FLOOR,
  'T': T.THRONE,
  'X': T.CROWN_ROOM,
  'K': T.KITCHEN,
  'A': T.ARMORY,
  'H': T.VILLAGE_HOUSE,
  'I': T.INN,
  'C': T.CATAPULT,
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
    // Castle interior (load-bearing tiles are the visible 2x2 of each)
    createBuilding('Throne',     4, [[1, 1], [2, 1], [1, 2], [2, 2]]),
    createBuilding('Crown Room', 4, [[13, 1], [14, 1], [13, 2], [14, 2]]),
    createBuilding('Kitchen',    1, [[1, 4], [2, 4], [1, 5], [2, 5]]),
    createBuilding('Armory',     2, [[13, 4], [14, 4], [13, 5], [14, 5]]),
    // Village
    createBuilding('House 1', 1, [[1, 9], [2, 9], [1, 10], [2, 10]]),
    createBuilding('House 2', 1, [[6, 9], [7, 9], [6, 10], [7, 10]]),
    createBuilding('Inn',     2, [[12, 9], [13, 9], [12, 10], [13, 10]]),
    createBuilding('House 3', 1, [[16, 9], [17, 9], [16, 10], [17, 10]]),
    // Catapult — can be targeted AND destroyed, player-tool integration deferred
    createBuilding('Catapult', 2, [[14, 13], [15, 13], [14, 14], [15, 14]]),
  ];
}

export function createTownies() {
  return [
    { col: 4,  row: 9,  variant: 0 },
    { col: 10, row: 11, variant: 1 },
    { col: 17, row: 13, variant: 2 },
    { col: 9,  row: 13, variant: 1 },
  ];
}
