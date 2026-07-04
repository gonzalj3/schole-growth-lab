// experiment.ts
// ---------------------------------------------------------------------------
// PURE. Orchestrates one full run: rounds → allocate traffic (bandit) → simulate
// visits → collect revenue → update posteriors, while logging everything the
// dashboard needs (allocation over time, leaderboard with CIs, regret). A run is
// fully defined by its config + seed and reproduces exactly (CLAUDE.md §8, §11).
//
// Reward normalization: the bandit works in [0,1], so revenue is divided by
// `rewardMax()` before `update`. Regret is computed against an EXACT oracle
// (expectedRewardUnderMix) — no Monte-Carlo noise in the benchmark.
// ---------------------------------------------------------------------------

import { SEED_VARIANTS, type Variant } from './genome';
import { AUDIENCE_MIXES, PERSONAS, samplePersona } from './personas';
import type { ConversionAction } from './personas';
import { simulateVisit, expectedRewardUnderMix } from './simulate';
import { createBandit, type BanditKind } from './bandit';
import { createRng } from './rng';

export interface ExperimentConfig {
  variantIds?: string[]; // arms; default = all seed variants
  mixKey: string; // key into AUDIENCE_MIXES
  banditKind: BanditKind;
  rounds: number;
  visitorsPerRound: number;
  seed: number;
  epsilon?: number; // epsilon_greedy only
}

export interface ArmResult {
  variantId: string;
  name: string;
  pulls: number;
  totalReward: number;
  meanReward: number; // raw dollars / visit
  ci: [number, number]; // 95% normal-approx CI on mean reward
  trueExpectedReward: number; // oracle μ under the mix (truth — for grading)
}

export interface RoundLog {
  round: number;
  allocation: number[]; // visitors per arm this round (aligned to armOrder)
  cumulativePulls: number[];
  cumulativeRegret: number; // pseudo-regret in dollars
}

export interface ExperimentResult {
  config: ExperimentConfig;
  banditKind: BanditKind;
  armOrder: string[]; // variantId at each arm index
  rounds: RoundLog[];
  regretCurve: number[]; // cumulativeRegret per round
  arms: ArmResult[]; // leaderboard, sorted by meanReward desc
  totalVisitors: number;
  totalReward: number;
  empiricalBestId: string; // the bandit's pick (argmax observed mean)
  oracleBestId: string; // the truth (argmax expected reward)
  rewardMax: number;
}

/** The largest possible single-visit reward — the bandit's [0,1] normalizer. */
export function rewardMax(): number {
  let max = 0;
  for (const p of Object.values(PERSONAS)) {
    for (const v of Object.values(p.conversionValue)) max = Math.max(max, v);
  }
  return max;
}

export function runExperiment(cfg: ExperimentConfig): ExperimentResult {
  const variants: Variant[] = (cfg.variantIds ?? SEED_VARIANTS.map((v) => v.id)).map((id) => {
    const v = SEED_VARIANTS.find((s) => s.id === id);
    if (!v) throw new Error(`unknown variant: ${id}`);
    return v;
  });
  const k = variants.length;
  const mix = AUDIENCE_MIXES[cfg.mixKey];
  const RMAX = rewardMax();

  const rng = createRng(cfg.seed);
  const bandit = createBandit(cfg.banditKind, k, { epsilon: cfg.epsilon });

  // Exact oracle: expected reward of each arm under the mix, and the best of them.
  const mu = variants.map((v) => expectedRewardUnderMix(v.genome, mix));
  const muStar = Math.max(...mu);

  const pulls = new Array(k).fill(0);
  const rawSum = new Array(k).fill(0);
  const rawSumSq = new Array(k).fill(0);
  let totalReward = 0;
  let cumulativeRegret = 0;
  const rounds: RoundLog[] = [];

  for (let r = 0; r < cfg.rounds; r++) {
    const allocation = new Array(k).fill(0);
    for (let i = 0; i < cfg.visitorsPerRound; i++) {
      const arm = bandit.choose(rng);
      const personaId = samplePersona(mix, rng.next());
      const visit = simulateVisit(variants[arm].genome, personaId, rng);
      const reward = visit.reward;

      bandit.update(arm, reward / RMAX);
      pulls[arm] += 1;
      rawSum[arm] += reward;
      rawSumSq[arm] += reward * reward;
      allocation[arm] += 1;
      totalReward += reward;
      cumulativeRegret += muStar - mu[arm]; // pseudo-regret, in dollars
    }
    rounds.push({
      round: r,
      allocation,
      cumulativePulls: [...pulls],
      cumulativeRegret,
    });
  }

  const arms: ArmResult[] = variants.map((v, i) => {
    const n = pulls[i];
    const mean = n > 0 ? rawSum[i] / n : 0;
    // 95% normal-approx CI on the mean reward.
    const variance = n > 1 ? Math.max(0, rawSumSq[i] / n - mean * mean) : 0;
    const se = n > 0 ? Math.sqrt(variance / n) : 0;
    return {
      variantId: v.id,
      name: v.name,
      pulls: n,
      totalReward: rawSum[i],
      meanReward: mean,
      ci: [mean - 1.96 * se, mean + 1.96 * se],
      trueExpectedReward: mu[i],
    };
  });
  arms.sort((a, b) => b.meanReward - a.meanReward);

  const oracleBestId = variants[mu.indexOf(muStar)].id;

  return {
    config: cfg,
    banditKind: cfg.banditKind,
    armOrder: variants.map((v) => v.id),
    rounds,
    regretCurve: rounds.map((r) => r.cumulativeRegret),
    arms,
    totalVisitors: cfg.rounds * cfg.visitorsPerRound,
    totalReward,
    empiricalBestId: arms[0].variantId,
    oracleBestId,
    rewardMax: RMAX,
  };
}

// Re-export so a caller can build a full run from one import.
export type { ConversionAction };
