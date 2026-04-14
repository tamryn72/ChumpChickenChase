// Chump Chicken Chase — boot + game loop

import { CANVAS_W, CANVAS_H, TICK_MS, DEBUG, TITLE } from './config.js';
import { createRng } from './rng.js';
import { bakeAll } from './render/bake.js';
import { render } from './render/renderer.js';
import { createFarm } from './world/farm.js';
import { createPlayer, tickPlayer } from './entities/player.js';
import { input } from './input.js';

const canvas = document.getElementById('game');
canvas.width = CANVAS_W;
canvas.height = CANVAS_H;
const ctx = canvas.getContext('2d');
ctx.imageSmoothingEnabled = false;

// bake every sprite into the offscreen cache before first frame
bakeAll();

const game = {
  state: 'CHASE',       // skipping MENU during dev
  tick: 0,
  rng: createRng(42),
  level: createFarm(),
  player: createPlayer(10, 7),
};

function tick(g) {
  g.tick += 1;
  tickPlayer(g.player, g.level);
  input.endFrame();
}

let accumulator = 0;
let last = performance.now();

function frame(now) {
  accumulator += now - last;
  last = now;
  // clamp to prevent spiral of death after tab switch
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
    ctx.fillText('tick ' + game.tick + '  seed ' + game.rng.seed, 4, 22);
    ctx.fillText('pos ' + game.player.col + ',' + game.player.row, 4, 34);
  }

  requestAnimationFrame(frame);
}

requestAnimationFrame(frame);
