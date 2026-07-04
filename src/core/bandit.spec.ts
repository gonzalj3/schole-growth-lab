import { describe, it, expect } from 'vitest';
import { createBandit, type BanditKind } from './bandit';
import { createRng } from './rng';

const KINDS: BanditKind[] = ['epsilon_greedy', 'ucb1', 'thompson'];

// A controllable reward oracle: arm i pays 1 with probability trueP[i], else 0.
// Rewards are already in [0, 1] — the bandit's native scale.
function pull(rng: ReturnType<typeof createRng>, p: number): number {
  return rng.bool(p) ? 1 : 0;
}

describe('createBandit — contract', () => {
  it.each(KINDS)('%s: choose returns a valid arm index', (kind) => {
    const b = createBandit(kind, 4, { epsilon: 0.1 });
    const rng = createRng(1);
    for (let i = 0; i < 100; i++) {
      const arm = b.choose(rng);
      expect(arm).toBeGreaterThanOrEqual(0);
      expect(arm).toBeLessThan(4);
    }
  });

  it.each(KINDS)('%s: update accumulates pulls and reward', (kind) => {
    const b = createBandit(kind, 2, { epsilon: 0.1 });
    b.update(0, 1);
    b.update(0, 0);
    const s = b.stats()[0];
    expect(s.pulls).toBe(2);
    expect(s.meanReward).toBeCloseTo(0.5, 6);
  });
});

describe('epsilon-greedy', () => {
  it('with epsilon=0 exploits the best arm once every arm is seen', () => {
    const b = createBandit('epsilon_greedy', 3, { epsilon: 0 });
    const rng = createRng(2);
    // Seed one pull per arm (the "try each once" phase).
    b.choose(rng);
    b.update(0, 0.1);
    b.choose(rng);
    b.update(1, 0.9); // arm 1 is best
    b.choose(rng);
    b.update(2, 0.2);
    // Now pure greedy → always arm 1.
    for (let i = 0; i < 20; i++) expect(b.choose(rng)).toBe(1);
  });
});

describe('UCB1', () => {
  it('pulls every arm once before repeating (optimism on the unknown)', () => {
    const b = createBandit('ucb1', 4);
    const rng = createRng(3);
    const firstFour = new Set<number>();
    for (let i = 0; i < 4; i++) {
      const arm = b.choose(rng);
      firstFour.add(arm);
      b.update(arm, 0.5);
    }
    expect(firstFour).toEqual(new Set([0, 1, 2, 3]));
  });
});

describe('convergence — every algorithm finds the best arm', () => {
  it.each(KINDS)('%s: allocates the plurality of pulls to the best arm', (kind) => {
    const trueP = [0.2, 0.5, 0.85]; // arm 2 is clearly best
    const choiceRng = createRng(10);
    const rewardRng = createRng(20);
    const b = createBandit(kind, 3, { epsilon: 0.1 });
    for (let t = 0; t < 4000; t++) {
      const arm = b.choose(choiceRng);
      b.update(arm, pull(rewardRng, trueP[arm]));
    }
    const pulls = b.stats().map((s) => s.pulls);
    const best = pulls.indexOf(Math.max(...pulls));
    expect(best).toBe(2);
    expect(pulls[2] / 4000).toBeGreaterThan(0.5);
  });
});

describe('determinism', () => {
  it.each(KINDS)('%s: same seeds → identical pull counts', (kind) => {
    const run = () => {
      const choiceRng = createRng(7);
      const rewardRng = createRng(8);
      const b = createBandit(kind, 3, { epsilon: 0.2 });
      for (let t = 0; t < 1000; t++) {
        const arm = b.choose(choiceRng);
        b.update(arm, pull(rewardRng, [0.3, 0.6, 0.4][arm]));
      }
      return b.stats().map((s) => s.pulls);
    };
    expect(run()).toEqual(run());
  });
});
