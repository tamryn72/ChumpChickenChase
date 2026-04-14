// Headless smoke test for the game-logic layer.
// Stubs window/document/performance so the browser-coupled modules can be
// imported in Node, then runs a bunch of ticks and checks nothing crashes.
//
// Usage:
//   node tools/smoke.mjs
//
// Exits 0 on success, 1 on any thrown error during tick loop.

// --- stub browser globals BEFORE any import pulls config.js / input.js ---
globalThis.window = {
  location: { search: '' },
  addEventListener: () => {},
  removeEventListener: () => {},
};
globalThis.document = {
  addEventListener: () => {},
  createElement: () => ({ getContext: () => ({}) }),
};
globalThis.performance = { now: () => Date.now() };

// --- imports ---
const { createRng } = await import('../src/rng.js');
const { createFarm, createFarmBuildings, createFarmTownies } = await import('../src/world/farm.js');
const { createPlayer, tickPlayer } = await import('../src/entities/player.js');
const {
  createChump, tickChump,
} = await import('../src/entities/chicken.js');
const { createTrap, TRAP_TYPES } = await import('../src/entities/trap.js');
const { destroyBuilding } = await import('../src/entities/building.js');
const { TILE_TYPES: T } = await import('../src/world/level.js');
const {
  createParticles, tickParticles,
  addGoo, addFeather, addDebrisBurst, addAttackSpark, addEggSplat,
} = await import('../src/systems/particles.js');
const { createBubbles, tickBubbles, say } = await import('../src/systems/bubbles.js');
const {
  createPickup, tickPickup, pickupAt, PICKUP_TYPES,
} = await import('../src/entities/pickup.js');
const { createTownie, tickTownie } = await import('../src/entities/npc.js');
const { createEgg, tickProjectile } = await import('../src/entities/projectile.js');

// --- set up game state ---
const rng = createRng(42);
const level = createFarm();
const buildings = createFarmBuildings();
const player = createPlayer(10, 7);
const chump = createChump(14, 5);
const particles = createParticles(level);
const bubbles = createBubbles();
const pickups = [];
const townies = createFarmTownies().map((t) => createTownie(t.col, t.row, t.variant));
const traps = [
  createTrap(TRAP_TYPES.NET, 12, 7),
  createTrap(TRAP_TYPES.BANANA, 11, 7),
  createTrap(TRAP_TYPES.CAGE, 13, 6),
];
const projectiles = [];

// hooks: route chump-generated side effects correctly (destroy tiles,
// spawn eggs into projectiles array)
const hooks = {
  addGoo:     (col, row)  => addGoo(particles, col, row),
  addFeather: (x, y, r)   => addFeather(particles, x, y, r),
  onTrapped:  () => {},
  onEscape:   () => {},
  onAttack:   (c, b, near) => addAttackSpark(particles, near.col, near.row, rng),
  onDestroy:  (c, b) => {
    destroyBuilding(b, level, T.RUBBLE);
    for (const [col, row] of b.tiles) addDebrisBurst(particles, col, row, rng);
  },
  spawnEgg:   (fc, fr, tc, tr) => projectiles.push(createEgg(fc, fr, tc, tr)),
  sayEgg:     () => {},
  onFinalForm: () => {},
  onReachPickup: (c, p) => {
    if (p.type === PICKUP_TYPES.CAT) {
      p.state = 'tossed';
      p.tossT = 0;
      p.tossFromCol = p.col;
      p.tossFromRow = p.row;
      p.tossToCol = p.col + 1;
      p.tossToRow = p.row + 1;
    } else if (p.type === PICKUP_TYPES.TACO) {
      p.state = 'gone';
      chump.stunTicks = 10;
    } else if (p.type === PICKUP_TYPES.BURGER) {
      p.state = 'gone';
      chump.burgerBuff = 80;
    }
  },
};

const ctx = { level, rng, hooks, traps, buildings, pickups, player };

// --- run ---
const TICKS = 900; // 90 seconds of game time
let errors = 0;
const startBuildings = buildings.length;

try {
  // spawn a few pickups over time to exercise that path too
  for (let i = 0; i < TICKS; i++) {
    // spawn a pickup every so often
    if (i === 50) pickups.push(createPickup(PICKUP_TYPES.TACO, 12, 6));
    if (i === 150) pickups.push(createPickup(PICKUP_TYPES.BURGER, 10, 10));
    if (i === 300) pickups.push(createPickup(PICKUP_TYPES.CAT, 9, 8));

    tickPlayer(player, level);
    tickChump(chump, ctx);

    // projectile lifecycle
    for (let j = projectiles.length - 1; j >= 0; j--) {
      const p = projectiles[j];
      if (tickProjectile(p)) {
        addEggSplat(particles, p.targetCol, p.targetRow, rng);
        projectiles.splice(j, 1);
      }
    }

    // pickup tick + cleanup
    for (let j = pickups.length - 1; j >= 0; j--) {
      tickPickup(pickups[j]);
      if (pickups[j].state === 'gone') pickups.splice(j, 1);
    }

    // player-side pickup auto-collection (stub: just mark as gone)
    const pAt = pickupAt(pickups, player.col, player.row);
    if (pAt && pAt.type !== PICKUP_TYPES.CAT) {
      pAt.state = 'gone';
      player.tacoBuff = 80;
    }

    tickParticles(particles);
    tickBubbles(bubbles);

    for (const n of townies) tickTownie(n, level, rng, chump);

    // occasional bubble to exercise the queue
    if (i % 40 === 0) {
      say(bubbles, chump, 'test', 'smoke', 1, 10);
    }
  }

  const alive = buildings.filter((b) => b.hp > 0).length;
  console.log('smoke: OK');
  console.log('  ticks run         :', TICKS);
  console.log('  player pos        :', player.col, player.row);
  console.log('  chump pos         :', chump.col, chump.row);
  console.log('  chump rage        :', chump.rage, ' final:', chump.finalForm);
  console.log('  buildings         :', alive, '/', startBuildings, 'alive');
  console.log('  particles         : goo cells=' + particles.goo.filter(v => v > 0).length,
              'feathers=' + particles.feathers.length);
  console.log('  bubbles active    :', bubbles.active.length);
  console.log('  pickups remaining :', pickups.length);
  console.log('  projectiles       :', projectiles.length);
} catch (e) {
  console.error('smoke FAIL:', e);
  errors = 1;
}

process.exit(errors);
