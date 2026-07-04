// sequential/timeline.ts
// ---------------------------------------------------------------------------
// The temporal stress-test. For each point in Ray's 2023→2026 timeline, run the
// EXISTING loop against that snapshot's weights (via PersonaSpec) and record what
// the system would build for him at that moment: the best seed, the recovered
// top "why", and the bred offspring page. As sentiment drifts, the winning page
// rotates on its own — the clearest argument that a static page can't work,
// because the buyer is a moving target.
//
// Reuses the generic pure pieces (attribute, promote, generateOffspring) with the
// spec-based simulator — no pipeline duplication.
// ---------------------------------------------------------------------------

import { SEED_VARIANTS, HEADLINE_COPY } from '../genome';
import type { Genome } from '../genome';
import {
  simulateVisitSpec,
  expectedRewardSpec,
  randomGenome,
  createRng,
  type PersonaSpec,
} from '../simulate';
import { attribute, promote, type Sample } from '../attribute';
import { generateOffspring, type GeneChange } from '../generate';
import { RAY_TIMELINE, type TimedPersona } from './index';

export function specOfTimed(tp: TimedPersona): PersonaSpec {
  return { weights: tp.weights, conversionValue: tp.conversionValue, preferredAction: tp.preferredAction };
}

export interface TimelineStep {
  id: string;
  date: string;
  era: string;
  person: string;
  role: string;
  macroContext: string;
  why: string;
  winningFrame: string;
  willingnessToBuy: number;
  vendorSentiment: number;
  roiBelief: number;
  stackValueBelief: string;

  // the six seeds ranked for this buyer
  ranking: { id: string; name: string; reward: number }[];
  bestSeedId: string;
  bestSeedName: string;

  // the top "why" the market wants now — true vs the system's inference
  trueTopHeadline: string;
  inferredTopHeadline: string;
  winningWhy: string; // HEADLINE_COPY[inferredTopHeadline].why

  // the page the system would breed for Ray at this moment
  offspring: {
    genome: Genome;
    headline: string;
    changes: GeneChange[];
    parentName: string;
    parentReward: number;
    offspringReward: number;
    estimatedLift: number;
    actualLift: number;
  };
}

const argmaxHeadline = (w: Partial<Record<string, number>>): string =>
  (Object.entries(w) as [string, number][]).sort((a, b) => b[1] - a[1])[0]?.[0] ?? '';

export interface TimelineOptions {
  genomes?: number;
  visitsPerGenome?: number;
  seed?: number;
  minSamples?: number;
}

export function runTimelineStep(tp: TimedPersona, opts: TimelineOptions = {}): TimelineStep {
  const genomes = opts.genomes ?? 120;
  const visitsPerGenome = opts.visitsPerGenome ?? 30;
  const seed = opts.seed ?? 7;
  const minSamples = opts.minSamples ?? 300;

  const spec = specOfTimed(tp);

  // rank the seeds for this buyer (exact expected reward, no noise)
  const ranking = SEED_VARIANTS.map((v) => ({
    id: v.id,
    name: v.name,
    reward: expectedRewardSpec(v.genome, spec),
  })).sort((a, b) => b.reward - a.reward);
  const champion = SEED_VARIANTS.find((v) => v.id === ranking[0].id)!;

  // attribute over a randomized population simulated with THIS buyer's weights
  const rng = createRng(seed);
  const samples: Sample[] = [];
  for (let i = 0; i < genomes; i++) {
    const g = randomGenome(rng);
    for (let v = 0; v < visitsPerGenome; v++) {
      samples.push({ genome: g, reward: simulateVisitSpec(g, spec, rng).reward });
    }
  }
  const attribution = attribute(samples);
  const promotion = promote(attribution, { minSamples });
  const offspring = generateOffspring(champion.genome, attribution, promotion);

  const parentReward = expectedRewardSpec(champion.genome, spec);
  const offspringReward = expectedRewardSpec(offspring.genome, spec);

  const trueTopHeadline = argmaxHeadline(tp.weights.headline);
  const inferredTopHeadline =
    attribution.genes.find((g) => g.gene === 'headline')?.bestAllele ?? '';

  return {
    id: tp.id,
    date: tp.date,
    era: tp.era,
    person: tp.person,
    role: tp.role,
    macroContext: tp.macroContext,
    why: tp.why,
    winningFrame: tp.winningFrame,
    willingnessToBuy: tp.willingnessToBuy,
    vendorSentiment: tp.sentiment.vendorSentiment,
    roiBelief: tp.sentiment.roiBelief,
    stackValueBelief: tp.sentiment.stackValueBelief,
    ranking,
    bestSeedId: ranking[0].id,
    bestSeedName: ranking[0].name,
    trueTopHeadline,
    inferredTopHeadline,
    winningWhy: HEADLINE_COPY[inferredTopHeadline as keyof typeof HEADLINE_COPY]?.why ?? '',
    offspring: {
      genome: offspring.genome,
      headline: offspring.genome.headline,
      changes: offspring.changes,
      parentName: champion.name,
      parentReward,
      offspringReward,
      estimatedLift: offspring.estimatedLift,
      actualLift: offspringReward - parentReward,
    },
  };
}

/** Run the whole timeline (oldest → newest). */
export function runTimeline(opts: TimelineOptions = {}): TimelineStep[] {
  return RAY_TIMELINE.map((tp) => runTimelineStep(tp, opts));
}
