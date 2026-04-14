// HUD rendering: catches counter, phase banner, timer, trap palette, state messages.

import { CANVAS_W, CANVAS_H, TILE } from '../config.js';
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

  // --- bottom hint strip during PLAN ---
  if (game.state === 'PLAN') {
    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    ctx.fillRect(0, CANVAS_H - 18, CANVAS_W, 18);
    ctx.fillStyle = P.white;
    ctx.textAlign = 'center';
    ctx.fillText(
      'Click a walkable tile to place a trap.  [1][2][3] select.',
      CANVAS_W / 2, CANVAS_H - 9,
    );
  }

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
