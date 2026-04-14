// Chump the chicken. Priority AI with rage, final form, pickups, eggs.
//
// Priority tree (per tick, after stun + passive rage + egg side-action):
//   1. CHASE_CAT      (mandatory override)
//   2. HATE_TACO      (he can't resist destroying tacos)
//   3. EAT_BURGER     (opportunistic, only if not already buffed)
//   4. DESTROY_NEAREST building (taco truck is a building, so if no
//                                 taco pickup on map he targets the truck)
//   5. WANDER fallback

import { TILE } from '../config.js';
import { FACE } from './player.js';
import { TRAP_STUN, TRAP_TYPES, findNearestLure } from './trap.js';
import { findNearestAliveBuilding, nearestTileOfBuilding } from './building.js';
import { findNearestPickup, PICKUP_TYPES } from './pickup.js';

const BASE_MOVE_TICKS = 4;

const DX = [0, 1, 0, -1];
const DY = [-1, 0, 1, 0];

export const TAUNTS = [
  'QUIET, PIGGY',
  'no eggs for you, loser',
  'I am the Golden Goose',
  'no one runs faster than me',
  'imagine losing to a chicken',
  'THIS FARM MINE NOW',
  'I am the best, the absolute best',
];

export const STUN_BUBBLES = [
  'I AM TRAPPED',
  'this is unfair',
  'MY LAWYERS',
  'UNRIG THIS TRAP',
];

export const ESCAPE_BUBBLES = [
  'I am the best at escape',
  'no one escapes like I do',
  'HAHAHA LOSER',
];

export const DESTROY_BUBBLES = [
  'WORST BARN EVER',
  'SAD SCARECROW',
  'OUT OF BUSINESS',
  'DESTROYING GREATLY',
];

export const EGG_BUBBLES = [
  'EGG TIME',
  'NO EGGS FOR YOU',
  'SPECIAL DELIVERY',
];

export const FINAL_FORM_BUBBLES = [
  'FINAL FORM',
  'YOU CANNOT STOP ME',
  'UNLIMITED POWER',
];

export const CAT_BUBBLES = [
  'grab that pussycat',
  'A CAT',
  'GET THE CAT',
  'CAT TIME',
];

export const TACO_HATE_BUBBLES = [
  'NOT THE TACOS',
  'I HATE TACOS',
  'WORST FOOD EVER',
  'DESTROYING TACOS',
];

export const BURGER_BUBBLES = [
  'BURGER TIME',
  'SO BIG',
  'BEST BURGERS',
];

export function createChump(col, row) {
  return {
    col, row,
    fromCol: col,
    fromRow: row,
    moveT: BASE_MOVE_TICKS,
    facing: FACE.DOWN,
    animFrame: 0,
    wanderCooldown: 0,
    stunTicks: 0,
    escapeInvul: 0,
    destroyTarget: null,
    attackCooldown: 0,
    attackAnim: 0,
    rage: 0,
    finalForm: 0,
    burgerBuff: 0,
    eggCooldown: 30,
    ragePassiveCounter: 0,
  };
}

export function addRage(c, amount) {
  if (c.finalForm > 0) return;
  c.rage = Math.min(100, c.rage + amount);
}

function moveTicksFor(c) {
  if (c.finalForm > 0) return 2;
  if (c.burgerBuff > 0) return 3;
  return BASE_MOVE_TICKS;
}

function facingFromTo(fromCol, fromRow, toCol, toRow) {
  if (toCol > fromCol) return FACE.RIGHT;
  if (toCol < fromCol) return FACE.LEFT;
  if (toRow > fromRow) return FACE.DOWN;
  if (toRow < fromRow) return FACE.UP;
  return FACE.DOWN;
}

function moveStep(c, d, ctx) {
  const { rng, hooks, traps, level } = ctx;
  c.facing = d;
  c.col = c.col + DX[d];
  c.row = c.row + DY[d];
  c.moveT = 0;
  c.animFrame = 1 - c.animFrame;

  hooks.addGoo(c.fromCol, c.fromRow);
  if (rng.chance(0.5)) {
    hooks.addFeather(
      c.fromCol * TILE + TILE / 2 + rng.int(-4, 4),
      c.fromRow * TILE + TILE / 2,
      rng,
    );
  }

  // trap check
  if (c.escapeInvul === 0 && traps) {
    const trap = traps.find(
      (t) => !t.triggered && t.col === c.col && t.row === c.row,
    );
    if (trap) {
      const immune = c.finalForm > 0
        && (trap.type === TRAP_TYPES.NET || trap.type === TRAP_TYPES.BANANA);
      if (!immune) {
        trap.triggered = true;
        let stun = TRAP_STUN[trap.type];
        if (c.finalForm > 0 && trap.type === TRAP_TYPES.CAGE) stun = 10;
        c.stunTicks = stun;
        c.destroyTarget = null;
        addRage(c, 10);
        hooks.onTrapped?.(c, trap);
        if (trap.type === TRAP_TYPES.BANANA) {
          const sc = c.col + DX[d];
          const sr = c.row + DY[d];
          if (level.isWalkable(sc, sr)) {
            c.fromCol = c.col;
            c.fromRow = c.row;
            c.col = sc;
            c.row = sr;
            c.moveT = 0;
          }
        }
      }
    }
  }
}

function sortDirsToward(c, targetCol, targetRow, level) {
  const dirs = [0, 1, 2, 3];
  return dirs
    .map((d) => {
      const nc = c.col + DX[d];
      const nr = c.row + DY[d];
      const walkable = level.isWalkable(nc, nr);
      const dist = Math.abs(nc - targetCol) + Math.abs(nr - targetRow);
      return { d, walkable, dist };
    })
    .sort((a, b) => {
      if (a.walkable !== b.walkable) return a.walkable ? -1 : 1;
      return a.dist - b.dist;
    })
    .map((x) => x.d);
}

function shuffledWanderDirs(c, rng) {
  const dirs = [0, 1, 2, 3];
  for (let i = dirs.length - 1; i > 0; i--) {
    const j = rng.int(0, i);
    [dirs[i], dirs[j]] = [dirs[j], dirs[i]];
  }
  if (rng.chance(0.6)) {
    const idx = dirs.indexOf(c.facing);
    if (idx > 0) [dirs[0], dirs[idx]] = [dirs[idx], dirs[0]];
  }
  return dirs;
}

function maybeThrowEgg(c, ctx) {
  const { player, hooks, rng } = ctx;
  if (c.stunTicks > 0) return;
  if (c.eggCooldown > 0) {
    c.eggCooldown -= 1;
    return;
  }
  if (!player) return;
  const dist = Math.abs(player.col - c.col) + Math.abs(player.row - c.row);
  if (dist < 2 || dist > 7) return;
  c.facing = facingFromTo(c.col, c.row, player.col, player.row);
  c.eggCooldown = 40 + rng.int(0, 20);
  hooks.spawnEgg?.(c.col, c.row, player.col, player.row);
  hooks.sayEgg?.(c);
}

// Pickup priority — returns { target: pickup, col, row } or null
function pickupTarget(c, ctx) {
  const { pickups } = ctx;
  if (!pickups) return null;
  // cat: mandatory override
  const cat = findNearestPickup(pickups, PICKUP_TYPES.CAT, c.col, c.row);
  if (cat) return { kind: PICKUP_TYPES.CAT, entity: cat, col: cat.col, row: cat.row };
  // taco: hate priority
  const taco = findNearestPickup(pickups, PICKUP_TYPES.TACO, c.col, c.row);
  if (taco) return { kind: PICKUP_TYPES.TACO, entity: taco, col: taco.col, row: taco.row };
  // burger: only if not already buffed
  if (c.burgerBuff === 0) {
    const burger = findNearestPickup(pickups, PICKUP_TYPES.BURGER, c.col, c.row);
    if (burger) return { kind: PICKUP_TYPES.BURGER, entity: burger, col: burger.col, row: burger.row };
  }
  return null;
}

export function tickChump(c, ctx) {
  const { level, rng, hooks, buildings } = ctx;

  // decay timers
  if (c.attackAnim > 0) c.attackAnim -= 1;
  if (c.burgerBuff > 0) c.burgerBuff -= 1;

  // final form clock
  if (c.finalForm > 0) {
    c.finalForm -= 1;
    if (c.finalForm === 0) c.rage = 0;
  } else if (c.rage >= 100) {
    c.finalForm = 50;
    hooks.onFinalForm?.(c);
  }

  // passive rage
  c.ragePassiveCounter += 1;
  if (c.ragePassiveCounter >= 50) {
    c.ragePassiveCounter = 0;
    addRage(c, 1);
  }

  // side action: egg throw
  maybeThrowEgg(c, ctx);

  // stun
  if (c.stunTicks > 0) {
    c.stunTicks -= 1;
    if (c.stunTicks === 0) {
      c.escapeInvul = 8;
      hooks.onEscape?.(c);
    }
    return;
  }
  if (c.escapeInvul > 0) c.escapeInvul -= 1;

  // interpolation step
  const mt = moveTicksFor(c);
  if (c.moveT < mt) c.moveT += 1;
  if (c.moveT < mt) return;

  c.fromCol = c.col;
  c.fromRow = c.row;

  // attack cooldown holds
  if (c.attackCooldown > 0) {
    c.attackCooldown -= 1;
    return;
  }

  // 1. pickup priority (cat > taco > burger)
  const pick = pickupTarget(c, ctx);
  if (pick) {
    const d = Math.abs(pick.col - c.col) + Math.abs(pick.row - c.row);
    if (d === 0) {
      // already ON the pickup — consume via hook
      hooks.onReachPickup?.(c, pick.entity);
      return;
    }
    const dirs = sortDirsToward(c, pick.col, pick.row, level);
    for (const d2 of dirs) {
      const tc = c.col + DX[d2];
      const tr = c.row + DY[d2];
      if (level.isWalkable(tc, tr)) {
        moveStep(c, d2, ctx);
        return;
      }
    }
    // blocked, fall through
  }

  // 1b. lure traps (corn decoy) — chicken actively paths to them.
  // When he arrives the normal trap trigger in moveStep fires.
  const lure = findNearestLure(ctx.traps || [], c.col, c.row);
  if (lure) {
    const dirs = sortDirsToward(c, lure.col, lure.row, level);
    for (const d2 of dirs) {
      const tc = c.col + DX[d2];
      const tr = c.row + DY[d2];
      if (level.isWalkable(tc, tr)) {
        moveStep(c, d2, ctx);
        return;
      }
    }
    // blocked, fall through
  }

  // 2. destroy target
  if (c.destroyTarget && c.destroyTarget.hp <= 0) c.destroyTarget = null;
  if (!c.destroyTarget && buildings && buildings.length) {
    c.destroyTarget = findNearestAliveBuilding(buildings, c.col, c.row);
  }

  if (c.destroyTarget) {
    const near = nearestTileOfBuilding(c.destroyTarget, c.col, c.row);
    if (near.dist === 1) {
      // damage — 1-hit destroy when burger buffed
      const damage = c.burgerBuff > 0 ? c.destroyTarget.maxHp : 1;
      c.destroyTarget.hp -= damage;
      c.facing = facingFromTo(c.col, c.row, near.col, near.row);
      c.attackCooldown = c.burgerBuff > 0 ? 4 : 8;
      c.attackAnim = 4;
      addRage(c, 2);
      hooks.onAttack?.(c, c.destroyTarget, near);
      if (c.destroyTarget.hp <= 0) {
        hooks.onDestroy?.(c, c.destroyTarget);
        c.destroyTarget = null;
      }
      return;
    }
    const dirs = sortDirsToward(c, near.col, near.row, level);
    for (const d of dirs) {
      const tc = c.col + DX[d];
      const tr = c.row + DY[d];
      if (level.isWalkable(tc, tr)) {
        moveStep(c, d, ctx);
        return;
      }
    }
    c.destroyTarget = null;
  }

  // 3. wander
  if (c.wanderCooldown > 0) {
    c.wanderCooldown -= 1;
    return;
  }
  if (rng.chance(0.12)) {
    c.wanderCooldown = rng.int(2, 5);
    return;
  }
  const dirs = shuffledWanderDirs(c, rng);
  for (const d of dirs) {
    const tc = c.col + DX[d];
    const tr = c.row + DY[d];
    if (level.isWalkable(tc, tr)) {
      moveStep(c, d, ctx);
      return;
    }
  }
  c.wanderCooldown = 2;
}

export function chumpPixelPos(c, alpha) {
  const mt = c.finalForm > 0 ? 2 : (c.burgerBuff > 0 ? 3 : BASE_MOVE_TICKS);
  const t = Math.min(1, (c.moveT + alpha) / mt);
  return {
    x: (c.fromCol + (c.col - c.fromCol) * t) * TILE,
    y: (c.fromRow + (c.row - c.fromRow) * t) * TILE,
  };
}
