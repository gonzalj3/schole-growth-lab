import { describe, it, expect } from 'vitest';
import { runHoldout } from './holdout';

describe('holdout A/B — does the bred lift survive out-of-sample?', () => {
  // ROI-driven: the generator changes tone punchy->consultative (a real lift).
  const roi = runHoldout('roi_driven', { seeds: Array.from({ length: 20 }, (_, i) => 100 + i) });

  it('the offspring beats its parent on a strong majority of fresh seeds', () => {
    expect(roi.changed).toBe(true);
    expect(roi.challengerWinRate).toBeGreaterThan(0.7);
    expect(roi.meanObservedLift).toBeGreaterThan(0);
  });

  it('the out-of-sample lift is consistent with the true (oracle) lift', () => {
    // observed holdout lift should be within noise of the exact gap
    expect(Math.abs(roi.meanObservedLift - roi.trueLift)).toBeLessThan(400);
    expect(roi.trueLift).toBeGreaterThan(0);
  });

  it('when the generator changes nothing, parent and challenger tie', () => {
    // risk-driven: champion already optimal -> offspring == parent
    const risk = runHoldout('risk_driven', { seeds: Array.from({ length: 12 }, (_, i) => 200 + i) });
    expect(risk.changed).toBe(false);
    expect(risk.trueLift).toBeCloseTo(0, 6);
    expect(Math.abs(risk.challengerWinRate - 0.5)).toBeLessThan(0.35); // roughly a coin flip
  });

  it('is deterministic', () => {
    const a = runHoldout('roi_driven', { seeds: [100, 101, 102] });
    const b = runHoldout('roi_driven', { seeds: [100, 101, 102] });
    expect(a).toEqual(b);
  });
});
