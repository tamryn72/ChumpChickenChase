// Headless smoke test for the game-logic layer.
// Stubs window/document/performance so the browser-coupled modules can be
// imported in Node, then runs a bunch of ticks and checks nothing crashes.
//
// Usage:
//   node tools/smoke.mjs
//
// Exits 0 on success, 1 on any thrown error during tick loop.

// --- stub browser globals BEFORE any import pulls config.js / input.js ---
const fakeStorage = {};
globalThis.window = {
  location: { search: '' },
  addEventListener: () => {},
  removeEventListener: () => {},
  localStorage: {
    getItem: (k) => (k in fakeStorage ? fakeStorage[k] : null),
    setItem: (k, v) => { fakeStorage[k] = String(v); },
    removeItem: (k) => { delete fakeStorage[k]; },
  },
};
globalThis.document = {
  addEventListener: () => {},
  createElement: () => ({ getContext: () => ({}) }),
};
globalThis.performance = { now: () => Date.now() };

// --- imports ---
const { createRng } = await import('../src/rng.js');
const { WORLDS, getWorldDef, WORLD_ORDER } = await import('../src/world/index.js');
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
const { createCutscene, tickCutscene, endCutscene } = await import('../src/systems/cutscene.js');
const { loadSave, saveSave, recordRun } = await import('../src/systems/save.js');

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

  // --- M8: cutscene state machine ---
  const cs = createCutscene('FARM_ESCAPE');
  let cutsceneFinished = false;
  for (let i = 0; i < cs.totalTicks + 5; i++) {
    if (tickCutscene(cs)) { cutsceneFinished = true; break; }
  }
  if (!cutsceneFinished) throw new Error('cutscene never finished');
  const cs2 = createCutscene('FARM_ESCAPE');
  endCutscene(cs2);
  if (cs2.t !== cs2.totalTicks) throw new Error('endCutscene did not jump to end');

  // --- M8: save roundtrip ---
  const saveA = loadSave();
  if (saveA.worldsUnlocked !== 1) throw new Error('default save wrong');
  const runStats = {
    catches: 2, catchesNeeded: 2,
    buildingsTotal: 9, buildingsSaved: 7,
    elapsedTicks: 550, trapsPlaced: 6,
    eggsDodged: 3, eggsHit: 1,
    catsTossed: 1, burgersChump: 0,
    tacosPlayer: 2, tacosChump: 1,
  };
  const saveB = recordRun(saveA, 1, 'won', runStats);
  saveSave(saveB);
  if (saveB.worldsUnlocked !== 2) throw new Error('worldsUnlocked did not advance');
  if (!saveB.bestStats[1]) throw new Error('bestStats not recorded');
  const saveC = loadSave();
  if (saveC.worldsUnlocked !== 2) throw new Error('save did not persist through roundtrip');
  if (saveC.bestStats[1].buildingsSaved !== 7) throw new Error('bestStats roundtrip lost data');

  // --- M9: world registry exercise ---
  // Load each world and run 300 ticks of AI against it to catch
  // world-specific tile / AI interaction bugs.
  const worldNums = Object.keys(WORLDS).map(Number).sort((a, b) => a - b);
  for (const wn of worldNums) {
    const wdef = getWorldDef(wn);
    if (!wdef) throw new Error('registry missing world ' + wn);
    if (typeof wdef.createLevel !== 'function') throw new Error('world ' + wn + ' missing createLevel');
    if (typeof wdef.createBuildings !== 'function') throw new Error('world ' + wn + ' missing createBuildings');
    if (typeof wdef.createTownies !== 'function') throw new Error('world ' + wn + ' missing createTownies');
    const wlvl = wdef.createLevel();
    const wbldgs = wdef.createBuildings();
    const wtownies = wdef.createTownies().map((t) => createTownie(t.col, t.row, t.variant));
    const wplayer = createPlayer(wdef.playerStart.col, wdef.playerStart.row);
    const wchump = createChump(wdef.chumpStart.col, wdef.chumpStart.row);
    const wparticles = createParticles(wlvl);
    const wbubbles = createBubbles();
    const wpickups = [];
    const wtraps = [];
    const wprojectiles = [];
    const whooks = {
      ...hooks,
      addGoo:     (col, row)  => addGoo(wparticles, col, row),
      addFeather: (x, y, r)   => addFeather(wparticles, x, y, r),
      onDestroy:  (c, b) => {
        const { destroyBuilding: db } = globalThis.__buildingModule || {};
        if (db) db(b, wlvl, T.RUBBLE);
        else {
          // fallback: just zero hp (already done by chicken.js)
          for (const [col, row] of b.tiles) wlvl.set(col, row, T.RUBBLE);
        }
      },
      spawnEgg:   (fc, fr, tc, tr) => wprojectiles.push(createEgg(fc, fr, tc, tr)),
    };
    const wctx = { level: wlvl, rng, hooks: whooks, traps: wtraps, buildings: wbldgs, pickups: wpickups, player: wplayer };
    for (let i = 0; i < 300; i++) {
      tickPlayer(wplayer, wlvl);
      tickChump(wchump, wctx);
      for (let j = wprojectiles.length - 1; j >= 0; j--) {
        if (tickProjectile(wprojectiles[j])) wprojectiles.splice(j, 1);
      }
      for (const n of wtownies) tickTownie(n, wlvl, rng, wchump);
      tickParticles(wparticles);
      tickBubbles(wbubbles);
    }
    const wAlive = wbldgs.filter((b) => b.hp > 0).length;
    console.log(`  world ${wn} (${wdef.name}): ` +
                `buildings ${wAlive}/${wbldgs.length}, ` +
                `chump ${wchump.col},${wchump.row}, ` +
                `rage ${wchump.rage}`);
  }

  // Verify menu WORLD_ORDER shape
  if (!Array.isArray(WORLD_ORDER) || WORLD_ORDER.length !== 5) {
    throw new Error('WORLD_ORDER should have 5 entries, got ' + WORLD_ORDER.length);
  }
  for (const entry of WORLD_ORDER) {
    if (typeof entry.num !== 'number') throw new Error('WORLD_ORDER missing num');
    if (typeof entry.name !== 'string') throw new Error('WORLD_ORDER missing name');
    if (typeof entry.exists !== 'boolean') throw new Error('WORLD_ORDER missing exists');
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
  console.log('  cutscene          : ticks=' + cs.t + '/' + cs.totalTicks);
  console.log('  save              : worlds=' + saveC.worldsUnlocked, 'best[1]=', saveC.bestStats[1]);
} catch (e) {
  console.error('smoke FAIL:', e);
  errors = 1;
}

process.exit(errors);
