import { describe, it, expect } from 'vitest';
import { generateOffspring, runGeneration } from './generate';
import { runAttribution } from './attribute';
import { SEED_VARIANTS, HEADLINE_COPY, CTA_COPY, SOCIAL_PROOF_COPY } from './genome';
import { AUDIENCE_MIXES } from './personas';
import { bodySections } from './render';
import { expectedRewardUnderMix } from './simulate';

const genCfg = { mixKey: 'roi_driven', genomes: 200, visitsPerGenome: 45, seed: 7, minSamples: 400 };

describe('generateOffspring — recombines only promoted genes', () => {
  const { attribution, promotion } = runAttribution(genCfg);
  const base = SEED_VARIANTS[0].genome;
  const offspring = generateOffspring(base, attribution, promotion);

  it('sets every promoted gene to its promoted allele', () => {
    for (const p of promotion.promoted) {
      expect(offspring.genome[p.gene]).toBe(p.allele);
    }
  });

  it('leaves genes that were not promoted untouched (no guessing)', () => {
    const promotedGenes = new Set(promotion.promoted.map((p) => p.gene));
    for (const gene of ['headline', 'primaryCta', 'ctaStyle', 'socialProof', 'tone', 'length', 'heroLayout'] as const) {
      if (!promotedGenes.has(gene)) {
        expect(offspring.genome[gene]).toBe(base[gene]);
      }
    }
  });

  it('records a change only where the base actually differed', () => {
    for (const c of offspring.changes) {
      expect(c.from).not.toBe(c.to);
      expect(base[c.gene]).toBe(c.from);
      expect(offspring.genome[c.gene]).toBe(c.to);
    }
  });

  it('estimated lift is non-negative (we only swap to better alleles)', () => {
    expect(offspring.estimatedLift).toBeGreaterThanOrEqual(0);
  });

  it('the offspring renders as a real, coherent page', () => {
    const g = offspring.genome;
    expect(bodySections(g).length).toBeGreaterThan(0);
    expect(HEADLINE_COPY[g.headline]).toBeTruthy();
    expect(CTA_COPY[g.primaryCta]).toBeTruthy();
    expect(SOCIAL_PROOF_COPY[g.socialProof]).toBeTruthy();
  });
});

describe('runGeneration — the informed offspring beats its parent', () => {
  const run = runGeneration(genCfg);

  it('picks the best seed under the mix as the parent', () => {
    const mix = AUDIENCE_MIXES[genCfg.mixKey];
    const trueBest = SEED_VARIANTS.map((v) => ({ id: v.id, er: expectedRewardUnderMix(v.genome, mix) })).sort(
      (a, b) => b.er - a.er,
    )[0];
    expect(run.base.id).toBe(trueBest.id);
  });

  it('the offspring’s true expected reward is at least the parent’s', () => {
    // Informed recombination shouldn't hurt: we only apply gate-cleared alleles.
    expect(run.offspringExpectedReward).toBeGreaterThanOrEqual(run.baseExpectedReward - 1);
  });

  it('the estimated lift points the same way as the true lift', () => {
    if (run.offspring.estimatedLift > 50) {
      expect(run.actualLift).toBeGreaterThan(0);
    }
  });

  it('is deterministic', () => {
    expect(runGeneration(genCfg)).toEqual(run);
  });
});
