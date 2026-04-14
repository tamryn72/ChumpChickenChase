// Level / tilemap data structure.

export const TILE_TYPES = {
  EMPTY:        0,
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
};

export const SOLID = new Set([
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
