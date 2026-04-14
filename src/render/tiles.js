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
