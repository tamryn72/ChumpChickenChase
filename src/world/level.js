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
