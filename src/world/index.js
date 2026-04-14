// World registry. Each world module exports a uniform interface:
//
//   name, worldNum, playerStart, chumpStart, catchesNeeded,
//   planTimer, chaseTimer, inventory(), cutsceneScript,
//   createLevel(), createBuildings(), createTownies()
//
// main.js uses loadWorld(num) to build fresh game state for a world.

import * as farm   from './farm.js';
import * as market from './market.js';
import * as docks  from './docks.js';

export const WORLDS = {
  1: farm,
  2: market,
  3: docks,
};

export const TOTAL_WORLDS = 5;

export function getWorldDef(num) {
  return WORLDS[num] || null;
}

// World metadata for the menu — in order, with locked entries for worlds
// that don't exist yet (placeholders for 4/5).
export const WORLD_ORDER = [
  { num: 1, name: 'The Farm',    exists: true  },
  { num: 2, name: 'The Market',  exists: true  },
  { num: 3, name: 'The Docks',   exists: true  },
  { num: 4, name: 'Castle Town', exists: false },
  { num: 5, name: 'The Volcano', exists: false },
];
