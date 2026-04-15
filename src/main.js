// Chump Chicken Chase — boot + game loop

import {
  CANVAS_W, CANVAS_H, TILE, TICK_MS, DEBUG, QUICKSTART, TITLE,
} from './config.js';
import { createRng } from './rng.js';
import { bakeAll } from './render/bake.js';
import { render } from './render/renderer.js';
import { drawMenu, drawScore, drawPause, drawTransition, drawSigning } from './render/menu.js';
import { drawCutscene } from './render/cutscene.js';
import { getWorldDef, WORLD_ORDER } from './world/index.js';
import { TILE_TYPES as T } from './world/level.js';
import { createPlayer, tickPlayer } from './entities/player.js';
import {
  createChump, tickChump, addRage,
  TAUNTS, STUN_BUBBLES, ESCAPE_BUBBLES, DESTROY_BUBBLES,
  EGG_BUBBLES, FINAL_FORM_BUBBLES,
  CAT_BUBBLES, TACO_HATE_BUBBLES, BURGER_BUBBLES,
  TELEPORT_BUBBLES, EXEC_TAUNTS,
} from './entities/chicken.js';
import { createTrap, TRAP_TYPES, findTrapAt } from './entities/trap.js';
import { destroyBuilding, allBuildingsDestroyed } from './entities/building.js';
import { createEgg, createIce, createRock, tickProjectile } from './entities/projectile.js';
import {
  createPickup, tickPickup, pickupAt, PICKUP_TYPES,
} from './entities/pickup.js';
import { createTownie, tickTownie } from './entities/npc.js';
import { createFox, tickFox } from './entities/fox.js';
import {
  createParticles, tickParticles, addGoo, addFeather,
  addDebrisBurst, addAttackSpark, addEggSplat, addSpitFire, setMotionScale,
} from './systems/particles.js';
import { createBubbles, tickBubbles, say } from './systems/bubbles.js';
import { createCutscene, tickCutscene, endCutscene } from './systems/cutscene.js';
import { loadSave, saveSave, recordRun } from './systems/save.js';
import { playSfx, setSfxMuted, setSfxVolume, kickAudio } from './audio/sfx.js';
import {
  trapPaletteSlots, TOUCH_DPAD, TOUCH_PAUSE_BTN, TOUCH_GO_BTN,
} from './render/ui.js';
import { menuLayout, pauseMenuLayout } from './render/menu.js';
import { input } from './input.js';

// --- canvas + context ---
// The canvas backing buffer is rendered at RENDER_SCALE× the logical game
// resolution so that fillText (HUD, bubbles, menus) has enough physical
// pixels to stay legible when the browser upscales the pixelated canvas to
// fit the viewport. Sprites still look crisp because we keep
// imageSmoothingEnabled=false — the ctx.scale() just turns each logical
// pixel into RENDER_SCALE buffer pixels via nearest-neighbor drawImage.
// All game code continues to work in logical (640×480) coordinates.
const RENDER_SCALE = 2;
const canvas = document.getElementById('game');
canvas.width = CANVAS_W * RENDER_SCALE;
canvas.height = CANVAS_H * RENDER_SCALE;
const ctx = canvas.getContext('2d');
ctx.imageSmoothingEnabled = false;
ctx.scale(RENDER_SCALE, RENDER_SCALE);

bakeAll();

// Apply save-backed accessibility settings before any game state is built.
const bootSave = loadSave();
setSfxMuted(bootSave.settings?.muted === true);
setSfxVolume(bootSave.settings?.volume ?? 1);
setMotionScale(bootSave.settings?.reducedMotion ? 0.35 : 1);
// Prime the AudioContext on first user gesture (autoplay policy).
function primeAudioOnce() {
  kickAudio();
  window.removeEventListener('keydown', primeAudioOnce);
  window.removeEventListener('mousedown', primeAudioOnce);
  window.removeEventListener('touchstart', primeAudioOnce);
}
if (typeof window !== 'undefined') {
  window.addEventListener('keydown', primeAudioOnce);
  window.addEventListener('mousedown', primeAudioOnce);
  window.addEventListener('touchstart', primeAudioOnce);
}

// --- helpers ---
function manhattan(a, b) {
  return Math.abs(a.col - b.col) + Math.abs(a.row - b.row);
}
// Shake accumulator with reduced-motion respect. Anything that wanted to
// bump the camera goes through this so the setting can clamp it globally.
function addShake(amt) {
  if (game.save?.settings?.reducedMotion) return;
  game.shake = Math.max(game.shake, amt);
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

// --- Executive Cluck — once-per-level comedy order signed after first catch
//
// Four flavors, picked at random on the first catch:
//   speed      — player inputs queue one tick late ("for efficiency reasons")
//   supersonic — Chump can trigger slow-mo on the player on cooldown
//   foxes      — 3 red-hatted fox minions spawn and stagger-stun on contact
//   tropical   — Chump throws ice cubes that freeze the player for 2 seconds
//
// All names are opposite-of-effect because Chump is an unreliable narrator.
const EXEC_ORDERS = ['speed', 'supersonic', 'foxes', 'tropical'];
const SIGNING_LEN = 32;

export const EXEC_ORDER_INFO = {
  speed: {
    title: 'ORDER FOR SPEED',
    tagline: 'for efficiency reasons',
    lines: ['player inputs now queue', 'one tick late, believe me'],
    hudLabel: 'ORDER: SPEED',
  },
  supersonic: {
    title: 'SUPERSONIC ORDER',
    tagline: 'going supersonic, folks',
    lines: ['chump can trigger slow-mo', 'on the player at will'],
    hudLabel: 'ORDER: SUPERSONIC',
  },
  foxes: {
    title: 'RED FOXES DIRECTIVE',
    tagline: 'very red, very fox',
    lines: ['three fox minions appear', 'to stagger the player'],
    hudLabel: 'ORDER: RED FOXES',
  },
  tropical: {
    title: 'TROPICAL ORDER',
    tagline: 'beautiful weather, really',
    lines: ['chump now throws ice cubes', 'that freeze on a direct hit'],
    hudLabel: 'ORDER: TROPICAL',
  },
};

const ORDER_SIGNED_BUBBLES = {
  speed:      ['EVERYONE AGREES', 'BEST ORDER EVER', 'for efficiency'],
  supersonic: ['GOING SUPERSONIC', 'believe me, fast', 'BIG-LEAGUE SPEED'],
  foxes:      ['the red foxes', 'VERY FOX', 'tremendous foxes'],
  tropical:   ['such nice weather', 'TROPICAL VIBES', 'warming up'],
};

function pickExecOrder(rng) {
  return rng.pick(EXEC_ORDERS);
}

function spawnDirectiveFoxes(g) {
  const L = g.level;
  let placed = 0;
  // 2 foxes, not 3 — three simultaneously-chasing minions meant the player
  // couldn't realistically escape once the directive was signed.
  for (let attempt = 0; attempt < 80 && placed < 2; attempt++) {
    const c = g.rng.int(1, L.w - 2);
    const r = g.rng.int(1, L.h - 2);
    if (!L.isWalkable(c, r)) continue;
    if (manhattan({ col: c, row: r }, g.player) < 4) continue;
    // don't spawn on an existing entity tile
    if (g.foxes.some((f) => f.col === c && f.row === r)) continue;
    g.foxes.push(createFox(c, r));
    placed += 1;
  }
}

function beginSigning(g) {
  const picked = pickExecOrder(g.rng);
  g.execOrder = picked;
  g.execOrderSigned = true;
  g.signingT = SIGNING_LEN;

  // order-specific activation
  if (picked === 'speed') {
    g.player.inputDelay = true;
  } else if (picked === 'supersonic') {
    g.supersonicCooldown = 60; // 6s warmup before first slow-mo
  } else if (picked === 'foxes') {
    spawnDirectiveFoxes(g);
  } else if (picked === 'tropical') {
    // no immediate state change — hook into maybeThrowEgg via ctx.execOrder
  }

  // persistent cumulative stat in save.ordersSeen — used by the score screen
  g.save.ordersSeen = g.save.ordersSeen || {};
  g.save.ordersSeen[picked] = true;
  saveSave(g.save);

  playSfx('exec_order');
  setState(g, 'SIGNING');
  say(g.bubbles, g.chump, g.rng.pick(ORDER_SIGNED_BUBBLES[picked]), 'exec', 60, 40);
}

function tickSigning(g) {
  g.signingT -= 1;
  if (input.wasPressed('Enter') || input.wasPressed('Space') || g.signingT <= 0) {
    g.signingT = 0;
    respawnChumpFarFromPlayer();
    setState(g, 'CHASE');
  }
}

// --- menu juice / state transitions -----------------------------------------
//
// `menuIntroT` counts up while in MENU to drive the staged title intro.
// `transitionT` counts down every tick; while > 0 a full-screen flash +
// banner overlays the next state to punch state changes.
// Both are driven through setState() so every state change picks them up.
const MENU_INTRO_LEN = 52;
const TRANSITION_LEN = 14;

function setState(g, newState) {
  if (g.state === newState) return;
  g.state = newState;
  g.transitionT = TRANSITION_LEN;
  if (newState === 'MENU') g.menuIntroT = 0;
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
  rockTimer: 60,
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
  save: bootSave,
  // menu state
  menuIndex: 0,
  menuColumn: 'worlds',  // 'worlds' | 'settings' — right-pane focus
  menuSettingIndex: 0,   // which setting row is highlighted when column==='settings'
  paused: false,         // in-chase pause overlay
  pauseIndex: 0,
  // touch state — flipped on first touchstart so touch UI and layouts render
  touchActive: false,
  // menu juice / transition counters
  menuIntroT: 0,
  transitionT: 0,
  // Executive Cluck state — set by the signing ceremony, cleared on level end
  execOrder: null,          // null | 'speed' | 'supersonic' | 'foxes' | 'tropical'
  execOrderSigned: false,   // has a signing happened this level?
  signingT: 0,              // ticks remaining in the signing ceremony
  supersonicCooldown: 0,    // ticks until Chump can trigger supersonic again
  iceTint: 0,               // blue screen tint timer (ice-cube hits)
  foxes: [],                // red fox minion entities (Red Foxes Directive)
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
  game.rockTimer = 60;
  game.shake = 0;
  // Executive Cluck reset — orders don't carry across levels
  game.execOrder       = null;
  game.execOrderSigned = false;
  game.signingT        = 0;
  game.supersonicCooldown = 0;
  game.iceTint         = 0;
  game.foxes.length    = 0;
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
  setState(game, 'PLAN');
}

function startLevelFromMenu() {
  const picked = WORLD_ORDER[game.menuIndex];
  if (!picked || !picked.exists) return;
  if (picked.num > game.save.worldsUnlocked) return;
  playSfx('menu_select');
  loadWorld(picked.num);
}

// --- menu interaction (world list + settings column) ---
const SETTING_KEYS = ['muted', 'volume', 'reducedMotion', 'highContrast'];

// Volume slider steps — Enter/tap cycles through these.
const VOLUME_STEPS = [0.25, 0.5, 0.75, 1.0, 1.25];
function nextVolumeStep(v) {
  const cur = VOLUME_STEPS.findIndex((s) => Math.abs(s - v) < 0.01);
  const next = (cur + 1) % VOLUME_STEPS.length;
  return VOLUME_STEPS[next];
}

function tickMenu(g) {
  // column toggle with Tab / Left / Right arrow
  if (input.wasPressed('Tab') || input.wasPressed('ArrowLeft') || input.wasPressed('ArrowRight')) {
    g.menuColumn = (g.menuColumn === 'worlds') ? 'settings' : 'worlds';
    playSfx('menu_cursor');
  }
  if (g.menuColumn === 'worlds') {
    if (input.wasPressed('ArrowDown') || input.wasPressed('KeyS')) {
      g.menuIndex = Math.min(WORLD_ORDER.length - 1, g.menuIndex + 1);
      playSfx('menu_cursor');
    }
    if (input.wasPressed('ArrowUp') || input.wasPressed('KeyW')) {
      g.menuIndex = Math.max(0, g.menuIndex - 1);
      playSfx('menu_cursor');
    }
    if (input.wasPressed('Enter')) {
      startLevelFromMenu();
    }
  } else {
    if (input.wasPressed('ArrowDown') || input.wasPressed('KeyS')) {
      g.menuSettingIndex = Math.min(SETTING_KEYS.length - 1, g.menuSettingIndex + 1);
      playSfx('menu_cursor');
    }
    if (input.wasPressed('ArrowUp') || input.wasPressed('KeyW')) {
      g.menuSettingIndex = Math.max(0, g.menuSettingIndex - 1);
      playSfx('menu_cursor');
    }
    if (input.wasPressed('Enter') || input.wasPressed('Space')) {
      toggleSetting(g, SETTING_KEYS[g.menuSettingIndex]);
    }
  }
  // M is a global mute toggle from anywhere
  if (input.wasPressed('KeyM')) {
    toggleSetting(g, 'muted');
  }
}

function toggleSetting(g, key) {
  const s = g.save.settings;
  if (key === 'volume') {
    s.volume = nextVolumeStep(s.volume ?? 1);
    setSfxVolume(s.volume);
  } else {
    s[key] = !s[key];
    if (key === 'muted')         setSfxMuted(s.muted);
    if (key === 'reducedMotion') setMotionScale(s.reducedMotion ? 0.35 : 1);
  }
  saveSave(g.save);
  playSfx('menu_select');
}

// --- in-chase pause overlay ---
// Entries: RESUME, toggle muted, toggle reducedMotion, toggle highContrast, QUIT
const PAUSE_ENTRIES = [
  { kind: 'resume' },
  { kind: 'setting', key: 'muted' },
  { kind: 'setting', key: 'volume' },
  { kind: 'setting', key: 'reducedMotion' },
  { kind: 'setting', key: 'highContrast' },
  { kind: 'quit' },
];
function tickPauseMenu(g) {
  if (input.wasPressed('Escape') || input.wasPressed('KeyP')) {
    g.paused = false;
    playSfx('menu_back');
    return;
  }
  if (input.wasPressed('ArrowDown') || input.wasPressed('KeyS')) {
    g.pauseIndex = Math.min(PAUSE_ENTRIES.length - 1, g.pauseIndex + 1);
    playSfx('menu_cursor');
  }
  if (input.wasPressed('ArrowUp') || input.wasPressed('KeyW')) {
    g.pauseIndex = Math.max(0, g.pauseIndex - 1);
    playSfx('menu_cursor');
  }
  if (input.wasPressed('Enter') || input.wasPressed('Space')) {
    const entry = PAUSE_ENTRIES[g.pauseIndex];
    if (entry.kind === 'resume') {
      g.paused = false;
      playSfx('menu_select');
    } else if (entry.kind === 'setting') {
      toggleSetting(g, entry.key);
    } else if (entry.kind === 'quit') {
      playSfx('menu_back');
      g.paused = false;
      setState(game, 'MENU');
    }
  }
  if (input.wasPressed('KeyM')) toggleSetting(g, 'muted');
}

// boot either straight into PLAN (dev quickstart) or into MENU
if (QUICKSTART) {
  loadWorld(1);
} else {
  // still need non-null placeholders so renderer doesn't crash if called
  loadWorld(1);
  setState(game, 'MENU');
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
  setState(game, 'ESCAPE_CUTSCENE');
  playSfx('victory');
}

function enterScore(result) {
  game.result = result;
  if (!game.resultStats) game.resultStats = snapshotStats();
  setState(game, 'SCORE');
  game.save = recordRun(game.save, game.worldNum, result, game.resultStats);
  saveSave(game.save);
}

// --- hooks for chicken AI ---
const chumpHooks = {
  addGoo:     (col, row)  => addGoo(game.particles, col, row),
  addFeather: (x, y, rng) => addFeather(game.particles, x, y, rng),
  onTrapped:  (c) => {
    say(game.bubbles, c, game.rng.pick(STUN_BUBBLES), 'hit', 30, 22);
    playSfx('trap_snap');
  },
  onEscape:   (c) => say(game.bubbles, c, game.rng.pick(ESCAPE_BUBBLES), 'escape', 50, 22),
  onAttack:   (c, building, near) => {
    addAttackSpark(game.particles, near.col, near.row, game.rng);
    playSfx('building_hit');
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
    addShake(8);
    playSfx('building_destroy');
  },
  spawnEgg: (fc, fr, tc, tr, fiery = false) => {
    game.projectiles.push(createEgg(fc, fr, tc, tr, fiery));
    playSfx('egg_throw');
  },
  spawnIce: (fc, fr, tc, tr) => {
    game.projectiles.push(createIce(fc, fr, tc, tr));
    playSfx('ice_throw');
  },
  sayEgg: (c) => say(game.bubbles, c, game.rng.pick(EGG_BUBBLES), 'egg', 40, 22),
  onFinalForm: (c) => {
    say(game.bubbles, c, game.rng.pick(FINAL_FORM_BUBBLES), 'finalform', 120, 40);
    addShake(18);
    playSfx('final_form');
  },
  onReachPickup: (c, p) => collectForChump(game, p),
  onTeleport: (c, fromCol, fromRow, toCol, toRow, withClone) => {
    // sparkle burst at origin and destination so the jump reads
    addAttackSpark(game.particles, fromCol, fromRow, game.rng);
    addAttackSpark(game.particles, toCol,   toRow,   game.rng);
    addShake(6);
    say(game.bubbles, c, game.rng.pick(TELEPORT_BUBBLES), 'teleport', 40, 20);
    playSfx('teleport');
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
  // Use logical canvas dimensions (CANVAS_W/H) not canvas.width/height —
  // the backing buffer is RENDER_SCALE× larger than logical, but the game
  // operates in logical coordinates.
  const cx = (e.clientX - rect.left) * (CANVAS_W / rect.width);
  const cy = (e.clientY - rect.top)  * (CANVAS_H / rect.height);
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

// --- touch controls --------------------------------------------------------
//
// First touch flips `game.touchActive`, which makes ui.js draw the virtual
// d-pad / GO / pause / trap palette. We hit-test touches against those rects
// and feed the result back into `input` via setTouchDir / injectPress.

const activeTouches = new Map(); // identifier -> { role, x, y }

function touchPointToCanvas(t) {
  const rect = canvas.getBoundingClientRect();
  // Logical coords — see canvasToGrid comment.
  return {
    x: (t.clientX - rect.left) * (CANVAS_W / rect.width),
    y: (t.clientY - rect.top)  * (CANVAS_H / rect.height),
  };
}

function rectHit(x, y, r) {
  return x >= r.x && x < r.x + r.w && y >= r.y && y < r.y + r.h;
}

function dpadHit(x, y) {
  const dx = x - TOUCH_DPAD.cx;
  const dy = y - TOUCH_DPAD.cy;
  const reach = TOUCH_DPAD.r + 14;
  return dx * dx + dy * dy <= reach * reach;
}

function updateDpadFromPoint(x, y) {
  const dx = x - TOUCH_DPAD.cx;
  const dy = y - TOUCH_DPAD.cy;
  const dead = 10;
  if (Math.abs(dx) < dead && Math.abs(dy) < dead) {
    input.setTouchDir(0, 0);
    return;
  }
  // dominant axis wins — avoids horizontal-priority stealing vertical moves
  if (Math.abs(dx) > Math.abs(dy)) input.setTouchDir(Math.sign(dx), 0);
  else                             input.setTouchDir(0, Math.sign(dy));
}

function handleTouchStart(x, y) {
  // Returns a role string ('dpad' | 'pause' | 'go' | 'palette' | 'place' |
  // 'menu' | 'setting' | 'pause_entry' | 'enter' | null) so touchmove /
  // touchend can act accordingly.

  // Pause overlay has priority when it's up
  if (game.state === 'CHASE' && game.paused) {
    const layout = pauseMenuLayout();
    for (let i = 0; i < layout.rows.length; i++) {
      const row = layout.rows[i];
      if (y >= row.y - layout.pickH / 2 && y <= row.y + layout.pickH / 2) {
        game.pauseIndex = i;
        input.injectPress('Enter');
        return 'pause_entry';
      }
    }
    // tap outside rows = close pause
    game.paused = false;
    playSfx('menu_back');
    return 'pause_close';
  }

  if (game.state === 'CHASE') {
    if (dpadHit(x, y)) {
      updateDpadFromPoint(x, y);
      return 'dpad';
    }
    if (rectHit(x, y, TOUCH_PAUSE_BTN)) {
      game.paused = true;
      game.pauseIndex = 0;
      playSfx('menu_cursor');
      return 'pause';
    }
    return null;
  }

  if (game.state === 'PLAN') {
    if (rectHit(x, y, TOUCH_GO_BTN)) {
      input.injectPress('Enter');
      return 'go';
    }
    const slots = trapPaletteSlots(game);
    for (const s of slots) {
      if (rectHit(x, y, s)) {
        if ((game.inventory[s.type] ?? 0) > 0) {
          game.selectedTrap = s.type;
          playSfx('menu_cursor');
        }
        return 'palette';
      }
    }
    // fall through: tap-to-place on grid (ignore taps in the bottom strip
    // band so a fat-thumb miss on a palette slot doesn't place a trap)
    if (y < CANVAS_H - 52 && y > 24) {
      const col = Math.floor(x / TILE);
      const row = Math.floor(y / TILE);
      tryPlaceTrap(col, row);
    }
    return 'place';
  }

  if (game.state === 'MENU') {
    const layout = menuLayout();
    // world list rows
    for (let i = 0; i < layout.worlds.length; i++) {
      const row = layout.worlds[i];
      if (rectHit(x, y, row)) {
        game.menuColumn = 'worlds';
        game.menuIndex = i;
        startLevelFromMenu();
        return 'menu';
      }
    }
    // settings rows
    for (let i = 0; i < layout.settings.length; i++) {
      const row = layout.settings[i];
      if (rectHit(x, y, row)) {
        game.menuColumn = 'settings';
        game.menuSettingIndex = i;
        toggleSetting(game, SETTING_KEYS[i]);
        return 'setting';
      }
    }
    return null;
  }

  if (game.state === 'SCORE') {
    input.injectPress('Enter');
    return 'enter';
  }

  if (game.state === 'SIGNING') {
    input.injectPress('Enter');
    return 'enter';
  }

  if (game.state === 'ESCAPE_CUTSCENE') {
    input.injectPress('Space');
    return 'enter';
  }

  return null;
}

canvas.addEventListener('touchstart', (e) => {
  e.preventDefault();
  game.touchActive = true;
  input.markTouchActive();
  for (const t of e.changedTouches) {
    const { x, y } = touchPointToCanvas(t);
    const role = handleTouchStart(x, y);
    activeTouches.set(t.identifier, { role, x, y });
  }
}, { passive: false });

canvas.addEventListener('touchmove', (e) => {
  e.preventDefault();
  for (const t of e.changedTouches) {
    const rec = activeTouches.get(t.identifier);
    if (!rec) continue;
    const { x, y } = touchPointToCanvas(t);
    rec.x = x;
    rec.y = y;
    if (rec.role === 'dpad') updateDpadFromPoint(x, y);
  }
}, { passive: false });

function handleTouchEnd(e) {
  e.preventDefault();
  for (const t of e.changedTouches) {
    const rec = activeTouches.get(t.identifier);
    if (!rec) continue;
    if (rec.role === 'dpad') input.setTouchDir(0, 0);
    activeTouches.delete(t.identifier);
  }
}
canvas.addEventListener('touchend',    handleTouchEnd, { passive: false });
canvas.addEventListener('touchcancel', handleTouchEnd, { passive: false });

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
  playSfx('trap_place');
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
    playSfx('pickup_taco');
    return;
  }
  if (p.type === PICKUP_TYPES.BURGER) {
    p.state = 'gone';
    g.player.burgerBait += 1;
    say(g.bubbles, g.player, 'BAIT ACQUIRED', 'player_pickup', 20, 20);
    playSfx('pickup_burger');
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
    playSfx('pickup_cat');
    return;
  }
  if (p.type === PICKUP_TYPES.TACO) {
    p.state = 'gone';
    g.chump.stunTicks = 10;
    addRage(g.chump, 30);
    // Spit-fire animation: Chump exhales a cone of flame in his facing
    // direction. Bigger flash than the old egg-splat placeholder.
    addSpitFire(g.particles, g.chump.col, g.chump.row, g.chump.facing, g.rng);
    addShake(12);
    g.stats.tacosChump += 1;
    say(g.bubbles, g.chump, g.rng.pick(TACO_HATE_BUBBLES), 'taco_hate', 15, 30);
    playSfx('spit_fire');
    return;
  }
  if (p.type === PICKUP_TYPES.BURGER) {
    p.state = 'gone';
    g.chump.burgerBuff = 80;
    g.stats.burgersChump += 1;
    say(g.bubbles, g.chump, g.rng.pick(BURGER_BUBBLES), 'burger', 30, 25);
    playSfx('pickup_burger');
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
    const ok = tile === T.GRASS || tile === T.DIRT || tile === T.RUBBLE
            || tile === T.COBBLE || tile === T.DOCK || tile === T.PIER
            || tile === T.CASTLE_FLOOR || tile === T.ASH || tile === T.OBSIDIAN;
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

    if (p.kind === 'rock') {
      // Falling rocks: area-damage the target tile. Player within 1 tile
      // gets stunned. Also damages any building on that tile (1hp).
      const d = Math.abs(g.player.col - p.targetCol) + Math.abs(g.player.row - p.targetRow);
      addDebrisBurst(g.particles, p.targetCol, p.targetRow, g.rng, 10);
      addShake(10);
      playSfx('rock_land');
      if (d <= 1 && g.player.stunTicks === 0) {
        g.player.stunTicks = 8;
        addShake(18);
        g.stats.eggsHit += 1;
        say(g.bubbles, g.player, 'ROCK', 'rock_hit', 20, 16);
        playSfx('player_hit');
      }
      // rock damages adjacent buildings
      for (const b of g.buildings) {
        if (b.hp <= 0) continue;
        for (const [bc, br] of b.tiles) {
          if (bc === p.targetCol && br === p.targetRow) {
            b.hp -= 1;
            if (b.hp <= 0) {
              chumpHooks.onDestroy(g.chump, b);
            }
            break;
          }
        }
      }
      g.projectiles.splice(i, 1);
      continue;
    }

    // eggs + ice cubes
    const d = Math.abs(g.player.col - p.targetCol) + Math.abs(g.player.row - p.targetRow);
    const fiery = p.kind === 'egg_fiery';
    const ice   = p.kind === 'ice';
    if (d <= 1 && g.player.stunTicks === 0) {
      g.player.stunTicks = ice ? 20 : (fiery ? 8 : 5);
      addShake(ice ? 12 : (fiery ? 18 : 14));
      addRage(g.chump, 5);
      addEggSplat(g.particles, p.targetCol, p.targetRow, g.rng);
      g.stats.eggsHit += 1;
      if (ice) {
        g.iceTint = 22;
        say(g.bubbles, g.chump, 'FROZEN', 'egg_hit', 20, 22);
        playSfx('ice_hit');
      } else {
        say(g.bubbles, g.chump, fiery ? 'ROAST' : 'DIRECT HIT', 'egg_hit', 20, 22);
        playSfx('egg_hit');
      }
    } else {
      addEggSplat(g.particles, p.targetCol, p.targetRow, g.rng);
      g.stats.eggsDodged += 1;
      playSfx(ice ? 'ice_splat' : 'egg_splat');
    }
    g.projectiles.splice(i, 1);
  }
}

// --- falling rocks (W5) ---
function tickFallingRocks(g) {
  g.rockTimer -= 1;
  if (g.rockTimer > 0) return;
  // cadence: faster when chump is enraged
  const base = g.chump.finalForm > 0 ? 35 : 70;
  g.rockTimer = base + g.rng.int(0, 20);

  // pick a target tile — 50/50 bias toward the player, otherwise random
  let tc, tr;
  if (g.rng.chance(0.55) && g.player) {
    tc = Math.max(1, Math.min(g.level.w - 2, g.player.col + g.rng.int(-2, 2)));
    tr = Math.max(1, Math.min(g.level.h - 2, g.player.row + g.rng.int(-2, 2)));
  } else {
    for (let attempt = 0; attempt < 10; attempt++) {
      const c = g.rng.int(1, g.level.w - 2);
      const r = g.rng.int(1, g.level.h - 2);
      if (g.level.isWalkable(c, r)) { tc = c; tr = r; break; }
    }
  }
  if (tc === undefined) return;
  g.projectiles.push(createRock(tc, tr));
  playSfx('rock_warn');
}

// --- tick routing by state ---
function tick(g) {
  g.tick += 1;

  // menu intro + transition counters advance every tick regardless of state
  if (g.state === 'MENU' && g.menuIntroT < MENU_INTRO_LEN) g.menuIntroT += 1;
  if (g.transitionT > 0) g.transitionT -= 1;

  if (g.state === 'MENU') {
    tickMenu(g);
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
      setState(g, 'CHASE');
    }
    tickParticles(g.particles);
    tickBubbles(g.bubbles);
  } else if (g.state === 'CHASE') {
    // pause overlay toggles on ESC / P
    if (input.wasPressed('Escape') || input.wasPressed('KeyP')) {
      g.paused = !g.paused;
      playSfx('menu_cursor');
    }
    if (g.paused) {
      tickPauseMenu(g);
      input.endFrame();
      return;
    }
    if (input.wasPressed('KeyM')) toggleSetting(g, 'muted');
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
      flamingEggs: g.worldDef?.flamingEggs === true,
      execOrder: g.execOrder,
    });

    for (const n of g.townies) {
      const wasWander = n.state !== 'panic';
      tickTownie(n, g.level, g.rng, g.chump);
      // Cook screams on the rising edge of panic — fires once per entry,
      // not every tick. Rate-limited so it doesn't spam at the panic edge.
      if (n.variant === 'cook' && wasWander && n.state === 'panic') {
        playSfx('cook_scream');
        say(g.bubbles, n, 'MY TACOS', 'cook_scream', 15, 24);
      }
    }

    // --- Executive Cluck per-tick effects (only while an order is active)
    if (g.execOrder === 'supersonic') {
      if (g.supersonicCooldown > 0) g.supersonicCooldown -= 1;
      if (g.supersonicCooldown === 0 && (g.player.supersonicSlow || 0) === 0) {
        // trigger only if the player is in visible range and not stunned
        if (manhattan(g.player, g.chump) <= 6 && g.player.stunTicks === 0) {
          g.player.supersonicSlow = 20;
          g.supersonicCooldown = 140;
          playSfx('supersonic');
          say(g.bubbles, g.chump, g.rng.pick([
            'GOING SUPERSONIC', 'BIG-LEAGUE SPEED', 'believe me, fast',
          ]), 'exec', 40, 24);
        }
      }
    }
    // Red Fox directive — tick each fox, apply stagger-stun on contact.
    // Stun is intentionally short (3 ticks = 0.3s): long enough to feel
    // like a real hit, short enough that two foxes can't chain-lock you.
    for (const fox of g.foxes) {
      const contact = tickFox(fox, g.level, g.rng, g.player);
      if (contact && g.player.stunTicks === 0) {
        g.player.stunTicks = 3;
        addShake(6);
        playSfx('player_hit');
        say(g.bubbles, g.player, 'OOF', 'fox_hit', 12, 16);
      }
    }
    // iceTint decays regardless of exec order (hit could still linger)
    if (g.iceTint > 0) g.iceTint -= 1;

    tickPickups(g);
    if (g.worldDef?.fallingRocks) tickFallingRocks(g);
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
      // Under an exec order, half the taunts pull from the order-flavored
      // pool so Chump keeps bragging about his latest decree.
      const pool = (g.execOrder && EXEC_TAUNTS[g.execOrder] && g.rng.chance(0.5))
        ? EXEC_TAUNTS[g.execOrder]
        : TAUNTS;
      say(g.bubbles, g.chump, g.rng.pick(pool), 'taunt', 70);
    }

    if (g.chump.stunTicks > 0 && manhattan(g.player, g.chump) <= 1) {
      g.catches += 1;
      say(g.bubbles, g.chump, 'NOT AGAIN', 'hit', 10, 20);
      setState(g, 'GOTCHA');
      g.gotchaTicks = 15;
      playSfx('gotcha');
    }

    if (g.chaseTimer <= 0 && g.state === 'CHASE') {
      say(g.bubbles, g.chump, 'HAHAHA LOSER', 'taunt', 1, 60);
      playSfx('game_over');
      enterScore('lost');
    }

    if (allBuildingsDestroyed(g.buildings) && g.state === 'CHASE') {
      say(g.bubbles, g.chump, 'TOTAL DESTRUCTION', 'destroy', 1, 60);
      playSfx('game_over');
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
      } else if (!g.execOrderSigned) {
        // first catch of the level — Chump signs an executive order
        beginSigning(g);
      } else {
        respawnChumpFarFromPlayer();
        setState(g, 'CHASE');
      }
    }
  } else if (g.state === 'SIGNING') {
    tickSigning(g);
    tickParticles(g.particles);
    tickBubbles(g.bubbles);
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
      setState(game, 'MENU');
    }
    // On the final victory, R replays W5 immediately.
    if (g.worldNum === 5 && g.result === 'won' && input.wasPressed('KeyR')) {
      loadWorld(5);
    }
  }

  input.endFrame();
}

// --- top-level render routing ---
function renderFrame(alpha) {
  if (game.state === 'MENU') {
    drawMenu(ctx, game, game.save);
    drawTransition(ctx, game);
    drawAccessibilityOverlay(ctx);
    return;
  }
  if (game.state === 'ESCAPE_CUTSCENE') {
    drawCutscene(ctx, game.cutscene, alpha);
    drawTransition(ctx, game);
    drawAccessibilityOverlay(ctx);
    return;
  }
  if (game.state === 'SCORE') {
    render(ctx, game, alpha);
    drawScore(ctx, game);
    drawTransition(ctx, game);
    drawAccessibilityOverlay(ctx);
    return;
  }
  render(ctx, game, alpha);
  drawIceTint(ctx);
  if (game.state === 'CHASE' && game.paused) {
    drawPause(ctx, game);
  }
  // Transition draws before the signing ceremony so the scroll isn't
  // obscured by the wipe during its slide-in.
  drawTransition(ctx, game);
  if (game.state === 'SIGNING') {
    drawSigning(ctx, game);
  }
  drawAccessibilityOverlay(ctx);
}

// Fading pale-blue overlay — shown briefly after an ice-cube hit. Drawn
// between the world and any menu/ceremony overlays.
function drawIceTint(ctx) {
  const t = game.iceTint || 0;
  if (t <= 0) return;
  const alpha = (t / 22) * 0.45;
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = '#29adff';
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
  ctx.restore();
}

// High-contrast overlay: adds a faint border + darkens the edges so sprites
// pop against a high-contrast frame. Applied last so it's over everything.
function drawAccessibilityOverlay(ctx) {
  if (!game.save?.settings?.highContrast) return;
  // border
  ctx.strokeStyle = '#fff';
  ctx.lineWidth = 3;
  ctx.strokeRect(1, 1, CANVAS_W - 2, CANVAS_H - 2);
  ctx.lineWidth = 1;
  // vignette
  const g = ctx.createRadialGradient(
    CANVAS_W / 2, CANVAS_H / 2, CANVAS_H / 3,
    CANVAS_W / 2, CANVAS_H / 2, CANVAS_W * 0.7,
  );
  g.addColorStop(0, 'rgba(0,0,0,0)');
  g.addColorStop(1, 'rgba(0,0,0,0.35)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
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
