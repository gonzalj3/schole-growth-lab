import { describe, it, expect } from 'vitest';
import { runAttribution, attribute, type Attribution } from './attribute';
import { ALLELES, type AttributedGene, type Genome } from './genome';
import { AUDIENCE_MIXES } from './personas';
import { expectedRewardUnderMix, randomGenome, createRng } from './simulate';

// Pearson correlation between two equal-length series.
function pearson(a: number[], b: number[]): number {
  const n = a.length;
  const ma = a.reduce((s, x) => s + x, 0) / n;
  const mb = b.reduce((s, x) => s + x, 0) / n;
  let num = 0;
  let da = 0;
  let db = 0;
  for (let i = 0; i < n; i++) {
    num += (a[i] - ma) * (b[i] - mb);
    da += (a[i] - ma) ** 2;
    db += (b[i] - mb) ** 2;
  }
  return num / Math.sqrt(da * db);
}

// The TRUE marginal effect of each allele of `gene` on expected revenue: average
// the exact (noise-free) expected reward over a large random genome population
// holding that allele fixed, minus the grand mean. This is the causal effect the
// attribution is trying to recover.
function trueRevenueEffects(gene: AttributedGene, mixKey: string): Map<string, number> {
  const rng = createRng(12345);
  const mix = AUDIENCE_MIXES[mixKey];
  const acc = new Map<string, { sum: number; n: number }>();
  let grandSum = 0;
  let grandN = 0;
  for (let i = 0; i < 6000; i++) {
    const g = randomGenome(rng);
    const r = expectedRewardUnderMix(g, mix);
    const a = String(g[gene]);
    const o = acc.get(a) ?? { sum: 0, n: 0 };
    o.sum += r;
    o.n += 1;
    acc.set(a, o);
    grandSum += r;
    grandN += 1;
  }
  const grandMean = grandSum / grandN;
  const out = new Map<string, number>();
  for (const [a, o] of acc) out.set(a, o.sum / o.n - grandMean);
  return out;
}

const geneOf = (att: Attribution, gene: string) =>
  att.genes.find((g) => g.gene === gene)!;

describe('attribution recovers the true effect on revenue', () => {
  const { attribution } = runAttribution({
    mixKey: 'roi_driven',
    genomes: 240,
    visitsPerGenome: 50,
    seed: 7,
  });

  it('estimated headline effects correlate strongly with the true revenue effects', () => {
    const truth = trueRevenueEffects('headline', 'roi_driven');
    const headline = geneOf(attribution, 'headline');
    const estimated = ALLELES.headline.map(
      (a) => headline.alleles.find((x) => x.allele === a)!.effect,
    );
    const trueVals = ALLELES.headline.map((a) => truth.get(a)!);
    expect(pearson(estimated, trueVals)).toBeGreaterThan(0.9);
  });

  it('also recovers the social-proof effects', () => {
    const truth = trueRevenueEffects('socialProof', 'risk_driven');
    const { attribution: att } = runAttribution({
      mixKey: 'risk_driven',
      genomes: 300,
      visitsPerGenome: 40,
      seed: 9,
    });
    const proof = geneOf(att, 'socialProof');
    const estimated = ALLELES.socialProof.map(
      (a) => proof.alleles.find((x) => x.allele === a)!.effect,
    );
    const trueVals = ALLELES.socialProof.map((a) => truth.get(a)!);
    expect(pearson(estimated, trueVals)).toBeGreaterThan(0.9);
  });

  it('per-gene, the effects sum to zero (effects-coding contract)', () => {
    for (const g of attribution.genes) {
      const sum = g.alleles.reduce((s, a) => s + a.effect, 0);
      expect(Math.abs(sum)).toBeLessThan(1e-6);
    }
  });

  it('the null gene (heroLayout) shows no meaningful effect', () => {
    const hero = geneOf(attribution, 'heroLayout');
    const maxAbs = Math.max(...hero.alleles.map((a) => Math.abs(a.effect)));
    expect(maxAbs).toBeLessThan(400); // rewards are in the thousands; this is noise
  });
});

describe('promotion gate — restraint', () => {
  const { promotion } = runAttribution({
    mixKey: 'roi_driven',
    genomes: 160,
    visitsPerGenome: 50,
    seed: 7,
  });

  it('promotes at least one gene whose best allele clearly separates', () => {
    expect(promotion.promoted.length).toBeGreaterThanOrEqual(1);
  });

  it('never promotes the null gene (no false discovery)', () => {
    expect(promotion.promoted.some((p) => p.gene === 'heroLayout')).toBe(false);
  });

  it('a too-small sample promotes nothing (evidence gate)', () => {
    const tiny = runAttribution({
      mixKey: 'roi_driven',
      genomes: 8,
      visitsPerGenome: 4,
      seed: 7,
      minSamples: 500,
    });
    expect(tiny.promotion.promoted).toHaveLength(0);
  });
});

describe('determinism', () => {
  it('same config → identical attribution', () => {
    const cfg = { mixKey: 'balanced', genomes: 30, visitsPerGenome: 40, seed: 3 };
    expect(runAttribution(cfg)).toEqual(runAttribution(cfg));
  });
});

describe('attribute() is pure over its samples', () => {
  it('handles a hand-built dataset and ranks the better allele higher', () => {
    // Two genomes differing only in tone; give the "punchy" one higher rewards.
    const base: Omit<Genome, 'tone'> = {
      headline: 'measurable_adoption',
      primaryCta: 'book_demo',
      ctaStyle: 'single',
      socialProof: 'case_studies',
      length: 'medium',
      heroLayout: 'split_image',
      sectionOrder: ['benefits', 'howItWorks', 'proof', 'credibility', 'pricing'],
    };
    const mk = (tone: Genome['tone'], reward: number, count: number) =>
      Array.from({ length: count }, () => ({ genome: { ...base, tone } as Genome, reward }));
    const att = attribute([...mk('punchy', 5000, 300), ...mk('academic', 1000, 300)]);
    expect(geneOf(att, 'tone').bestAllele).toBe('punchy');
  });
});
