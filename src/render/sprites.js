// Procedural character sprites. Each function draws one frame at (0,0).
// Player sprites are 16x16, rendered into a 32x32 tile centered (+8 offset).

import { P } from './palette.js';

// --- Player (pixel farmer) ---

function playerBody(ctx, legFrame) {
  // hat brim
  ctx.fillStyle = P.chumpDeep;
  ctx.fillRect(3, 3, 10, 1);
  // hat top (straw)
  ctx.fillStyle = P.yellow;
  ctx.fillRect(5, 1, 6, 2);
  ctx.fillRect(4, 2, 8, 1);
  // hat band
  ctx.fillStyle = P.red;
  ctx.fillRect(4, 3, 8, 1);
  // face
  ctx.fillStyle = P.peach;
  ctx.fillRect(5, 4, 6, 3);
  // body (overalls)
  ctx.fillStyle = P.darkBlue;
  ctx.fillRect(4, 7, 8, 5);
  // overall straps
  ctx.fillStyle = P.blue;
  ctx.fillRect(5, 7, 1, 3);
  ctx.fillRect(10, 7, 1, 3);
  // arms (shirt)
  ctx.fillStyle = P.red;
  ctx.fillRect(3, 7, 1, 3);
  ctx.fillRect(12, 7, 1, 3);
  // hands
  ctx.fillStyle = P.peach;
  ctx.fillRect(3, 10, 1, 1);
  ctx.fillRect(12, 10, 1, 1);
  // legs (vary with frame for walk bob)
  ctx.fillStyle = P.brown;
  if (legFrame === 0) {
    ctx.fillRect(5, 12, 2, 3);
    ctx.fillRect(9, 12, 2, 3);
  } else {
    ctx.fillRect(4, 12, 2, 3);
    ctx.fillRect(10, 12, 2, 3);
  }
  // boots
  ctx.fillStyle = P.black;
  if (legFrame === 0) {
    ctx.fillRect(5, 15, 2, 1);
    ctx.fillRect(9, 15, 2, 1);
  } else {
    ctx.fillRect(4, 15, 2, 1);
    ctx.fillRect(10, 15, 2, 1);
  }
}

function drawFaceDown(ctx) {
  ctx.fillStyle = P.black;
  ctx.fillRect(6, 5, 1, 1);
  ctx.fillRect(9, 5, 1, 1);
  // mouth
  ctx.fillStyle = P.darkPurple;
  ctx.fillRect(7, 6, 2, 1);
}

function drawFaceUp(ctx) {
  // back of head — hair, no eyes
  ctx.fillStyle = P.brown;
  ctx.fillRect(5, 4, 6, 2);
}

function drawFaceRight(ctx) {
  ctx.fillStyle = P.black;
  ctx.fillRect(9, 5, 1, 1);
  ctx.fillStyle = P.brown;
  ctx.fillRect(5, 4, 1, 2);
}

function drawFaceLeft(ctx) {
  ctx.fillStyle = P.black;
  ctx.fillRect(6, 5, 1, 1);
  ctx.fillStyle = P.brown;
  ctx.fillRect(10, 4, 1, 2);
}

export function drawPlayerDown0(ctx)  { playerBody(ctx, 0); drawFaceDown(ctx);  }
export function drawPlayerDown1(ctx)  { playerBody(ctx, 1); drawFaceDown(ctx);  }
export function drawPlayerUp0(ctx)    { playerBody(ctx, 0); drawFaceUp(ctx);    }
export function drawPlayerUp1(ctx)    { playerBody(ctx, 1); drawFaceUp(ctx);    }
export function drawPlayerRight0(ctx) { playerBody(ctx, 0); drawFaceRight(ctx); }
export function drawPlayerRight1(ctx) { playerBody(ctx, 1); drawFaceRight(ctx); }
export function drawPlayerLeft0(ctx)  { playerBody(ctx, 0); drawFaceLeft(ctx);  }
export function drawPlayerLeft1(ctx)  { playerBody(ctx, 1); drawFaceLeft(ctx);  }
