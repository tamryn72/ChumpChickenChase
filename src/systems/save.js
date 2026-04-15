// localStorage persistence. Graceful degradation if storage is blocked
// (incognito mode, sandboxed iframe, etc).

const KEY = 'chump_chicken_chase_v1';

const DEFAULT_SAVE = {
  worldsUnlocked: 1,
  bestStats: {},   // keyed by world number: snapshot of best run
  totalPlays: 0,
  gameComplete: false,  // set true once W5 is cleared
  clears: 0,            // how many times W5 has been beaten
  // Executive Clucks seen across all runs — cumulative. Used by the score
  // screen to show "EXECUTIVE CLUCKS SEEN: X/4" so the player knows there
  // are more flavors to discover.
  ordersSeen: {
    speed:      false,
    supersonic: false,
    foxes:      false,
    tropical:   false,
  },
  settings: {
    muted:         false, // global SFX mute
    volume:        1.0,   // 0..1.25, multiplies the base master gain
    reducedMotion: false, // kills screen shake, clamps particle counts
    highContrast:  false, // thicker sprite outlines + darker overlay
  },
};

function canUseStorage() {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

export function loadSave() {
  if (!canUseStorage()) return cloneDefault();
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return cloneDefault();
    const parsed = JSON.parse(raw);
    const merged = { ...cloneDefault(), ...parsed };
    // settings is nested, so merge individually to avoid losing new fields
    merged.settings   = { ...DEFAULT_SAVE.settings,   ...(parsed.settings   || {}) };
    merged.ordersSeen = { ...DEFAULT_SAVE.ordersSeen, ...(parsed.ordersSeen || {}) };
    return merged;
  } catch (e) {
    return cloneDefault();
  }
}

function cloneDefault() {
  return {
    ...DEFAULT_SAVE,
    bestStats: {},
    settings:   { ...DEFAULT_SAVE.settings },
    ordersSeen: { ...DEFAULT_SAVE.ordersSeen },
  };
}

export function saveSave(save) {
  if (!canUseStorage()) return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(save));
  } catch (e) {
    // quota exceeded or blocked — silently give up
  }
}

// Higher is better — favor buildings saved, then catches, penalize egg hits
function scoreRun(s) {
  return (s.buildingsSaved ?? 0) * 10
       + (s.catches ?? 0) * 5
       - (s.eggsHit ?? 0);
}

export function recordRun(save, worldNum, result, stats) {
  save.totalPlays += 1;
  if (result === 'won') {
    save.worldsUnlocked = Math.max(save.worldsUnlocked, worldNum + 1);
    const existing = save.bestStats[worldNum];
    if (!existing || scoreRun(stats) > scoreRun(existing)) {
      save.bestStats[worldNum] = { ...stats };
    }
    if (worldNum >= 5) {
      save.gameComplete = true;
      save.clears = (save.clears || 0) + 1;
    }
  }
  return save;
}
