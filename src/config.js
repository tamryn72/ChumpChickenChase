// Chump Chicken Chase — global config

export const TITLE = 'Chump Chicken Chase';
export const CHICKEN_NAME = 'Chump';

// Grid / canvas
export const TILE = 32;
export const GRID_W = 20;
export const GRID_H = 15;
export const CANVAS_W = TILE * GRID_W; // 640
export const CANVAS_H = TILE * GRID_H; // 480

// Timing
export const TICK_HZ = 10;
export const TICK_MS = 1000 / TICK_HZ;

// URL flags — both guarded so node-based tooling (smoke tests) can import config.
function hasFlag(name) {
  if (typeof window === 'undefined' || !window.location) return false;
  return new URLSearchParams(window.location.search).has(name);
}

export const DEBUG = hasFlag('debug');
export const QUICKSTART = hasFlag('quickstart'); // skip MENU, boot straight to PLAN
