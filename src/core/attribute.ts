// attribute.ts
// ---------------------------------------------------------------------------
// PURE stats + a thin simulation-driven convenience. The trust layer (CLAUDE.md
// §9): given reward observations tagged by genome, estimate each ALLELE's
// marginal effect on reward, with a confidence interval — and a PROMOTION GATE
// that refuses to crown a winner the evidence can't support.
//
// Method: an interpretable MAIN-EFFECTS LINEAR REGRESSION. We regress reward on
// one-hot gene alleles using effects (sum-to-zero) coding, so each allele's
// coefficient is its effect on revenue *holding the other genes fixed*. This
// controls for confounding — a raw marginal mean would blame `socialProof` for
// swings actually caused by an imbalanced `headline` — which matters because our
// genome population is finite. Discrete genes + an additive model = coefficients
// that recover the (hidden) causal structure. This echoes InterpretCC: an
// interpretable-by-design decomposition, not a black box.
//
// This module reads NO ground truth. It infers — that is the whole point.
// ---------------------------------------------------------------------------

import type { Genome } from './genome';
import { ALLELES, ATTRIBUTED_GENES, type AttributedGene } from './genome';
import { AUDIENCE_MIXES, samplePersona } from './personas';
import { simulateVisit, randomGenome } from './simulate';
import { createRng } from './rng';

export interface AlleleEffect {
  gene: AttributedGene;
  allele: string;
  n: number;
  meanReward: number; // raw marginal mean (for display)
  effect: number; // de-confounded regression coefficient (deviation from gene mean)
  ci: [number, number]; // 95% CI on the effect
}

export interface GeneAttribution {
  gene: AttributedGene;
  alleles: AlleleEffect[]; // sorted by effect, descending
  bestAllele: string;
  /** Does the best allele's effect CI sit entirely above the runner-up's? */
  separated: boolean;
}

export interface Attribution {
  genes: GeneAttribution[];
  n: number;
}

export interface Sample {
  genome: Genome;
  reward: number;
}

const Z = 1.96; // 95%
const RIDGE = 1e-6; // tiny regularization → invertible even on degenerate designs

/** Estimate per-allele marginal effects on revenue with CIs, de-confounded. */
export function attribute(samples: Sample[]): Attribution {
  // Column layout: intercept, then (k-1) effects-coded columns per gene. The
  // last allele of each gene is the reference (coded -1 across its columns).
  const meta = ATTRIBUTED_GENES.map((gene) => ({
    gene,
    alleles: ALLELES[gene] as readonly string[],
  }));
  let col = 1; // 0 = intercept
  const starts: number[] = [];
  for (const m of meta) {
    starts.push(col);
    col += m.alleles.length - 1;
  }
  const p = col;

  // raw per-allele stats (for display) + normal equations XtX, Xty
  const raw = new Map<string, { n: number; sum: number }>();
  const XtX = Array.from({ length: p }, () => new Array(p).fill(0));
  const Xty = new Array(p).fill(0);
  const N = samples.length;

  const buildRow = (g: Genome): number[] => {
    const row = new Array(p).fill(0);
    row[0] = 1;
    meta.forEach((m, gi) => {
      const idx = m.alleles.indexOf(String(g[m.gene]));
      const k = m.alleles.length;
      for (let j = 0; j < k - 1; j++) {
        row[starts[gi] + j] = idx === j ? 1 : idx === k - 1 ? -1 : 0;
      }
    });
    return row;
  };

  for (const s of samples) {
    const row = buildRow(s.genome);
    const y = s.reward;
    for (let i = 0; i < p; i++) {
      Xty[i] += row[i] * y;
      for (let j = i; j < p; j++) XtX[i][j] += row[i] * row[j];
    }
    meta.forEach((m) => {
      const key = `${m.gene}:${String(s.genome[m.gene])}`;
      const r = raw.get(key) ?? { n: 0, sum: 0 };
      r.n += 1;
      r.sum += y;
      raw.set(key, r);
    });
  }
  for (let i = 0; i < p; i++) {
    for (let j = 0; j < i; j++) XtX[i][j] = XtX[j][i];
    XtX[i][i] += RIDGE;
  }

  const inv = invert(XtX);
  const beta = matVec(inv, Xty);

  // Heteroscedasticity-consistent (HC1) covariance. Reward variance depends on
  // the genome (mostly-zero with occasional large conversions), so classical OLS
  // standard errors under-cover. The sandwich estimator inv·M·inv, with
  // M = Σ eᵢ² xᵢxᵢᵀ (squared residuals), corrects the intervals — measured by
  // the calibration eval. HC1 applies the small-sample factor N/(N−p).
  const M = Array.from({ length: p }, () => new Array(p).fill(0));
  for (const s of samples) {
    const row = buildRow(s.genome);
    const e = s.reward - dot(beta, row);
    const e2 = e * e;
    for (let i = 0; i < p; i++) {
      const ri = row[i];
      if (ri === 0) continue;
      for (let j = 0; j < p; j++) if (row[j] !== 0) M[i][j] += ri * row[j] * e2;
    }
  }
  const hc = N > p ? N / (N - p) : 1;
  const cov = matMul(matMul(inv, M), inv).map((r) => r.map((v) => v * hc));

  const genes: GeneAttribution[] = meta.map((m, gi) => {
    const k = m.alleles.length;
    const start = starts[gi];
    // effects: coded alleles are their coefficients; reference = -Σ(coefs).
    const coef = m.alleles.map((_, j) => (j < k - 1 ? beta[start + j] : 0));
    coef[k - 1] = -coef.slice(0, k - 1).reduce((a, b) => a + b, 0);

    const alleles: AlleleEffect[] = m.alleles.map((allele, j) => {
      // variance of the effect
      let variance: number;
      if (j < k - 1) {
        variance = cov[start + j][start + j];
      } else {
        // Var(-Σβ) = ΣΣ Cov(β_a, β_b) over the gene's columns
        let s = 0;
        for (let a = 0; a < k - 1; a++)
          for (let b = 0; b < k - 1; b++) s += cov[start + a][start + b];
        variance = s;
      }
      const se = Math.sqrt(Math.max(0, variance));
      const r = raw.get(`${m.gene}:${allele}`) ?? { n: 0, sum: 0 };
      const effect = coef[j];
      return {
        gene: m.gene,
        allele,
        n: r.n,
        meanReward: r.n > 0 ? r.sum / r.n : 0,
        effect,
        ci: [effect - Z * se, effect + Z * se],
      };
    });
    alleles.sort((x, y2) => y2.effect - x.effect);

    const best = alleles[0];
    const runnerUp = alleles[1];
    const separated = !!best && !!runnerUp && best.ci[0] > runnerUp.ci[1];
    return { gene: m.gene, alleles, bestAllele: best?.allele ?? '', separated };
  });

  return { genes, n: N };
}

// ---- tiny linear algebra --------------------------------------------------

function invert(M: number[][]): number[][] {
  const n = M.length;
  const A = M.map((row, i) => [...row, ...Array.from({ length: n }, (_, j) => (i === j ? 1 : 0))]);
  for (let c = 0; c < n; c++) {
    let piv = c;
    for (let r = c + 1; r < n; r++) if (Math.abs(A[r][c]) > Math.abs(A[piv][c])) piv = r;
    const tmp = A[c];
    A[c] = A[piv];
    A[piv] = tmp;
    const d = A[c][c] || 1e-12;
    for (let j = 0; j < 2 * n; j++) A[c][j] /= d;
    for (let r = 0; r < n; r++) {
      if (r === c) continue;
      const f = A[r][c];
      if (f === 0) continue;
      for (let j = 0; j < 2 * n; j++) A[r][j] -= f * A[c][j];
    }
  }
  return A.map((row) => row.slice(n));
}

const matVec = (M: number[][], v: number[]): number[] =>
  M.map((row) => row.reduce((s, x, j) => s + x * v[j], 0));
const dot = (a: number[], b: number[]): number => a.reduce((s, x, i) => s + x * b[i], 0);

function matMul(A: number[][], B: number[][]): number[][] {
  const n = A.length;
  const k = B.length;
  const m = B[0].length;
  const C = Array.from({ length: n }, () => new Array(m).fill(0));
  for (let i = 0; i < n; i++)
    for (let l = 0; l < k; l++) {
      const a = A[i][l];
      if (a === 0) continue;
      for (let j = 0; j < m; j++) C[i][j] += a * B[l][j];
    }
  return C;
}

// ---- Promotion gate -------------------------------------------------------

export interface Promotion {
  gene: AttributedGene;
  allele: string;
  effect: number;
  ci: [number, number];
}
export interface Rejection {
  gene: AttributedGene;
  allele: string;
  effect: number;
  reason: string;
}
export interface PromotionResult {
  promoted: Promotion[];
  rejected: Rejection[];
  minSamples: number;
}

/**
 * A gene's best allele is PROMOTED only when its evidence clears two bars:
 * (1) enough samples, and (2) its effect CI separates from the runner-up.
 * Otherwise it is REJECTED with the reason — surfacing restraint is the point.
 */
export function promote(
  attribution: Attribution,
  opts: { minSamples?: number } = {},
): PromotionResult {
  const minSamples = opts.minSamples ?? 300;
  const promoted: Promotion[] = [];
  const rejected: Rejection[] = [];

  for (const g of attribution.genes) {
    const best = g.alleles[0];
    if (!best) continue;
    if (best.n < minSamples) {
      rejected.push({
        gene: g.gene,
        allele: best.allele,
        effect: best.effect,
        reason: `only ${best.n} samples (< ${minSamples}); not enough evidence`,
      });
      continue;
    }
    if (!g.separated) {
      rejected.push({
        gene: g.gene,
        allele: best.allele,
        effect: best.effect,
        reason: 'effect interval overlaps the runner-up; the lead may be noise',
      });
      continue;
    }
    promoted.push({ gene: g.gene, allele: best.allele, effect: best.effect, ci: best.ci });
  }
  return { promoted, rejected, minSamples };
}

// ---- Convenience: run the whole attribution experiment --------------------

export interface AttributionConfig {
  mixKey: string;
  genomes: number;
  visitsPerGenome: number;
  seed: number;
  minSamples?: number;
}

export interface AttributionRun {
  attribution: Attribution;
  promotion: PromotionResult;
  nGenomes: number;
  nVisits: number;
}

/**
 * Build a randomized genome population, simulate traffic under the mix, and
 * attribute. The randomized population is the "factorial experiment" that lets
 * the regression identify each gene's effect.
 */
export function runAttribution(cfg: AttributionConfig): AttributionRun {
  const rng = createRng(cfg.seed);
  const mix = AUDIENCE_MIXES[cfg.mixKey];
  const samples: Sample[] = [];
  for (let i = 0; i < cfg.genomes; i++) {
    const genome = randomGenome(rng);
    for (let v = 0; v < cfg.visitsPerGenome; v++) {
      const personaId = samplePersona(mix, rng.next());
      samples.push({ genome, reward: simulateVisit(genome, personaId, rng).reward });
    }
  }
  const attribution = attribute(samples);
  const promotion = promote(attribution, { minSamples: cfg.minSamples });
  return { attribution, promotion, nGenomes: cfg.genomes, nVisits: samples.length };
}
