// Chump Chicken Chase — boot + game loop

import {
  CANVAS_W, CANVAS_H, TILE, TICK_MS, DEBUG, QUICKSTART, TITLE,
} from './config.js';
import { createRng } from './rng.js';
import { bakeAll } from './render/bake.js';
import { render } from './render/renderer.js';
import { drawMenu, drawScore } from './render/menu.js';
import { drawCutscene } from './render/cutscene.js';
import { getWorldDef, WORLD_ORDER } from './world/index.js';
import { TILE_TYPES as T } from './world/level.js';
import { createPlayer, tickPlayer } from './entities/player.js';
import {
  createChump, tickChump, addRage,
  TAUNTS, STUN_BUBBLES, ESCAPE_BUBBLES, DESTROY_BUBBLES,
  EGG_BUBBLES, FINAL_FORM_BUBBLES,
  CAT_BUBBLES, TACO_HATE_BUBBLES, BURGER_BUBBLES,
  TELEPORT_BUBBLES,
} from './entities/chicken.js';
import { createTrap, TRAP_TYPES, findTrapAt } from './entities/trap.js';
import { destroyBuilding, allBuildingsDestroyed } from './entities/building.js';
import { createEgg, tickProjectile } from './entities/projectile.js';
import {
  createPickup, tickPickup, pickupAt, PICKUP_TYPES,
} from './entities/pickup.js';
import { createTownie, tickTownie } from './entities/npc.js';
import {
  createParticles, tickParticles, addGoo, addFeather,
  addDebrisBurst, addAttackSpark, addEggSplat,
} from './systems/particles.js';
import { createBubbles, tickBubbles, say } from './systems/bubbles.js';
import { createCutscene, tickCutscene, endCutscene } from './systems/cutscene.js';
import { loadSave, saveSave, recordRun } from './systems/save.js';
import { input } from './input.js';

// --- canvas + context ---
const canvas = document.getElementById('game');
canvas.width = CANVAS_W;
canvas.height = CANVAS_H;
const ctx = canvas.getContext('2d');
ctx.imageSmoothingEnabled = false;

bakeAll();

// --- helpers ---
function manhattan(a, b) {
  return Math.abs(a.col - b.col) + Math.abs(a.row - b.row);
}
function freshStats() {
  return {
    elapsedTicks: 0,
    trapsPlaced:  0,
    eggsDodged:   0,
    eggsHit:      0,
    catsTossed:   0,
    burgersChump: 0,
    tacosPlayer:  0,
    tacosChump:   0,
  };
}

// --- game state (mutated by loadWorld) ---
const game = {
  state: 'MENU',
  tick: 0,
  rng: createRng(42),
  // world-dependent (set by loadWorld)
  worldNum: 1,
  worldName: 'The Farm',
  worldDef: null,
  level: null,
  player: null,
  chump: null,
  particles: null,
  bubbles: createBubbles(),
  buildings: [],
  traps: [],
  projectiles: [],
  pickups: [],
  decoys: [],
  townies: [],
  pickupTimers: { taco: 120, burger: 180, cat: 240 },
  shake: 0,
  planTimer: 0,
  chaseTimer: 0,
  catches: 0,
  catchesNeeded: 2,
  selectedTrap: TRAP_TYPES.NET,
  inventory: { net: 3, banana: 2, cage: 1 },
  hoverCol: -1,
  hoverRow: -1,
  gotchaTicks: 0,
  stats: freshStats(),
  result: null,
  resultStats: null,
  cutscene: null,
  save: loadSave(),
  // menu state
  menuIndex: 0,
};

function loadWorld(num) {
  const def = getWorldDef(num);
  if (!def) {
    console.warn('loadWorld: unknown world', num);
    return;
  }
  game.worldNum     = num;
  game.worldName    = def.name;
  game.worldDef     = def;
  game.level        = def.createLevel();
  game.buildings    = def.createBuildings();
  game.townies      = def.createTownies().map((t) => createTownie(t.col, t.row, t.variant));
  game.player       = createPlayer(def.playerStart.col, def.playerStart.row);
  game.chump        = createChump(def.chumpStart.col, def.chumpStart.row);
  game.particles    = createParticles(game.level);
  game.bubbles      = createBubbles();
  game.traps.length = 0;
  game.projectiles.length = 0;
  game.pickups.length = 0;
  game.decoys.length = 0;
  game.pickupTimers = { taco: 120, burger: 180, cat: 240 };
  game.shake = 0;
  game.planTimer     = def.planTimer;
  game.chaseTimer    = def.chaseTimer;
  game.catches       = 0;
  game.catchesNeeded = def.catchesNeeded;
  game.selectedTrap  = TRAP_TYPES.NET;
  game.inventory     = def.inventory();
  game.hoverCol = -1;
  game.hoverRow = -1;
  game.gotchaTicks = 0;
  game.stats = freshStats();
  game.result = null;
  game.resultStats = null;
  game.cutscene = null;
  game.state = 'PLAN';
}

function startLevelFromMenu() {
  const picked = WORLD_ORDER[game.menuIndex];
  if (!picked || !picked.exists) return;
  if (picked.num > game.save.worldsUnlocked) return;
  loadWorld(picked.num);
}

// boot either straight into PLAN (dev quickstart) or into MENU
if (QUICKSTART) {
  loadWorld(1);
} else {
  // still need non-null placeholders so renderer doesn't crash if called
  loadWorld(1);
  game.state = 'MENU';
}

function snapshotStats() {
  return {
    catches:        game.catches,
    catchesNeeded:  game.catchesNeeded,
    buildingsTotal: game.buildings.length,
    buildingsSaved: game.buildings.filter((b) => b.hp > 0).length,
    elapsedTicks:   game.stats.elapsedTicks,
    trapsPlaced:    game.stats.trapsPlaced,
    eggsDodged:     game.stats.eggsDodged,
    eggsHit:        game.stats.eggsHit,
    catsTossed:     game.stats.catsTossed,
    burgersChump:   game.stats.burgersChump,
    tacosPlayer:    game.stats.tacosPlayer,
    tacosChump:     game.stats.tacosChump,
  };
}

function enterEscapeCutscene() {
  game.result = 'won';
  game.resultStats = snapshotStats();
  const scriptName = game.worldDef?.cutsceneScript || 'FARM_ESCAPE';
  game.cutscene = createCutscene(scriptName);
  game.state = 'ESCAPE_CUTSCENE';
}

function enterScore(result) {
  game.result = result;
  if (!game.resultStats) game.resultStats = snapshotStats();
  game.state = 'SCORE';
  game.save = recordRun(game.save, game.worldNum, result, game.resultStats);
  saveSave(game.save);
}

// --- hooks for chicken AI ---
const chumpHooks = {
  addGoo:     (col, row)  => addGoo(game.particles, col, row),
  addFeather: (x, y, rng) => addFeather(game.particles, x, y, rng),
  onTrapped:  (c) => say(game.bubbles, c, game.rng.pick(STUN_BUBBLES),   'hit', 30, 22),
  onEscape:   (c) => say(game.bubbles, c, game.rng.pick(ESCAPE_BUBBLES), 'escape', 50, 22),
  onAttack:   (c, building, near) => {
    addAttackSpark(game.particles, near.col, near.row, game.rng);
    if (game.rng.chance(0.3)) {
      say(game.bubbles, c, game.rng.pick(DESTROY_BUBBLES), 'destroy', 60, 22);
    }
  },
  onDestroy: (c, building) => {
    destroyBuilding(building, game.level, T.RUBBLE);
    for (const [col, row] of building.tiles) {
      addDebrisBurst(game.particles, col, row, game.rng);
    }
    for (const [col, row] of building.extraTiles) {
      addDebrisBurst(game.particles, col, row, game.rng, 6);
    }
    say(game.bubbles, c, 'DEMOLISHED', 'destroy', 20, 30);
    game.shake = Math.max(game.shake, 8);
  },
  spawnEgg: (fc, fr, tc, tr) => {
    game.projectiles.push(createEgg(fc, fr, tc, tr));
  },
  sayEgg: (c) => say(game.bubbles, c, game.rng.pick(EGG_BUBBLES), 'egg', 40, 22),
  onFinalForm: (c) => {
    say(game.bubbles, c, game.rng.pick(FINAL_FORM_BUBBLES), 'finalform', 120, 40);
    game.shake = Math.max(game.shake, 18);
  },
  onReachPickup: (c, p) => collectForChump(game, p),
  onTeleport: (c, fromCol, fromRow, toCol, toRow, withClone) => {
    // sparkle burst at origin and destination so the jump reads
    addAttackSpark(game.particles, fromCol, fromRow, game.rng);
    addAttackSpark(game.particles, toCol,   toRow,   game.rng);
    game.shake = Math.max(game.shake, 6);
    say(game.bubbles, c, game.rng.pick(TELEPORT_BUBBLES), 'teleport', 40, 20);
    if (withClone) {
      // Clone cheat: leave a fake chump at the old location for 60 ticks
      game.decoys.push({
        col: fromCol,
        row: fromRow,
        facing: c.facing,
        animFrame: c.animFrame,
        lifeTicks: 60,
      });
    }
  },
};

// --- canvas mouse ---
function canvasToGrid(e) {
  const rect = canvas.getBoundingClientRect();
  const cx = (e.clientX - rect.left) * (canvas.width / rect.width);
  const cy = (e.clientY - rect.top)  * (canvas.height / rect.height);
  return { col: Math.floor(cx / TILE), row: Math.floor(cy / TILE) };
}

canvas.addEventListener('mousemove', (e) => {
  const { col, row } = canvasToGrid(e);
  game.hoverCol = col;
  game.hoverRow = row;
});
canvas.addEventListener('mouseleave', () => {
  game.hoverCol = -1;
  game.hoverRow = -1;
});
canvas.addEventListener('click', (e) => {
  if (game.state === 'PLAN') {
    const { col, row } = canvasToGrid(e);
    tryPlaceTrap(col, row);
  }
});

function tryPlaceTrap(col, row) {
  if (col < 0 || row < 0 || col >= game.level.w || row >= game.level.h) return;
  if (!game.level.isWalkable(col, row)) return;
  if (findTrapAt(game.traps, col, row)) return;
  if (pickupAt(game.pickups, col, row)) return;
  const key = game.selectedTrap;
  const count = game.inventory[key];
  if (!(typeof count === 'number' && count > 0)) return;
  game.inventory[key] = count - 1;
  game.stats.trapsPlaced += 1;

  if (key === TRAP_TYPES.CAT_DECOY) {
    // Cat Decoy spawns a real cat pickup at the tile. Chump's existing
    // cat-chase priority does the rest.
    game.pickups.push(createPickup(PICKUP_TYPES.CAT, col, row));
  } else {
    game.traps.push(createTrap(key, col, row));
  }
}

function respawnChumpFarFromPlayer() {
  const L = game.level;
  for (let attempt = 0; attempt < 60; attempt++) {
    const c = game.rng.int(1, L.w - 2);
    const r = game.rng.int(1, L.h - 2);
    if (L.isWalkable(c, r) && manhattan({ col: c, row: r }, game.player) >= 6) {
      const rageBefore   = game.chump.rage;
      const finalBefore  = game.chump.finalForm;
      const burgerBefore = game.chump.burgerBuff;
      game.chump = createChump(c, r);
      game.chump.rage       = rageBefore;
      game.chump.finalForm  = finalBefore;
      game.chump.burgerBuff = burgerBefore;
      return;
    }
  }
  const fallback = game.worldDef?.chumpStart || { col: 14, row: 5 };
  game.chump = createChump(fallback.col, fallback.row);
}

// --- pickup collection ---
function collectForPlayer(g, p) {
  if (!p || p.state !== 'idle') return;
  if (p.type === PICKUP_TYPES.CAT) return;
  if (p.type === PICKUP_TYPES.TACO) {
    p.state = 'gone';
    g.player.tacoBuff = 80;
    g.stats.tacosPlayer += 1;
    say(g.bubbles, g.player, 'TACOS!', 'player_pickup', 20, 20);
    return;
  }
  if (p.type === PICKUP_TYPES.BURGER) {
    p.state = 'gone';
    g.player.burgerBait += 1;
    say(g.bubbles, g.player, 'BAIT ACQUIRED', 'player_pickup', 20, 20);
    return;
  }
}

function collectForChump(g, p) {
  if (!p || p.state !== 'idle') return;
  if (p.type === PICKUP_TYPES.CAT) {
    p.state = 'tossed';
    p.tossT = 0;
    p.tossFromCol = p.col;
    p.tossFromRow = p.row;
    p.tossToCol = Math.max(1, Math.min(g.level.w - 2, p.col + g.rng.int(-3, 3)));
    p.tossToRow = Math.max(1, Math.min(g.level.h - 2, p.row + g.rng.int(-3, 3)));
    g.chump.attackAnim = 8;
    g.stats.catsTossed += 1;
    say(g.bubbles, g.chump, g.rng.pick(CAT_BUBBLES), 'cat', 30, 26);
    return;
  }
  if (p.type === PICKUP_TYPES.TACO) {
    p.state = 'gone';
    g.chump.stunTicks = 10;
    addRage(g.chump, 30);
    addEggSplat(g.particles, p.col, p.row, g.rng);
    g.shake = Math.max(g.shake, 10);
    g.stats.tacosChump += 1;
    say(g.bubbles, g.chump, g.rng.pick(TACO_HATE_BUBBLES), 'taco_hate', 15, 30);
    return;
  }
  if (p.type === PICKUP_TYPES.BURGER) {
    p.state = 'gone';
    g.chump.burgerBuff = 80;
    g.stats.burgersChump += 1;
    say(g.bubbles, g.chump, g.rng.pick(BURGER_BUBBLES), 'burger', 30, 25);
    return;
  }
}

// --- pickup spawning ---
function hasIdlePickup(g, type) {
  return g.pickups.some((p) => p.type === type && p.state === 'idle');
}

function spawnPickup(g, type) {
  if (type === PICKUP_TYPES.TACO) {
    // tacos spawn adjacent to the Taco Truck if the world has one
    const truck = g.buildings.find(
      (b) => b.name === 'Taco Truck' && b.hp > 0,
    );
    if (truck) {
      for (const [tc, tr] of truck.tiles) {
        for (const [dc, dr] of [[0,1],[1,0],[0,-1],[-1,0],[1,1],[-1,1]]) {
          const c = tc + dc;
          const r = tr + dr;
          if (g.level.isWalkable(c, r) && !pickupAt(g.pickups, c, r)) {
            g.pickups.push(createPickup(PICKUP_TYPES.TACO, c, r));
            return;
          }
        }
      }
      return;
    }
    // no taco truck in this world — fall through to random walkable tile
  }
  for (let attempt = 0; attempt < 30; attempt++) {
    const c = g.rng.int(1, g.level.w - 2);
    const r = g.rng.int(1, g.level.h - 2);
    if (!g.level.isWalkable(c, r)) continue;
    const tile = g.level.at(c, r);
    // walkable floor types across worlds
    const ok = tile === T.GRASS || tile === T.DIRT || tile === T.RUBBLE || tile === T.COBBLE;
    if (!ok) continue;
    if (pickupAt(g.pickups, c, r)) continue;
    if (manhattan({ col: c, row: r }, g.player) < 3) continue;
    g.pickups.push(createPickup(type, c, r));
    return;
  }
}

function tickPickups(g) {
  for (let i = g.pickups.length - 1; i >= 0; i--) {
    tickPickup(g.pickups[i]);
    if (g.pickups[i].state === 'gone') g.pickups.splice(i, 1);
  }
  g.pickupTimers.taco   -= 1;
  g.pickupTimers.burger -= 1;
  g.pickupTimers.cat    -= 1;
  if (g.pickupTimers.taco <= 0) {
    if (!hasIdlePickup(g, PICKUP_TYPES.TACO))   spawnPickup(g, PICKUP_TYPES.TACO);
    g.pickupTimers.taco = 180;
  }
  if (g.pickupTimers.burger <= 0) {
    if (!hasIdlePickup(g, PICKUP_TYPES.BURGER)) spawnPickup(g, PICKUP_TYPES.BURGER);
    g.pickupTimers.burger = 250;
  }
  if (g.pickupTimers.cat <= 0) {
    if (!hasIdlePickup(g, PICKUP_TYPES.CAT))    spawnPickup(g, PICKUP_TYPES.CAT);
    g.pickupTimers.cat = 300;
  }
}

// --- projectile lifecycle ---
function tickProjectiles(g) {
  for (let i = g.projectiles.length - 1; i >= 0; i--) {
    const p = g.projectiles[i];
    const done = tickProjectile(p);
    if (!done) continue;
    const d = Math.abs(g.player.col - p.targetCol) + Math.abs(g.player.row - p.targetRow);
    if (d <= 1 && g.player.stunTicks === 0) {
      g.player.stunTicks = 5;
      g.shake = Math.max(g.shake, 14);
      addRage(g.chump, 5);
      addEggSplat(g.particles, p.targetCol, p.targetRow, g.rng);
      g.stats.eggsHit += 1;
      say(g.bubbles, g.chump, 'DIRECT HIT', 'egg_hit', 20, 22);
    } else {
      addEggSplat(g.particles, p.targetCol, p.targetRow, g.rng);
      g.stats.eggsDodged += 1;
    }
    g.projectiles.splice(i, 1);
  }
}

// --- tick routing by state ---
function tick(g) {
  g.tick += 1;

  if (g.state === 'MENU') {
    if (input.wasPressed('ArrowDown') || input.wasPressed('KeyS')) {
      g.menuIndex = Math.min(WORLD_ORDER.length - 1, g.menuIndex + 1);
    }
    if (input.wasPressed('ArrowUp') || input.wasPressed('KeyW')) {
      g.menuIndex = Math.max(0, g.menuIndex - 1);
    }
    if (input.wasPressed('Enter')) {
      startLevelFromMenu();
    }
  } else if (g.state === 'PLAN') {
    if (input.wasPressed('Digit1')) g.selectedTrap = TRAP_TYPES.NET;
    if (input.wasPressed('Digit2')) g.selectedTrap = TRAP_TYPES.BANANA;
    if (input.wasPressed('Digit3')) g.selectedTrap = TRAP_TYPES.CAGE;
    if (input.wasPressed('Digit4')) g.selectedTrap = TRAP_TYPES.GLUE;
    if (input.wasPressed('Digit5')) g.selectedTrap = TRAP_TYPES.CORN_DECOY;
    if (input.wasPressed('Digit6')) g.selectedTrap = TRAP_TYPES.PRETTY_HEN;
    if (input.wasPressed('Digit7')) g.selectedTrap = TRAP_TYPES.BURGER_BAIT;
    if (input.wasPressed('Digit8')) g.selectedTrap = TRAP_TYPES.CAT_DECOY;
    g.planTimer -= 1;
    if (input.wasPressed('Enter') || g.planTimer <= 0) {
      g.state = 'CHASE';
    }
    tickParticles(g.particles);
    tickBubbles(g.bubbles);
  } else if (g.state === 'CHASE') {
    if (input.wasPressed('Digit1')) g.selectedTrap = TRAP_TYPES.NET;
    if (input.wasPressed('Digit2')) g.selectedTrap = TRAP_TYPES.BANANA;
    if (input.wasPressed('Digit3')) g.selectedTrap = TRAP_TYPES.CAGE;
    if (input.wasPressed('Digit4')) g.selectedTrap = TRAP_TYPES.GLUE;
    if (input.wasPressed('Digit5')) g.selectedTrap = TRAP_TYPES.CORN_DECOY;
    if (input.wasPressed('Digit6')) g.selectedTrap = TRAP_TYPES.PRETTY_HEN;
    if (input.wasPressed('Digit7')) g.selectedTrap = TRAP_TYPES.BURGER_BAIT;
    if (input.wasPressed('Digit8')) g.selectedTrap = TRAP_TYPES.CAT_DECOY;

    g.chaseTimer -= 1;
    g.stats.elapsedTicks += 1;

    tickPlayer(g.player, g.level);

    const pAt = pickupAt(g.pickups, g.player.col, g.player.row);
    if (pAt) collectForPlayer(g, pAt);

    tickChump(g.chump, {
      level: g.level,
      rng: g.rng,
      hooks: chumpHooks,
      traps: g.traps,
      buildings: g.buildings,
      pickups: g.pickups,
      player: g.player,
      cheats: g.worldDef?.cheats || [],
    });

    for (const n of g.townies) tickTownie(n, g.level, g.rng, g.chump);

    tickPickups(g);
    tickProjectiles(g);
    // decoys decay
    for (let i = g.decoys.length - 1; i >= 0; i--) {
      g.decoys[i].lifeTicks -= 1;
      if (g.decoys[i].lifeTicks <= 0) g.decoys.splice(i, 1);
    }
    tickParticles(g.particles);
    tickBubbles(g.bubbles);

    if (g.shake > 0) g.shake -= 1;

    if (manhattan(g.player, g.chump) <= 3 && g.chump.stunTicks === 0) {
      say(g.bubbles, g.chump, g.rng.pick(TAUNTS), 'taunt', 70);
    }

    if (g.chump.stunTicks > 0 && manhattan(g.player, g.chump) <= 1) {
      g.catches += 1;
      say(g.bubbles, g.chump, 'NOT AGAIN', 'hit', 10, 20);
      g.state = 'GOTCHA';
      g.gotchaTicks = 15;
    }

    if (g.chaseTimer <= 0 && g.state === 'CHASE') {
      say(g.bubbles, g.chump, 'HAHAHA LOSER', 'taunt', 1, 60);
      enterScore('lost');
    }

    if (allBuildingsDestroyed(g.buildings) && g.state === 'CHASE') {
      say(g.bubbles, g.chump, 'TOTAL DESTRUCTION', 'destroy', 1, 60);
      enterScore('lost');
    }
  } else if (g.state === 'GOTCHA') {
    g.gotchaTicks -= 1;
    tickParticles(g.particles);
    tickBubbles(g.bubbles);
    if (g.shake > 0) g.shake -= 1;
    if (g.gotchaTicks <= 0) {
      if (g.catches >= g.catchesNeeded) {
        enterEscapeCutscene();
      } else {
        respawnChumpFarFromPlayer();
        g.state = 'CHASE';
      }
    }
  } else if (g.state === 'ESCAPE_CUTSCENE') {
    const skipping = input.wasPressed('Space') || input.wasPressed('Enter');
    const done = tickCutscene(g.cutscene);
    if (skipping) {
      endCutscene(g.cutscene);
      enterScore('won');
    } else if (done) {
      enterScore('won');
    }
    tickBubbles(g.bubbles);
  } else if (g.state === 'SCORE') {
    if (input.wasPressed('Enter')) {
      game.state = 'MENU';
    }
  }

  input.endFrame();
}

// --- top-level render routing ---
function renderFrame(alpha) {
  if (game.state === 'MENU') {
    drawMenu(ctx, game, game.save);
    return;
  }
  if (game.state === 'ESCAPE_CUTSCENE') {
    drawCutscene(ctx, game.cutscene, alpha);
    return;
  }
  if (game.state === 'SCORE') {
    render(ctx, game, alpha);
    drawScore(ctx, game);
    return;
  }
  render(ctx, game, alpha);
}

let accumulator = 0;
let last = performance.now();

function frame(now) {
  accumulator += now - last;
  last = now;
  if (accumulator > 1000) accumulator = TICK_MS;
  while (accumulator >= TICK_MS) {
    tick(game);
    accumulator -= TICK_MS;
  }

  renderFrame(accumulator / TICK_MS);

  if (DEBUG) {
    ctx.fillStyle = '#fff';
    ctx.font = '10px ui-monospace, monospace';
    ctx.textAlign = 'left';
    ctx.fillText(TITLE, 4, 44);
    ctx.fillText(
      'tick ' + game.tick + '  state ' + game.state + '  world ' + game.worldNum,
      4, 56,
    );
    if (game.state === 'CHASE' || game.state === 'GOTCHA' || game.state === 'PLAN') {
      ctx.fillText(
        'player ' + game.player.col + ',' + game.player.row +
        '  chump ' + game.chump.col + ',' + game.chump.row,
        4, 68,
      );
      ctx.fillText(
        'rage ' + game.chump.rage +
        '  final ' + game.chump.finalForm +
        '  burger ' + game.chump.burgerBuff +
        '  tacoBuff ' + game.player.tacoBuff,
        4, 80,
      );
      const alive = game.buildings.filter((b) => b.hp > 0).length;
      ctx.fillText(
        'bldg ' + alive + '/' + game.buildings.length +
        '  pickups ' + game.pickups.length +
        '  eggs ' + game.projectiles.length +
        '  townies ' + game.townies.length,
        4, 92,
      );
    }
  }

  requestAnimationFrame(frame);
}

requestAnimationFrame(frame);
