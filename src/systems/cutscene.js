// Cutscene state machine (logic only — rendering lives in render/cutscene.js).
// Each script is a fixed-duration sequence of captions that show at tick offsets.

export const CUTSCENE_SCRIPTS = {
  FARM_ESCAPE: {
    totalTicks: 180,
    captions: [
      { at: 0,   ttl: 28, text: 'not today farmer' },
      { at: 32,  ttl: 28, text: 'backflip time' },
      { at: 68,  ttl: 28, text: 'moonwalk activated' },
      { at: 104, ttl: 28, text: 'watch this dab' },
      { at: 138, ttl: 28, text: 'see you at the market' },
    ],
  },
  MARKET_ESCAPE: {
    totalTicks: 200,
    captions: [
      { at: 0,   ttl: 32, text: 'flipped the fruit stand' },
      { at: 35,  ttl: 32, text: 'orange tidal wave rising' },
      { at: 72,  ttl: 32, text: 'COWABUNGA' },
      { at: 110, ttl: 32, text: 'surfs own goo, somehow' },
      { at: 150, ttl: 40, text: 'see you at the docks' },
    ],
  },
};

export function createCutscene(scriptName) {
  const script = CUTSCENE_SCRIPTS[scriptName];
  if (!script) throw new Error('unknown cutscene: ' + scriptName);
  return {
    script: scriptName,
    t: 0,
    totalTicks: script.totalTicks,
    captions: script.captions,
  };
}

// Returns true when the cutscene has finished playing.
export function tickCutscene(cs) {
  cs.t += 1;
  return cs.t >= cs.totalTicks;
}

// Jump to the last frame (for skip).
export function endCutscene(cs) {
  cs.t = cs.totalTicks;
}
