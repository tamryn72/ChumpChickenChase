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

// Taco truck — left half (window side)
export function drawTacoTruckL(ctx) {
  // awning
  ctx.fillStyle = P.darkGreen;
  ctx.fillRect(0, 0, TILE, 4);
  ctx.fillStyle = P.green;
  ctx.fillRect(0, 2, TILE, 1);
  // red trim
  ctx.fillStyle = P.red;
  ctx.fillRect(0, 4, TILE, 2);
  ctx.fillRect(0, 24, TILE, 2);
  // body
  ctx.fillStyle = P.yellow;
  ctx.fillRect(0, 6, TILE, 18);
  // window frame
  ctx.fillStyle = P.chumpDeep;
  ctx.fillRect(5, 9, 24, 12);
  // window glass
  ctx.fillStyle = P.lightGrey;
  ctx.fillRect(7, 11, 20, 8);
  // TACOS text inside window (stylized as red blocks)
  ctx.fillStyle = P.red;
  ctx.fillRect(9, 13, 2, 4);
  ctx.fillRect(13, 13, 2, 4);
  ctx.fillRect(17, 13, 2, 4);
  ctx.fillRect(21, 13, 2, 4);
  // wheel
  ctx.fillStyle = P.black;
  ctx.fillRect(6, 26, 6, 5);
  ctx.fillStyle = P.lightGrey;
  ctx.fillRect(8, 28, 2, 2);
}

// Taco truck — right half (door + sign)
export function drawTacoTruckR(ctx) {
  // awning
  ctx.fillStyle = P.darkGreen;
  ctx.fillRect(0, 0, TILE, 4);
  ctx.fillStyle = P.green;
  ctx.fillRect(0, 2, TILE, 1);
  // red trim
  ctx.fillStyle = P.red;
  ctx.fillRect(0, 4, TILE, 2);
  ctx.fillRect(0, 24, TILE, 2);
  // body
  ctx.fillStyle = P.yellow;
  ctx.fillRect(0, 6, TILE, 18);
  // door
  ctx.fillStyle = P.chumpDeep;
  ctx.fillRect(3, 8, 11, 16);
  ctx.fillStyle = P.yellow;
  ctx.fillRect(11, 15, 1, 1);
  // sign
  ctx.fillStyle = P.green;
  ctx.fillRect(18, 9, 11, 11);
  ctx.fillStyle = P.white;
  ctx.fillRect(19, 11, 9, 2);
  ctx.fillRect(19, 15, 9, 2);
  // sign border
  ctx.fillStyle = P.darkGreen;
  ctx.fillRect(18, 9, 11, 1);
  ctx.fillRect(18, 19, 11, 1);
  // wheel
  ctx.fillStyle = P.black;
  ctx.fillRect(20, 26, 6, 5);
  ctx.fillStyle = P.lightGrey;
  ctx.fillRect(22, 28, 2, 2);
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

// =============================================================================
// W2 — The Market
// =============================================================================

// Cobblestone path — grey stones in offset pattern
export function drawCobble(ctx) {
  ctx.fillStyle = P.darkGrey;
  ctx.fillRect(0, 0, TILE, TILE);
  ctx.fillStyle = P.lightGrey;
  const stones = [
    [2,2,6,4], [10,2,7,4], [19,2,6,4], [27,2,3,4],
    [2,8,4,5], [8,8,8,5],  [18,8,6,5], [26,8,4,5],
    [2,15,7,5],[11,15,5,5],[18,15,7,5],[27,15,3,5],
    [2,22,5,5],[9,22,8,5], [19,22,6,5],[27,22,3,5],
  ];
  for (const [x, y, w, h] of stones) {
    ctx.fillRect(x, y, w, h);
  }
  ctx.fillStyle = P.black;
  ctx.globalAlpha = 0.3;
  for (const [x, y, w, h] of stones) {
    ctx.fillRect(x, y + h, w, 1);
  }
  ctx.globalAlpha = 1;
}

// Fruit stand — wooden cart with red awning and fruit pile
export function drawFruitStand(ctx) {
  drawCobble(ctx);
  // awning
  ctx.fillStyle = P.red;
  ctx.fillRect(0, 4, TILE, 4);
  ctx.fillStyle = P.white;
  for (let x = 1; x < TILE; x += 4) {
    ctx.fillRect(x, 4, 2, 4);
  }
  // cart body
  ctx.fillStyle = P.brown;
  ctx.fillRect(2, 12, 28, 15);
  ctx.fillStyle = P.chumpDeep;
  ctx.fillRect(2, 26, 28, 1);
  // fruit pile
  ctx.fillStyle = P.red;
  ctx.fillRect(4, 14, 4, 4);
  ctx.fillRect(9, 14, 4, 4);
  ctx.fillStyle = P.orange;
  ctx.fillRect(14, 14, 4, 4);
  ctx.fillRect(19, 14, 4, 4);
  ctx.fillStyle = P.yellow;
  ctx.fillRect(24, 14, 5, 4);
  // wheels
  ctx.fillStyle = P.black;
  ctx.fillRect(5, 27, 4, 4);
  ctx.fillRect(23, 27, 4, 4);
}

// Apple cart — red apples stacked
export function drawAppleCart(ctx) {
  drawCobble(ctx);
  ctx.fillStyle = P.brown;
  ctx.fillRect(2, 12, 28, 15);
  ctx.fillStyle = P.chumpDeep;
  ctx.fillRect(2, 26, 28, 1);
  ctx.fillStyle = P.red;
  for (let x = 4; x < 28; x += 4) {
    ctx.fillRect(x, 14, 3, 3);
    ctx.fillRect(x, 19, 3, 3);
  }
  ctx.fillStyle = P.darkGreen;
  for (let x = 4; x < 28; x += 4) {
    ctx.fillRect(x + 1, 13, 1, 1);
    ctx.fillRect(x + 1, 18, 1, 1);
  }
  // wheels
  ctx.fillStyle = P.black;
  ctx.fillRect(5, 27, 4, 4);
  ctx.fillRect(23, 27, 4, 4);
}

// Fish cart — grey body with blue fish and ice
export function drawFishCart(ctx) {
  drawCobble(ctx);
  ctx.fillStyle = P.lightGrey;
  ctx.fillRect(2, 10, 28, 17);
  ctx.fillStyle = P.darkGrey;
  ctx.fillRect(2, 10, 28, 1);
  ctx.fillRect(2, 26, 28, 1);
  // fish
  ctx.fillStyle = P.blue;
  ctx.fillRect(5, 14, 7, 3);
  ctx.fillRect(14, 14, 7, 3);
  ctx.fillRect(23, 14, 5, 3);
  ctx.fillStyle = P.white;
  ctx.fillRect(5, 14, 1, 1);
  ctx.fillRect(14, 14, 1, 1);
  ctx.fillRect(23, 14, 1, 1);
  // ice
  ctx.fillStyle = P.white;
  ctx.fillRect(4, 20, 3, 3);
  ctx.fillRect(10, 20, 3, 3);
  ctx.fillRect(18, 20, 3, 3);
  ctx.fillRect(25, 20, 3, 3);
  // wheels
  ctx.fillStyle = P.black;
  ctx.fillRect(5, 27, 4, 4);
  ctx.fillRect(23, 27, 4, 4);
}

// Bakery — single tile with roof, sign, window full of bread
export function drawBakery(ctx) {
  ctx.fillStyle = P.brown;
  ctx.fillRect(0, 0, TILE, TILE);
  // roof
  ctx.fillStyle = P.chumpDeep;
  ctx.fillRect(0, 0, TILE, 8);
  ctx.fillStyle = P.darkPurple;
  for (let x = 0; x < TILE; x += 4) ctx.fillRect(x, 2, 2, 1);
  // sign
  ctx.fillStyle = P.white;
  ctx.fillRect(4, 9, 24, 4);
  ctx.fillStyle = P.red;
  // "BAKE"
  ctx.fillRect(6, 10, 2, 2);
  ctx.fillRect(10, 10, 2, 2);
  ctx.fillRect(14, 10, 2, 2);
  ctx.fillRect(18, 10, 2, 2);
  ctx.fillRect(22, 10, 2, 2);
  // window
  ctx.fillStyle = P.black;
  ctx.fillRect(4, 15, 24, 14);
  ctx.fillStyle = P.orange;
  ctx.fillRect(6, 17, 7, 4);
  ctx.fillRect(18, 17, 7, 4);
  ctx.fillStyle = P.yellow;
  ctx.fillRect(6, 23, 7, 4);
  ctx.fillRect(18, 23, 7, 4);
  ctx.fillStyle = P.lightGrey;
  ctx.fillRect(4, 15, 24, 1);
  ctx.fillRect(4, 28, 24, 1);
  ctx.fillRect(4, 15, 1, 14);
  ctx.fillRect(27, 15, 1, 14);
}

// Restaurant — single tile with yellow sign and a door
export function drawRestaurant(ctx) {
  ctx.fillStyle = '#6b4000';
  ctx.fillRect(0, 0, TILE, TILE);
  ctx.fillStyle = P.darkPurple;
  ctx.fillRect(0, 0, TILE, 6);
  // sign
  ctx.fillStyle = P.yellow;
  ctx.fillRect(2, 7, 28, 4);
  ctx.fillStyle = P.red;
  ctx.fillRect(5, 8, 3, 2);
  ctx.fillRect(11, 8, 3, 2);
  ctx.fillRect(17, 8, 3, 2);
  ctx.fillRect(23, 8, 3, 2);
  // door
  ctx.fillStyle = P.black;
  ctx.fillRect(12, 14, 8, 14);
  ctx.fillStyle = P.yellow;
  ctx.fillRect(18, 20, 1, 1);
  // windows
  ctx.fillStyle = P.blue;
  ctx.fillRect(3, 14, 6, 8);
  ctx.fillRect(23, 14, 6, 8);
  ctx.fillStyle = P.white;
  ctx.fillRect(4, 15, 4, 1);
  ctx.fillRect(24, 15, 4, 1);
}

// Flower shop — pink facade, flower display
export function drawFlowerShop(ctx) {
  ctx.fillStyle = P.peach;
  ctx.fillRect(0, 0, TILE, TILE);
  ctx.fillStyle = P.darkGreen;
  ctx.fillRect(0, 0, TILE, 7);
  // sign
  ctx.fillStyle = P.white;
  ctx.fillRect(4, 8, 24, 3);
  ctx.fillStyle = P.pink;
  for (let i = 0; i < 6; i++) ctx.fillRect(5 + i * 4, 9, 2, 1);
  // window
  ctx.fillStyle = P.black;
  ctx.fillRect(4, 13, 24, 15);
  // flowers
  ctx.fillStyle = P.pink;
  ctx.fillRect(6, 17, 3, 3);
  ctx.fillRect(12, 17, 3, 3);
  ctx.fillRect(18, 17, 3, 3);
  ctx.fillRect(24, 17, 3, 3);
  ctx.fillStyle = P.yellow;
  ctx.fillRect(7, 18, 1, 1);
  ctx.fillRect(13, 18, 1, 1);
  ctx.fillRect(19, 18, 1, 1);
  ctx.fillRect(25, 18, 1, 1);
  ctx.fillStyle = P.darkGreen;
  for (let x = 6; x < 28; x += 6) {
    ctx.fillRect(x + 1, 20, 1, 4);
  }
}

// Fountain — stone basin with water and statue
export function drawFountain(ctx) {
  ctx.fillStyle = P.lightGrey;
  ctx.fillRect(0, 0, TILE, TILE);
  // water
  ctx.fillStyle = P.darkBlue;
  ctx.fillRect(4, 6, 24, 20);
  ctx.fillStyle = P.blue;
  ctx.fillRect(6, 8, 20, 2);
  ctx.fillRect(5, 22, 22, 2);
  ctx.fillStyle = P.white;
  ctx.globalAlpha = 0.6;
  ctx.fillRect(8, 8, 4, 1);
  ctx.fillRect(20, 22, 3, 1);
  ctx.globalAlpha = 1;
  // rim
  ctx.fillStyle = P.darkGrey;
  ctx.fillRect(3, 5, 26, 1);
  ctx.fillRect(3, 26, 26, 1);
  ctx.fillRect(3, 5, 1, 22);
  ctx.fillRect(28, 5, 1, 22);
  // statue
  ctx.fillStyle = P.lightGrey;
  ctx.fillRect(13, 10, 6, 14);
  ctx.fillStyle = P.white;
  ctx.fillRect(14, 12, 4, 2);
  ctx.fillStyle = P.blue;
  ctx.fillRect(15, 4, 2, 4);
}

// Clock tower — TOP (has the clock face, roof, spire)
export function drawClockTop(ctx) {
  ctx.fillStyle = '#4a2f14';
  ctx.fillRect(0, 8, TILE, TILE - 8);
  // brick lines
  ctx.fillStyle = '#2e1a06';
  for (let y = 12; y < TILE; y += 6) {
    ctx.fillRect(0, y, TILE, 1);
  }
  // spire
  ctx.fillStyle = P.darkPurple;
  ctx.fillRect(10, 2, 12, 6);
  ctx.fillRect(12, 0, 8, 2);
  // clock face
  ctx.fillStyle = P.white;
  ctx.fillRect(10, 14, 12, 12);
  ctx.fillStyle = P.black;
  ctx.fillRect(10, 14, 12, 1);
  ctx.fillRect(10, 25, 12, 1);
  ctx.fillRect(10, 14, 1, 12);
  ctx.fillRect(21, 14, 1, 12);
  // clock hands + dots
  ctx.fillRect(15, 16, 2, 2);
  ctx.fillRect(15, 22, 2, 2);
  ctx.fillRect(11, 19, 2, 2);
  ctx.fillRect(19, 19, 2, 2);
  ctx.fillRect(15, 19, 1, -4); // minute (up)
  ctx.fillRect(16, 20, 4, 1);  // hour (right)
}

// Clock tower — BASE (door, window)
export function drawClockBase(ctx) {
  ctx.fillStyle = '#4a2f14';
  ctx.fillRect(0, 0, TILE, TILE);
  ctx.fillStyle = '#2e1a06';
  for (let y = 4; y < TILE; y += 6) {
    ctx.fillRect(0, y, TILE, 1);
  }
  // window
  ctx.fillStyle = P.yellow;
  ctx.fillRect(12, 6, 8, 10);
  ctx.fillStyle = P.black;
  ctx.fillRect(15, 6, 2, 10);
  ctx.fillRect(12, 10, 8, 2);
  // door
  ctx.fillStyle = P.black;
  ctx.fillRect(12, 20, 8, 12);
  ctx.fillStyle = P.yellow;
  ctx.fillRect(18, 26, 1, 1);
}

// =============================================================================
// W3 — The Docks
// =============================================================================

// Water — dark blue with rolling highlights
export function drawWater(ctx) {
  ctx.fillStyle = P.darkBlue;
  ctx.fillRect(0, 0, TILE, TILE);
  // mid tone
  ctx.fillStyle = '#2c3f7a';
  ctx.fillRect(0, 6, TILE, 4);
  ctx.fillRect(0, 18, TILE, 4);
  ctx.fillRect(0, 27, TILE, 3);
  // highlights
  ctx.fillStyle = P.blue;
  ctx.fillRect(4, 7, 5, 1);
  ctx.fillRect(14, 8, 6, 1);
  ctx.fillRect(22, 7, 4, 1);
  ctx.fillRect(2, 19, 7, 1);
  ctx.fillRect(15, 20, 6, 1);
  ctx.fillRect(24, 19, 4, 1);
  // sparkles
  ctx.fillStyle = P.white;
  ctx.globalAlpha = 0.6;
  ctx.fillRect(6, 3, 1, 1);
  ctx.fillRect(18, 12, 1, 1);
  ctx.fillRect(26, 15, 1, 1);
  ctx.fillRect(10, 24, 1, 1);
  ctx.globalAlpha = 1;
}

// Pier — wood planks walkable
export function drawPier(ctx) {
  ctx.fillStyle = P.brown;
  ctx.fillRect(0, 0, TILE, TILE);
  // plank lines
  ctx.fillStyle = P.chumpDeep;
  ctx.fillRect(0, 7, TILE, 1);
  ctx.fillRect(0, 15, TILE, 1);
  ctx.fillRect(0, 23, TILE, 1);
  ctx.fillRect(0, 31, TILE, 1);
  // grain knots
  ctx.fillStyle = P.black;
  ctx.globalAlpha = 0.4;
  ctx.fillRect(5, 3, 2, 1);
  ctx.fillRect(20, 11, 2, 1);
  ctx.fillRect(12, 19, 2, 1);
  ctx.fillRect(26, 27, 2, 1);
  ctx.globalAlpha = 1;
  // highlight stripes
  ctx.fillStyle = '#c37040';
  ctx.fillRect(0, 2, TILE, 1);
  ctx.fillRect(0, 10, TILE, 1);
  ctx.fillRect(0, 18, TILE, 1);
  ctx.fillRect(0, 26, TILE, 1);
}

// Dock — stone harbor floor
export function drawDock(ctx) {
  ctx.fillStyle = '#5a6671';
  ctx.fillRect(0, 0, TILE, TILE);
  // stone block seams
  ctx.fillStyle = '#3d4a55';
  ctx.fillRect(0, 7, TILE, 1);
  ctx.fillRect(0, 16, TILE, 1);
  ctx.fillRect(0, 24, TILE, 1);
  ctx.fillRect(7, 0, 1, 8);
  ctx.fillRect(16, 8, 1, 9);
  ctx.fillRect(5, 17, 1, 8);
  ctx.fillRect(22, 17, 1, 8);
  ctx.fillRect(12, 25, 1, 7);
  // lighter highlights
  ctx.fillStyle = '#707c87';
  ctx.fillRect(2, 2, 3, 2);
  ctx.fillRect(18, 3, 4, 2);
  ctx.fillRect(8, 10, 4, 2);
  ctx.fillRect(24, 18, 3, 2);
  ctx.fillRect(14, 27, 4, 2);
}

// Boat — brown hull with a small cabin and mast
export function drawBoat(ctx) {
  drawWater(ctx);
  // hull
  ctx.fillStyle = P.brown;
  ctx.fillRect(2, 18, 28, 10);
  ctx.fillStyle = P.chumpDeep;
  ctx.fillRect(2, 18, 28, 1);
  ctx.fillRect(2, 27, 28, 1);
  // hull curve
  ctx.fillStyle = P.brown;
  ctx.fillRect(4, 28, 24, 1);
  ctx.fillRect(6, 29, 20, 1);
  // cabin
  ctx.fillStyle = P.red;
  ctx.fillRect(10, 10, 12, 8);
  ctx.fillStyle = P.white;
  ctx.fillRect(12, 12, 3, 3);
  ctx.fillRect(17, 12, 3, 3);
  // mast
  ctx.fillStyle = P.chumpDeep;
  ctx.fillRect(15, 2, 2, 8);
  // sail
  ctx.fillStyle = P.white;
  ctx.fillRect(17, 3, 8, 6);
  ctx.fillStyle = P.lightGrey;
  ctx.fillRect(17, 3, 1, 6);
}

// Warehouse — big grey metal building with door and window
export function drawWarehouse(ctx) {
  ctx.fillStyle = '#5c5450';
  ctx.fillRect(0, 0, TILE, TILE);
  // roof
  ctx.fillStyle = P.darkGrey;
  ctx.fillRect(0, 0, TILE, 6);
  ctx.fillStyle = P.lightGrey;
  ctx.fillRect(0, 4, TILE, 1);
  // side panels
  ctx.fillStyle = '#464039';
  for (let x = 3; x < TILE; x += 6) {
    ctx.fillRect(x, 6, 1, TILE - 6);
  }
  // window
  ctx.fillStyle = P.lightGrey;
  ctx.fillRect(4, 10, 10, 6);
  ctx.fillStyle = P.black;
  ctx.fillRect(8, 10, 1, 6);
  ctx.fillRect(4, 12, 10, 1);
  // door
  ctx.fillStyle = P.black;
  ctx.fillRect(18, 14, 10, 16);
  ctx.fillStyle = P.yellow;
  ctx.fillRect(26, 22, 1, 1);
}

// Fish Market — stall with striped awning and fish in it
export function drawFishMarket(ctx) {
  ctx.fillStyle = '#8b6f47';
  ctx.fillRect(0, 0, TILE, TILE);
  // awning
  ctx.fillStyle = P.blue;
  ctx.fillRect(0, 0, TILE, 6);
  ctx.fillStyle = P.white;
  for (let x = 0; x < TILE; x += 6) {
    ctx.fillRect(x, 0, 3, 6);
  }
  // sign
  ctx.fillStyle = P.white;
  ctx.fillRect(4, 8, 24, 3);
  ctx.fillStyle = P.blue;
  ctx.fillRect(6, 9, 2, 1);
  ctx.fillRect(10, 9, 2, 1);
  ctx.fillRect(14, 9, 2, 1);
  ctx.fillRect(18, 9, 2, 1);
  ctx.fillRect(22, 9, 2, 1);
  // display
  ctx.fillStyle = P.lightGrey;
  ctx.fillRect(3, 14, 26, 14);
  // fish on ice
  ctx.fillStyle = P.blue;
  ctx.fillRect(5, 17, 7, 3);
  ctx.fillRect(14, 17, 7, 3);
  ctx.fillRect(22, 17, 5, 3);
  ctx.fillStyle = P.white;
  ctx.fillRect(5, 17, 1, 1);
  ctx.fillRect(14, 17, 1, 1);
  ctx.fillRect(22, 17, 1, 1);
  // more fish
  ctx.fillStyle = '#3a4a7e';
  ctx.fillRect(5, 22, 6, 3);
  ctx.fillRect(13, 22, 7, 3);
  ctx.fillRect(22, 22, 5, 3);
}

// Lighthouse TOP — red and white with the light room
export function drawLighthouseTop(ctx) {
  // sky behind
  ctx.fillStyle = P.darkBlue;
  ctx.fillRect(0, 0, TILE, 4);
  // cap
  ctx.fillStyle = P.red;
  ctx.fillRect(8, 2, 16, 4);
  ctx.fillStyle = P.chumpDeep;
  ctx.fillRect(10, 0, 12, 3);
  // light room
  ctx.fillStyle = P.yellow;
  ctx.fillRect(10, 6, 12, 8);
  ctx.fillStyle = P.white;
  ctx.fillRect(12, 8, 8, 4);
  ctx.fillStyle = P.lightGrey;
  ctx.fillRect(10, 14, 12, 2);
  // stone body start
  ctx.fillStyle = P.white;
  ctx.fillRect(6, 16, 20, 8);
  ctx.fillStyle = P.red;
  ctx.fillRect(6, 20, 20, 4);
  // railing
  ctx.fillStyle = P.darkGrey;
  ctx.fillRect(6, 15, 20, 1);
  ctx.fillRect(8, 28, 16, 4);
}

// Lighthouse BASE — stone body
export function drawLighthouseBase(ctx) {
  ctx.fillStyle = P.white;
  ctx.fillRect(6, 0, 20, TILE);
  ctx.fillStyle = P.red;
  ctx.fillRect(6, 8, 20, 4);
  ctx.fillRect(6, 20, 20, 4);
  // stone seams
  ctx.fillStyle = P.lightGrey;
  ctx.fillRect(6, 0, 20, 1);
  ctx.fillRect(6, 16, 20, 1);
  ctx.fillRect(6, 28, 20, 1);
  ctx.fillStyle = P.darkGrey;
  ctx.fillRect(6, 0, 1, TILE);
  ctx.fillRect(25, 0, 1, TILE);
  // door
  ctx.fillStyle = P.black;
  ctx.fillRect(13, 24, 6, 8);
  // background water
  ctx.fillStyle = P.darkBlue;
  ctx.fillRect(0, 0, 6, TILE);
  ctx.fillRect(26, 0, 6, TILE);
}

// Cargo — wooden crate with stamps
export function drawCargo(ctx) {
  drawDock(ctx);
  ctx.fillStyle = P.brown;
  ctx.fillRect(2, 2, 28, 28);
  ctx.fillStyle = P.chumpDeep;
  ctx.fillRect(2, 2, 28, 1);
  ctx.fillRect(2, 29, 28, 1);
  ctx.fillRect(2, 2, 1, 28);
  ctx.fillRect(29, 2, 1, 28);
  // planks
  ctx.fillStyle = P.chumpDeep;
  ctx.fillRect(2, 10, 28, 1);
  ctx.fillRect(2, 18, 28, 1);
  // stamps
  ctx.fillStyle = P.red;
  ctx.fillRect(6, 5, 4, 4);
  ctx.fillRect(20, 22, 4, 4);
  // rope handle
  ctx.fillStyle = P.yellow;
  ctx.fillRect(12, 14, 8, 1);
}

// Net Stack — pile of fishing nets
export function drawNetStack(ctx) {
  drawDock(ctx);
  // rope pile
  ctx.fillStyle = '#9c7a3a';
  ctx.fillRect(3, 14, 26, 14);
  ctx.fillRect(5, 10, 22, 14);
  ctx.fillRect(8, 6, 16, 12);
  // net mesh pattern
  ctx.fillStyle = P.chumpDeep;
  for (let y = 8; y < 28; y += 4) {
    ctx.fillRect(5, y, 22, 1);
  }
  for (let x = 6; x < 28; x += 4) {
    ctx.fillRect(x, 8, 1, 20);
  }
  // floats
  ctx.fillStyle = P.red;
  ctx.fillRect(8, 9, 3, 3);
  ctx.fillRect(18, 7, 3, 3);
  ctx.fillRect(23, 12, 3, 3);
}

// Crane — metal tower with arm and hook
export function drawCrane(ctx) {
  drawDock(ctx);
  // base
  ctx.fillStyle = P.yellow;
  ctx.fillRect(10, 20, 12, 12);
  ctx.fillStyle = P.darkGrey;
  ctx.fillRect(10, 20, 12, 2);
  ctx.fillRect(10, 30, 12, 2);
  // tower
  ctx.fillStyle = P.yellow;
  ctx.fillRect(12, 4, 8, 16);
  // cross bracing
  ctx.fillStyle = P.chumpDeep;
  ctx.fillRect(12, 8, 8, 1);
  ctx.fillRect(12, 12, 8, 1);
  ctx.fillRect(12, 16, 8, 1);
  // arm
  ctx.fillStyle = P.yellow;
  ctx.fillRect(18, 4, 14, 3);
  ctx.fillStyle = P.chumpDeep;
  ctx.fillRect(18, 4, 14, 1);
  // hook line
  ctx.fillStyle = P.darkGrey;
  ctx.fillRect(28, 7, 1, 10);
  ctx.fillStyle = P.lightGrey;
  ctx.fillRect(27, 16, 3, 3);
}

// =============================================================================
// W4 — Castle Town
// =============================================================================

// Castle wall — grey stone with battlement crenellations on the top
export function drawCastleWall(ctx) {
  ctx.fillStyle = '#6e6a5e';
  ctx.fillRect(0, 0, TILE, TILE);
  // seams
  ctx.fillStyle = '#4a4638';
  ctx.fillRect(0, 8, TILE, 1);
  ctx.fillRect(0, 16, TILE, 1);
  ctx.fillRect(0, 24, TILE, 1);
  ctx.fillRect(8, 0, 1, 8);
  ctx.fillRect(16, 8, 1, 8);
  ctx.fillRect(24, 0, 1, 8);
  ctx.fillRect(4, 17, 1, 7);
  ctx.fillRect(20, 17, 1, 7);
  ctx.fillRect(12, 25, 1, 7);
  // highlights
  ctx.fillStyle = '#8a8578';
  ctx.fillRect(2, 2, 4, 2);
  ctx.fillRect(18, 10, 4, 2);
  ctx.fillRect(10, 18, 4, 2);
  ctx.fillRect(22, 26, 4, 2);
  // moss
  ctx.fillStyle = P.darkGreen;
  ctx.globalAlpha = 0.4;
  ctx.fillRect(6, 28, 3, 2);
  ctx.fillRect(20, 30, 4, 1);
  ctx.globalAlpha = 1;
}

// Castle floor — lighter interior stone
export function drawCastleFloor(ctx) {
  ctx.fillStyle = '#8a8578';
  ctx.fillRect(0, 0, TILE, TILE);
  // tile seams
  ctx.fillStyle = '#5f574f';
  ctx.fillRect(0, 15, TILE, 1);
  ctx.fillRect(15, 0, 1, TILE);
  // highlights in each quadrant
  ctx.fillStyle = '#a39d8d';
  ctx.fillRect(3, 3, 3, 3);
  ctx.fillRect(19, 3, 3, 3);
  ctx.fillRect(3, 19, 3, 3);
  ctx.fillRect(19, 19, 3, 3);
}

// Throne — gold and red cushion
export function drawThrone(ctx) {
  drawCastleFloor(ctx);
  // throne back
  ctx.fillStyle = P.yellow;
  ctx.fillRect(8, 4, 16, 18);
  ctx.fillStyle = '#c4a530';
  ctx.fillRect(8, 4, 16, 2);
  ctx.fillRect(8, 20, 16, 2);
  ctx.fillRect(8, 4, 2, 18);
  ctx.fillRect(22, 4, 2, 18);
  // cushion
  ctx.fillStyle = P.red;
  ctx.fillRect(10, 14, 12, 6);
  // crown-ish top
  ctx.fillStyle = P.yellow;
  ctx.fillRect(10, 1, 2, 4);
  ctx.fillRect(14, 1, 2, 4);
  ctx.fillRect(18, 1, 2, 4);
  ctx.fillRect(22, 1, 2, 4);
  ctx.fillStyle = P.red;
  ctx.fillRect(11, 2, 1, 1);
  ctx.fillRect(15, 2, 1, 1);
  ctx.fillRect(19, 2, 1, 1);
  // legs
  ctx.fillStyle = '#c4a530';
  ctx.fillRect(9, 22, 2, 8);
  ctx.fillRect(21, 22, 2, 8);
}

// Crown Room — velvet display with a gold crown
export function drawCrownRoom(ctx) {
  drawCastleFloor(ctx);
  // velvet pedestal
  ctx.fillStyle = P.darkPurple;
  ctx.fillRect(6, 14, 20, 16);
  ctx.fillStyle = P.red;
  ctx.fillRect(6, 14, 20, 2);
  // display case frame
  ctx.fillStyle = '#c4a530';
  ctx.fillRect(8, 6, 16, 10);
  ctx.fillStyle = P.darkBlue;
  ctx.fillRect(10, 8, 12, 6);
  // crown
  ctx.fillStyle = P.yellow;
  ctx.fillRect(12, 10, 2, 3);
  ctx.fillRect(15, 10, 2, 3);
  ctx.fillRect(18, 10, 2, 3);
  ctx.fillRect(11, 12, 10, 2);
  ctx.fillStyle = P.red;
  ctx.fillRect(15, 11, 1, 1);
  ctx.fillStyle = P.blue;
  ctx.fillRect(13, 12, 1, 1);
  ctx.fillRect(19, 12, 1, 1);
  // base shadow
  ctx.fillStyle = P.black;
  ctx.fillRect(6, 30, 20, 1);
}

// Kitchen — wooden stove + pots
export function drawKitchen(ctx) {
  drawCastleFloor(ctx);
  // stove
  ctx.fillStyle = '#2a2418';
  ctx.fillRect(4, 12, 24, 18);
  ctx.fillStyle = '#4a4028';
  ctx.fillRect(4, 12, 24, 2);
  // burner glow
  ctx.fillStyle = P.red;
  ctx.fillRect(8, 16, 6, 4);
  ctx.fillStyle = P.yellow;
  ctx.fillRect(9, 17, 4, 2);
  // pot on burner
  ctx.fillStyle = P.darkGrey;
  ctx.fillRect(18, 14, 8, 6);
  ctx.fillStyle = P.lightGrey;
  ctx.fillRect(17, 13, 10, 1);
  // steam
  ctx.fillStyle = P.white;
  ctx.globalAlpha = 0.5;
  ctx.fillRect(20, 9, 1, 3);
  ctx.fillRect(22, 7, 1, 4);
  ctx.globalAlpha = 1;
  // shelf above
  ctx.fillStyle = P.brown;
  ctx.fillRect(4, 5, 24, 2);
  ctx.fillStyle = P.red;
  ctx.fillRect(8, 2, 2, 3);
  ctx.fillRect(14, 2, 2, 3);
  ctx.fillRect(20, 2, 2, 3);
}

// Armory — weapon rack
export function drawArmory(ctx) {
  drawCastleFloor(ctx);
  // rack
  ctx.fillStyle = P.brown;
  ctx.fillRect(4, 8, 24, 20);
  ctx.fillStyle = P.chumpDeep;
  ctx.fillRect(4, 8, 24, 1);
  ctx.fillRect(4, 27, 24, 1);
  // weapons
  ctx.fillStyle = P.lightGrey;
  // sword
  ctx.fillRect(7, 10, 2, 14);
  ctx.fillRect(6, 10, 4, 2);
  ctx.fillStyle = P.yellow;
  ctx.fillRect(7, 22, 2, 2);
  // spear
  ctx.fillStyle = P.lightGrey;
  ctx.fillRect(14, 9, 1, 16);
  ctx.fillStyle = P.darkGrey;
  ctx.fillRect(13, 9, 3, 3);
  // shield
  ctx.fillStyle = P.red;
  ctx.fillRect(19, 12, 8, 10);
  ctx.fillStyle = P.yellow;
  ctx.fillRect(22, 14, 2, 6);
  ctx.fillRect(20, 16, 6, 2);
}

// Inn — wooden building with sign
export function drawInn(ctx) {
  ctx.fillStyle = '#8b6f47';
  ctx.fillRect(0, 0, TILE, TILE);
  // thatched roof
  ctx.fillStyle = P.chumpDeep;
  ctx.fillRect(0, 0, TILE, 7);
  ctx.fillStyle = P.brown;
  for (let x = 0; x < TILE; x += 4) {
    ctx.fillRect(x, 2, 2, 5);
  }
  // sign
  ctx.fillStyle = P.white;
  ctx.fillRect(4, 9, 24, 4);
  ctx.fillStyle = P.red;
  ctx.fillRect(6, 10, 3, 2);
  ctx.fillRect(11, 10, 3, 2);
  ctx.fillRect(16, 10, 3, 2);
  ctx.fillRect(21, 10, 3, 2);
  // windows
  ctx.fillStyle = P.yellow;
  ctx.fillRect(4, 16, 6, 6);
  ctx.fillRect(22, 16, 6, 6);
  ctx.fillStyle = P.black;
  ctx.fillRect(6, 16, 1, 6);
  ctx.fillRect(24, 16, 1, 6);
  // door
  ctx.fillStyle = P.chumpDeep;
  ctx.fillRect(13, 16, 6, 14);
  ctx.fillStyle = P.yellow;
  ctx.fillRect(17, 22, 1, 1);
}

// Village house — thatched hut
export function drawVillageHouse(ctx) {
  ctx.fillStyle = '#6b4000';
  ctx.fillRect(0, 8, TILE, TILE - 8);
  // roof
  ctx.fillStyle = '#c19050';
  ctx.fillRect(0, 0, TILE, 10);
  for (let x = 0; x < TILE; x += 3) {
    ctx.fillStyle = (x / 3) % 2 === 0 ? '#a57840' : '#c19050';
    ctx.fillRect(x, 2, 2, 8);
  }
  // door
  ctx.fillStyle = P.black;
  ctx.fillRect(12, 16, 8, 14);
  ctx.fillStyle = P.yellow;
  ctx.fillRect(18, 22, 1, 1);
  // windows
  ctx.fillStyle = P.yellow;
  ctx.fillRect(4, 14, 4, 4);
  ctx.fillRect(24, 14, 4, 4);
  ctx.fillStyle = P.black;
  ctx.fillRect(6, 14, 1, 4);
  ctx.fillRect(26, 14, 1, 4);
}

// Catapult — wooden frame with arm and counterweight
export function drawCatapult(ctx) {
  ctx.fillStyle = P.darkGreen;
  ctx.fillRect(0, 20, TILE, 12);
  // base frame
  ctx.fillStyle = P.brown;
  ctx.fillRect(4, 18, 24, 12);
  ctx.fillStyle = P.chumpDeep;
  ctx.fillRect(4, 18, 24, 1);
  ctx.fillRect(4, 29, 24, 1);
  // arm
  ctx.fillStyle = P.brown;
  ctx.fillRect(6, 4, 20, 3);
  ctx.fillStyle = P.chumpDeep;
  ctx.fillRect(6, 4, 20, 1);
  // bucket / sling with payload
  ctx.fillStyle = P.yellow;
  ctx.fillRect(22, 2, 6, 4);
  ctx.fillStyle = P.orange;
  ctx.fillRect(23, 3, 4, 2);
  // rope
  ctx.fillStyle = P.chumpDeep;
  ctx.fillRect(14, 7, 1, 12);
  // wheels
  ctx.fillStyle = P.black;
  ctx.fillRect(6, 27, 5, 5);
  ctx.fillRect(21, 27, 5, 5);
  ctx.fillStyle = P.lightGrey;
  ctx.fillRect(8, 29, 1, 1);
  ctx.fillRect(23, 29, 1, 1);
}

// ---------------------------------------------------------------------------
// W5 Volcano tiles
// ---------------------------------------------------------------------------

// Ash ground — dark charcoal with scattered embers and soot flecks.
export function drawAsh(ctx) {
  ctx.fillStyle = '#1a1410';
  ctx.fillRect(0, 0, TILE, TILE);
  // ash streaks
  ctx.fillStyle = '#2a2018';
  const streaks = [[2, 4], [10, 7], [18, 3], [24, 14], [6, 22], [14, 26], [22, 20], [28, 9]];
  for (const [x, y] of streaks) {
    ctx.fillRect(x, y, 4, 1);
    ctx.fillRect(x + 1, y + 1, 3, 1);
  }
  // embers
  ctx.fillStyle = P.chumpOrange;
  ctx.fillRect(5, 18, 1, 1);
  ctx.fillRect(19, 11, 1, 1);
  ctx.fillRect(26, 25, 1, 1);
  ctx.fillStyle = P.yellow;
  ctx.fillRect(19, 11, 1, 0.5);
  // subtle grid border
  ctx.fillStyle = '#0c0806';
  ctx.fillRect(0, 0, TILE, 1);
  ctx.fillRect(0, TILE - 1, TILE, 1);
}

// Obsidian — polished black stone path with blue/purple highlights.
export function drawObsidian(ctx) {
  ctx.fillStyle = '#0a0612';
  ctx.fillRect(0, 0, TILE, TILE);
  ctx.fillStyle = '#1a0e24';
  ctx.fillRect(2, 2, TILE - 4, TILE - 4);
  // reflective highlights
  ctx.fillStyle = P.lavender;
  ctx.globalAlpha = 0.5;
  ctx.fillRect(6, 5, 6, 1);
  ctx.fillRect(18, 9, 8, 1);
  ctx.fillRect(4, 18, 10, 1);
  ctx.fillRect(20, 22, 6, 1);
  ctx.globalAlpha = 1;
  // fracture lines
  ctx.fillStyle = '#2a1638';
  ctx.fillRect(14, 6, 1, 18);
  ctx.fillRect(8, 14, 14, 1);
}

// Lava — bright orange pool with brighter yellow veins. Solid for player.
export function drawLava(ctx) {
  ctx.fillStyle = '#c43100';
  ctx.fillRect(0, 0, TILE, TILE);
  // heat veins
  ctx.fillStyle = P.chumpOrange;
  ctx.fillRect(0, 4, TILE, 3);
  ctx.fillRect(0, 14, TILE, 3);
  ctx.fillRect(0, 24, TILE, 3);
  // bright yellow hot spots
  ctx.fillStyle = P.yellow;
  ctx.fillRect(4, 5, 6, 1);
  ctx.fillRect(16, 5, 4, 1);
  ctx.fillRect(10, 15, 8, 1);
  ctx.fillRect(22, 15, 4, 1);
  ctx.fillRect(6, 25, 10, 1);
  // cooled-crust darker patches floating in it
  ctx.fillStyle = '#5a1500';
  ctx.fillRect(2, 10, 4, 2);
  ctx.fillRect(22, 20, 5, 2);
  ctx.fillRect(14, 2, 3, 1);
}

// Magma rock — solid dark charcoal wall with glowing cracks.
export function drawMagmaRock(ctx) {
  ctx.fillStyle = '#2a1a10';
  ctx.fillRect(0, 0, TILE, TILE);
  ctx.fillStyle = '#3a241a';
  ctx.fillRect(0, 0, TILE, 2);
  ctx.fillRect(0, TILE - 2, TILE, 2);
  // cracks with lava glow inside
  ctx.fillStyle = P.chumpOrange;
  ctx.fillRect(4, 8, 10, 1);
  ctx.fillRect(14, 9, 1, 4);
  ctx.fillRect(20, 18, 8, 1);
  ctx.fillRect(6, 22, 1, 6);
  ctx.fillStyle = P.yellow;
  ctx.fillRect(8, 8, 2, 1);
  ctx.fillRect(22, 18, 2, 1);
  // chunky outline
  ctx.fillStyle = '#0a0605';
  ctx.fillRect(0, 0, 1, TILE);
  ctx.fillRect(TILE - 1, 0, 1, TILE);
}

// Volcano peak — smoking cone silhouette.
export function drawVolcanoPeak(ctx) {
  // sky backdrop
  ctx.fillStyle = '#251408';
  ctx.fillRect(0, 0, TILE, TILE);
  // mountain slope
  ctx.fillStyle = '#2a1a10';
  ctx.fillRect(0, 14, TILE, 18);
  // jagged top
  ctx.fillStyle = '#2a1a10';
  ctx.beginPath();
  ctx.moveTo(0, 16);
  ctx.lineTo(6, 6);
  ctx.lineTo(12, 10);
  ctx.lineTo(18, 4);
  ctx.lineTo(24, 8);
  ctx.lineTo(TILE, 14);
  ctx.lineTo(TILE, TILE);
  ctx.lineTo(0, TILE);
  ctx.closePath();
  ctx.fill();
  // lava glow at the crater
  ctx.fillStyle = P.chumpOrange;
  ctx.fillRect(14, 6, 4, 2);
  ctx.fillStyle = P.yellow;
  ctx.fillRect(15, 6, 2, 1);
  // smoke puffs
  ctx.fillStyle = P.lightGrey;
  ctx.globalAlpha = 0.7;
  ctx.fillRect(14, 2, 4, 2);
  ctx.fillRect(18, 1, 3, 2);
  ctx.fillRect(12, 0, 2, 2);
  ctx.globalAlpha = 1;
}

// Stone hut — small villager shelter with thatched roof and glowing door.
export function drawStoneHut(ctx) {
  drawAsh(ctx);
  // hut body
  ctx.fillStyle = P.darkGrey;
  ctx.fillRect(3, 12, 26, 18);
  ctx.fillStyle = '#3a342c';
  ctx.fillRect(3, 12, 26, 2);
  // stones
  ctx.fillStyle = '#2a241c';
  ctx.fillRect(5, 16, 4, 2);
  ctx.fillRect(12, 16, 5, 2);
  ctx.fillRect(20, 16, 4, 2);
  ctx.fillRect(8, 20, 5, 2);
  ctx.fillRect(15, 20, 4, 2);
  ctx.fillRect(22, 20, 4, 2);
  // thatched roof
  ctx.fillStyle = '#6b4000';
  ctx.fillRect(1, 4, 30, 10);
  ctx.fillStyle = '#4a2b00';
  for (let x = 1; x < 31; x += 3) {
    ctx.fillRect(x, 6, 1, 7);
  }
  // glowing door
  ctx.fillStyle = P.black;
  ctx.fillRect(13, 20, 6, 10);
  ctx.fillStyle = P.chumpOrange;
  ctx.fillRect(14, 22, 4, 1);
  ctx.fillRect(14, 26, 4, 1);
  ctx.fillStyle = P.yellow;
  ctx.fillRect(15, 22, 2, 1);
}

// Shrine — offering altar with floating ember/skull offering.
export function drawShrine(ctx) {
  drawAsh(ctx);
  // pedestal
  ctx.fillStyle = '#4a4238';
  ctx.fillRect(6, 18, 20, 12);
  ctx.fillStyle = '#2a241c';
  ctx.fillRect(6, 18, 20, 1);
  ctx.fillRect(6, 29, 20, 1);
  // stepped tiers
  ctx.fillStyle = '#3a342c';
  ctx.fillRect(4, 22, 2, 8);
  ctx.fillRect(26, 22, 2, 8);
  // bowl on top
  ctx.fillStyle = P.chumpDeep;
  ctx.fillRect(10, 12, 12, 6);
  ctx.fillStyle = P.chumpOrange;
  ctx.fillRect(11, 13, 10, 3);
  ctx.fillStyle = P.yellow;
  ctx.fillRect(13, 13, 2, 1);
  ctx.fillRect(17, 14, 3, 1);
  // flame tongue
  ctx.fillStyle = P.chumpOrange;
  ctx.fillRect(14, 8, 4, 4);
  ctx.fillStyle = P.yellow;
  ctx.fillRect(15, 9, 2, 2);
  // carvings
  ctx.fillStyle = P.yellow;
  ctx.fillRect(10, 22, 1, 4);
  ctx.fillRect(21, 22, 1, 4);
  ctx.fillRect(15, 24, 2, 2);
}

// Cauldron — round bubbling lava pot over a small fire.
export function drawCauldron(ctx) {
  drawAsh(ctx);
  // legs
  ctx.fillStyle = P.darkGrey;
  ctx.fillRect(6, 24, 3, 6);
  ctx.fillRect(23, 24, 3, 6);
  ctx.fillRect(14, 26, 4, 4);
  // fire under
  ctx.fillStyle = P.chumpOrange;
  ctx.fillRect(10, 26, 12, 4);
  ctx.fillStyle = P.yellow;
  ctx.fillRect(12, 27, 8, 2);
  // pot body
  ctx.fillStyle = '#1a0e08';
  ctx.fillRect(4, 12, 24, 14);
  ctx.fillStyle = P.darkGrey;
  ctx.fillRect(4, 12, 24, 2);
  // lava inside
  ctx.fillStyle = P.chumpOrange;
  ctx.fillRect(5, 11, 22, 3);
  ctx.fillStyle = P.yellow;
  ctx.fillRect(9, 11, 3, 1);
  ctx.fillRect(18, 11, 4, 1);
  // bubble
  ctx.fillStyle = P.yellow;
  ctx.fillRect(14, 7, 3, 3);
  ctx.fillStyle = P.chumpOrange;
  ctx.fillRect(15, 8, 1, 1);
}

// Crystal cluster — jagged glowing purple/blue shards.
export function drawCrystal(ctx) {
  drawObsidian(ctx);
  // shard bases
  ctx.fillStyle = P.darkPurple;
  ctx.fillRect(6, 18, 20, 12);
  // shard 1 tall
  ctx.fillStyle = P.lavender;
  ctx.beginPath();
  ctx.moveTo(10, 22);
  ctx.lineTo(13, 4);
  ctx.lineTo(16, 22);
  ctx.closePath();
  ctx.fill();
  // shard 2 medium
  ctx.fillStyle = P.blue;
  ctx.beginPath();
  ctx.moveTo(16, 24);
  ctx.lineTo(20, 10);
  ctx.lineTo(24, 24);
  ctx.closePath();
  ctx.fill();
  // shard 3 small
  ctx.fillStyle = P.pink;
  ctx.beginPath();
  ctx.moveTo(4, 26);
  ctx.lineTo(7, 16);
  ctx.lineTo(10, 26);
  ctx.closePath();
  ctx.fill();
  // highlights
  ctx.fillStyle = P.white;
  ctx.fillRect(12, 10, 1, 6);
  ctx.fillRect(19, 14, 1, 4);
  ctx.fillRect(6, 19, 1, 4);
}

// Lookout tower — stone pillar with a torch on top.
export function drawLookout(ctx) {
  drawObsidian(ctx);
  // stone shaft
  ctx.fillStyle = P.darkGrey;
  ctx.fillRect(8, 4, 16, 26);
  ctx.fillStyle = '#3a342c';
  ctx.fillRect(8, 4, 16, 2);
  ctx.fillRect(8, 14, 16, 2);
  // window
  ctx.fillStyle = P.yellow;
  ctx.fillRect(13, 9, 6, 4);
  ctx.fillStyle = P.black;
  ctx.fillRect(15, 9, 2, 4);
  // crenellations
  ctx.fillStyle = P.darkGrey;
  ctx.fillRect(6, 2, 4, 4);
  ctx.fillRect(12, 2, 3, 4);
  ctx.fillRect(17, 2, 3, 4);
  ctx.fillRect(22, 2, 4, 4);
  // torch
  ctx.fillStyle = P.chumpOrange;
  ctx.fillRect(14, 0, 4, 3);
  ctx.fillStyle = P.yellow;
  ctx.fillRect(15, 1, 2, 1);
  // door at base
  ctx.fillStyle = P.chumpDeep;
  ctx.fillRect(13, 22, 6, 8);
  ctx.fillStyle = P.yellow;
  ctx.fillRect(17, 26, 1, 1);
}

// Magma forge — anvil + furnace glowing orange.
export function drawForge(ctx) {
  drawAsh(ctx);
  // furnace hood
  ctx.fillStyle = P.darkGrey;
  ctx.fillRect(2, 2, 16, 18);
  ctx.fillStyle = '#2a241c';
  ctx.fillRect(2, 2, 16, 2);
  // fire mouth
  ctx.fillStyle = P.black;
  ctx.fillRect(4, 10, 12, 10);
  ctx.fillStyle = P.chumpOrange;
  ctx.fillRect(5, 12, 10, 8);
  ctx.fillStyle = P.yellow;
  ctx.fillRect(7, 14, 6, 4);
  // chimney
  ctx.fillStyle = P.darkGrey;
  ctx.fillRect(8, 0, 4, 4);
  ctx.fillStyle = P.lightGrey;
  ctx.globalAlpha = 0.6;
  ctx.fillRect(7, 0, 2, 2);
  ctx.globalAlpha = 1;
  // anvil to the right
  ctx.fillStyle = '#1a1410';
  ctx.fillRect(20, 18, 10, 6);
  ctx.fillRect(22, 24, 6, 6);
  // anvil horn
  ctx.fillStyle = '#0a0806';
  ctx.fillRect(28, 16, 3, 3);
  // hammer leaning
  ctx.fillStyle = P.brown;
  ctx.fillRect(25, 10, 1, 8);
  ctx.fillStyle = P.darkGrey;
  ctx.fillRect(22, 8, 6, 3);
}

