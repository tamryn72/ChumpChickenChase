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

  // --- world list (right side, compact) ---
  const listX = 340;
  const listY = 100;
  const rowH = 19;

  const worldsFocused = game.menuColumn !== 'settings';

  ctx.textAlign = 'left';
  ctx.font = 'bold 10px ui-monospace, monospace';
  ctx.fillStyle = worldsFocused ? P.white : P.darkGrey;
  ctx.fillText('SELECT WORLD', listX, listY - 12);

  for (let i = 0; i < WORLD_ORDER.length; i++) {
    const w = WORLD_ORDER[i];
    const y = listY + i * rowH;
    const unlocked = w.num <= save.worldsUnlocked && w.exists;
    const highlighted = worldsFocused && i === game.menuIndex;

    if (highlighted) {
      ctx.fillStyle = unlocked ? 'rgba(255,102,0,0.28)' : 'rgba(255,0,77,0.18)';
      ctx.fillRect(listX - 6, y - 11, 250, rowH - 3);
      ctx.fillStyle = unlocked ? P.chumpOrange : P.darkGrey;
      ctx.fillRect(listX - 6, y - 11, 2, rowH - 3);
    }

    let label = `${w.num}. ${w.name}`;
    if (!w.exists)      label += '  [SOON]';
    else if (!unlocked) label += '  [LOCKED]';
    else if (save.bestStats[w.num]) label += '  [x]';

    ctx.fillStyle = unlocked
      ? (highlighted ? P.white : (worldsFocused ? P.lightGrey : P.darkGrey))
      : P.darkGrey;
    ctx.font = 'bold 11px ui-monospace, monospace';
    ctx.fillText(label, listX, y);

    const best = save.bestStats[w.num];
    if (best) {
      ctx.font = '7px ui-monospace, monospace';
      ctx.fillStyle = P.darkGrey;
      ctx.fillText(
        `${best.buildingsSaved}/${best.buildingsTotal}, ` +
        `${(best.elapsedTicks / 10).toFixed(0)}s`,
        listX + 160, y,
      );
    }
  }

  // --- settings panel (right side, below worlds) ---
  const setX = listX;
  const setY = listY + WORLD_ORDER.length * rowH + 16;
  const settingsFocused = game.menuColumn === 'settings';

  ctx.textAlign = 'left';
  ctx.font = 'bold 10px ui-monospace, monospace';
  ctx.fillStyle = settingsFocused ? P.white : P.darkGrey;
  ctx.fillText('SETTINGS', setX, setY - 12);

  const rows = [
    { key: 'muted',         label: 'SOUND',          onText: 'MUTED',  offText: 'ON' },
    { key: 'reducedMotion', label: 'REDUCED MOTION', onText: 'ON',     offText: 'OFF' },
    { key: 'highContrast',  label: 'HIGH CONTRAST',  onText: 'ON',     offText: 'OFF' },
  ];
  const srH = 15;
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const y = setY + i * srH;
    const value = save.settings?.[row.key] === true;
    const highlighted = settingsFocused && i === game.menuSettingIndex;
    if (highlighted) {
      ctx.fillStyle = 'rgba(41,173,255,0.22)';
      ctx.fillRect(setX - 6, y - 10, 250, srH - 2);
      ctx.fillStyle = P.blue;
      ctx.fillRect(setX - 6, y - 10, 2, srH - 2);
    }
    ctx.font = 'bold 10px ui-monospace, monospace';
    ctx.fillStyle = settingsFocused ? (highlighted ? P.white : P.lightGrey) : P.darkGrey;
    ctx.fillText(row.label, setX, y);
    // value pill on the right
    const pillText = value
      ? (row.key === 'muted' ? row.onText : row.onText)
      : (row.key === 'muted' ? row.offText : row.offText);
    const showAsOn = row.key === 'muted' ? !value : value;
    ctx.fillStyle = showAsOn ? P.green : P.darkGrey;
    ctx.textAlign = 'right';
    ctx.fillText(pillText, setX + 230, y);
    ctx.textAlign = 'left';
  }

  // --- controls hint ---
  ctx.fillStyle = P.lightGrey;
  ctx.font = '10px ui-monospace, monospace';
  ctx.textAlign = 'center';
  if (Math.floor(game.tick / 14) % 2 === 0) {
    const hint = settingsFocused
      ? 'UP/DOWN  ENTER toggle  TAB worlds'
      : 'UP/DOWN  ENTER play  TAB settings';
    ctx.fillText(hint, CANVAS_W / 2, CANVAS_H - 34);
  }
  ctx.fillStyle = P.darkGrey;
  ctx.font = '9px ui-monospace, monospace';
  const unlocked = Math.min(5, save.worldsUnlocked);
  const footer = save.gameComplete
    ? `ALL WORLDS CLEARED — chump captured x${save.clears || 1}`
    : `worlds unlocked: ${unlocked} / 5`;
  ctx.fillText(footer, CANVAS_W / 2, CANVAS_H - 18);

  // credit
  ctx.textAlign = 'left';
  ctx.fillStyle = P.darkGrey;
  ctx.fillText('chump chicken chase', 6, CANVAS_H - 6);
  ctx.textAlign = 'right';
  ctx.fillText('v0.1 dev', CANVAS_W - 6, CANVAS_H - 6);
}

// --- In-chase pause overlay ---

export function drawPause(ctx, game) {
  ctx.fillStyle = 'rgba(0,0,0,0.72)';
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

  ctx.textAlign = 'center';
  ctx.font = 'bold 26px ui-monospace, monospace';
  ctx.fillStyle = P.black;
  ctx.fillText('PAUSED', CANVAS_W / 2 + 2, 100 + 2);
  ctx.fillStyle = P.chumpOrange;
  ctx.fillText('PAUSED', CANVAS_W / 2, 100);

  ctx.font = '10px ui-monospace, monospace';
  ctx.fillStyle = P.lightGrey;
  ctx.fillText('ESC resume   UP/DOWN pick   ENTER toggle', CANVAS_W / 2, 126);

  const rows = [
    { label: 'RESUME' },
    { label: 'SOUND',          settingKey: 'muted',         invert: true  },
    { label: 'REDUCED MOTION', settingKey: 'reducedMotion', invert: false },
    { label: 'HIGH CONTRAST',  settingKey: 'highContrast',  invert: false },
    { label: 'QUIT TO MENU' },
  ];

  const startY = 170;
  const rowH = 32;
  ctx.textAlign = 'left';
  const cx = CANVAS_W / 2;
  for (let i = 0; i < rows.length; i++) {
    const r = rows[i];
    const y = startY + i * rowH;
    const highlighted = i === game.pauseIndex;
    if (highlighted) {
      ctx.fillStyle = 'rgba(255,102,0,0.28)';
      ctx.fillRect(cx - 150, y - 18, 300, rowH - 6);
      ctx.fillStyle = P.chumpOrange;
      ctx.fillRect(cx - 150, y - 18, 3, rowH - 6);
    }
    ctx.font = 'bold 14px ui-monospace, monospace';
    ctx.fillStyle = highlighted ? P.white : P.lightGrey;
    ctx.fillText(r.label, cx - 130, y);
    if (r.settingKey) {
      const raw = game.save.settings?.[r.settingKey] === true;
      const isOn = r.invert ? !raw : raw;
      ctx.textAlign = 'right';
      ctx.fillStyle = isOn ? P.green : P.darkGrey;
      ctx.fillText(isOn ? 'ON' : 'OFF', cx + 130, y);
      ctx.textAlign = 'left';
    }
  }
}

// --- Score screen ---

export function drawScore(ctx, game) {
  ctx.fillStyle = 'rgba(0,0,0,0.82)';
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  const won = game.result === 'won';
  const finalVictory = won && game.worldNum === 5;

  ctx.font = 'bold 28px ui-monospace, monospace';
  let title;
  if (finalVictory) title = 'GAME COMPLETE';
  else if (won)     title = `${game.worldName || 'WORLD'} SAVED`;
  else              title = `${game.worldName || 'WORLD'} LOST`;
  ctx.fillStyle = P.black;
  ctx.fillText(title.toUpperCase(), CANVAS_W / 2 + 2, 48 + 2);
  ctx.fillStyle = finalVictory ? P.yellow : (won ? P.green : P.red);
  ctx.fillText(title.toUpperCase(), CANVAS_W / 2, 48);

  ctx.font = '10px ui-monospace, monospace';
  ctx.fillStyle = P.lightGrey;
  let sub;
  if (finalVictory) sub = 'chump delivered — the town is saved';
  else if (won)     sub = 'chump escaped — for now';
  else              sub = 'chump has declared victory';
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
    const hint = finalVictory ? 'ENTER for menu  R to PLAY AGAIN' : 'ENTER to continue';
    ctx.fillText(hint, CANVAS_W / 2, CANVAS_H - 22);
  }
}
