// Web Audio procedural sound effects. Zero assets, ~200 LOC.
//
// Lazy-init pattern: AudioContext can only be created after a user gesture
// (autoplay policy), so we defer construction until the first play() call.
// If audio is unavailable (old browser, blocked context) we silently no-op.
//
// All sounds are small synth routines built from oscillators + noise bursts.
// Each one takes ~10-20 lines and no external data.

const state = {
  ctx: null,
  master: null,
  muted: false,
  noiseBuf: null, // cached white-noise buffer for splat sounds
};

// -- lifecycle ---------------------------------------------------------------

function ensureCtx() {
  if (state.ctx) return state.ctx;
  if (typeof window === 'undefined') return null;
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return null;
  try {
    state.ctx = new AC();
  } catch (e) {
    state.ctx = null;
    return null;
  }
  state.master = state.ctx.createGain();
  state.master.gain.value = state.muted ? 0 : 0.6;
  state.master.connect(state.ctx.destination);
  return state.ctx;
}

function makeNoiseBuffer(ctx) {
  if (state.noiseBuf) return state.noiseBuf;
  const len = ctx.sampleRate * 0.5;
  const buf = ctx.createBuffer(1, len, ctx.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
  state.noiseBuf = buf;
  return buf;
}

export function setSfxMuted(muted) {
  state.muted = !!muted;
  if (state.master) {
    state.master.gain.setValueAtTime(
      state.muted ? 0 : 0.6,
      state.ctx ? state.ctx.currentTime : 0,
    );
  }
}

export function isSfxMuted() {
  return state.muted;
}

// Resume the AudioContext (browsers suspend it until a gesture). Call this
// from any wasPressed path before playing.
export function kickAudio() {
  const ctx = ensureCtx();
  if (!ctx) return;
  if (ctx.state === 'suspended') {
    ctx.resume().catch(() => {});
  }
}

// -- synth helpers -----------------------------------------------------------

function env(gain, t0, attack, hold, release, peak = 1) {
  gain.gain.setValueAtTime(0, t0);
  gain.gain.linearRampToValueAtTime(peak, t0 + attack);
  gain.gain.setValueAtTime(peak, t0 + attack + hold);
  gain.gain.linearRampToValueAtTime(0, t0 + attack + hold + release);
}

function beep(freq, duration, type = 'square', peak = 0.3) {
  const ctx = ensureCtx();
  if (!ctx || state.muted) return;
  const t = ctx.currentTime;
  const osc = ctx.createOscillator();
  const g   = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t);
  env(g, t, 0.005, duration * 0.6, duration * 0.4, peak);
  osc.connect(g).connect(state.master);
  osc.start(t);
  osc.stop(t + duration + 0.05);
}

function sweep(f0, f1, duration, type = 'square', peak = 0.3) {
  const ctx = ensureCtx();
  if (!ctx || state.muted) return;
  const t = ctx.currentTime;
  const osc = ctx.createOscillator();
  const g   = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(f0, t);
  osc.frequency.exponentialRampToValueAtTime(Math.max(10, f1), t + duration);
  env(g, t, 0.005, duration * 0.5, duration * 0.5, peak);
  osc.connect(g).connect(state.master);
  osc.start(t);
  osc.stop(t + duration + 0.05);
}

function noise(duration, type = 'lowpass', cutoff = 2000, peak = 0.35) {
  const ctx = ensureCtx();
  if (!ctx || state.muted) return;
  const t = ctx.currentTime;
  const src = ctx.createBufferSource();
  src.buffer = makeNoiseBuffer(ctx);
  const filter = ctx.createBiquadFilter();
  filter.type = type;
  filter.frequency.setValueAtTime(cutoff, t);
  const g = ctx.createGain();
  env(g, t, 0.005, duration * 0.3, duration * 0.7, peak);
  src.connect(filter).connect(g).connect(state.master);
  src.start(t);
  src.stop(t + duration + 0.05);
}

// -- named effects -----------------------------------------------------------
//
// These are the SFX names the game calls. Keep them stable — main.js and
// other consumers use strings.

const EFFECTS = {
  menu_cursor:  () => beep(520, 0.05, 'square', 0.18),
  menu_select:  () => { beep(660, 0.06, 'square', 0.22); setTimeout(() => beep(880, 0.1, 'square', 0.22), 60); },
  menu_back:    () => sweep(520, 260, 0.1, 'square', 0.22),

  trap_place:   () => beep(440, 0.06, 'triangle', 0.25),
  trap_snap:    () => { sweep(900, 180, 0.15, 'square', 0.35); noise(0.08, 'highpass', 1800, 0.2); },
  gotcha:       () => { beep(880, 0.08, 'square', 0.3); setTimeout(() => beep(1320, 0.12, 'square', 0.3), 80); setTimeout(() => beep(1760, 0.16, 'triangle', 0.3), 180); },

  egg_throw:    () => sweep(180, 420, 0.08, 'triangle', 0.22),
  egg_splat:    () => noise(0.14, 'lowpass', 900, 0.35),
  egg_hit:      () => { noise(0.12, 'lowpass', 700, 0.4); sweep(380, 120, 0.14, 'sawtooth', 0.25); },
  rock_warn:    () => beep(220, 0.08, 'sine', 0.15),
  rock_land:    () => { noise(0.25, 'lowpass', 300, 0.55); sweep(160, 40, 0.3, 'sawtooth', 0.4); },

  building_hit:     () => noise(0.06, 'bandpass', 1800, 0.25),
  building_destroy: () => { noise(0.3, 'lowpass', 400, 0.55); sweep(220, 55, 0.35, 'sawtooth', 0.35); },

  pickup_taco:   () => { beep(660, 0.05, 'triangle', 0.22); setTimeout(() => beep(990, 0.06, 'triangle', 0.22), 40); },
  pickup_burger: () => { beep(420, 0.08, 'sawtooth', 0.25); setTimeout(() => beep(630, 0.08, 'triangle', 0.22), 70); },
  pickup_cat:    () => { beep(880, 0.05, 'square', 0.18); setTimeout(() => beep(1200, 0.06, 'square', 0.18), 40); },

  final_form: () => { sweep(120, 60, 0.4, 'sawtooth', 0.5); noise(0.35, 'highpass', 800, 0.3); },
  teleport:   () => sweep(1600, 300, 0.18, 'sine', 0.3),

  chump_squawk: () => { sweep(560, 720, 0.08, 'square', 0.28); setTimeout(() => sweep(720, 420, 0.08, 'square', 0.28), 70); },
  cowabunga:    () => { for (let i = 0; i < 4; i++) setTimeout(() => beep(330 + i * 110, 0.1, 'square', 0.28), i * 70); },

  victory:  () => {
    const notes = [523, 659, 784, 1047, 1319];
    notes.forEach((f, i) => setTimeout(() => beep(f, 0.12, 'triangle', 0.3), i * 80));
  },
  game_over: () => {
    const notes = [523, 392, 330, 262];
    notes.forEach((f, i) => setTimeout(() => beep(f, 0.16, 'sawtooth', 0.3), i * 120));
  },
  player_hit: () => sweep(420, 80, 0.18, 'sawtooth', 0.3),
};

// Public entry point.
export function playSfx(name) {
  if (state.muted) return;
  const fn = EFFECTS[name];
  if (!fn) return;
  // ensureCtx happens inside beep/sweep/noise — this is fine if ctx can be made.
  try { fn(); } catch (e) { /* swallow — audio is best-effort */ }
}
