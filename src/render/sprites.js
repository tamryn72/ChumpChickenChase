// Procedural character sprites. Each function draws one frame at (0,0).
// Player: 16x16 (centered in 32px tile with +8 offset)
// Chump : 24x24 (centered in 32px tile with +4 offset)

import { P } from './palette.js';

// Facing constants (must match entities/player.js FACE)
const UP = 0, RIGHT = 1, DOWN = 2, LEFT = 3;

// ---------------------------------------------------------------------------
// Player (pixel farmer) — 16x16
// ---------------------------------------------------------------------------

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

function playerFaceDown(ctx) {
  ctx.fillStyle = P.black;
  ctx.fillRect(6, 5, 1, 1);
  ctx.fillRect(9, 5, 1, 1);
  ctx.fillStyle = P.darkPurple;
  ctx.fillRect(7, 6, 2, 1);
}
function playerFaceUp(ctx) {
  ctx.fillStyle = P.brown;
  ctx.fillRect(5, 4, 6, 2);
}
function playerFaceRight(ctx) {
  ctx.fillStyle = P.black;
  ctx.fillRect(9, 5, 1, 1);
  ctx.fillStyle = P.brown;
  ctx.fillRect(5, 4, 1, 2);
}
function playerFaceLeft(ctx) {
  ctx.fillStyle = P.black;
  ctx.fillRect(6, 5, 1, 1);
  ctx.fillStyle = P.brown;
  ctx.fillRect(10, 4, 1, 2);
}

export function drawPlayerDown0(ctx)  { playerBody(ctx, 0); playerFaceDown(ctx);  }
export function drawPlayerDown1(ctx)  { playerBody(ctx, 1); playerFaceDown(ctx);  }
export function drawPlayerUp0(ctx)    { playerBody(ctx, 0); playerFaceUp(ctx);    }
export function drawPlayerUp1(ctx)    { playerBody(ctx, 1); playerFaceUp(ctx);    }
export function drawPlayerRight0(ctx) { playerBody(ctx, 0); playerFaceRight(ctx); }
export function drawPlayerRight1(ctx) { playerBody(ctx, 1); playerFaceRight(ctx); }
export function drawPlayerLeft0(ctx)  { playerBody(ctx, 0); playerFaceLeft(ctx);  }
export function drawPlayerLeft1(ctx)  { playerBody(ctx, 1); playerFaceLeft(ctx);  }

// ---------------------------------------------------------------------------
// Chump (the orange chicken) — 24x24
// ---------------------------------------------------------------------------

function chumpLegs(ctx, frame) {
  // ground shadow
  ctx.fillStyle = P.black;
  ctx.globalAlpha = 0.25;
  ctx.fillRect(5, 21, 14, 1);
  ctx.globalAlpha = 1;
  // yellow legs + toes
  ctx.fillStyle = P.yellow;
  if (frame === 0) {
    ctx.fillRect(8, 20, 1, 3);
    ctx.fillRect(15, 20, 1, 3);
    ctx.fillRect(6, 22, 4, 1);
    ctx.fillRect(13, 22, 4, 1);
  } else {
    ctx.fillRect(9, 20, 1, 3);
    ctx.fillRect(14, 20, 1, 3);
    ctx.fillRect(7, 22, 4, 1);
    ctx.fillRect(12, 22, 4, 1);
  }
}

function chumpBody(ctx) {
  // main rounded body
  ctx.fillStyle = P.chumpOrange;
  ctx.fillRect(5, 9, 15, 11);
  ctx.fillRect(6, 8, 13, 1);
  ctx.fillRect(6, 20, 13, 1);
  // top highlight
  ctx.fillStyle = P.orange;
  ctx.fillRect(7, 9, 11, 1);
  // bottom shadow
  ctx.fillStyle = P.chumpDeep;
  ctx.fillRect(6, 18, 13, 2);
  // wings on each side
  ctx.fillRect(4, 12, 2, 5);
  ctx.fillRect(19, 12, 2, 5);
  // wing highlight
  ctx.fillStyle = P.orange;
  ctx.fillRect(4, 12, 1, 2);
  ctx.fillRect(20, 12, 1, 2);
  // belly fluff
  ctx.fillStyle = P.yellow;
  ctx.globalAlpha = 0.35;
  ctx.fillRect(10, 15, 5, 3);
  ctx.globalAlpha = 1;
}

function chumpHead(ctx, facing, frame) {
  // iconic floppy hair piece — varies with frame for signature wobble
  const hx = frame === 0 ? 0 : -1;
  ctx.fillStyle = P.yellow;
  ctx.fillRect(8 + hx, 2, 7, 2);
  ctx.fillRect(9 + hx, 1, 5, 1);
  ctx.fillRect(10 + hx, 0, 3, 1);
  ctx.fillStyle = P.orange;
  ctx.fillRect(7 + hx, 4, 9, 1);
  ctx.fillStyle = P.chumpDeep;
  ctx.fillRect(8 + hx, 3, 1, 1);

  // head dome (under hair)
  ctx.fillStyle = P.chumpOrange;
  ctx.fillRect(7, 5, 11, 4);

  // eyes + beak per facing
  if (facing === DOWN) {
    // two wide bratty eyes
    ctx.fillStyle = P.white;
    ctx.fillRect(8, 6, 3, 2);
    ctx.fillRect(14, 6, 3, 2);
    ctx.fillStyle = P.black;
    ctx.fillRect(9, 6, 1, 2);
    ctx.fillRect(15, 6, 1, 2);
    // beak
    ctx.fillStyle = P.yellow;
    ctx.fillRect(11, 8, 3, 2);
    ctx.fillStyle = P.chumpDeep;
    ctx.fillRect(11, 9, 3, 1);
  } else if (facing === UP) {
    // back of head — hair bump only, no features
  } else if (facing === RIGHT) {
    ctx.fillStyle = P.white;
    ctx.fillRect(14, 6, 2, 2);
    ctx.fillStyle = P.black;
    ctx.fillRect(15, 6, 1, 2);
    ctx.fillStyle = P.yellow;
    ctx.fillRect(17, 7, 2, 2);
    ctx.fillStyle = P.chumpDeep;
    ctx.fillRect(18, 8, 1, 1);
  } else { // LEFT
    ctx.fillStyle = P.white;
    ctx.fillRect(9, 6, 2, 2);
    ctx.fillStyle = P.black;
    ctx.fillRect(9, 6, 1, 2);
    ctx.fillStyle = P.yellow;
    ctx.fillRect(6, 7, 2, 2);
    ctx.fillStyle = P.chumpDeep;
    ctx.fillRect(6, 8, 1, 1);
  }
}

export function drawChumpDown0(ctx)  { chumpLegs(ctx, 0); chumpBody(ctx); chumpHead(ctx, DOWN, 0);  }
export function drawChumpDown1(ctx)  { chumpLegs(ctx, 1); chumpBody(ctx); chumpHead(ctx, DOWN, 1);  }
export function drawChumpUp0(ctx)    { chumpLegs(ctx, 0); chumpBody(ctx); chumpHead(ctx, UP, 0);    }
export function drawChumpUp1(ctx)    { chumpLegs(ctx, 1); chumpBody(ctx); chumpHead(ctx, UP, 1);    }
export function drawChumpRight0(ctx) { chumpLegs(ctx, 0); chumpBody(ctx); chumpHead(ctx, RIGHT, 0); }
export function drawChumpRight1(ctx) { chumpLegs(ctx, 1); chumpBody(ctx); chumpHead(ctx, RIGHT, 1); }
export function drawChumpLeft0(ctx)  { chumpLegs(ctx, 0); chumpBody(ctx); chumpHead(ctx, LEFT, 0);  }
export function drawChumpLeft1(ctx)  { chumpLegs(ctx, 1); chumpBody(ctx); chumpHead(ctx, LEFT, 1);  }
