// evals.ts
// ---------------------------------------------------------------------------
// PURE. Eval-driven development is the signature (CLAUDE.md §10). Because we
// authored GROUND_TRUTH, we can grade the system's own inferences across many
// seeds and report FREQUENCIES, not one lucky run. Five evals:
//   1. Arm identification   — how often the bandit crowns the truly-best variant
//   2. Attribution recovery — corr(estimated per-allele effect, true effect)
//   3. Regret vs oracle     — bandit's cumulative regret as a share of uniform
//   4. CI calibration       — do the 95% effect intervals cover truth ~95%?
//   5. False-discovery guard— is the planted null gene ever promoted?
// This module + evals.spec.ts turn those into a graded scorecard.
// ---------------------------------------------------------------------------

import { runExperiment } from './experiment';
import { runAttribution } from './attribute';
import { AUDIENCE_MIXES } from './personas';
import { expectedRewardUnderMix, randomGenome, createRng } from './simulate';
import { ATTRIBUTED_GENES, type AttributedGene } from './genome';

// Genes that carry real ground-truth signal (used for recovery + calibration).
const SIGNAL_GENES: AttributedGene[] = [
  'headline',
  'primaryCta',
  'socialProof',
  'tone',
  'length',
];

export interface EvalScore {
  key: string;
  label: string;
  value: number;
  display: string;
  pass: boolean;
  target: string;
  detail: string;
}

export interface Scorecard {
  mixKey: string;
  seeds: number;
  scores: EvalScore[];
}

const mean = (xs: number[]) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0);

function pearson(a: number[], b: number[]): number {
  const n = a.length;
  const ma = mean(a);
  const mb = mean(b);
  let num = 0;
  let da = 0;
  let db = 0;
  for (let i = 0; i < n; i++) {
    num += (a[i] - ma) * (b[i] - mb);
    da += (a[i] - ma) ** 2;
    db += (b[i] - mb) ** 2;
  }
  return da === 0 || db === 0 ? 0 : num / Math.sqrt(da * db);
}

/** The exact true effect of every allele on expected revenue, per gene. */
function trueEffects(mixKey: string): Record<string, Map<string, number>> {
  const rng = createRng(202601);
  const mix = AUDIENCE_MIXES[mixKey];
  const acc: Record<string, Map<string, { sum: number; n: number }>> = {};
  const grand: Record<string, { sum: number; n: number }> = {};
  for (const g of ATTRIBUTED_GENES) {
    acc[g] = new Map();
    grand[g] = { sum: 0, n: 0 };
  }
  for (let i = 0; i < 5000; i++) {
    const genome = randomGenome(rng);
    const r = expectedRewardUnderMix(genome, mix);
    for (const g of ATTRIBUTED_GENES) {
      const a = String(genome[g]);
      const cell = acc[g].get(a) ?? { sum: 0, n: 0 };
      cell.sum += r;
      cell.n += 1;
      acc[g].set(a, cell);
      grand[g].sum += r;
      grand[g].n += 1;
    }
  }
  const out: Record<string, Map<string, number>> = {};
  for (const g of ATTRIBUTED_GENES) {
    const gm = grand[g].sum / grand[g].n;
    out[g] = new Map([...acc[g].entries()].map(([a, c]) => [a, c.sum / c.n - gm]));
  }
  return out;
}

export interface EvalOptions {
  mixKey?: string;
  seeds?: number[];
  genomes?: number;
  visitsPerGenome?: number;
}

export function runEvals(opts: EvalOptions = {}): Scorecard {
  const mixKey = opts.mixKey ?? 'roi_driven';
  const seeds = opts.seeds ?? Array.from({ length: 12 }, (_, i) => i + 1);
  const genomes = opts.genomes ?? 220;
  const visitsPerGenome = opts.visitsPerGenome ?? 45;
  const truth = trueEffects(mixKey);

  let armHits = 0;
  let fdHits = 0;
  const recoveryCorrs: number[] = [];
  const regretRatios: number[] = [];
  let ciCovered = 0;
  let ciTotal = 0;

  for (const seed of seeds) {
    // Arm identification + regret (bandit vs uniform on the same seed).
    const exp = runExperiment({ mixKey, banditKind: 'thompson', rounds: 30, visitorsPerRound: 60, seed });
    if (exp.empiricalBestId === exp.oracleBestId) armHits++;
    const uni = runExperiment({
      mixKey,
      banditKind: 'epsilon_greedy',
      epsilon: 1,
      rounds: 30,
      visitorsPerRound: 60,
      seed,
    });
    const ub = uni.regretCurve.at(-1) ?? 0;
    regretRatios.push(ub > 0 ? (exp.regretCurve.at(-1) ?? 0) / ub : 0);

    // Attribution: recovery, calibration, false-discovery.
    const { attribution, promotion } = runAttribution({
      mixKey,
      genomes,
      visitsPerGenome,
      seed,
      minSamples: 400,
    });
    if (promotion.promoted.some((p) => p.gene === 'heroLayout')) fdHits++;

    const est: number[] = [];
    const tru: number[] = [];
    for (const gene of SIGNAL_GENES) {
      const g = attribution.genes.find((x) => x.gene === gene)!;
      for (const a of g.alleles) {
        const t = truth[gene].get(a.allele) ?? 0;
        est.push(a.effect);
        tru.push(t);
        ciTotal++;
        if (t >= a.ci[0] && t <= a.ci[1]) ciCovered++;
      }
    }
    recoveryCorrs.push(pearson(est, tru));
  }

  const N = seeds.length;
  const armRate = armHits / N;
  const recovery = mean(recoveryCorrs);
  const regretRatio = mean(regretRatios);
  const calibration = ciTotal > 0 ? ciCovered / ciTotal : 0;
  const fdRate = fdHits / N;

  const pct = (x: number) => `${(x * 100).toFixed(0)}%`;

  const scores: EvalScore[] = [
    {
      key: 'arm',
      label: 'Arm identification',
      value: armRate,
      display: pct(armRate),
      pass: armRate >= 0.8,
      target: '≥ 80% of runs',
      detail: `crowned the truly-best variant in ${armHits}/${N} runs`,
    },
    {
      key: 'recovery',
      label: 'Attribution recovery',
      value: recovery,
      display: recovery.toFixed(2),
      pass: recovery >= 0.85,
      target: 'corr ≥ 0.85',
      detail: 'estimated vs. true per-allele revenue effects, pooled over signal genes',
    },
    {
      key: 'regret',
      label: 'Regret vs. oracle',
      value: regretRatio,
      display: `${(regretRatio * 100).toFixed(0)}% of uniform`,
      pass: regretRatio <= 0.5,
      target: '≤ 50% of uniform',
      detail: 'cumulative regret as a share of pure-exploration allocation',
    },
    {
      key: 'calibration',
      label: 'CI calibration',
      value: calibration,
      display: pct(calibration),
      pass: calibration >= 0.88 && calibration <= 0.995,
      target: '≈ 95% coverage',
      detail: `the true effect fell inside the 95% CI ${ciCovered}/${ciTotal} times`,
    },
    {
      key: 'fd',
      label: 'False-discovery guard',
      value: fdRate,
      display: `${fdHits}/${N}`,
      pass: fdRate === 0,
      target: '0 promotions of the null gene',
      detail: 'the planted no-effect gene (hero layout) was never promoted',
    },
  ];

  return { mixKey, seeds: N, scores };
}
