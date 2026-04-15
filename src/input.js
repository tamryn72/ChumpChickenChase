// Unified input: keyboard + touch.
//
// Touch is driven by main.js, which hit-tests canvas touches against the
// virtual d-pad and button layouts in render/ui.js and feeds state back
// through `setTouchDir` / `injectPress` / `markTouchActive`.

const keys = new Set();
const pressed = new Set();

const PREVENT = new Set([
  'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space',
]);

if (typeof window !== 'undefined' && typeof window.addEventListener === 'function') {
  window.addEventListener('keydown', (e) => {
    if (PREVENT.has(e.code)) e.preventDefault();
    if (e.repeat) return;
    keys.add(e.code);
    pressed.add(e.code);
  });

  window.addEventListener('keyup', (e) => {
    keys.delete(e.code);
  });
}

// Touch state — set by main.js touch event handlers.
const touch = {
  active: false, // true once any touch has been seen
  dirX: 0,       // -1 | 0 | 1
  dirY: 0,       // -1 | 0 | 1
};

export const input = {
  isDown(code) { return keys.has(code); },
  wasPressed(code) { return pressed.has(code); },

  // 4-directional input. Returns {dx, dy} with horizontal priority so grid
  // movement stays crisp. Touch d-pad contribution is merged in.
  getDir() {
    let dx = 0, dy = 0;
    if (keys.has('ArrowLeft')  || keys.has('KeyA')) dx -= 1;
    if (keys.has('ArrowRight') || keys.has('KeyD')) dx += 1;
    if (keys.has('ArrowUp')    || keys.has('KeyW')) dy -= 1;
    if (keys.has('ArrowDown')  || keys.has('KeyS')) dy += 1;
    dx += touch.dirX;
    dy += touch.dirY;
    if (dx < -1) dx = -1; else if (dx > 1) dx = 1;
    if (dy < -1) dy = -1; else if (dy > 1) dy = 1;
    if (dx !== 0) return { dx, dy: 0 };
    return { dx: 0, dy };
  },

  // Virtual keypress — touch UI uses this to inject one-shot codes like
  // 'Enter', 'KeyP', 'Digit1', etc. Cleared at end of tick like real input.
  injectPress(code) { pressed.add(code); },

  // Touch d-pad state. Caller should set dirX *or* dirY (dominant axis),
  // not both, to avoid horizontal-priority stealing diagonal moves.
  setTouchDir(dx, dy) {
    touch.dirX = dx < 0 ? -1 : dx > 0 ? 1 : 0;
    touch.dirY = dy < 0 ? -1 : dy > 0 ? 1 : 0;
  },
  markTouchActive() { touch.active = true; },
  isTouchActive() { return touch.active; },

  // called at the end of each logic tick so wasPressed is one-shot
  endFrame() { pressed.clear(); },
};
