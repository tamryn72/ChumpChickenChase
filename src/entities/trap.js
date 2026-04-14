// Trap entities placed on tiles during the PLAN phase.
// M3/M4 traps: Net, Banana, Cage.

export const TRAP_TYPES = {
  NET:    'net',
  BANANA: 'banana',
  CAGE:   'cage',
};

// Stun durations in ticks (10Hz logic). 30 ticks ~= 3 real seconds.
export const TRAP_STUN = {
  [TRAP_TYPES.NET]:    30,
  [TRAP_TYPES.BANANA]: 20,
  [TRAP_TYPES.CAGE]:   40,
};

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
