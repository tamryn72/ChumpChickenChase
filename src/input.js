// Unified input: keyboard now, touch later.

const keys = new Set();
const pressed = new Set();

const PREVENT = new Set([
  'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space',
]);

window.addEventListener('keydown', (e) => {
  if (PREVENT.has(e.code)) e.preventDefault();
  if (e.repeat) return;
  keys.add(e.code);
  pressed.add(e.code);
});

window.addEventListener('keyup', (e) => {
  keys.delete(e.code);
});

export const input = {
  isDown(code) { return keys.has(code); },
  wasPressed(code) { return pressed.has(code); },

  // 4-directional input. Returns one of {dx:-1,0,1, dy:-1,0,1} — horizontal priority.
  getDir() {
    let dx = 0, dy = 0;
    if (keys.has('ArrowLeft')  || keys.has('KeyA')) dx -= 1;
    if (keys.has('ArrowRight') || keys.has('KeyD')) dx += 1;
    if (keys.has('ArrowUp')    || keys.has('KeyW')) dy -= 1;
    if (keys.has('ArrowDown')  || keys.has('KeyS')) dy += 1;
    // horizontal priority to keep grid movement crisp
    if (dx !== 0) return { dx, dy: 0 };
    return { dx: 0, dy };
  },

  // called at the end of each logic tick so wasPressed is one-shot
  endFrame() { pressed.clear(); },
};
