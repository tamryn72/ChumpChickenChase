// Procedural tile drawing functions. Each draws one 32x32 tile at origin (0,0).
// Called once at boot by bake.js; cached to offscreen canvas.

import { P } from './palette.js';
import { TILE } from '../config.js';

export function drawGrass(ctx) {
  ctx.fillStyle = P.darkGreen;
  ctx.fillRect(0, 0, TILE, TILE);
  ctx.fillStyle = P.green;
  const blades = [[3,5],[8,11],[14,7],[20,19],[25,4],[11,25],[28,22],[6,28],[17,14]];
  for (const [x, y] of blades) {
    ctx.fillRect(x, y, 1, 2);
    ctx.fillRect(x + 1, y + 1, 1, 1);
  }
  ctx.fillStyle = P.black;
  ctx.globalAlpha = 0.25;
  ctx.fillRect(15, 14, 1, 1);
  ctx.fillRect(22, 26, 1, 1);
  ctx.fillRect(2, 18, 1, 1);
  ctx.globalAlpha = 1;
}

export function drawDirt(ctx) {
  ctx.fillStyle = P.brown;
  ctx.fillRect(0, 0, TILE, TILE);
  ctx.fillStyle = P.chumpDeep;
  const specks = [[4,6],[10,12],[18,3],[24,21],[28,8],[6,28],[15,25],[22,14]];
  for (const [x, y] of specks) {
    ctx.fillRect(x, y, 2, 1);
  }
  ctx.fillStyle = P.darkGrey;
  ctx.globalAlpha = 0.3;
  ctx.fillRect(0, 0, TILE, 1);
  ctx.fillRect(0, TILE - 1, TILE, 1);
  ctx.globalAlpha = 1;
}

export function drawFenceH(ctx) {
  drawGrass(ctx);
  ctx.fillStyle = P.brown;
  ctx.fillRect(0, 10, TILE, 3);
  ctx.fillRect(0, 18, TILE, 3);
  ctx.fillStyle = P.chumpDeep;
  ctx.fillRect(4, 6, 3, 20);
  ctx.fillRect(25, 6, 3, 20);
  ctx.fillStyle = P.chumpDeep;
  ctx.fillRect(8, 11, 16, 1);
  ctx.fillRect(8, 19, 16, 1);
}

export function drawPond(ctx) {
  ctx.fillStyle = P.darkBlue;
  ctx.fillRect(0, 0, TILE, TILE);
  ctx.fillStyle = P.blue;
  ctx.fillRect(4, 8, 10, 2);
  ctx.fillRect(16, 18, 8, 2);
  ctx.fillRect(6, 24, 6, 2);
  ctx.fillStyle = P.white;
  ctx.globalAlpha = 0.6;
  ctx.fillRect(5, 8, 4, 1);
  ctx.fillRect(18, 18, 3, 1);
  ctx.globalAlpha = 1;
}

export function drawHay(ctx) {
  drawGrass(ctx);
  ctx.fillStyle = P.yellow;
  ctx.fillRect(4, 6, 24, 22);
  ctx.fillStyle = P.orange;
  for (let y = 8; y < 28; y += 3) {
    ctx.fillRect(4, y, 24, 1);
  }
  ctx.fillStyle = P.chumpDeep;
  ctx.fillRect(8, 6, 1, 22);
  ctx.fillRect(16, 6, 1, 22);
  ctx.fillRect(23, 6, 1, 22);
  ctx.fillStyle = P.brown;
  ctx.fillRect(4, 6, 24, 1);
  ctx.fillRect(4, 27, 24, 1);
  ctx.fillRect(4, 6, 1, 22);
  ctx.fillRect(27, 6, 1, 22);
}

export function drawBarnWall(ctx) {
  ctx.fillStyle = P.red;
  ctx.fillRect(0, 0, TILE, TILE);
  ctx.fillStyle = P.darkPurple;
  ctx.fillRect(7, 0, 1, TILE);
  ctx.fillRect(15, 0, 1, TILE);
  ctx.fillRect(23, 0, 1, TILE);
  ctx.fillStyle = P.white;
  ctx.fillRect(0, 0, TILE, 1);
  ctx.fillRect(0, TILE - 1, TILE, 1);
}

export function drawBarnRoof(ctx) {
  ctx.fillStyle = P.chumpDeep;
  ctx.fillRect(0, 0, TILE, TILE);
  ctx.fillStyle = P.brown;
  for (let y = 2; y < TILE; y += 4) {
    ctx.fillRect(0, y, TILE, 1);
  }
  ctx.fillStyle = P.darkPurple;
  for (let x = 3; x < TILE; x += 6) {
    ctx.fillRect(x, 0, 1, TILE);
  }
}

export function drawCoop(ctx) {
  drawGrass(ctx);
  ctx.fillStyle = P.brown;
  ctx.fillRect(4, 10, 24, 18);
  ctx.fillStyle = P.chumpDeep;
  ctx.fillRect(2, 6, 28, 6);
  ctx.fillStyle = P.black;
  ctx.fillRect(13, 16, 6, 10);
  ctx.fillStyle = P.white;
  ctx.fillRect(4, 10, 24, 1);
  ctx.fillRect(4, 27, 24, 1);
  ctx.fillStyle = P.red;
  ctx.fillRect(15, 20, 2, 2);
}

export function drawScarecrow(ctx) {
  drawGrass(ctx);
  ctx.fillStyle = P.brown;
  ctx.fillRect(15, 10, 2, 20);
  ctx.fillRect(9, 12, 14, 2);
  ctx.fillStyle = P.chumpDeep;
  ctx.fillRect(11, 8, 10, 8);
  ctx.fillStyle = P.darkGrey;
  ctx.fillRect(10, 4, 12, 2);
  ctx.fillRect(12, 2, 8, 2);
  ctx.fillStyle = P.white;
  ctx.fillRect(13, 9, 2, 2);
  ctx.fillRect(17, 9, 2, 2);
  ctx.fillStyle = P.black;
  ctx.fillRect(13, 9, 1, 1);
  ctx.fillRect(17, 9, 1, 1);
  ctx.fillStyle = P.yellow;
  ctx.fillRect(8, 14, 2, 2);
  ctx.fillRect(22, 14, 2, 2);
}

export function drawTractor(ctx) {
  drawDirt(ctx);
  ctx.fillStyle = P.darkGreen;
  ctx.fillRect(6, 10, 22, 12);
  ctx.fillRect(10, 6, 14, 6);
  ctx.fillStyle = P.blue;
  ctx.fillRect(12, 8, 10, 4);
  ctx.fillStyle = P.green;
  ctx.fillRect(7, 11, 20, 1);
  ctx.fillStyle = P.black;
  ctx.fillRect(4, 22, 7, 7);
  ctx.fillRect(21, 22, 9, 9);
  ctx.fillStyle = P.lightGrey;
  ctx.fillRect(6, 24, 3, 3);
  ctx.fillRect(24, 25, 3, 3);
  ctx.fillStyle = P.darkGrey;
  ctx.fillRect(9, 4, 2, 6);
  ctx.fillStyle = P.yellow;
  ctx.fillRect(25, 14, 2, 2);
}

// Rubble — what building tiles become after destruction
export function drawRubble(ctx) {
  ctx.fillStyle = P.darkGrey;
  ctx.fillRect(0, 0, TILE, TILE);
  // debris chunks
  ctx.fillStyle = P.brown;
  ctx.fillRect(4, 5, 4, 3);
  ctx.fillRect(10, 8, 5, 4);
  ctx.fillRect(18, 4, 3, 3);
  ctx.fillRect(22, 14, 4, 3);
  ctx.fillRect(5, 18, 5, 4);
  ctx.fillRect(12, 22, 4, 3);
  ctx.fillRect(20, 24, 5, 3);
  // darker edges
  ctx.fillStyle = P.chumpDeep;
  ctx.fillRect(4, 5, 1, 3);
  ctx.fillRect(10, 8, 1, 4);
  ctx.fillRect(5, 18, 1, 4);
  // soot
  ctx.fillStyle = P.black;
  ctx.globalAlpha = 0.5;
  ctx.fillRect(8, 14, 6, 4);
  ctx.fillRect(18, 20, 8, 5);
  ctx.globalAlpha = 1;
  // dust motes
  ctx.fillStyle = P.lightGrey;
  ctx.fillRect(7, 10, 1, 1);
  ctx.fillRect(14, 6, 1, 1);
  ctx.fillRect(20, 18, 1, 1);
  ctx.fillRect(25, 7, 1, 1);
}
