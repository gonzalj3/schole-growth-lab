import { describe, it, expect } from 'vitest';
import { interpret } from './interpret';
import { runExperiment } from './experiment';
import { runGeneration } from './generate';

const cfg = { mixKey: 'roi_driven', seed: 7 };

describe('interpret — composes the whole story', () => {
  const n = interpret(cfg);

  it('is deterministic', () => {
    expect(interpret(cfg)).toEqual(n);
  });

  it('reports the bandit recovery flag consistently with the experiment', () => {
    const exp = runExperiment({
      mixKey: cfg.mixKey,
      banditKind: 'thompson',
      rounds: 30,
      visitorsPerRound: 60,
      seed: cfg.seed,
    });
    expect(n.recovered).toBe(exp.empiricalBestId === exp.oracleBestId);
    expect(n.winnerName).toBeTruthy();
    expect(n.winnerWhy).toBeTruthy();
  });

  it('carries the offspring lift numbers from generation', () => {
    const gen = runGeneration({
      mixKey: cfg.mixKey,
      genomes: 200,
      visitsPerGenome: 45,
      seed: cfg.seed,
      minSamples: 400,
    });
    expect(n.offspring.actualLift).toBeCloseTo(gen.actualLift, 6);
    expect(n.offspring.estimatedLift).toBeCloseTo(gen.offspring.estimatedLift, 6);
    expect(n.offspring.parentName).toBe(gen.base.name);
  });

  it('lists promoted genes and holds back the null control', () => {
    expect(n.promoted.length).toBeGreaterThanOrEqual(1);
    expect(n.promoted.some((p) => p.gene === 'heroLayout')).toBe(false);
  });

  it('produces an ordered set of story beats, each backed by a link', () => {
    expect(n.beats.length).toBeGreaterThanOrEqual(4);
    for (const b of n.beats) {
      expect(b.title).toBeTruthy();
      expect(b.detail).toBeTruthy();
    }
    // the four core phases are covered
    const phases = new Set(n.beats.map((b) => b.phase));
    for (const p of [1, 2, 3, 4]) expect(phases.has(p)).toBe(true);
  });

  it('always states its honesty caveats', () => {
    expect(n.caveats.length).toBeGreaterThanOrEqual(2);
    expect(n.caveats.join(' ')).toMatch(/interaction|noise|simulat/i);
  });
});
