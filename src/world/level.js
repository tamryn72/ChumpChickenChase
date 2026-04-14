// Level / tilemap data structure. TILE_TYPES is a shared enum across all worlds.

export const TILE_TYPES = {
  EMPTY:        0,

  // --- W1 Farm ---
  GRASS:        1,
  DIRT:         2,
  FENCE_H:      3,
  POND:         4,
  HAY:          5,
  BARN_W:       6,
  BARN_R:       7,
  COOP:         8,
  SCARECROW:    9,
  TRACTOR:     10,
  RUBBLE:      11,
  TACO_TRUCK_L: 12,
  TACO_TRUCK_R: 13,

  // --- W2 Market ---
  COBBLE:      20,
  BAKERY:      21,
  RESTAURANT:  22,
  CLOCK_TOP:   23,   // cosmetic upper half of tower
  CLOCK_BASE:  24,   // load-bearing lower half
  FOUNTAIN:    25,
  FRUIT_STAND: 26,
  APPLE_CART:  27,
  FISH_CART:   28,
  FLOWER_SHOP: 29,

  // --- W3 Docks ---
  WATER:       40,   // solid for player, passable for swimming chump
  PIER:        41,   // walkable wood plank jutting into water
  DOCK:        42,   // walkable stone dock floor
  BOAT:        43,
  WAREHOUSE:   44,
  FISH_MARKET: 45,
  LIGHTHOUSE_T:46,   // cosmetic top with light
  LIGHTHOUSE_B:47,   // load-bearing stone base
  CARGO:       48,
  NET_STACK:   49,
  CRANE:       50,

  // --- W4 Castle Town ---
  CASTLE_WALL:  60,  // solid indestructible masonry
  CASTLE_FLOOR: 61,  // walkable interior stone
  THRONE:       62,
  CROWN_ROOM:   63,
  KITCHEN:      64,
  ARMORY:       65,
  INN:          66,
  VILLAGE_HOUSE:67,
  CATAPULT:     68,

  // --- W5 Volcano ---
  ASH:          80,  // walkable dark ash ground
  OBSIDIAN:     81,  // walkable polished black stone path
  LAVA:         82,  // solid for player, passable for chump via SWIM cheat
  MAGMA_ROCK:   83,  // solid wall, indestructible
  VOLCANO_PEAK: 84,  // solid, cosmetic smoking peak
  STONE_HUT:    85,  // building tile — fragile villager hut
  SHRINE:       86,  // building tile — offering shrine
  CAULDRON:     87,  // building tile — bubbling lava cauldron
  CRYSTAL:      88,  // building tile — glowing crystal cluster
  LOOKOUT:      89,  // building tile — lookout tower base
  FORGE:        90,  // building tile — magma forge
};

export const SOLID = new Set([
  // W1
  TILE_TYPES.POND,
  TILE_TYPES.HAY,
  TILE_TYPES.BARN_W,
  TILE_TYPES.BARN_R,
  TILE_TYPES.COOP,
  TILE_TYPES.FENCE_H,
  TILE_TYPES.SCARECROW,
  TILE_TYPES.TRACTOR,
  TILE_TYPES.TACO_TRUCK_L,
  TILE_TYPES.TACO_TRUCK_R,
  // W2
  TILE_TYPES.BAKERY,
  TILE_TYPES.RESTAURANT,
  TILE_TYPES.CLOCK_TOP,
  TILE_TYPES.CLOCK_BASE,
  TILE_TYPES.FOUNTAIN,
  TILE_TYPES.FRUIT_STAND,
  TILE_TYPES.APPLE_CART,
  TILE_TYPES.FISH_CART,
  TILE_TYPES.FLOWER_SHOP,
  // W3 — water is in SOLID so player can't walk on it. Chump bypasses
  // this via the SWIM cheat inside chicken.js/isStepAcceptable.
  TILE_TYPES.WATER,
  TILE_TYPES.BOAT,
  TILE_TYPES.WAREHOUSE,
  TILE_TYPES.FISH_MARKET,
  TILE_TYPES.LIGHTHOUSE_T,
  TILE_TYPES.LIGHTHOUSE_B,
  TILE_TYPES.CARGO,
  TILE_TYPES.NET_STACK,
  TILE_TYPES.CRANE,
  // PIER and DOCK stay walkable
  // W4 Castle
  TILE_TYPES.CASTLE_WALL,
  TILE_TYPES.THRONE,
  TILE_TYPES.CROWN_ROOM,
  TILE_TYPES.KITCHEN,
  TILE_TYPES.ARMORY,
  TILE_TYPES.INN,
  TILE_TYPES.VILLAGE_HOUSE,
  TILE_TYPES.CATAPULT,
  // CASTLE_FLOOR stays walkable
  // W5 Volcano — lava is solid for player but chump with SWIM can cross it
  // (handled in chicken.js isStepAcceptable). ASH + OBSIDIAN walkable.
  TILE_TYPES.LAVA,
  TILE_TYPES.MAGMA_ROCK,
  TILE_TYPES.VOLCANO_PEAK,
  TILE_TYPES.STONE_HUT,
  TILE_TYPES.SHRINE,
  TILE_TYPES.CAULDRON,
  TILE_TYPES.CRYSTAL,
  TILE_TYPES.LOOKOUT,
  TILE_TYPES.FORGE,
]);

export class Level {
  constructor(w, h, tiles) {
    this.w = w;
    this.h = h;
    this.tiles = tiles;
  }

  at(col, row) {
    if (col < 0 || col >= this.w || row < 0 || row >= this.h) {
      return TILE_TYPES.EMPTY;
    }
    return this.tiles[row * this.w + col];
  }

  set(col, row, v) {
    if (col < 0 || col >= this.w || row < 0 || row >= this.h) return;
    this.tiles[row * this.w + col] = v;
  }

  isWalkable(col, row) {
    if (col < 0 || col >= this.w || row < 0 || row >= this.h) return false;
    return !SOLID.has(this.at(col, row));
  }
}
