import { describe, it, expect } from 'vitest';
import { runEvals } from '../src/core/evals';

// The eval harness IS the spec (CLAUDE.md §10): grade the system's inferences
// against the ground truth we authored, across many seeds, and require each to
// clear its bar. Run once, assert every score, and print the scorecard.
describe('eval scorecard (roi_driven, 12 seeds)', () => {
  const card = runEvals({ mixKey: 'roi_driven', seeds: Array.from({ length: 12 }, (_, i) => i + 1) });

  it('prints the scorecard', () => {
    // eslint-disable-next-line no-console
    console.log(
      '\n' +
        card.scores.map((s) => `  ${s.pass ? '✓' : '✗'} ${s.label}: ${s.display} (${s.target})`).join('\n'),
    );
    expect(card.scores).toHaveLength(5);
  });

  it('arm identification — crowns the true best in a strong majority of runs', () => {
    expect(card.scores.find((s) => s.key === 'arm')!.pass).toBe(true);
  });

  it('attribution recovery — estimates correlate with truth', () => {
    expect(card.scores.find((s) => s.key === 'recovery')!.pass).toBe(true);
  });

  it('regret — the bandit loses far less than uniform allocation', () => {
    expect(card.scores.find((s) => s.key === 'regret')!.pass).toBe(true);
  });

  it('calibration — 95% CIs cover the truth ~95% of the time', () => {
    expect(card.scores.find((s) => s.key === 'calibration')!.pass).toBe(true);
  });

  it('false-discovery guard — the null gene is never promoted', () => {
    expect(card.scores.find((s) => s.key === 'fd')!.pass).toBe(true);
  });
});
