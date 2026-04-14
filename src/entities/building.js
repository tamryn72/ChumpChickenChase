// Protectable building entity. Each building is a cluster of tiles with shared HP.
// When destroyed, all its tiles are converted to walkable rubble.

export function createBuilding(name, hp, tiles, extraTiles = []) {
  return {
    name,
    hp,
    maxHp: hp,
    tiles,       // load-bearing tiles [[col,row], ...]
    extraTiles,  // cosmetic (e.g. roof above walls)
  };
}

export function buildingBoundingBox(b) {
  let minC = Infinity, minR = Infinity, maxC = -Infinity, maxR = -Infinity;
  for (const [c, r] of b.tiles) {
    if (c < minC) minC = c;
    if (c > maxC) maxC = c;
    if (r < minR) minR = r;
    if (r > maxR) maxR = r;
  }
  for (const [c, r] of b.extraTiles) {
    if (c < minC) minC = c;
    if (c > maxC) maxC = c;
    if (r < minR) minR = r;
    if (r > maxR) maxR = r;
  }
  return { minC, minR, maxC, maxR };
}

// Nearest load-bearing tile of a building to a (col,row) source, in manhattan.
export function nearestTileOfBuilding(b, fromCol, fromRow) {
  let best = null;
  let bestDist = Infinity;
  for (const [c, r] of b.tiles) {
    const d = Math.abs(c - fromCol) + Math.abs(r - fromRow);
    if (d < bestDist) {
      bestDist = d;
      best = [c, r];
    }
  }
  if (!best) return { col: 0, row: 0, dist: Infinity };
  return { col: best[0], row: best[1], dist: bestDist };
}

export function findNearestAliveBuilding(buildings, col, row) {
  let best = null;
  let bestDist = Infinity;
  for (const b of buildings) {
    if (b.hp <= 0) continue;
    const near = nearestTileOfBuilding(b, col, row);
    if (near.dist < bestDist) {
      bestDist = near.dist;
      best = b;
    }
  }
  return best;
}

export function destroyBuilding(b, level, rubbleTile) {
  b.hp = 0;
  for (const [c, r] of b.tiles) level.set(c, r, rubbleTile);
  for (const [c, r] of b.extraTiles) level.set(c, r, rubbleTile);
}

export function allBuildingsDestroyed(buildings) {
  for (const b of buildings) {
    if (b.hp > 0) return false;
  }
  return true;
}
