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

function drawGlue(ctx) {
  // sticky honey-brown puddle
  ctx.fillStyle = '#a67c1e';
  ctx.fillRect(4, 4, 8, 10);
  ctx.fillRect(2, 5, 12, 8);
  ctx.fillRect(3, 3, 10, 12);
  ctx.fillStyle = '#c8931f';
  ctx.fillRect(3, 5, 10, 2);
  ctx.fillRect(4, 7, 8, 2);
  ctx.fillStyle = P.yellow;
  ctx.fillRect(5, 5, 2, 1);
  ctx.fillRect(10, 5, 2, 1);
  // sticky strands pulling up
  ctx.fillStyle = '#8b6914';
  ctx.fillRect(5, 1, 1, 3);
  ctx.fillRect(10, 1, 1, 3);
  ctx.fillRect(8, 0, 1, 3);
  // bubbles
  ctx.fillStyle = P.white;
  ctx.globalAlpha = 0.6;
  ctx.fillRect(6, 8, 1, 1);
  ctx.fillRect(11, 10, 1, 1);
  ctx.globalAlpha = 1;
}

function drawCornDecoy(ctx) {
  // ground patch
  ctx.fillStyle = P.darkGreen;
  ctx.fillRect(1, 12, 14, 3);
  // corn pile (yellow kernels)
  ctx.fillStyle = P.yellow;
  ctx.fillRect(4, 6, 8, 7);
  ctx.fillRect(3, 8, 10, 4);
  ctx.fillRect(5, 5, 6, 1);
  // darker shading
  ctx.fillStyle = P.orange;
  ctx.fillRect(3, 11, 10, 1);
  ctx.fillRect(11, 8, 1, 4);
  // kernel dots
  ctx.fillStyle = P.chumpDeep;
  ctx.fillRect(5, 7, 1, 1);
  ctx.fillRect(8, 8, 1, 1);
  ctx.fillRect(10, 7, 1, 1);
  ctx.fillRect(6, 10, 1, 1);
  ctx.fillRect(9, 11, 1, 1);
  // corn husks / leaves
  ctx.fillStyle = P.darkGreen;
  ctx.fillRect(1, 5, 2, 4);
  ctx.fillRect(13, 5, 2, 4);
  ctx.fillStyle = P.green;
  ctx.fillRect(2, 5, 1, 2);
  ctx.fillRect(13, 5, 1, 2);
}

export function drawTrapGlue(ctx)                 { drawGlue(ctx); }
export function drawTrapGlueTriggered(ctx)        { drawGlue(ctx); drawTriggered(ctx); }
export function drawTrapCornDecoy(ctx)            { drawCornDecoy(ctx); }
export function drawTrapCornDecoyTriggered(ctx)   { drawCornDecoy(ctx); drawTriggered(ctx); }

function drawPrettyHen(ctx) {
  // ground shadow
  ctx.fillStyle = P.black;
  ctx.globalAlpha = 0.3;
  ctx.fillRect(3, 13, 10, 1);
  ctx.globalAlpha = 1;
  // body — pink/white
  ctx.fillStyle = P.pink;
  ctx.fillRect(4, 6, 8, 7);
  ctx.fillRect(5, 5, 6, 1);
  ctx.fillStyle = P.white;
  ctx.fillRect(5, 8, 6, 3);
  // head
  ctx.fillStyle = P.pink;
  ctx.fillRect(10, 3, 4, 4);
  // comb
  ctx.fillStyle = P.red;
  ctx.fillRect(11, 1, 1, 2);
  ctx.fillRect(12, 2, 1, 1);
  ctx.fillRect(13, 1, 1, 2);
  // beak
  ctx.fillStyle = P.yellow;
  ctx.fillRect(14, 4, 2, 2);
  // eye
  ctx.fillStyle = P.black;
  ctx.fillRect(12, 4, 1, 1);
  // wing
  ctx.fillStyle = '#d85090';
  ctx.fillRect(6, 8, 4, 3);
  // legs
  ctx.fillStyle = P.yellow;
  ctx.fillRect(6, 13, 1, 2);
  ctx.fillRect(9, 13, 1, 2);
  // eyelash hearts above
  ctx.fillStyle = P.red;
  ctx.fillRect(2, 2, 1, 1);
  ctx.fillRect(3, 3, 1, 1);
}

function drawBurgerBait(ctx) {
  // looks like a burger but with a subtle danger hint
  // top bun
  ctx.fillStyle = P.brown;
  ctx.fillRect(3, 4, 10, 3);
  ctx.fillRect(4, 3, 8, 1);
  ctx.fillStyle = P.yellow;
  ctx.fillRect(5, 4, 1, 1);
  ctx.fillRect(8, 5, 1, 1);
  ctx.fillRect(10, 4, 1, 1);
  // lettuce
  ctx.fillStyle = P.green;
  ctx.fillRect(2, 7, 12, 1);
  // patty
  ctx.fillStyle = P.chumpDeep;
  ctx.fillRect(2, 8, 12, 2);
  // cheese
  ctx.fillStyle = P.yellow;
  ctx.fillRect(2, 10, 12, 1);
  // bottom bun
  ctx.fillStyle = P.brown;
  ctx.fillRect(3, 11, 10, 3);
  // subtle trap hint — faint wire or stake poking out
  ctx.fillStyle = P.lightGrey;
  ctx.fillRect(1, 14, 14, 1);
  ctx.fillRect(2, 15, 2, 1);
  ctx.fillRect(12, 15, 2, 1);
  // tiny "BAIT" hint dot
  ctx.fillStyle = P.red;
  ctx.fillRect(14, 3, 1, 1);
}

export function drawTrapPrettyHen(ctx)            { drawPrettyHen(ctx); }
export function drawTrapPrettyHenTriggered(ctx)   { drawPrettyHen(ctx); drawTriggered(ctx); }
export function drawTrapBurgerBait(ctx)           { drawBurgerBait(ctx); }
export function drawTrapBurgerBaitTriggered(ctx)  { drawBurgerBait(ctx); drawTriggered(ctx); }

// Cat Decoy is handled specially in main.js — placing it spawns a real cat
// pickup at the tile instead of creating a trap. The sprite is only shown
// in the HUD palette, never actually drawn on the map. We still bake an
// icon for the palette though.
function drawCatDecoyIcon(ctx) {
  // miniature cat figure, basically drawCat() but tinted with a faint
  // paper label underneath
  ctx.fillStyle = P.lightGrey;
  ctx.fillRect(3, 7, 10, 6);
  ctx.fillRect(4, 4, 6, 4);
  ctx.fillStyle = P.darkGrey;
  ctx.fillRect(4, 2, 1, 2);
  ctx.fillRect(9, 2, 1, 2);
  ctx.fillStyle = P.green;
  ctx.fillRect(5, 5, 1, 1);
  ctx.fillRect(8, 5, 1, 1);
  ctx.fillStyle = P.pink;
  ctx.fillRect(6, 6, 1, 1);
  ctx.fillStyle = P.white;
  ctx.fillRect(4, 13, 2, 2);
  ctx.fillRect(11, 13, 2, 2);
  // paper label under it
  ctx.fillStyle = P.yellow;
  ctx.fillRect(1, 13, 14, 2);
  ctx.fillStyle = P.black;
  ctx.fillRect(3, 13, 1, 1);
  ctx.fillRect(6, 13, 1, 1);
  ctx.fillRect(9, 13, 1, 1);
  ctx.fillRect(12, 13, 1, 1);
}

export function drawTrapCatDecoy(ctx)          { drawCatDecoyIcon(ctx); }
export function drawTrapCatDecoyTriggered(ctx) { drawCatDecoyIcon(ctx); drawTriggered(ctx); }

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

// ---------------------------------------------------------------------------
// Pickups — 16x16
// ---------------------------------------------------------------------------

export function drawCat(ctx) {
  // body
  ctx.fillStyle = P.lightGrey;
  ctx.fillRect(3, 7, 10, 6);
  // head
  ctx.fillRect(4, 4, 6, 4);
  // ears
  ctx.fillStyle = P.darkGrey;
  ctx.fillRect(4, 2, 1, 2);
  ctx.fillRect(9, 2, 1, 2);
  ctx.fillStyle = P.pink;
  ctx.fillRect(4, 3, 1, 1);
  ctx.fillRect(9, 3, 1, 1);
  // eyes
  ctx.fillStyle = P.green;
  ctx.fillRect(5, 5, 1, 1);
  ctx.fillRect(8, 5, 1, 1);
  // nose
  ctx.fillStyle = P.pink;
  ctx.fillRect(6, 6, 1, 1);
  // whiskers
  ctx.fillStyle = P.white;
  ctx.fillRect(2, 6, 1, 1);
  ctx.fillRect(10, 6, 1, 1);
  // stripes
  ctx.fillStyle = P.darkGrey;
  ctx.fillRect(5, 8, 4, 1);
  ctx.fillRect(7, 10, 4, 1);
  // legs
  ctx.fillStyle = P.white;
  ctx.fillRect(4, 13, 2, 2);
  ctx.fillRect(11, 13, 2, 2);
  ctx.fillRect(7, 13, 2, 2);
  // tail
  ctx.fillStyle = P.lightGrey;
  ctx.fillRect(13, 7, 1, 4);
  ctx.fillRect(12, 11, 2, 1);
  ctx.fillStyle = P.darkGrey;
  ctx.fillRect(13, 9, 1, 1);
}

export function drawBurger(ctx) {
  // top bun
  ctx.fillStyle = P.brown;
  ctx.fillRect(3, 4, 10, 3);
  ctx.fillRect(4, 3, 8, 1);
  // sesame seeds
  ctx.fillStyle = P.yellow;
  ctx.fillRect(5, 4, 1, 1);
  ctx.fillRect(8, 5, 1, 1);
  ctx.fillRect(10, 4, 1, 1);
  // lettuce
  ctx.fillStyle = P.green;
  ctx.fillRect(2, 7, 12, 1);
  // patty
  ctx.fillStyle = P.chumpDeep;
  ctx.fillRect(2, 8, 12, 2);
  // cheese
  ctx.fillStyle = P.yellow;
  ctx.fillRect(2, 10, 12, 1);
  ctx.fillRect(12, 11, 2, 1);
  // bottom bun
  ctx.fillStyle = P.brown;
  ctx.fillRect(3, 11, 10, 3);
  ctx.fillRect(4, 14, 8, 1);
}

export function drawTaco(ctx) {
  // shell (crescent)
  ctx.fillStyle = P.yellow;
  ctx.fillRect(2, 5, 12, 8);
  ctx.fillRect(3, 4, 10, 1);
  ctx.fillRect(3, 13, 10, 1);
  // shell edges
  ctx.fillStyle = P.orange;
  ctx.fillRect(2, 5, 1, 8);
  ctx.fillRect(13, 5, 1, 8);
  ctx.fillRect(3, 4, 10, 1);
  // opening / filling
  ctx.fillStyle = P.chumpDeep;
  ctx.fillRect(4, 6, 8, 2);
  // lettuce bits
  ctx.fillStyle = P.green;
  ctx.fillRect(5, 7, 1, 1);
  ctx.fillRect(9, 7, 1, 1);
  // tomato bits
  ctx.fillStyle = P.red;
  ctx.fillRect(6, 7, 1, 1);
  ctx.fillRect(10, 6, 1, 1);
  // cheese
  ctx.fillStyle = P.white;
  ctx.fillRect(7, 8, 1, 1);
  // shadow
  ctx.fillStyle = P.orange;
  ctx.fillRect(4, 12, 8, 1);
}

// ---------------------------------------------------------------------------
// Townspeople — 16x16, 3 variants x 2 frames (idle / panic)
// ---------------------------------------------------------------------------

const TOWNIE_HAT   = [ /* red */ '#FF004D', /* darkBlue */ '#1D2B53', /* darkGreen */ '#008751' ];
const TOWNIE_SHIRT = [ /* pink */ '#FF77A8', /* yellow */ '#FFEC27', /* green */ '#00E436' ];

function townieBody(ctx, variant, armsUp) {
  // hat
  ctx.fillStyle = TOWNIE_HAT[variant % 3];
  ctx.fillRect(5, 1, 6, 2);
  ctx.fillRect(4, 2, 8, 1);
  // face
  ctx.fillStyle = P.peach;
  ctx.fillRect(5, 3, 6, 3);
  ctx.fillStyle = P.black;
  ctx.fillRect(6, 4, 1, 1);
  ctx.fillRect(9, 4, 1, 1);
  // panic mouth (O shape when armsUp)
  ctx.fillStyle = P.black;
  if (armsUp) {
    ctx.fillRect(7, 5, 2, 1);
    ctx.fillRect(7, 6, 2, 1);
  } else {
    ctx.fillRect(7, 5, 2, 1);
  }
  // shirt
  ctx.fillStyle = TOWNIE_SHIRT[variant % 3];
  ctx.fillRect(4, 7, 8, 4);
  // arms (differ by state)
  if (armsUp) {
    ctx.fillStyle = TOWNIE_SHIRT[variant % 3];
    ctx.fillRect(2, 4, 1, 3);
    ctx.fillRect(13, 4, 1, 3);
    ctx.fillStyle = P.peach;
    ctx.fillRect(2, 3, 1, 1);
    ctx.fillRect(13, 3, 1, 1);
  } else {
    ctx.fillStyle = TOWNIE_SHIRT[variant % 3];
    ctx.fillRect(3, 7, 1, 3);
    ctx.fillRect(12, 7, 1, 3);
    ctx.fillStyle = P.peach;
    ctx.fillRect(3, 10, 1, 1);
    ctx.fillRect(12, 10, 1, 1);
  }
  // pants
  ctx.fillStyle = P.darkBlue;
  ctx.fillRect(5, 11, 2, 3);
  ctx.fillRect(9, 11, 2, 3);
  // shoes
  ctx.fillStyle = P.black;
  ctx.fillRect(5, 14, 2, 1);
  ctx.fillRect(9, 14, 2, 1);
}

export function drawTownie0Idle(ctx)  { townieBody(ctx, 0, false); }
export function drawTownie0Panic(ctx) { townieBody(ctx, 0, true);  }
export function drawTownie1Idle(ctx)  { townieBody(ctx, 1, false); }
export function drawTownie1Panic(ctx) { townieBody(ctx, 1, true);  }
export function drawTownie2Idle(ctx)  { townieBody(ctx, 2, false); }
export function drawTownie2Panic(ctx) { townieBody(ctx, 2, true);  }

// ---------------------------------------------------------------------------
// Cook NPC (stands at the taco truck window) — 16x16
// ---------------------------------------------------------------------------

function cookBody(ctx, panic) {
  // chef hat — white mushroom top + yellow band
  ctx.fillStyle = P.white;
  ctx.fillRect(4, 0, 8, 1);
  ctx.fillRect(3, 1, 10, 2);
  ctx.fillStyle = P.yellow;
  ctx.fillRect(4, 3, 8, 1);
  // hat shadow
  ctx.fillStyle = P.lightGrey;
  ctx.fillRect(11, 1, 2, 1);
  // face
  ctx.fillStyle = P.peach;
  ctx.fillRect(5, 4, 6, 3);
  // eyes
  ctx.fillStyle = P.black;
  if (panic) {
    // wide panic eyes
    ctx.fillRect(5, 5, 1, 1);
    ctx.fillRect(10, 5, 1, 1);
    // screaming O mouth
    ctx.fillRect(7, 6, 2, 2);
  } else {
    ctx.fillRect(6, 5, 1, 1);
    ctx.fillRect(9, 5, 1, 1);
    // content smile
    ctx.fillRect(7, 6, 2, 1);
  }
  // mustache
  ctx.fillStyle = P.brown;
  ctx.fillRect(6, 6, 1, 1);
  ctx.fillRect(9, 6, 1, 1);
  // white chef coat torso
  ctx.fillStyle = P.white;
  ctx.fillRect(4, 7, 8, 5);
  // apron red stripes + buttons
  ctx.fillStyle = P.red;
  ctx.fillRect(5, 8, 1, 1);
  ctx.fillRect(10, 8, 1, 1);
  ctx.fillRect(5, 10, 1, 1);
  ctx.fillRect(10, 10, 1, 1);
  // apron center button line
  ctx.fillStyle = P.darkGrey;
  ctx.fillRect(7, 8, 2, 1);
  ctx.fillRect(7, 10, 2, 1);
  // arms differ by state
  if (panic) {
    // arms flailing up
    ctx.fillStyle = P.white;
    ctx.fillRect(1, 4, 2, 3);
    ctx.fillRect(13, 4, 2, 3);
    ctx.fillStyle = P.peach;
    ctx.fillRect(1, 3, 2, 1);
    ctx.fillRect(13, 3, 2, 1);
  } else {
    // one arm holds a spatula
    ctx.fillStyle = P.white;
    ctx.fillRect(2, 8, 2, 3);
    ctx.fillRect(12, 8, 2, 3);
    ctx.fillStyle = P.peach;
    ctx.fillRect(2, 11, 2, 1);
    ctx.fillStyle = P.peach;
    ctx.fillRect(12, 11, 2, 1);
    // spatula handle + pan
    ctx.fillStyle = P.brown;
    ctx.fillRect(14, 9, 1, 3);
    ctx.fillStyle = P.lightGrey;
    ctx.fillRect(14, 7, 2, 2);
  }
  // pants (jeans)
  ctx.fillStyle = P.darkBlue;
  ctx.fillRect(5, 12, 2, 3);
  ctx.fillRect(9, 12, 2, 3);
  // shoes
  ctx.fillStyle = P.black;
  ctx.fillRect(5, 15, 2, 1);
  ctx.fillRect(9, 15, 2, 1);
}

export function drawCookIdle(ctx)  { cookBody(ctx, false); }
export function drawCookPanic(ctx) { cookBody(ctx, true);  }
