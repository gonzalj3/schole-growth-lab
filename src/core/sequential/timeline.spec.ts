import { describe, it, expect } from 'vitest';
import { runTimeline, runTimelineStep } from './timeline';
import { RAY_TIMELINE } from './index';

describe('sequential timeline — the target moves', () => {
  const steps = runTimeline({ genomes: 140, visitsPerGenome: 30, seed: 7, minSamples: 300 });

  it('produces one step per snapshot, in chronological order', () => {
    expect(steps).toHaveLength(RAY_TIMELINE.length);
    expect(steps.map((s) => s.date)).toEqual(RAY_TIMELINE.map((t) => t.date));
  });

  it('recovers the true top "why" at each end of the timeline', () => {
    const first = steps[0]; // 2023-07
    const last = steps.at(-1)!; // 2026-07
    // 2023: capability era; 2026: anti-token era. The system infers each.
    expect(first.inferredTopHeadline).toBe('team_capability');
    expect(last.inferredTopHeadline).toBe('value_realization');
  });

  it('passes through the ROI/adoption era in the middle', () => {
    const mid = steps.find((s) => s.date === '2025-07')!;
    expect(mid.inferredTopHeadline).toBe('measurable_adoption');
  });

  it('the winning message rotates — not one fixed frame across time', () => {
    const distinct = new Set(steps.map((s) => s.inferredTopHeadline));
    expect(distinct.size).toBeGreaterThanOrEqual(3);
  });

  it("the system's inference matches the authored ground truth (recovery over time)", () => {
    // inferred top headline should equal the true argmax weight at each step
    const matches = steps.filter((s) => s.inferredTopHeadline === s.trueTopHeadline).length;
    expect(matches / steps.length).toBeGreaterThanOrEqual(0.8);
  });

  it('is deterministic', () => {
    const a = runTimelineStep(RAY_TIMELINE[0], { seed: 3 });
    const b = runTimelineStep(RAY_TIMELINE[0], { seed: 3 });
    expect(a).toEqual(b);
  });
});
