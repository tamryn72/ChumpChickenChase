// Chump Chicken Chase — boot + game loop

import { CANVAS_W, CANVAS_H, TICK_MS, DEBUG, TITLE } from './config.js';
import { createRng } from './rng.js';
import { bakeAll } from './render/bake.js';
import { render } from './render/renderer.js';
import { createFarm } from './world/farm.js';
import { createPlayer, tickPlayer } from './entities/player.js';
import { createChump, tickChump, TAUNTS } from './entities/chicken.js';
import {
  createParticles, tickParticles, addGoo, addFeather,
} from './systems/particles.js';
import { createBubbles, tickBubbles, say } from './systems/bubbles.js';
import { input } from './input.js';

const canvas = document.getElementById('game');
canvas.width = CANVAS_W;
canvas.height = CANVAS_H;
const ctx = canvas.getContext('2d');
ctx.imageSmoothingEnabled = false;

bakeAll();

const level = createFarm();
const game = {
  state: 'CHASE',
  tick: 0,
  rng: createRng(42),
  level,
  player: createPlayer(10, 7),
  chump: createChump(14, 5),
  particles: createParticles(level),
  bubbles: createBubbles(),
};

// hooks passed to chump so it can spawn particles without importing them directly
const chumpHooks = {
  addGoo:     (col, row)  => addGoo(game.particles, col, row),
  addFeather: (x, y, rng) => addFeather(game.particles, x, y, rng),
};

function manhattan(a, b) {
  return Math.abs(a.col - b.col) + Math.abs(a.row - b.row);
}

function tick(g) {
  g.tick += 1;
  tickPlayer(g.player, g.level);
  tickChump(g.chump, g.level, g.rng, chumpHooks);
  tickParticles(g.particles);
  tickBubbles(g.bubbles);

  // first taunt trigger: when player gets within 3 tiles, Chump talks smack
  if (manhattan(g.player, g.chump) <= 3) {
    say(g.bubbles, g.chump, g.rng.pick(TAUNTS), 'taunt', 70);
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
    ctx.fillText(TITLE, 4, 10);
    ctx.fillText(
      'tick ' + game.tick + '  seed ' + game.rng.seed,
      4, 22,
    );
    ctx.fillText(
      'player ' + game.player.col + ',' + game.player.row +
      '  chump ' + game.chump.col + ',' + game.chump.row,
      4, 34,
    );
  }

  requestAnimationFrame(frame);
}

requestAnimationFrame(frame);
