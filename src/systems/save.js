// localStorage persistence. Graceful degradation if storage is blocked
// (incognito mode, sandboxed iframe, etc).

const KEY = 'chump_chicken_chase_v1';

const DEFAULT_SAVE = {
  worldsUnlocked: 1,
  bestStats: {},   // keyed by world number: snapshot of best run
  totalPlays: 0,
  gameComplete: false,  // set true once W5 is cleared
  clears: 0,            // how many times W5 has been beaten
};

function canUseStorage() {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

export function loadSave() {
  if (!canUseStorage()) return { ...DEFAULT_SAVE };
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return { ...DEFAULT_SAVE };
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_SAVE, ...parsed };
  } catch (e) {
    return { ...DEFAULT_SAVE };
  }
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
