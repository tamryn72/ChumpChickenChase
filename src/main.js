// Chump Chicken Chase — boot

import { CANVAS_W, CANVAS_H, TICK_MS, TITLE, DEBUG } from './config.js';
import { createRng } from './rng.js';

const canvas = document.getElementById('game');
canvas.width = CANVAS_W;
canvas.height = CANVAS_H;
const ctx = canvas.getContext('2d');
ctx.imageSmoothingEnabled = false;

const game = {
  state: 'BOOT',
  tick: 0,
  rng: createRng(42),
};

function tick(g) {
  g.tick += 1;
}

function render(g, _alpha) {
  // background
  ctx.fillStyle = '#1a1208';
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

  ctx.textAlign = 'center';

  // title
  ctx.fillStyle = '#ff8c1a';
  ctx.font = 'bold 36px ui-monospace, monospace';
  ctx.fillText(TITLE, CANVAS_W / 2, CANVAS_H / 2 - 20);

  // boot status
  ctx.fillStyle = '#fff3d6';
  ctx.font = '14px ui-monospace, monospace';
  ctx.fillText('boot ok — tick ' + g.tick, CANVAS_W / 2, CANVAS_H / 2 + 12);

  if (DEBUG) {
    ctx.fillStyle = '#666';
    ctx.font = '10px ui-monospace, monospace';
    ctx.textAlign = 'left';
    ctx.fillText('debug · seed ' + g.rng.seed, 8, CANVAS_H - 8);
  }
}

let accumulator = 0;
let last = performance.now();

function frame(now) {
  accumulator += now - last;
  last = now;
  // clamp to avoid spiral of death after tab switch / long pause
  if (accumulator > 1000) accumulator = TICK_MS;
  while (accumulator >= TICK_MS) {
    tick(game);
    accumulator -= TICK_MS;
  }
  render(game, accumulator / TICK_MS);
  requestAnimationFrame(frame);
}

requestAnimationFrame(frame);
