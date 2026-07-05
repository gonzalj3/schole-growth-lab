// holdout.ts
// ---------------------------------------------------------------------------
// PURE. Champion-vs-challenger validation. The generator's lift was measured on
// the SAME population it bred from — that's in-sample and could be overfitting.
// The honest test: a fresh A/B of the parent vs the bred offspring on NEW seeds,
// with EQUAL traffic to each arm (we want each arm's true mean, not an optimizer
// starving one). If the lift survives out-of-sample, it's real.
// ---------------------------------------------------------------------------

import { SEED_VARIANTS, type Genome } from './genome';
import { AUDIENCE_MIXES, samplePersona } from './personas';
import { simulateVisit, expectedRewardUnderMix, createRng } from './simulate';
import { runGeneration } from './generate';

export interface HoldoutResult {
  mixKey: string;
  seeds: number;
  visitorsPerArm: number;
  parentName: string;
  changed: boolean; // did the generator actually change anything?
  challengerWinRate: number; // fraction of holdout seeds the offspring's mean beat the parent's
  meanObservedLift: number; // avg (offspring mean − parent mean) across seeds, dollars
  parentMeanObserved: number;
  challengerMeanObserved: number;
  trueLift: number; // oracle: exact expected-reward gap under the mix
  inSampleLift: number; // the lift the generator reported when breeding
}

const mean = (xs: number[]) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0);

export interface HoldoutOptions {
  seeds?: number[]; // holdout seeds — MUST be disjoint from the generation seed
  visitorsPerArm?: number;
  genSeed?: number; // the seed used to breed the canonical offspring
}

export function runHoldout(mixKey: string, opts: HoldoutOptions = {}): HoldoutResult {
  const seeds = opts.seeds ?? Array.from({ length: 20 }, (_, i) => 100 + i);
  const K = opts.visitorsPerArm ?? 800;
  const genSeed = opts.genSeed ?? 7;

  // Breed the canonical offspring once (in-sample), then validate out-of-sample.
  const gen = runGeneration({ mixKey, genomes: 450, visitsPerGenome: 50, seed: genSeed, minSamples: 400 });
  const parent: Genome = gen.base.genome;
  const offspring: Genome = gen.offspring.genome;
  const mix = AUDIENCE_MIXES[mixKey];

  const lifts: number[] = [];
  const parentMeans: number[] = [];
  const challMeans: number[] = [];
  let wins = 0;

  for (const seed of seeds) {
    const rng = createRng(seed);
    const pr: number[] = [];
    const cr: number[] = [];
    for (let i = 0; i < K; i++) pr.push(simulateVisit(parent, samplePersona(mix, rng.next()), rng).reward);
    for (let i = 0; i < K; i++) cr.push(simulateVisit(offspring, samplePersona(mix, rng.next()), rng).reward);
    const pm = mean(pr);
    const cm = mean(cr);
    parentMeans.push(pm);
    challMeans.push(cm);
    lifts.push(cm - pm);
    if (cm > pm) wins++;
  }

  return {
    mixKey,
    seeds: seeds.length,
    visitorsPerArm: K,
    parentName: gen.base.name,
    changed: gen.offspring.changes.length > 0,
    challengerWinRate: wins / seeds.length,
    meanObservedLift: mean(lifts),
    parentMeanObserved: mean(parentMeans),
    challengerMeanObserved: mean(challMeans),
    trueLift: expectedRewardUnderMix(offspring, mix) - expectedRewardUnderMix(parent, mix),
    inSampleLift: gen.offspring.estimatedLift,
  };
}

/** Name lookup helper for the UI. */
export const seedName = (id: string) => SEED_VARIANTS.find((v) => v.id === id)?.name ?? id;
