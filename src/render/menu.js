// Menu (title screen) + world select + score screen rendering.

import { CANVAS_W, CANVAS_H, TITLE } from '../config.js';
import * as cache from './sprite-cache.js';
import { P } from './palette.js';
import { WORLD_ORDER } from '../world/index.js';

// Layout constants shared with touch hit-testing in main.js
const WORLD_LIST_X = 340;
const WORLD_LIST_Y = 100;
const WORLD_ROW_H  = 19;
const SETTINGS_ROW_H = 15;
const NUM_SETTINGS = 4;

// Computed layout for the title screen. Used by both the renderer and
// main.js's touch hit-testing. Rects are in canvas coordinates.
export function menuLayout() {
  const worlds = [];
  for (let i = 0; i < WORLD_ORDER.length; i++) {
    const y = WORLD_LIST_Y + i * WORLD_ROW_H;
    worlds.push({
      x: WORLD_LIST_X - 10,
      y: y - 12,
      w: 260,
      h: WORLD_ROW_H,
    });
  }
  const settingsY0 = WORLD_LIST_Y + WORLD_ORDER.length * WORLD_ROW_H + 16;
  const settings = [];
  for (let i = 0; i < NUM_SETTINGS; i++) {
    const y = settingsY0 + i * SETTINGS_ROW_H;
    settings.push({
      x: WORLD_LIST_X - 10,
      y: y - 11,
      w: 260,
      h: SETTINGS_ROW_H,
    });
  }
  return { worlds, settings };
}

// Layout of the pause menu rows — used for touch hit-testing.
// startY / rowH must match drawPause.
const PAUSE_START_Y = 150;
const PAUSE_ROW_H   = 28;
const PAUSE_ROWS    = 6;
export function pauseMenuLayout() {
  const rows = [];
  for (let i = 0; i < PAUSE_ROWS; i++) {
    rows.push({ y: PAUSE_START_Y + i * PAUSE_ROW_H });
  }
  return { rows, pickH: PAUSE_ROW_H };
}

// --- Title + world-select screen ---
// Menu layout:
//   big chump sprite, title, subtitle
//   world list (arrow keys to navigate, ENTER to launch)
//   instructions + credits
//
// game.menuIndex is the currently highlighted world row (zero-based in
// WORLD_ORDER).

// Intro staging timers (tick indices within menuIntroT).
// All times are in logic ticks (10Hz), so an 8-tick stage is 0.8s.
const INTRO_TITLE_START    = 0;   const INTRO_TITLE_LEN    = 10;
const INTRO_SUB_START      = 8;   const INTRO_SUB_LEN      = 10;
const INTRO_CHUMP_START    = 14;  const INTRO_CHUMP_LEN    = 20;
const INTRO_LIST_START     = 30;  const INTRO_LIST_LEN     = 16;
const INTRO_SETTINGS_START = 38;  const INTRO_SETTINGS_LEN = 14;

function clamp01(v) { return Math.max(0, Math.min(1, v)); }
function stage(t, start, len) { return clamp01((t - start) / len); }
function easeOut(t) { return 1 - Math.pow(1 - t, 3); }

export function drawMenu(ctx, game, save) {
  const it = game.menuIntroT ?? 999;

  // background
  ctx.fillStyle = '#1a1208';
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

  // faint stars — always on
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

  // --- chump sprite: stomps in from off-screen right, then idles ---
  const chumpStage = easeOut(stage(it, INTRO_CHUMP_START, INTRO_CHUMP_LEN));
  const steadyX = 140;
  const chumpX  = chumpStage < 1
    ? CANVAS_W + 100 - (CANVAS_W + 100 - steadyX) * chumpStage
    : steadyX;
  // stomp bob: big steps during the walk-in, idle bob once steady
  let bounceY;
  if (chumpStage < 1) {
    // each step ~4 ticks; bounce peaks at each
    const walkPhase = (it - INTRO_CHUMP_START) * 0.8;
    bounceY = -Math.abs(Math.sin(walkPhase)) * 6;
  } else {
    bounceY = Math.sin(game.tick * 0.12) * 4;
  }
  // frame 0/1 cycles faster during stomp-in
  const frame = chumpStage < 1
    ? (Math.floor((it - INTRO_CHUMP_START) * 0.6) % 2)
    : (Math.floor(game.tick / 6) % 2);
  // face direction: left while stomping in, down once idle
  const chumpKey = chumpStage < 1 ? `chump_left_${frame}` : `chump_down_${frame}`;
  if (chumpStage > 0) {
    ctx.save();
    ctx.translate(chumpX, CANVAS_H / 2 + 30 + bounceY);
    ctx.scale(3.5, 3.5);
    cache.draw(ctx, chumpKey, -12, -12);
    ctx.restore();
    // dust puffs under each step during the walk-in
    if (chumpStage < 1 && Math.floor((it - INTRO_CHUMP_START)) % 2 === 0) {
      ctx.save();
      ctx.globalAlpha = 0.6;
      ctx.fillStyle = '#5a4020';
      ctx.beginPath();
      ctx.arc(chumpX + 30, CANVAS_H / 2 + 70, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(chumpX + 45, CANVAS_H / 2 + 72, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  // --- title: drops in with overshoot bounce ---
  const titleStage = easeOut(stage(it, INTRO_TITLE_START, INTRO_TITLE_LEN));
  if (titleStage > 0) {
    const titleY = -30 + (50 + 30) * titleStage;
    ctx.save();
    ctx.globalAlpha = titleStage;
    ctx.textAlign = 'center';
    ctx.font = 'bold 30px ui-monospace, monospace';
    ctx.fillStyle = P.black;
    ctx.fillText(TITLE.toUpperCase(), CANVAS_W / 2 + 3, titleY + 3);
    ctx.fillStyle = P.chumpOrange;
    ctx.fillText(TITLE.toUpperCase(), CANVAS_W / 2, titleY);
    ctx.restore();
  }

  // --- subtitle: fades in ---
  const subStage = stage(it, INTRO_SUB_START, INTRO_SUB_LEN);
  if (subStage > 0) {
    ctx.save();
    ctx.globalAlpha = subStage;
    ctx.textAlign = 'center';
    ctx.fillStyle = P.yellow;
    ctx.font = 'bold 11px ui-monospace, monospace';
    ctx.fillText('ORANGE CHICKEN CHAOS', CANVAS_W / 2, 70);
    ctx.restore();
  }

  // --- world list (right side, compact) ---
  const listStage = stage(it, INTRO_LIST_START, INTRO_LIST_LEN);
  if (listStage <= 0) return; // list hasn't started fading in yet
  ctx.save();
  ctx.globalAlpha = listStage;
  const listSlideX = (1 - listStage) * 40;
  ctx.translate(listSlideX, 0);
  const listX = WORLD_LIST_X;
  const listY = WORLD_LIST_Y;
  const rowH = WORLD_ROW_H;

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

  ctx.restore();

  // --- settings panel (right side, below worlds) ---
  const settingsStage = stage(it, INTRO_SETTINGS_START, INTRO_SETTINGS_LEN);
  if (settingsStage <= 0) return;
  ctx.save();
  ctx.globalAlpha = settingsStage;
  const setSlideX = (1 - settingsStage) * 40;
  ctx.translate(setSlideX, 0);
  const setX = listX;
  const setY = listY + WORLD_ORDER.length * rowH + 16;
  const settingsFocused = game.menuColumn === 'settings';

  ctx.textAlign = 'left';
  ctx.font = 'bold 10px ui-monospace, monospace';
  ctx.fillStyle = settingsFocused ? P.white : P.darkGrey;
  ctx.fillText('SETTINGS', setX, setY - 12);

  const rows = [
    { key: 'muted',         label: 'SOUND',          onText: 'MUTED',  offText: 'ON' },
    { key: 'volume',        label: 'VOLUME' },
    { key: 'reducedMotion', label: 'REDUCED MOTION', onText: 'ON',     offText: 'OFF' },
    { key: 'highContrast',  label: 'HIGH CONTRAST',  onText: 'ON',     offText: 'OFF' },
  ];
  const srH = SETTINGS_ROW_H;
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const y = setY + i * srH;
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
    // right-aligned value pill
    ctx.textAlign = 'right';
    if (row.key === 'volume') {
      const v = save.settings?.volume ?? 1;
      const pct = Math.round(v * 100) + '%';
      ctx.fillStyle = v > 0 ? P.green : P.darkGrey;
      ctx.fillText(pct, setX + 230, y);
    } else {
      const value = save.settings?.[row.key] === true;
      const pillText = value ? row.onText : row.offText;
      const showAsOn = row.key === 'muted' ? !value : value;
      ctx.fillStyle = showAsOn ? P.green : P.darkGrey;
      ctx.fillText(pillText, setX + 230, y);
    }
    ctx.textAlign = 'left';
  }
  ctx.restore();

  drawMenuFooter(ctx, game, save, it);
}

function drawMenuFooter(ctx, game, save, it) {
  const settingsFocused = game.menuColumn === 'settings';
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

// --- State transition flash + banner ---
//
// Played every time setState() bumps game.transitionT. A full-screen orange
// flash fades out while a big bold label slides in from the right. Only
// state changes worth narrating get a label — for the rest, just the flash.

const TRANSITION_MAX = 14; // must match main.js TRANSITION_LEN

function transitionLabel(state) {
  if (state === 'PLAN')           return 'PLAN';
  if (state === 'CHASE')          return 'CHASE!';
  if (state === 'ESCAPE_CUTSCENE') return 'HE ESCAPED';
  return null;
}

export function drawTransition(ctx, game) {
  const t = game.transitionT || 0;
  if (t <= 0) return;
  const frac = t / TRANSITION_MAX;            // 1 at start → 0 at end
  const fadeOut = Math.pow(frac, 1.4);

  // chunky diagonal orange wipe across the canvas
  ctx.save();
  ctx.globalAlpha = fadeOut * 0.72;
  ctx.fillStyle = P.chumpOrange;
  const cover = 1 - frac;                     // 0 → 1 over the duration
  const barX  = -120 + cover * (CANVAS_W + 240);
  ctx.beginPath();
  ctx.moveTo(barX,            0);
  ctx.lineTo(barX + 180,      0);
  ctx.lineTo(barX + 180 - 80, CANVAS_H);
  ctx.lineTo(barX - 80,       CANVAS_H);
  ctx.closePath();
  ctx.fill();
  // dark leading edge
  ctx.globalAlpha = fadeOut * 0.9;
  ctx.fillStyle = P.chumpDeep;
  ctx.beginPath();
  ctx.moveTo(barX + 170,      0);
  ctx.lineTo(barX + 180,      0);
  ctx.lineTo(barX + 180 - 80, CANVAS_H);
  ctx.lineTo(barX + 170 - 80, CANVAS_H);
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  // banner label (slides in from right with a slight overshoot)
  const label = transitionLabel(game.state);
  if (label) {
    ctx.save();
    const labelT = 1 - frac;
    const easeT = 1 - Math.pow(1 - Math.min(1, labelT * 1.4), 3);
    const bx = CANVAS_W / 2 + (1 - easeT) * 220;
    ctx.globalAlpha = fadeOut;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = 'bold 42px ui-monospace, monospace';
    ctx.fillStyle = P.black;
    ctx.fillText(label, bx + 4, CANVAS_H / 2 + 4);
    ctx.fillStyle = P.white;
    ctx.fillText(label, bx, CANVAS_H / 2);
    ctx.restore();
  }
}

// --- Executive Cluck signing ceremony ---
//
// Played in SIGNING state (between GOTCHA and the next CHASE, on the first
// catch of a level). Parchment scroll slides in from the right, Chump stands
// to the left dipping his beak, a red "SIGNED" stamp slams on. Skippable
// with Enter/Space. Total duration matches SIGNING_LEN in main.js (32 ticks).

const SIGNING_TOTAL = 32;

const ORDER_INFO = {
  speed: {
    title: 'ORDER FOR SPEED',
    tagline: '"for efficiency reasons"',
    lines: ['player inputs now queue', 'one tick late, believe me'],
  },
  supersonic: {
    title: 'SUPERSONIC ORDER',
    tagline: '"going supersonic, folks"',
    lines: ['chump can trigger slow-mo', 'on the player at will'],
  },
  foxes: {
    title: 'RED FOXES DIRECTIVE',
    tagline: '"very red, very fox"',
    lines: ['three fox minions appear', 'to stagger the player'],
  },
  tropical: {
    title: 'TROPICAL ORDER',
    tagline: '"beautiful weather, really"',
    lines: ['chump now throws ice cubes', 'that freeze on a direct hit'],
  },
};

export function drawSigning(ctx, game) {
  // dim the world behind the overlay
  ctx.fillStyle = 'rgba(0,0,0,0.68)';
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

  const T = game.signingT || 0;
  const elapsed = SIGNING_TOTAL - T;

  // scroll slide-in from right (done by elapsed=8)
  const slide = Math.min(1, elapsed / 8);
  const ease = 1 - Math.pow(1 - slide, 3);
  const scrollW = 460;
  const scrollH = 220;
  const targetX = CANVAS_W - scrollW - 30;
  const scrollX = (CANVAS_W + 40) - ((CANVAS_W + 40) - targetX) * ease;
  const scrollY = 130;

  // parchment body
  ctx.fillStyle = '#f0dba8';
  ctx.fillRect(scrollX, scrollY, scrollW, scrollH);
  ctx.fillStyle = '#e2c68a';
  ctx.fillRect(scrollX, scrollY, scrollW, 5);
  ctx.fillRect(scrollX, scrollY + scrollH - 5, scrollW, 5);
  // rolled ends (darker vertical bars)
  ctx.fillStyle = '#8b6b38';
  ctx.fillRect(scrollX - 10, scrollY - 6, 10, scrollH + 12);
  ctx.fillRect(scrollX + scrollW, scrollY - 6, 10, scrollH + 12);
  ctx.fillStyle = '#5a3f18';
  ctx.fillRect(scrollX - 10, scrollY - 6, 10, 3);
  ctx.fillRect(scrollX - 10, scrollY + scrollH + 3, 10, 3);
  ctx.fillRect(scrollX + scrollW, scrollY - 6, 10, 3);
  ctx.fillRect(scrollX + scrollW, scrollY + scrollH + 3, 10, 3);

  const info = ORDER_INFO[game.execOrder] || ORDER_INFO.speed;

  // header
  ctx.fillStyle = '#2a1208';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  ctx.font = 'bold 13px ui-monospace, monospace';
  ctx.fillText('EXECUTIVE CLUCK', scrollX + scrollW / 2, scrollY + 28);
  // horizontal rule
  ctx.fillRect(scrollX + 40, scrollY + 36, scrollW - 80, 1);
  // order name (big)
  ctx.font = 'bold 22px ui-monospace, monospace';
  ctx.fillStyle = '#8b1f08';
  ctx.fillText(info.title, scrollX + scrollW / 2, scrollY + 72);
  // tagline
  ctx.font = 'italic 11px ui-monospace, monospace';
  ctx.fillStyle = '#5a3018';
  ctx.fillText(info.tagline, scrollX + scrollW / 2, scrollY + 94);
  // description lines
  ctx.font = '11px ui-monospace, monospace';
  ctx.fillStyle = '#2a1208';
  for (let i = 0; i < info.lines.length; i++) {
    ctx.fillText(info.lines[i], scrollX + scrollW / 2, scrollY + 124 + i * 14);
  }

  // red "SIGNED" stamp — appears after beak dip, grows into place
  const stampElapsed = elapsed - 18;
  if (stampElapsed >= 0) {
    const growthT = Math.min(1, stampElapsed / 3);
    const stampScale = 2.2 - growthT * 1.2; // slams down from 2.2x → 1.0x
    ctx.save();
    ctx.translate(scrollX + scrollW - 84, scrollY + scrollH - 44);
    ctx.rotate(-0.18);
    ctx.scale(stampScale, stampScale);
    ctx.globalAlpha = growthT;
    ctx.strokeStyle = '#b00020';
    ctx.lineWidth = 3;
    ctx.strokeRect(-42, -22, 84, 44);
    ctx.strokeRect(-37, -17, 74, 34);
    ctx.fillStyle = '#b00020';
    ctx.font = 'bold 16px ui-monospace, monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('SIGNED', 0, 0);
    ctx.restore();
    ctx.lineWidth = 1;
  }

  // Chump standing to the left of the scroll, dipping his beak on each
  // "sign" beat. Appears as the scroll finishes sliding in.
  if (slide >= 0.6) {
    const beakDip = Math.abs(Math.sin(elapsed * 0.5)) * 4;
    ctx.save();
    ctx.translate(60 + 80, scrollY + scrollH / 2 + beakDip);
    ctx.scale(3, 3);
    const frame = Math.floor(elapsed / 3) % 2;
    cache.draw(ctx, `chump_right_${frame}`, -12, -12);
    ctx.restore();
    // scratchy quill line next to his beak
    ctx.fillStyle = P.black;
    ctx.fillRect(60 + 140, scrollY + scrollH / 2 - 2 + beakDip, 14, 1);
  }

  // skip hint
  if (Math.floor(game.tick / 10) % 2 === 0) {
    ctx.fillStyle = P.lightGrey;
    ctx.font = '9px ui-monospace, monospace';
    ctx.textAlign = 'center';
    ctx.fillText('ENTER / tap to skip', CANVAS_W / 2, CANVAS_H - 12);
  }
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
    { label: 'VOLUME',         settingKey: 'volume' },
    { label: 'REDUCED MOTION', settingKey: 'reducedMotion', invert: false },
    { label: 'HIGH CONTRAST',  settingKey: 'highContrast',  invert: false },
    { label: 'QUIT TO MENU' },
  ];

  const startY = PAUSE_START_Y;
  const rowH = PAUSE_ROW_H;
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
      ctx.textAlign = 'right';
      if (r.settingKey === 'volume') {
        const v = game.save.settings?.volume ?? 1;
        ctx.fillStyle = v > 0 ? P.green : P.darkGrey;
        ctx.fillText(Math.round(v * 100) + '%', cx + 130, y);
      } else {
        const raw = game.save.settings?.[r.settingKey] === true;
        const isOn = r.invert ? !raw : raw;
        ctx.fillStyle = isOn ? P.green : P.darkGrey;
        ctx.fillText(isOn ? 'ON' : 'OFF', cx + 130, y);
      }
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
  const ordersSeen = game.save?.ordersSeen || {};
  const ordersSeenCount = ['speed', 'supersonic', 'foxes', 'tropical']
    .reduce((n, k) => n + (ordersSeen[k] ? 1 : 0), 0);
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
    ['EXEC CLUCKS SEEN', `${ordersSeenCount} / 4`],
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
