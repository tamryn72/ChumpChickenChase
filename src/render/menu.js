// Menu (title screen) + world select + score screen rendering.

import { CANVAS_W, CANVAS_H, TITLE } from '../config.js';
import * as cache from './sprite-cache.js';
import { P } from './palette.js';
import { WORLD_ORDER } from '../world/index.js';

// --- Title + world-select screen ---
// Menu layout:
//   big chump sprite, title, subtitle
//   world list (arrow keys to navigate, ENTER to launch)
//   instructions + credits
//
// game.menuIndex is the currently highlighted world row (zero-based in
// WORLD_ORDER).

export function drawMenu(ctx, game, save) {
  // background
  ctx.fillStyle = '#1a1208';
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

  // faint stars
  ctx.fillStyle = P.white;
  const starSeeds = [[30, 40], [80, 60], [140, 30], [210, 55], [270, 45],
                     [340, 70], [420, 35], [490, 60], [560, 40], [610, 75]];
  for (let i = 0; i < starSeeds.length; i++) {
    const [sx, sy] = starSeeds[i];
    if ((Math.floor(game.tick / 12) + i) % 4 !== 0) {
      ctx.fillRect(sx, sy, 1, 1);
    }
  }

  // ground
  ctx.fillStyle = '#2a1a0a';
  ctx.fillRect(0, CANVAS_H - 60, CANVAS_W, 60);

  // chump sprite (smaller now, on the left; world list takes the right)
  const bounceY = Math.sin(game.tick * 0.12) * 4;
  const frame = Math.floor(game.tick / 6) % 2;
  ctx.save();
  ctx.translate(140, CANVAS_H / 2 + 30 + bounceY);
  ctx.scale(3.5, 3.5);
  cache.draw(ctx, `chump_down_${frame}`, -12, -12);
  ctx.restore();

  // title
  ctx.textAlign = 'center';
  ctx.font = 'bold 30px ui-monospace, monospace';
  ctx.fillStyle = P.black;
  ctx.fillText(TITLE.toUpperCase(), CANVAS_W / 2 + 3, 50 + 3);
  ctx.fillStyle = P.chumpOrange;
  ctx.fillText(TITLE.toUpperCase(), CANVAS_W / 2, 50);

  // subtitle
  ctx.fillStyle = P.yellow;
  ctx.font = 'bold 11px ui-monospace, monospace';
  ctx.fillText('ORANGE CHICKEN CHAOS', CANVAS_W / 2, 70);

  // --- world list (right side) ---
  const listX = 340;
  const listY = 110;
  const rowH = 24;

  ctx.textAlign = 'left';
  ctx.font = 'bold 10px ui-monospace, monospace';
  ctx.fillStyle = P.white;
  ctx.fillText('SELECT WORLD', listX, listY - 14);

  for (let i = 0; i < WORLD_ORDER.length; i++) {
    const w = WORLD_ORDER[i];
    const y = listY + i * rowH;
    const unlocked = w.num <= save.worldsUnlocked && w.exists;
    const highlighted = i === game.menuIndex;

    // selection bar
    if (highlighted) {
      ctx.fillStyle = unlocked ? 'rgba(255,102,0,0.28)' : 'rgba(255,0,77,0.18)';
      ctx.fillRect(listX - 6, y - 12, 250, rowH - 4);
      ctx.fillStyle = unlocked ? P.chumpOrange : P.darkGrey;
      ctx.fillRect(listX - 6, y - 12, 2, rowH - 4);
    }

    // num + name
    let label = `${w.num}. ${w.name}`;
    if (!w.exists)      label += '  [SOON]';
    else if (!unlocked) label += '  [LOCKED]';
    else if (save.bestStats[w.num]) label += '  [x]';

    ctx.fillStyle = unlocked ? (highlighted ? P.white : P.lightGrey) : P.darkGrey;
    ctx.font = 'bold 12px ui-monospace, monospace';
    ctx.fillText(label, listX, y);

    // best score hint for beaten worlds
    const best = save.bestStats[w.num];
    if (best) {
      ctx.font = '8px ui-monospace, monospace';
      ctx.fillStyle = P.darkGrey;
      ctx.fillText(
        `best: ${best.buildingsSaved}/${best.buildingsTotal} saved, ` +
        `${(best.elapsedTicks / 10).toFixed(0)}s`,
        listX + 8, y + 9,
      );
    }
  }

  // --- controls hint ---
  ctx.fillStyle = P.lightGrey;
  ctx.font = '10px ui-monospace, monospace';
  ctx.textAlign = 'center';
  if (Math.floor(game.tick / 14) % 2 === 0) {
    ctx.fillText('ARROWS to pick  ENTER to play', CANVAS_W / 2, CANVAS_H - 34);
  }
  ctx.fillStyle = P.darkGrey;
  ctx.font = '9px ui-monospace, monospace';
  ctx.fillText(`worlds unlocked: ${save.worldsUnlocked} / 5`, CANVAS_W / 2, CANVAS_H - 18);

  // credit
  ctx.textAlign = 'left';
  ctx.fillStyle = P.darkGrey;
  ctx.fillText('chump chicken chase', 6, CANVAS_H - 6);
  ctx.textAlign = 'right';
  ctx.fillText('v0.1 dev', CANVAS_W - 6, CANVAS_H - 6);
}

// --- Score screen ---

export function drawScore(ctx, game) {
  ctx.fillStyle = 'rgba(0,0,0,0.82)';
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  const won = game.result === 'won';

  ctx.font = 'bold 28px ui-monospace, monospace';
  ctx.fillStyle = P.black;
  const title = won ? `${game.worldName || 'WORLD'} SAVED` : `${game.worldName || 'WORLD'} LOST`;
  ctx.fillText(title.toUpperCase(), CANVAS_W / 2 + 2, 48 + 2);
  ctx.fillStyle = won ? P.green : P.red;
  ctx.fillText(title.toUpperCase(), CANVAS_W / 2, 48);

  ctx.font = '10px ui-monospace, monospace';
  ctx.fillStyle = P.lightGrey;
  const sub = won
    ? 'chump escaped — for now'
    : 'chump has declared victory';
  ctx.fillText(sub, CANVAS_W / 2, 70);

  const s = game.resultStats || {};
  const rows = [
    ['CATCHES',         `${s.catches ?? 0} / ${s.catchesNeeded ?? 2}`],
    ['BUILDINGS SAVED', `${s.buildingsSaved ?? 0} / ${s.buildingsTotal ?? 0}`],
    ['TRAPS PLACED',    `${s.trapsPlaced ?? 0}`],
    ['EGGS DODGED',     `${s.eggsDodged ?? 0}`],
    ['EGGS LANDED',     `${s.eggsHit ?? 0}`],
    ['CATS TOSSED',     `${s.catsTossed ?? 0}`],
    ['BURGERS (CHUMP)', `${s.burgersChump ?? 0}`],
    ['TACOS (YOU)',     `${s.tacosPlayer ?? 0}`],
    ['TACOS (CHUMP)',   `${s.tacosChump ?? 0}`],
    ['TIME',            `${((s.elapsedTicks ?? 0) / 10).toFixed(1)}s`],
  ];

  ctx.font = '11px ui-monospace, monospace';
  const startY = 104;
  const rowH = 17;
  const labelX = CANVAS_W / 2 - 110;
  const valueX = CANVAS_W / 2 + 110;

  for (let i = 0; i < rows.length; i++) {
    const [label, value] = rows[i];
    const y = startY + i * rowH;
    ctx.textAlign = 'left';
    ctx.fillStyle = P.lightGrey;
    ctx.fillText(label, labelX, y);
    ctx.textAlign = 'right';
    ctx.fillStyle = P.white;
    ctx.fillText(value, valueX, y);
  }

  ctx.textAlign = 'center';
  if (Math.floor(game.tick / 12) % 2 === 0) {
    ctx.fillStyle = P.yellow;
    ctx.font = 'bold 12px ui-monospace, monospace';
    ctx.fillText('ENTER to continue', CANVAS_W / 2, CANVAS_H - 22);
  }
}
