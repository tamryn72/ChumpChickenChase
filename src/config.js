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

// Debug flag (pulled from ?debug=1)
export const DEBUG = new URLSearchParams(window.location.search).has('debug');
