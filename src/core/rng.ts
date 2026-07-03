// rng.ts
// ---------------------------------------------------------------------------
// PURE. The single source of randomness for the whole system. A run is fully
// defined by (config, seed) and reproduces exactly (CLAUDE.md §11). NOTHING
// anywhere may call Math.random() — everything draws from an Rng created here.
//
// Core generator: mulberry32 — a tiny, fast, well-distributed 32-bit PRNG.
// Small enough to read in one sitting, which is the point.
// ---------------------------------------------------------------------------

export interface Rng {
  /** Uniform in [0, 1). */
  next(): number;
  /** Uniform in [min, max). */
  range(min: number, max: number): number;
  /** Integer in [0, maxExclusive). */
  int(maxExclusive: number): number;
  /** Normal draw with the given mean and standard deviation (Box–Muller). */
  gaussian(mean?: number, stdev?: number): number;
  /** True with probability p. */
  bool(p: number): boolean;
  /** Uniformly pick one element of a non-empty array. */
  pick<T>(items: readonly T[]): T;
}

/** Raw mulberry32 step: seed → next float in [0, 1). */
function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function createRng(seed: number): Rng {
  const uniform = mulberry32(seed);

  return {
    next: uniform,
    range: (min, max) => min + uniform() * (max - min),
    int: (maxExclusive) => Math.floor(uniform() * maxExclusive),
    gaussian: (mean = 0, stdev = 1) => {
      // Box–Muller: two uniforms → one standard normal. u1 is nudged off 0 to
      // avoid log(0).
      const u1 = 1 - uniform();
      const u2 = uniform();
      const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
      return mean + z * stdev;
    },
    bool: (p) => uniform() < p,
    pick: (items) => items[Math.floor(uniform() * items.length)],
  };
}
