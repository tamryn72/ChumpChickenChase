// Menu (title screen) + score screen rendering.

import { CANVAS_W, CANVAS_H, TITLE } from '../config.js';
import * as cache from './sprite-cache.js';
import { P } from './palette.js';

// --- Title screen ---

export function drawMenu(ctx, game, save) {
  // starfield background
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

  // giant chicken (4x scale) bouncing
  const bounceY = Math.sin(game.tick * 0.12) * 5;
  const frame = Math.floor(game.tick / 6) % 2;
  ctx.save();
  ctx.translate(CANVAS_W / 2, CANVAS_H / 2 + 20 + bounceY);
  ctx.scale(4, 4);
  cache.draw(ctx, `chump_down_${frame}`, -12, -12);
  ctx.restore();

  // title
  ctx.textAlign = 'center';
  ctx.font = 'bold 36px ui-monospace, monospace';
  // shadow
  ctx.fillStyle = P.black;
  ctx.fillText(TITLE.toUpperCase(), CANVAS_W / 2 + 3, 56 + 3);
  // orange fill
  ctx.fillStyle = P.chumpOrange;
  ctx.fillText(TITLE.toUpperCase(), CANVAS_W / 2, 56);

  // subtitle
  ctx.fillStyle = P.yellow;
  ctx.font = 'bold 12px ui-monospace, monospace';
  ctx.fillText('ORANGE CHICKEN CHAOS', CANVAS_W / 2, 78);

  // prompt (blinks)
  if (Math.floor(game.tick / 12) % 2 === 0) {
    ctx.fillStyle = P.white;
    ctx.font = 'bold 14px ui-monospace, monospace';
    ctx.fillText('PRESS ENTER TO START', CANVAS_W / 2, CANVAS_H - 70);
  }

  // worlds unlocked
  ctx.fillStyle = P.lightGrey;
  ctx.font = '10px ui-monospace, monospace';
  let worldDots = '';
  for (let w = 1; w <= 5; w++) {
    worldDots += (w <= save.worldsUnlocked) ? '1 ' : '? ';
  }
  ctx.fillText('WORLDS  ' + worldDots.trim(), CANVAS_W / 2, CANVAS_H - 44);

  const plays = save.totalPlays || 0;
  if (plays > 0) {
    ctx.fillStyle = P.darkGrey;
    ctx.font = '9px ui-monospace, monospace';
    ctx.fillText(`runs: ${plays}`, CANVAS_W / 2, CANVAS_H - 28);
  }

  // credit
  ctx.fillStyle = P.darkGrey;
  ctx.font = '9px ui-monospace, monospace';
  ctx.textAlign = 'left';
  ctx.fillText('chump chicken chase', 6, CANVAS_H - 6);
  ctx.textAlign = 'right';
  ctx.fillText('v0.1 dev', CANVAS_W - 6, CANVAS_H - 6);
}

// --- Score screen ---

export function drawScore(ctx, game) {
  // dim the game scene behind it
  ctx.fillStyle = 'rgba(0,0,0,0.82)';
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  const won = game.result === 'won';

  // banner
  ctx.font = 'bold 30px ui-monospace, monospace';
  ctx.fillStyle = P.black;
  const title = won ? 'FARM SAVED' : 'FARM LOST';
  ctx.fillText(title, CANVAS_W / 2 + 2, 52 + 2);
  ctx.fillStyle = won ? P.green : P.red;
  ctx.fillText(title, CANVAS_W / 2, 52);

  // subtitle quip
  ctx.font = '10px ui-monospace, monospace';
  ctx.fillStyle = P.lightGrey;
  const sub = won
    ? 'chump escaped — for now'
    : 'chump has declared victory';
  ctx.fillText(sub, CANVAS_W / 2, 74);

  // stats table
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
  const startY = 108;
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

  // prompt
  ctx.textAlign = 'center';
  if (Math.floor(game.tick / 12) % 2 === 0) {
    ctx.fillStyle = P.yellow;
    ctx.font = 'bold 12px ui-monospace, monospace';
    ctx.fillText('ENTER to continue', CANVAS_W / 2, CANVAS_H - 22);
  }
}
