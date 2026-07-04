import { describe, it, expect } from 'vitest';
import { runExperiment, rewardMax, type ExperimentConfig } from './experiment';

const base: ExperimentConfig = {
  mixKey: 'roi_driven',
  banditKind: 'thompson',
  rounds: 40,
  visitorsPerRound: 50, // 2000 visitors
  seed: 1,
};

describe('rewardMax', () => {
  it('is the largest conversion value across the committee (lnd_leader demo)', () => {
    expect(rewardMax()).toBe(15000);
  });
});

describe('runExperiment — bookkeeping', () => {
  const r = runExperiment(base);

  it('serves exactly rounds × visitorsPerRound', () => {
    expect(r.totalVisitors).toBe(2000);
    const finalPulls = r.rounds.at(-1)!.cumulativePulls.reduce((a, b) => a + b, 0);
    expect(finalPulls).toBe(2000);
  });

  it('produces one round log per round', () => {
    expect(r.rounds).toHaveLength(40);
    expect(r.regretCurve).toHaveLength(40);
  });

  it('ranks the leaderboard by mean reward, descending', () => {
    const means = r.arms.map((a) => a.meanReward);
    expect(means).toEqual([...means].sort((a, b) => b - a));
  });

  it('is deterministic: same config → identical result', () => {
    expect(runExperiment(base)).toEqual(r);
  });
});

describe('runExperiment — it learns the truth', () => {
  const r = runExperiment(base);

  it('sends the most traffic to the arm that is truly best under the mix', () => {
    const finalPulls = r.rounds.at(-1)!.cumulativePulls;
    const mostPulledIdx = finalPulls.indexOf(Math.max(...finalPulls));
    expect(r.armOrder[mostPulledIdx]).toBe(r.oracleBestId);
  });

  it('concentrates allocation on the best arm over time (explore → exploit)', () => {
    const bestIdx = r.armOrder.indexOf(r.oracleBestId);
    const half = r.rounds.length / 2;
    const shareOver = (rs: typeof r.rounds) =>
      rs.reduce((s, x) => s + x.allocation[bestIdx], 0) /
      rs.reduce((s, x) => s + x.allocation.reduce((a, b) => a + b, 0), 0);
    const firstHalf = shareOver(r.rounds.slice(0, half));
    const secondHalf = shareOver(r.rounds.slice(half));
    expect(secondHalf).toBeGreaterThan(firstHalf);
  });
});

describe('runExperiment — regret', () => {
  const r = runExperiment(base);

  it('cumulative regret is non-decreasing and non-negative', () => {
    let prev = 0;
    for (const x of r.regretCurve) {
      expect(x).toBeGreaterThanOrEqual(prev - 1e-9);
      prev = x;
    }
    expect(r.regretCurve.at(-1)!).toBeGreaterThanOrEqual(0);
  });

  it('a smart bandit beats uniform (round-robin) allocation on regret', () => {
    // A pure-exploration baseline pays the average sub-optimality on every pull.
    const uniform = runExperiment({ ...base, banditKind: 'epsilon_greedy', epsilon: 1 });
    expect(r.regretCurve.at(-1)!).toBeLessThan(uniform.regretCurve.at(-1)!);
  });
});
