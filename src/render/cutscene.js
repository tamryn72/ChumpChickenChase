// Cutscene rendering. Draws Chump doing his escape choreography with
// rotations, scaling, and captions. State is interpreted from cs.t.

import { CANVAS_W, CANVAS_H } from '../config.js';
import * as cache from './sprite-cache.js';
import { P } from './palette.js';

const FACE_NAME = ['up', 'right', 'down', 'left'];

function drawBackground(ctx, t) {
  // sky gradient
  ctx.fillStyle = '#1a1208';
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
  // sun
  ctx.fillStyle = P.orange;
  ctx.beginPath();
  ctx.arc(CANVAS_W - 60, 56, 22, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = P.yellow;
  ctx.beginPath();
  ctx.arc(CANVAS_W - 60, 56, 14, 0, Math.PI * 2);
  ctx.fill();
  // horizon line
  ctx.fillStyle = '#4a2f14';
  ctx.fillRect(0, CANVAS_H - 80, CANVAS_W, 80);
  // ground dithering
  ctx.fillStyle = '#6b4420';
  for (let x = 0; x < CANVAS_W; x += 8) {
    if ((x / 8 + Math.floor(t / 4)) % 3 === 0) {
      ctx.fillRect(x, CANVAS_H - 30, 2, 2);
    }
  }
  // stars
  ctx.fillStyle = P.white;
  const starPositions = [[40, 30], [120, 50], [220, 20], [380, 40], [520, 60], [580, 30]];
  for (const [sx, sy] of starPositions) {
    if ((Math.floor(t / 10) + sx) % 3 !== 0) {
      ctx.fillRect(sx, sy, 1, 1);
    }
  }
}

function drawChumpTransformed(ctx, cx, cy, rotation, scale, facingIdx, frame) {
  const faceName = FACE_NAME[facingIdx];
  const key = `chump_${faceName}_${frame}`;
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(rotation);
  ctx.scale(scale, scale);
  cache.draw(ctx, key, -12, -12);
  ctx.restore();
}

function drawCaption(ctx, text) {
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = 'bold 22px ui-monospace, monospace';
  // shadow
  ctx.fillStyle = P.black;
  ctx.fillText(text.toUpperCase(), CANVAS_W / 2 + 2, 82);
  // fill
  ctx.fillStyle = P.chumpOrange;
  ctx.fillText(text.toUpperCase(), CANVAS_W / 2, 80);
}

// Facing index mapping (matches entities/player.js FACE):
//   0=up, 1=right, 2=down, 3=left

// Dispatcher: each script has its own choreography function.
export function drawCutscene(ctx, cs, alpha) {
  if (cs.script === 'MARKET_ESCAPE') {
    drawMarketStyleEscape(ctx, cs, alpha);
    return;
  }
  if (cs.script === 'VOLCANO_VICTORY') {
    drawVolcanoVictory(ctx, cs, alpha);
    return;
  }
  drawFarmStyleEscape(ctx, cs, alpha);
}

function drawFarmStyleEscape(ctx, cs, alpha) {
  const t = cs.t + alpha;

  drawBackground(ctx, t);

  // Piecewise choreography
  let cx, cy, rotation, scale, facing, frame;

  const centerX = CANVAS_W / 2;
  const groundY = CANVAS_H - 110;

  if (t < 30) {
    // phase 1: stand center, hair flop
    cx = centerX;
    cy = groundY;
    rotation = 0;
    scale = 3;
    facing = 2; // down
    frame = Math.floor(t / 5) % 2;
  } else if (t < 68) {
    // phase 2: backflip (spin + arc)
    const p = (t - 30) / 38;
    cx = centerX + p * 30;
    cy = groundY - Math.sin(p * Math.PI) * 110;
    rotation = p * Math.PI * 2;
    scale = 3;
    facing = 1; // right
    frame = Math.floor(t / 3) % 2;
  } else if (t < 104) {
    // phase 3: moonwalk — facing LEFT but sliding RIGHT
    const p = (t - 68) / 36;
    cx = centerX + 30 + p * 80;
    cy = groundY + Math.sin(t * 0.4) * 2;
    rotation = 0;
    scale = 3;
    facing = 3; // left (moonwalk illusion)
    frame = Math.floor(t / 3) % 2;
  } else if (t < 138) {
    // phase 4: DAB — big pose, slight bob
    const p = (t - 104) / 34;
    cx = centerX + 110;
    cy = groundY - 4;
    rotation = -Math.PI / 7;
    scale = 3 + Math.sin(p * Math.PI * 3) * 0.15;
    facing = 3;
    frame = 0;
  } else if (t < 172) {
    // phase 5: sprint off screen right
    const p = (t - 138) / 34;
    cx = centerX + 110 + p * 320;
    cy = groundY + Math.sin(t * 0.8) * 4;
    rotation = 0;
    scale = 3;
    facing = 1;
    frame = Math.floor(t / 2) % 2;
  } else {
    // phase 6: gone
    cx = -400;
    cy = groundY;
    rotation = 0;
    scale = 1;
    facing = 2;
    frame = 0;
  }

  drawChumpTransformed(ctx, cx, cy, rotation, scale, facing, frame);

  // spawn feathers / dust trail while running (phase 5)
  if (t >= 138 && t < 172 && Math.floor(t) % 2 === 0) {
    ctx.fillStyle = P.white;
    ctx.fillRect((cx - 18) | 0, (cy + 30) | 0, 2, 2);
    ctx.fillStyle = P.chumpOrange;
    ctx.fillRect((cx - 12) | 0, (cy + 34) | 0, 2, 2);
  }

  // current caption
  const caption = cs.captions.find((c) => t >= c.at && t < c.at + c.ttl);
  if (caption) {
    // fade in/out
    const localT = t - caption.at;
    const fade = localT < 4 ? localT / 4 : (localT > caption.ttl - 4 ? (caption.ttl - localT) / 4 : 1);
    ctx.globalAlpha = Math.max(0, Math.min(1, fade));
    drawCaption(ctx, caption.text);
    ctx.globalAlpha = 1;
  }

  // skip hint
  ctx.fillStyle = '#888';
  ctx.font = '10px ui-monospace, monospace';
  ctx.textAlign = 'right';
  ctx.textBaseline = 'alphabetic';
  ctx.fillText('SPACE to skip', CANVAS_W - 6, CANVAS_H - 6);
}

// ---------------------------------------------------------------------------
// Market escape — kicks fruit stand, orange tidal wave, COWABUNGA surf
// ---------------------------------------------------------------------------

function drawMarketBackground(ctx, t) {
  // night sky market ambience
  ctx.fillStyle = '#251408';
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
  // cobblestone street hint at bottom
  ctx.fillStyle = '#3a2a1a';
  ctx.fillRect(0, CANVAS_H - 70, CANVAS_W, 70);
  for (let x = 4; x < CANVAS_W; x += 16) {
    if (Math.floor((x + t) / 4) % 2 === 0) {
      ctx.fillStyle = '#4a3a26';
      ctx.fillRect(x, CANVAS_H - 60, 10, 4);
    }
  }
  // silhouetted clock tower far right
  ctx.fillStyle = '#1a0a00';
  ctx.fillRect(CANVAS_W - 90, 60, 40, 200);
  ctx.fillRect(CANVAS_W - 100, 40, 60, 30);
  ctx.fillStyle = P.yellow;
  ctx.fillRect(CANVAS_W - 75, 100, 10, 10);
  // moon
  ctx.fillStyle = P.white;
  ctx.beginPath();
  ctx.arc(90, 60, 18, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#251408';
  ctx.beginPath();
  ctx.arc(98, 56, 14, 0, Math.PI * 2);
  ctx.fill();
}

// Draws the rolling orange tidal wave from behind chump toward screen right.
// `head` is the x-pixel position of the wave leading edge, `height` is the
// wave amplitude in pixels.
function drawTidalWave(ctx, head, height, t) {
  // wave body fills from left edge up to head
  ctx.fillStyle = P.chumpOrange;
  const baseY = CANVAS_H - 60;
  ctx.beginPath();
  ctx.moveTo(-10, CANVAS_H);
  ctx.lineTo(-10, baseY + 20);
  const steps = 30;
  for (let i = 0; i <= steps; i++) {
    const p = i / steps;
    const x = -10 + (head + 10) * p;
    const ripple = Math.sin(p * Math.PI * 4 + t * 0.3) * 4;
    const y = baseY + 20 - (height * Math.sin(p * Math.PI)) + ripple;
    ctx.lineTo(x, y);
  }
  ctx.lineTo(head, CANVAS_H);
  ctx.closePath();
  ctx.fill();

  // wave crest highlight
  ctx.fillStyle = P.orange;
  ctx.beginPath();
  ctx.moveTo(-10, baseY + 20);
  for (let i = 0; i <= steps; i++) {
    const p = i / steps;
    const x = -10 + (head + 10) * p;
    const ripple = Math.sin(p * Math.PI * 4 + t * 0.3) * 4;
    const y = baseY + 20 - (height * Math.sin(p * Math.PI)) + ripple;
    ctx.lineTo(x, y - 2);
  }
  ctx.lineTo(head, baseY + 20);
  ctx.closePath();
  ctx.fill();

  // foam on the crest
  ctx.fillStyle = P.white;
  for (let i = 1; i < steps; i += 2) {
    const p = i / steps;
    const x = -10 + (head + 10) * p;
    const y = baseY + 20 - (height * Math.sin(p * Math.PI));
    ctx.fillRect(x - 1, y - 4, 2, 2);
  }
}

function drawMarketStyleEscape(ctx, cs, alpha) {
  const t = cs.t + alpha;
  drawMarketBackground(ctx, t);

  // --- phases ---
  // 0-30:   chump stares at fruit stand, cart stands to his right
  // 30-65:  chump kicks the stand (sprite lurches right), fruit flies
  // 65-100: tidal wave starts rising behind him from the goo
  // 100-150: wave surges right, chump rides crest, yells cowabunga
  // 150-200: wave crashes off right edge, chump vanishes with it

  let cx, cy, rotation, scale, facing, frame;
  let waveHead = 0;
  let waveHeight = 0;
  let showCart = true;
  let fruitBurst = false;

  const groundY = CANVAS_H - 90;

  if (t < 30) {
    cx = 160;
    cy = groundY;
    rotation = 0;
    scale = 3;
    facing = 1; // looking at cart
    frame = Math.floor(t / 6) % 2;
  } else if (t < 65) {
    // kick lurch
    const p = (t - 30) / 35;
    cx = 160 + p * 30;
    cy = groundY - Math.sin(p * Math.PI) * 14;
    rotation = Math.sin(p * Math.PI) * 0.3;
    scale = 3 + Math.sin(p * Math.PI) * 0.3;
    facing = 1;
    frame = Math.floor(t / 2) % 2;
    if (t > 40) {
      fruitBurst = true;
      showCart = false;
    }
  } else if (t < 100) {
    // wave rises behind him
    const p = (t - 65) / 35;
    cx = 200;
    cy = groundY - p * 10;
    rotation = 0;
    scale = 3;
    facing = 2; // look down at wave
    frame = Math.floor(t / 5) % 2;
    waveHeight = p * 90;
    waveHead = 240 + p * 10;
    showCart = false;
  } else if (t < 150) {
    // surfing the wave — wave surges right
    const p = (t - 100) / 50;
    waveHead = 250 + p * (CANVAS_W - 200);
    waveHeight = 90 + Math.sin(t * 0.2) * 6;
    cx = waveHead - 32;
    cy = groundY - waveHeight + 22;
    rotation = -Math.PI / 10 + Math.sin(t * 0.3) * 0.08;
    scale = 3;
    facing = 1;
    frame = Math.floor(t / 3) % 2;
    showCart = false;
  } else {
    // crash off screen
    const p = (t - 150) / 50;
    waveHead = CANVAS_W + 50 + p * 100;
    waveHeight = Math.max(0, 90 - p * 70);
    cx = waveHead - 32;
    cy = groundY - waveHeight + 22;
    rotation = p * Math.PI * 0.8;
    scale = 3 * (1 - p * 0.4);
    facing = 1;
    frame = Math.floor(t / 4) % 2;
    showCart = false;
  }

  // wave draws behind chump
  if (waveHeight > 0) drawTidalWave(ctx, waveHead, waveHeight, t);

  // fruit cart (pre-kick)
  if (showCart) {
    ctx.fillStyle = P.brown;
    ctx.fillRect(220, groundY + 8, 52, 28);
    ctx.fillStyle = P.red;
    ctx.fillRect(218, groundY, 56, 8);
    // fruit
    ctx.fillStyle = P.red;
    ctx.fillRect(228, groundY + 12, 6, 6);
    ctx.fillStyle = P.orange;
    ctx.fillRect(240, groundY + 12, 6, 6);
    ctx.fillStyle = P.yellow;
    ctx.fillRect(252, groundY + 12, 6, 6);
  }

  // fruit burst particles
  if (fruitBurst) {
    for (let i = 0; i < 16; i++) {
      const p = ((i * 7 + t) % 30) / 30;
      const fx = 240 + Math.cos(i) * p * 120;
      const fy = groundY + 12 - p * 80 + p * p * 40;
      const colors = [P.red, P.orange, P.yellow];
      ctx.fillStyle = colors[i % 3];
      ctx.fillRect(fx | 0, fy | 0, 3, 3);
    }
  }

  drawChumpTransformed(ctx, cx, cy, rotation, scale, facing, frame);

  // caption
  const caption = cs.captions.find((c) => t >= c.at && t < c.at + c.ttl);
  if (caption) {
    const localT = t - caption.at;
    const fade = localT < 4 ? localT / 4 : (localT > caption.ttl - 4 ? (caption.ttl - localT) / 4 : 1);
    ctx.globalAlpha = Math.max(0, Math.min(1, fade));
    drawCaption(ctx, caption.text);
    ctx.globalAlpha = 1;
  }

  // skip hint
  ctx.fillStyle = '#888';
  ctx.font = '10px ui-monospace, monospace';
  ctx.textAlign = 'right';
  ctx.textBaseline = 'alphabetic';
  ctx.fillText('SPACE to skip', CANVAS_W - 6, CANVAS_H - 6);
}

// ---------------------------------------------------------------------------
// Volcano VICTORY — chump finally gets caught on the caldera. No escape.
// The player's pixel sprite walks in, lunges, hoists chump overhead while
// the crater erupts in confetti.
// ---------------------------------------------------------------------------

function drawVolcanoBackground(ctx, t) {
  ctx.fillStyle = '#0c0308';
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H / 2);
  ctx.fillStyle = '#2a0a05';
  ctx.fillRect(0, CANVAS_H / 2 - 30, CANVAS_W, 60);
  ctx.fillStyle = '#1a0a05';
  ctx.beginPath();
  ctx.moveTo(0, CANVAS_H);
  ctx.lineTo(0, CANVAS_H - 60);
  ctx.lineTo(120, CANVAS_H - 180);
  ctx.lineTo(240, CANVAS_H - 110);
  ctx.lineTo(320, CANVAS_H - 190);
  ctx.lineTo(420, CANVAS_H - 110);
  ctx.lineTo(540, CANVAS_H - 160);
  ctx.lineTo(CANVAS_W, CANVAS_H - 70);
  ctx.lineTo(CANVAS_W, CANVAS_H);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = P.chumpOrange;
  ctx.globalAlpha = 0.55 + Math.sin(t * 0.25) * 0.1;
  ctx.beginPath();
  ctx.arc(320, CANVAS_H - 188, 22, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;
  ctx.fillStyle = P.yellow;
  ctx.fillRect(314, CANVAS_H - 192, 12, 4);
  ctx.fillStyle = P.chumpOrange;
  for (let i = 0; i < 8; i++) {
    const x = 280 + ((i * 17 + t) % 80);
    const y = CANVAS_H - 200 + ((i * 11 + t * 2) % 40);
    ctx.fillRect(x, y, 1, 1);
  }
  ctx.fillStyle = P.white;
  const stars = [[40, 30], [110, 55], [220, 20], [380, 40], [520, 60], [590, 30]];
  for (const [sx, sy] of stars) {
    if ((Math.floor(t / 10) + sx) % 3 !== 0) ctx.fillRect(sx, sy, 1, 1);
  }
}

function drawPlayerTransformed(ctx, cx, cy, facingIdx, frame, scale) {
  const faceName = FACE_NAME[facingIdx];
  const key = `player_${faceName}_${frame}`;
  ctx.save();
  ctx.translate(cx, cy);
  ctx.scale(scale, scale);
  cache.draw(ctx, key, -8, -8);
  ctx.restore();
}

function drawConfetti(ctx, t) {
  const colors = [P.chumpOrange, P.yellow, P.pink, P.green, P.blue, P.white];
  for (let i = 0; i < 40; i++) {
    const px = (i * 53) % CANVAS_W;
    const drop = ((i * 37 + t * 3) % (CANVAS_H + 80));
    const sway = Math.sin((i + t * 0.1) * 0.4) * 14;
    ctx.fillStyle = colors[i % colors.length];
    ctx.fillRect((px + sway) | 0, drop | 0, 3, 3);
  }
}

function drawVolcanoVictory(ctx, cs, alpha) {
  const t = cs.t + alpha;
  drawVolcanoBackground(ctx, t);

  const centerX = CANVAS_W / 2;
  const groundY = CANVAS_H - 200;

  let chumpX, chumpY, chumpRot, chumpScale, chumpFacing, chumpFrame;
  let playerX, playerY, playerFacing, playerFrame, playerScale;
  let showConfetti = false;
  let ropeLine = false;

  if (t < 40) {
    chumpX = centerX + 30;
    chumpY = groundY;
    chumpRot = Math.sin(t * 0.4) * 0.08;
    chumpScale = 3;
    chumpFacing = 3;
    chumpFrame = Math.floor(t / 4) % 2;
    playerX = centerX - 140 + (t / 40) * 80;
    playerY = groundY + 8;
    playerFacing = 1;
    playerFrame = Math.floor(t / 3) % 2;
    playerScale = 3;
  } else if (t < 80) {
    const p = (t - 40) / 40;
    chumpX = centerX + 30 - p * 40;
    chumpY = groundY - Math.sin(p * Math.PI) * 10;
    chumpRot = p * 0.5;
    chumpScale = 3;
    chumpFacing = 2;
    chumpFrame = Math.floor(t / 2) % 2;
    playerX = centerX - 60 + p * 30;
    playerY = groundY + 8 - Math.sin(p * Math.PI) * 6;
    playerFacing = 1;
    playerFrame = Math.floor(t / 2) % 2;
    playerScale = 3.2;
  } else if (t < 120) {
    const p = (t - 80) / 40;
    chumpX = centerX - 10;
    chumpY = groundY - 20 - p * 40;
    chumpRot = Math.PI * 0.6 - p * 0.3;
    chumpScale = 3;
    chumpFacing = 0;
    chumpFrame = 0;
    playerX = centerX - 34;
    playerY = groundY + 8;
    playerFacing = 2;
    playerFrame = Math.floor(t / 5) % 2;
    playerScale = 3.2;
    ropeLine = true;
  } else if (t < 160) {
    chumpX = centerX - 10;
    chumpY = groundY - 60 + Math.sin(t * 0.25) * 3;
    chumpRot = Math.PI * 0.3 + Math.sin(t * 0.2) * 0.1;
    chumpScale = 3;
    chumpFacing = 0;
    chumpFrame = Math.floor(t / 6) % 2;
    playerX = centerX - 34;
    playerY = groundY + 8;
    playerFacing = 2;
    playerFrame = Math.floor(t / 5) % 2;
    playerScale = 3.2;
    showConfetti = true;
    ropeLine = true;
  } else {
    chumpX = centerX - 10;
    chumpY = groundY - 66;
    chumpRot = Math.PI * 0.3 + Math.sin(t * 0.2) * 0.06;
    chumpScale = 3 + Math.sin(t * 0.2) * 0.06;
    chumpFacing = 0;
    chumpFrame = Math.floor(t / 6) % 2;
    playerX = centerX - 34;
    playerY = groundY + 8;
    playerFacing = 2;
    playerFrame = Math.floor(t / 6) % 2;
    playerScale = 3.2;
    showConfetti = true;
    ropeLine = true;
  }

  drawPlayerTransformed(ctx, playerX, playerY, playerFacing, playerFrame, playerScale);
  drawChumpTransformed(ctx, chumpX, chumpY, chumpRot, chumpScale, chumpFacing, chumpFrame);

  if (ropeLine) {
    ctx.strokeStyle = P.yellow;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(playerX + 6, playerY - 6);
    ctx.lineTo(chumpX - 2, chumpY + 8);
    ctx.stroke();
    ctx.lineWidth = 1;
  }

  if (showConfetti) drawConfetti(ctx, t);

  const caption = cs.captions.find((c) => t >= c.at && t < c.at + c.ttl);
  if (caption) {
    const localT = t - caption.at;
    const fade = localT < 4 ? localT / 4 : (localT > caption.ttl - 4 ? (caption.ttl - localT) / 4 : 1);
    ctx.globalAlpha = Math.max(0, Math.min(1, fade));
    drawCaption(ctx, caption.text);
    ctx.globalAlpha = 1;
  }

  ctx.fillStyle = '#888';
  ctx.font = '10px ui-monospace, monospace';
  ctx.textAlign = 'right';
  ctx.textBaseline = 'alphabetic';
  ctx.fillText('SPACE to skip', CANVAS_W - 6, CANVAS_H - 6);
}
