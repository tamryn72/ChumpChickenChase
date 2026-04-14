// Procedural character sprites. Each function draws one frame at (0,0).
// Player: 16x16 (centered in 32px tile with +8 offset)
// Chump : 24x24 (centered in 32px tile with +4 offset)
// Traps : 16x16 (centered with +8 offset)

import { P } from './palette.js';

// Facing constants (must match entities/player.js FACE)
const UP = 0, RIGHT = 1, DOWN = 2, LEFT = 3;

// ---------------------------------------------------------------------------
// Player (pixel farmer) — 16x16
// ---------------------------------------------------------------------------

function playerBody(ctx, legFrame) {
  ctx.fillStyle = P.chumpDeep;
  ctx.fillRect(3, 3, 10, 1);
  ctx.fillStyle = P.yellow;
  ctx.fillRect(5, 1, 6, 2);
  ctx.fillRect(4, 2, 8, 1);
  ctx.fillStyle = P.red;
  ctx.fillRect(4, 3, 8, 1);
  ctx.fillStyle = P.peach;
  ctx.fillRect(5, 4, 6, 3);
  ctx.fillStyle = P.darkBlue;
  ctx.fillRect(4, 7, 8, 5);
  ctx.fillStyle = P.blue;
  ctx.fillRect(5, 7, 1, 3);
  ctx.fillRect(10, 7, 1, 3);
  ctx.fillStyle = P.red;
  ctx.fillRect(3, 7, 1, 3);
  ctx.fillRect(12, 7, 1, 3);
  ctx.fillStyle = P.peach;
  ctx.fillRect(3, 10, 1, 1);
  ctx.fillRect(12, 10, 1, 1);
  ctx.fillStyle = P.brown;
  if (legFrame === 0) {
    ctx.fillRect(5, 12, 2, 3);
    ctx.fillRect(9, 12, 2, 3);
  } else {
    ctx.fillRect(4, 12, 2, 3);
    ctx.fillRect(10, 12, 2, 3);
  }
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
  ctx.fillStyle = P.black;
  ctx.globalAlpha = 0.25;
  ctx.fillRect(5, 21, 14, 1);
  ctx.globalAlpha = 1;
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
  ctx.fillStyle = P.chumpOrange;
  ctx.fillRect(5, 9, 15, 11);
  ctx.fillRect(6, 8, 13, 1);
  ctx.fillRect(6, 20, 13, 1);
  ctx.fillStyle = P.orange;
  ctx.fillRect(7, 9, 11, 1);
  ctx.fillStyle = P.chumpDeep;
  ctx.fillRect(6, 18, 13, 2);
  ctx.fillRect(4, 12, 2, 5);
  ctx.fillRect(19, 12, 2, 5);
  ctx.fillStyle = P.orange;
  ctx.fillRect(4, 12, 1, 2);
  ctx.fillRect(20, 12, 1, 2);
  ctx.fillStyle = P.yellow;
  ctx.globalAlpha = 0.35;
  ctx.fillRect(10, 15, 5, 3);
  ctx.globalAlpha = 1;
}

function chumpHead(ctx, facing, frame) {
  const hx = frame === 0 ? 0 : -1;
  ctx.fillStyle = P.yellow;
  ctx.fillRect(8 + hx, 2, 7, 2);
  ctx.fillRect(9 + hx, 1, 5, 1);
  ctx.fillRect(10 + hx, 0, 3, 1);
  ctx.fillStyle = P.orange;
  ctx.fillRect(7 + hx, 4, 9, 1);
  ctx.fillStyle = P.chumpDeep;
  ctx.fillRect(8 + hx, 3, 1, 1);
  ctx.fillStyle = P.chumpOrange;
  ctx.fillRect(7, 5, 11, 4);

  if (facing === DOWN) {
    ctx.fillStyle = P.white;
    ctx.fillRect(8, 6, 3, 2);
    ctx.fillRect(14, 6, 3, 2);
    ctx.fillStyle = P.black;
    ctx.fillRect(9, 6, 1, 2);
    ctx.fillRect(15, 6, 1, 2);
    ctx.fillStyle = P.yellow;
    ctx.fillRect(11, 8, 3, 2);
    ctx.fillStyle = P.chumpDeep;
    ctx.fillRect(11, 9, 3, 1);
  } else if (facing === UP) {
    // back of head — no features visible
  } else if (facing === RIGHT) {
    ctx.fillStyle = P.white;
    ctx.fillRect(14, 6, 2, 2);
    ctx.fillStyle = P.black;
    ctx.fillRect(15, 6, 1, 2);
    ctx.fillStyle = P.yellow;
    ctx.fillRect(17, 7, 2, 2);
    ctx.fillStyle = P.chumpDeep;
    ctx.fillRect(18, 8, 1, 1);
  } else {
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

// ---------------------------------------------------------------------------
// Traps — 16x16
// ---------------------------------------------------------------------------

function drawNet(ctx) {
  // rope border
  ctx.fillStyle = P.brown;
  ctx.fillRect(0, 0, 16, 1);
  ctx.fillRect(0, 15, 16, 1);
  ctx.fillRect(0, 0, 1, 16);
  ctx.fillRect(15, 0, 1, 16);
  // mesh
  ctx.fillStyle = P.lightGrey;
  for (let i = 3; i < 14; i += 3) {
    ctx.fillRect(1, i, 14, 1);
    ctx.fillRect(i, 1, 1, 14);
  }
  // knots
  ctx.fillStyle = P.darkGrey;
  for (let y = 3; y < 14; y += 3) {
    for (let x = 3; x < 14; x += 3) {
      ctx.fillRect(x, y, 1, 1);
    }
  }
}

function drawBanana(ctx) {
  // crescent
  ctx.fillStyle = P.yellow;
  ctx.fillRect(3, 5, 9, 2);
  ctx.fillRect(2, 7, 11, 2);
  ctx.fillRect(3, 9, 9, 2);
  ctx.fillRect(4, 11, 7, 2);
  // shading
  ctx.fillStyle = P.orange;
  ctx.fillRect(3, 6, 1, 2);
  ctx.fillRect(11, 6, 1, 2);
  ctx.fillRect(4, 12, 7, 1);
  // stem
  ctx.fillStyle = P.brown;
  ctx.fillRect(5, 3, 1, 3);
  ctx.fillRect(6, 3, 1, 1);
}

function drawCage(ctx) {
  // wooden frame
  ctx.fillStyle = P.brown;
  ctx.fillRect(1, 1, 14, 14);
  // interior shadow
  ctx.fillStyle = P.black;
  ctx.fillRect(3, 3, 10, 10);
  // vertical bars
  ctx.fillStyle = P.lightGrey;
  ctx.fillRect(5, 3, 1, 10);
  ctx.fillRect(8, 3, 1, 10);
  ctx.fillRect(11, 3, 1, 10);
  // horizontal rails
  ctx.fillRect(3, 6, 10, 1);
  ctx.fillRect(3, 10, 10, 1);
  // top hook
  ctx.fillStyle = P.darkGrey;
  ctx.fillRect(7, 0, 2, 2);
}

function drawTriggered(ctx) {
  ctx.globalAlpha = 0.55;
  ctx.fillStyle = P.black;
  ctx.fillRect(0, 0, 16, 16);
  ctx.globalAlpha = 1;
  // red X
  ctx.fillStyle = P.red;
  for (let i = 0; i < 16; i++) {
    ctx.fillRect(i, i, 1, 1);
    ctx.fillRect(15 - i, i, 1, 1);
  }
}

export function drawTrapNet(ctx)            { drawNet(ctx); }
export function drawTrapNetTriggered(ctx)   { drawNet(ctx); drawTriggered(ctx); }
export function drawTrapBanana(ctx)         { drawBanana(ctx); }
export function drawTrapBananaTriggered(ctx){ drawBanana(ctx); drawTriggered(ctx); }
export function drawTrapCage(ctx)           { drawCage(ctx); }
export function drawTrapCageTriggered(ctx)  { drawCage(ctx); drawTriggered(ctx); }

// ---------------------------------------------------------------------------
// Projectiles — 8x8
// ---------------------------------------------------------------------------

export function drawEgg(ctx) {
  ctx.fillStyle = P.white;
  ctx.fillRect(2, 1, 4, 6);
  ctx.fillRect(1, 2, 6, 4);
  ctx.fillStyle = P.yellow;
  ctx.fillRect(3, 2, 2, 2);
  ctx.fillStyle = P.chumpDeep;
  ctx.fillRect(2, 5, 1, 1);
}
