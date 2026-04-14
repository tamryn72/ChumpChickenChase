// Seeded mulberry32 PRNG.
// All gameplay randomness should route through an rng returned from createRng
// so bugs can be reproduced from a seed and the headless AI sim stays deterministic.

export function createRng(seed = Date.now()) {
  let a = seed >>> 0;
  const rng = {
    seed,
    next() {
      a |= 0;
      a = (a + 0x6D2B79F5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    },
    int(min, max) { // inclusive both ends
      return Math.floor(rng.next() * (max - min + 1)) + min;
    },
    pick(arr) {
      return arr[Math.floor(rng.next() * arr.length)];
    },
    chance(p) {
      return rng.next() < p;
    },
  };
  return rng;
}
