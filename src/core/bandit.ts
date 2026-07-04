// bandit.ts
// ---------------------------------------------------------------------------
// PURE. Multi-armed bandits: allocate scarce traffic across variants, learning
// online which pays best. Three algorithms behind one interface so the lab can
// compare them (CLAUDE.md §8). Rewards are in [0, 1] — the experiment normalizes
// revenue before it gets here, so the bandit is a clean, reusable MAB.
//
//   epsilon_greedy — exploit the best, explore at random with prob ε. Baseline.
//   ucb1           — optimism under uncertainty: pick the best upper bound.
//   thompson       — Beta–Bernoulli posterior sampling (primary). "Winners get
//                    more traffic," made rigorous — the same belief-updating
//                    shape as knowledge tracing (CLAUDE.md §9).
// ---------------------------------------------------------------------------

import type { Rng } from './rng';

export type BanditKind = 'epsilon_greedy' | 'ucb1' | 'thompson';

export interface ArmStats {
  pulls: number;
  sumReward: number; // in [0,1] units
  meanReward: number; // sumReward / pulls (0 if unpulled)
  alpha: number; // Beta posterior α (Thompson)
  beta: number; // Beta posterior β (Thompson)
}

export interface Bandit {
  readonly kind: BanditKind;
  readonly k: number;
  /** Pick an arm to serve the next visitor. */
  choose(rng: Rng): number;
  /** Record a reward in [0, 1] for an arm. */
  update(arm: number, reward: number): void;
  stats(): ArmStats[];
}

export interface BanditOptions {
  epsilon?: number; // epsilon_greedy only (default 0.1)
}

export function createBandit(kind: BanditKind, k: number, opts: BanditOptions = {}): Bandit {
  const epsilon = opts.epsilon ?? 0.1;
  // Beta(1,1) = uniform prior: we assume nothing about an arm until it pays.
  const arms: ArmStats[] = Array.from({ length: k }, () => ({
    pulls: 0,
    sumReward: 0,
    meanReward: 0,
    alpha: 1,
    beta: 1,
  }));

  const unpulled = () => arms.findIndex((a) => a.pulls === 0);

  function argmax(score: (a: ArmStats, i: number) => number, rng: Rng): number {
    let bestScore = -Infinity;
    let best = 0;
    for (let i = 0; i < k; i++) {
      const s = score(arms[i], i);
      // random tie-break so ties don't bias toward arm 0
      if (s > bestScore || (s === bestScore && rng.next() < 0.5)) {
        bestScore = s;
        best = i;
      }
    }
    return best;
  }

  function choose(rng: Rng): number {
    // Every algorithm tries each arm once before it can prefer one — you can't
    // rank arms you've never served.
    const u = unpulled();
    if (u !== -1) return u;

    switch (kind) {
      case 'epsilon_greedy':
        if (rng.next() < epsilon) return rng.int(k); // explore
        return argmax((a) => a.meanReward, rng); // exploit

      case 'ucb1': {
        const t = arms.reduce((sum, a) => sum + a.pulls, 0);
        return argmax((a) => a.meanReward + Math.sqrt((2 * Math.log(t)) / a.pulls), rng);
      }

      case 'thompson':
        return argmax((a) => betaSample(rng, a.alpha, a.beta), rng);
    }
  }

  function update(arm: number, reward: number): void {
    const a = arms[arm];
    a.pulls += 1;
    a.sumReward += reward;
    a.meanReward = a.sumReward / a.pulls;
    // Fractional Beta update for bounded rewards (Agrawal–Goyal): a "reward" of
    // r counts as r of a success and (1−r) of a failure.
    a.alpha += reward;
    a.beta += 1 - reward;
  }

  return {
    kind,
    k,
    choose,
    update,
    stats: () => arms.map((a) => ({ ...a })),
  };
}

// ---- Beta sampling (for Thompson) -----------------------------------------
// Beta(a,b) = G(a) / (G(a) + G(b)) for Gamma draws G. Since α,β ≥ 1 here, a
// single Marsaglia–Tsang Gamma sampler (valid for shape ≥ 1) suffices.

function gammaSample(rng: Rng, shape: number): number {
  // Marsaglia & Tsang (2000), shape ≥ 1, scale = 1.
  const d = shape - 1 / 3;
  const c = 1 / Math.sqrt(9 * d);
  for (;;) {
    let x: number;
    let v: number;
    do {
      x = rng.gaussian();
      v = 1 + c * x;
    } while (v <= 0);
    v = v * v * v;
    const u = rng.next();
    if (u < 1 - 0.0331 * x * x * x * x) return d * v;
    if (Math.log(u) < 0.5 * x * x + d * (1 - v + Math.log(v))) return d * v;
  }
}

function betaSample(rng: Rng, a: number, b: number): number {
  const ga = gammaSample(rng, a);
  const gb = gammaSample(rng, b);
  return ga / (ga + gb);
}
