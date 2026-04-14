// Chump Chicken Chase — boot + game loop

import { CANVAS_W, CANVAS_H, TILE, TICK_MS, DEBUG, TITLE } from './config.js';
import { createRng } from './rng.js';
import { bakeAll } from './render/bake.js';
import { render } from './render/renderer.js';
import { createFarm } from './world/farm.js';
import { createPlayer, tickPlayer } from './entities/player.js';
import {
  createChump, tickChump, TAUNTS, STUN_BUBBLES, ESCAPE_BUBBLES,
} from './entities/chicken.js';
import {
  createTrap, TRAP_TYPES, findTrapAt,
} from './entities/trap.js';
import {
  createParticles, tickParticles, addGoo, addFeather,
} from './systems/particles.js';
import { createBubbles, tickBubbles, say } from './systems/bubbles.js';
import { input } from './input.js';

// --- canvas + context ---
const canvas = document.getElementById('game');
canvas.width = CANVAS_W;
canvas.height = CANVAS_H;
const ctx = canvas.getContext('2d');
ctx.imageSmoothingEnabled = false;

bakeAll();

// --- game state ---
const level = createFarm();
const game = {
  state: 'PLAN',
  tick: 0,
  rng: createRng(42),
  level,
  player: createPlayer(10, 7),
  chump: createChump(14, 5),
  particles: createParticles(level),
  bubbles: createBubbles(),
  traps: [],
  // phase timers (in ticks, 10Hz => 200 = 20s)
  planTimer: 200,
  chaseTimer: 500,
  // catch objective
  catches: 0,
  catchesNeeded: 2,
  // placement
  selectedTrap: TRAP_TYPES.NET,
  inventory: { net: 3, banana: 2, cage: 1 },
  hoverCol: -1,
  hoverRow: -1,
  gotchaTicks: 0,
};

function canonInventory() {
  return { net: 3, banana: 2, cage: 1 };
}

function resetLevel() {
  game.state = 'PLAN';
  game.planTimer = 200;
  game.chaseTimer = 500;
  game.catches = 0;
  game.traps.length = 0;
  game.inventory = canonInventory();
  game.selectedTrap = TRAP_TYPES.NET;
  game.player = createPlayer(10, 7);
  game.chump = createChump(14, 5);
  game.particles = createParticles(level);
  game.bubbles = createBubbles();
  game.gotchaTicks = 0;
}

// --- hooks for chicken AI to fire particles / speech ---
const chumpHooks = {
  addGoo:     (col, row)  => addGoo(game.particles, col, row),
  addFeather: (x, y, rng) => addFeather(game.particles, x, y, rng),
  onTrapped:  (c)         => say(game.bubbles, c, game.rng.pick(STUN_BUBBLES), 'hit', 30, 22),
  onEscape:   (c)         => say(game.bubbles, c, game.rng.pick(ESCAPE_BUBBLES), 'escape', 50, 22),
};

// --- canvas mouse handling (PLAN phase placement + VICTORY/GAMEOVER retry) ---
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
  if (game.state === 'VICTORY' || game.state === 'GAMEOVER') {
    resetLevel();
    return;
  }
  if (game.state !== 'PLAN') return;
  const { col, row } = canvasToGrid(e);
  tryPlaceTrap(col, row);
});

function tryPlaceTrap(col, row) {
  if (col < 0 || row < 0 || col >= game.level.w || row >= game.level.h) return;
  if (!game.level.isWalkable(col, row)) return;
  if (findTrapAt(game.traps, col, row)) return;
  const key = game.selectedTrap;
  if (game.inventory[key] <= 0) return;
  game.inventory[key] -= 1;
  game.traps.push(createTrap(key, col, row));
}

function manhattan(a, b) {
  return Math.abs(a.col - b.col) + Math.abs(a.row - b.row);
}

function respawnChumpFarFromPlayer() {
  const { level } = game;
  for (let attempt = 0; attempt < 60; attempt++) {
    const c = game.rng.int(1, level.w - 2);
    const r = game.rng.int(1, level.h - 2);
    if (level.isWalkable(c, r) && manhattan({ col: c, row: r }, game.player) >= 6) {
      game.chump = createChump(c, r);
      return;
    }
  }
  game.chump = createChump(14, 5);
}

// --- tick routing by state ---
function tick(g) {
  g.tick += 1;

  // trap select — always allowed
  if (input.wasPressed('Digit1')) g.selectedTrap = TRAP_TYPES.NET;
  if (input.wasPressed('Digit2')) g.selectedTrap = TRAP_TYPES.BANANA;
  if (input.wasPressed('Digit3')) g.selectedTrap = TRAP_TYPES.CAGE;

  if (g.state === 'PLAN') {
    g.planTimer -= 1;
    if (input.wasPressed('Enter') || g.planTimer <= 0) {
      g.state = 'CHASE';
    }
    tickParticles(g.particles);
    tickBubbles(g.bubbles);
  } else if (g.state === 'CHASE') {
    g.chaseTimer -= 1;
    tickPlayer(g.player, g.level);
    tickChump(g.chump, g.level, g.rng, chumpHooks, g.traps);
    tickParticles(g.particles);
    tickBubbles(g.bubbles);

    // proximity taunt
    if (manhattan(g.player, g.chump) <= 3 && g.chump.stunTicks === 0) {
      say(g.bubbles, g.chump, g.rng.pick(TAUNTS), 'taunt', 70);
    }

    // catch check: player adjacent to stunned chump
    if (g.chump.stunTicks > 0 && manhattan(g.player, g.chump) <= 1) {
      g.catches += 1;
      say(g.bubbles, g.chump, 'NOT AGAIN', 'hit', 10, 20);
      g.state = 'GOTCHA';
      g.gotchaTicks = 15;
    }

    if (g.chaseTimer <= 0) {
      g.state = 'GAMEOVER';
      say(g.bubbles, g.chump, 'HAHAHA LOSER', 'taunt', 1, 60);
    }
  } else if (g.state === 'GOTCHA') {
    g.gotchaTicks -= 1;
    tickParticles(g.particles);
    tickBubbles(g.bubbles);
    if (g.gotchaTicks <= 0) {
      if (g.catches >= g.catchesNeeded) {
        g.state = 'VICTORY';
      } else {
        respawnChumpFarFromPlayer();
        // clear stun state on the new chump
        g.chump.stunTicks = 0;
        g.chump.escapeInvul = 0;
        g.state = 'CHASE';
      }
    }
  } else if (g.state === 'VICTORY' || g.state === 'GAMEOVER') {
    // hold until click — no ticking
  }

  input.endFrame();
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

  render(ctx, game, accumulator / TICK_MS);

  if (DEBUG) {
    ctx.fillStyle = '#fff';
    ctx.font = '10px ui-monospace, monospace';
    ctx.textAlign = 'left';
    ctx.fillText(TITLE, 4, 44);
    ctx.fillText(
      'tick ' + game.tick + '  state ' + game.state + '  seed ' + game.rng.seed,
      4, 56,
    );
    ctx.fillText(
      'player ' + game.player.col + ',' + game.player.row +
      '  chump ' + game.chump.col + ',' + game.chump.row +
      '  stun ' + game.chump.stunTicks,
      4, 68,
    );
    ctx.fillText('traps placed ' + game.traps.length, 4, 80);
  }

  requestAnimationFrame(frame);
}

requestAnimationFrame(frame);
