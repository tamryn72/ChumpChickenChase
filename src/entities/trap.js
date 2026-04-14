// Trap entities placed on tiles during the PLAN phase.
//
// Trap types and their behavior in chicken.js:
//   NET     - passive, stun 30t (3s)
//   BANANA  - passive, stun 20t + slide 1 tile in travel direction
//   CAGE    - passive, stun 40t (4s). Shortened in final form.
//   GLUE    - passive, stun 50t (5s). Super sticky — longest basic stun.
//   CORN_DECOY - ACTIVE: chicken AI seeks it. On arrival, 50t lock-in
//                 ("eating") that frees up a catch window.

export const TRAP_TYPES = {
  NET:        'net',
  BANANA:     'banana',
  CAGE:       'cage',
  GLUE:       'glue',
  CORN_DECOY: 'corn_decoy',
};

// Stun durations in ticks (10Hz logic). 30 ticks ~= 3 real seconds.
export const TRAP_STUN = {
  [TRAP_TYPES.NET]:        30,
  [TRAP_TYPES.BANANA]:     20,
  [TRAP_TYPES.CAGE]:       40,
  [TRAP_TYPES.GLUE]:       50,
  [TRAP_TYPES.CORN_DECOY]: 50,  // "eating" lock — still a catch window
};

// Traps that lure the chicken toward them (pull priority) instead of
// waiting for him to bumble in.
export const LURE_TRAPS = new Set([TRAP_TYPES.CORN_DECOY]);

export function createTrap(type, col, row) {
  return {
    type,
    col, row,
    triggered: false,
  };
}

export function findTrapAt(traps, col, row) {
  for (const t of traps) {
    if (t.col === col && t.row === row) return t;
  }
  return null;
}

export function findNearestLure(traps, col, row) {
  let best = null;
  let bestDist = Infinity;
  for (const t of traps) {
    if (t.triggered) continue;
    if (!LURE_TRAPS.has(t.type)) continue;
    const d = Math.abs(t.col - col) + Math.abs(t.row - row);
    if (d < bestDist) {
      bestDist = d;
      best = t;
    }
  }
  return best;
}
