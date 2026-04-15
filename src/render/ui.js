// HUD rendering: catches counter, phase banner, timer, trap palette, state messages.

import { CANVAS_W, CANVAS_H, TILE } from '../config.js';
import * as cache from './sprite-cache.js';
import { P } from './palette.js';
import { TRAP_TYPES } from '../entities/trap.js';

const TRAP_LABEL = {
  [TRAP_TYPES.NET]:         '[1] NET',
  [TRAP_TYPES.BANANA]:      '[2] BAN',
  [TRAP_TYPES.CAGE]:        '[3] CAGE',
  [TRAP_TYPES.GLUE]:        '[4] GLUE',
  [TRAP_TYPES.CORN_DECOY]:  '[5] CORN',
  [TRAP_TYPES.PRETTY_HEN]:  '[6] HEN',
  [TRAP_TYPES.BURGER_BAIT]: '[7] BAIT',
  [TRAP_TYPES.CAT_DECOY]:   '[8] CAT',
};

// Canonical display order (matches keybindings)
const TRAP_DISPLAY_ORDER = [
  TRAP_TYPES.CAT_DECOY,
  TRAP_TYPES.BURGER_BAIT,
  TRAP_TYPES.PRETTY_HEN,
  TRAP_TYPES.CORN_DECOY,
  TRAP_TYPES.GLUE,
  TRAP_TYPES.CAGE,
  TRAP_TYPES.BANANA,
  TRAP_TYPES.NET,
];

function formatSeconds(ticks) {
  return Math.max(0, Math.ceil(ticks / 10));
}

export function drawHUD(ctx, game) {
  // --- top strip ---
  ctx.fillStyle = 'rgba(0,0,0,0.55)';
  ctx.fillRect(0, 0, CANVAS_W, 22);

  ctx.font = 'bold 10px ui-monospace, monospace';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';

  // catches (left)
  ctx.fillStyle = P.white;
  ctx.fillText(`CATCHES ${game.catches}/${game.catchesNeeded}`, 6, 11);

  // state + timer (center)
  ctx.textAlign = 'center';
  if (game.state === 'PLAN') {
    ctx.fillStyle = P.yellow;
    ctx.fillText(
      `PLAN PHASE   ${formatSeconds(game.planTimer)}s   (ENTER to start)`,
      CANVAS_W / 2, 11,
    );
  } else if (game.state === 'CHASE') {
    ctx.fillStyle = P.chumpOrange;
    ctx.fillText(
      `CHASE   ${formatSeconds(game.chaseTimer)}s`,
      CANVAS_W / 2, 11,
    );
  } else if (game.state === 'GOTCHA') {
    ctx.fillStyle = P.green;
    ctx.fillText('GOTCHA!!', CANVAS_W / 2, 11);
  } else if (game.state === 'VICTORY') {
    ctx.fillStyle = P.green;
    ctx.fillText('LEVEL COMPLETE — click to retry', CANVAS_W / 2, 11);
  } else if (game.state === 'GAMEOVER') {
    ctx.fillStyle = P.red;
    ctx.fillText('HE ESCAPED — click to retry', CANVAS_W / 2, 11);
  }

  // trap palette (right) — only show traps that are in this world's inventory
  ctx.textAlign = 'right';
  let x = CANVAS_W - 6;
  for (const t of TRAP_DISPLAY_ORDER) {
    if (game.inventory[t] === undefined) continue;
    const label = `${TRAP_LABEL[t]} ${game.inventory[t]}`;
    if (t === game.selectedTrap) {
      ctx.fillStyle = P.yellow;
    } else if (game.inventory[t] <= 0) {
      ctx.fillStyle = P.darkGrey;
    } else {
      ctx.fillStyle = P.white;
    }
    const w = ctx.measureText(label).width;
    ctx.fillText(label, x, 11);
    if (t === game.selectedTrap) {
      ctx.fillStyle = P.yellow;
      ctx.fillRect(x - w - 2, 18, w + 4, 1);
    }
    x -= w + 14;
  }

  // --- bottom hint strip during PLAN (desktop only; touch draws its own) ---
  if (game.state === 'PLAN' && !game.touchActive) {
    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    ctx.fillRect(0, CANVAS_H - 18, CANVAS_W, 18);
    ctx.fillStyle = P.white;
    ctx.textAlign = 'center';
    ctx.fillText(
      'Click a walkable tile to place a trap.  [1][2][3] select.',
      CANVAS_W / 2, CANVAS_H - 9,
    );
  }

  // --- touch controls (virtual d-pad, pause, GO, trap palette) ---
  drawTouchControls(ctx, game);

  // --- big centered overlay for VICTORY / GAMEOVER ---
  if (game.state === 'VICTORY' || game.state === 'GAMEOVER') {
    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    ctx.fillRect(0, CANVAS_H / 2 - 28, CANVAS_W, 56);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = 'bold 24px ui-monospace, monospace';
    ctx.fillStyle = game.state === 'VICTORY' ? P.green : P.red;
    ctx.fillText(
      game.state === 'VICTORY' ? 'GOT HIM' : 'HE ESCAPED',
      CANVAS_W / 2, CANVAS_H / 2 - 6,
    );
    ctx.font = '10px ui-monospace, monospace';
    ctx.fillStyle = P.white;
    ctx.fillText('click anywhere to retry', CANVAS_W / 2, CANVAS_H / 2 + 16);
  }
}

// Highlight hovered tile during PLAN phase.
export function drawPlaceCursor(ctx, game, hoverCol, hoverRow) {
  if (game.state !== 'PLAN') return;
  if (hoverCol < 0 || hoverRow < 0) return;
  if (hoverCol >= game.level.w || hoverRow >= game.level.h) return;

  const walkable = game.level.isWalkable(hoverCol, hoverRow);
  ctx.strokeStyle = walkable ? P.yellow : P.red;
  ctx.lineWidth = 1;
  ctx.strokeRect(
    hoverCol * TILE + 0.5,
    hoverRow * TILE + 0.5,
    TILE - 1,
    TILE - 1,
  );
}

// ---------------------------------------------------------------------------
// Touch controls — virtual d-pad, pause button, GO button, trap palette strip.
//
// Layouts are exported so main.js can hit-test against them without
// duplicating geometry.
// ---------------------------------------------------------------------------

export const TOUCH_DPAD      = { cx: 76,  cy: CANVAS_H - 76, r: 52 };
export const TOUCH_PAUSE_BTN = { x: CANVAS_W - 44, y: CANVAS_H - 44, w: 36, h: 36 };
export const TOUCH_GO_BTN    = { x: CANVAS_W - 104, y: CANVAS_H - 72, w: 96, h: 52 };

// Returns an array of tappable trap slot rects for PLAN phase:
// [{ type, x, y, w, h }, ...]
export function trapPaletteSlots(game) {
  const slots = [];
  const entries = TRAP_DISPLAY_ORDER.filter((t) => game.inventory[t] !== undefined);
  if (entries.length === 0) return slots;
  const slotW = 54;
  const slotH = 44;
  const gap = 3;
  const totalW = entries.length * slotW + (entries.length - 1) * gap;
  const startX = Math.max(6, Math.floor((CANVAS_W - totalW) / 2));
  const y = CANVAS_H - slotH - 4;
  for (let i = 0; i < entries.length; i++) {
    slots.push({
      type: entries[i],
      x: startX + i * (slotW + gap),
      y,
      w: slotW,
      h: slotH,
    });
  }
  return slots;
}

export function drawTouchControls(ctx, game) {
  if (!game.touchActive) return;
  if (game.paused) return; // pause overlay draws its own controls
  if (game.state === 'CHASE') {
    drawDPad(ctx);
    drawPauseBtn(ctx);
  } else if (game.state === 'PLAN') {
    drawTrapPaletteStrip(ctx, game);
    drawGoBtn(ctx);
  }
}

function drawDPad(ctx) {
  const { cx, cy, r } = TOUCH_DPAD;
  ctx.save();
  // backing disc
  ctx.globalAlpha = 0.35;
  ctx.fillStyle = '#000';
  ctx.beginPath();
  ctx.arc(cx, cy, r + 4, 0, Math.PI * 2);
  ctx.fill();
  // ring
  ctx.globalAlpha = 0.75;
  ctx.strokeStyle = P.white;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.stroke();
  ctx.lineWidth = 1;
  // chevrons
  ctx.fillStyle = P.white;
  const chev = (x0, y0, x1, y1, x2, y2) => {
    ctx.beginPath();
    ctx.moveTo(x0, y0);
    ctx.lineTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.closePath();
    ctx.fill();
  };
  chev(cx,           cy - r + 8,  cx - 8, cy - r + 20, cx + 8, cy - r + 20); // up
  chev(cx,           cy + r - 8,  cx - 8, cy + r - 20, cx + 8, cy + r - 20); // down
  chev(cx - r + 8,   cy,          cx - r + 20, cy - 8, cx - r + 20, cy + 8); // left
  chev(cx + r - 8,   cy,          cx + r - 20, cy - 8, cx + r - 20, cy + 8); // right
  ctx.restore();
}

function drawPauseBtn(ctx) {
  const { x, y, w, h } = TOUCH_PAUSE_BTN;
  ctx.save();
  ctx.globalAlpha = 0.55;
  ctx.fillStyle = '#000';
  ctx.fillRect(x, y, w, h);
  ctx.globalAlpha = 0.85;
  ctx.strokeStyle = P.white;
  ctx.lineWidth = 2;
  ctx.strokeRect(x + 1, y + 1, w - 2, h - 2);
  ctx.lineWidth = 1;
  ctx.fillStyle = P.white;
  ctx.fillRect(x + 10, y + 9,  4, 18);
  ctx.fillRect(x + 22, y + 9,  4, 18);
  ctx.restore();
}

function drawGoBtn(ctx) {
  const { x, y, w, h } = TOUCH_GO_BTN;
  ctx.save();
  ctx.globalAlpha = 0.92;
  ctx.fillStyle = P.chumpOrange;
  ctx.fillRect(x, y, w, h);
  ctx.fillStyle = P.chumpDeep;
  ctx.fillRect(x, y + h - 4, w, 4);
  ctx.strokeStyle = P.white;
  ctx.lineWidth = 2;
  ctx.strokeRect(x + 1, y + 1, w - 2, h - 2);
  ctx.lineWidth = 1;
  ctx.fillStyle = P.white;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = 'bold 18px ui-monospace, monospace';
  ctx.fillText('START', x + w / 2, y + h / 2 - 1);
  ctx.restore();
}

function drawTrapPaletteStrip(ctx, game) {
  const slots = trapPaletteSlots(game);
  if (slots.length === 0) return;
  ctx.save();
  // darken strip backing
  ctx.globalAlpha = 0.45;
  ctx.fillStyle = '#000';
  ctx.fillRect(0, slots[0].y - 4, CANVAS_W, slots[0].h + 8);
  ctx.globalAlpha = 1;
  for (const s of slots) {
    const count = game.inventory[s.type] ?? 0;
    const selected = game.selectedTrap === s.type;
    const disabled = count <= 0;
    ctx.globalAlpha = selected ? 0.92 : 0.72;
    ctx.fillStyle = selected ? '#4a2200' : (disabled ? '#181818' : '#1a1a1a');
    ctx.fillRect(s.x, s.y, s.w, s.h);
    ctx.globalAlpha = 1;
    ctx.strokeStyle = selected ? P.chumpOrange : (disabled ? P.darkGrey : P.lightGrey);
    ctx.lineWidth = selected ? 2 : 1;
    ctx.strokeRect(s.x + 1, s.y + 1, s.w - 2, s.h - 2);
    ctx.lineWidth = 1;
    // sprite (centered, scaled 1.5x for readability)
    const sprite = cache.get('trap_' + s.type);
    if (sprite) {
      const scale = 1.5;
      const sw = sprite.width * scale;
      const sh = sprite.height * scale;
      ctx.save();
      if (disabled) ctx.globalAlpha = 0.4;
      ctx.drawImage(sprite, s.x + (s.w - sw) / 2, s.y + 4, sw, sh);
      ctx.restore();
    }
    // count
    ctx.fillStyle = disabled ? P.darkGrey : P.white;
    ctx.font = 'bold 11px ui-monospace, monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'alphabetic';
    ctx.fillText('x' + count, s.x + s.w / 2, s.y + s.h - 4);
  }
  ctx.restore();
}
