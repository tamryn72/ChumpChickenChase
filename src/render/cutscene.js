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

// Dispatcher: each script has its own choreography function. For now both
// FARM_ESCAPE and MARKET_ESCAPE reuse the same base choreography (backflip +
// moonwalk + dab + sprint). Market gets its own bespoke visuals in M9-e.
export function drawCutscene(ctx, cs, alpha) {
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
