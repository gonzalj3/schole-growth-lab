// generate.ts
// ---------------------------------------------------------------------------
// PURE. Phase 2 "Optimization": breed an informed offspring page from what the
// trust layer proved. The DECISION of what to change is deterministic and
// interpretable — we apply only the alleles the promotion gate cleared, and
// leave every unproven gene exactly as the parent had it. No guessing.
// (Optional LLM copy for a fresh headline is a flagged extension, off by default
// and with a deterministic fallback — see CLAUDE.md §12 — so the app stays
// fully reproducible without a key. Not required to render the offspring, which
// uses the existing grounded copy maps.)
// ---------------------------------------------------------------------------

import type { Genome } from './genome';
import { SEED_VARIANTS, type Variant, type AttributedGene } from './genome';
import { AUDIENCE_MIXES } from './personas';
import { expectedRewardUnderMix } from './simulate';
import { runAttribution, type Attribution, type PromotionResult } from './attribute';

export interface GeneChange {
  gene: AttributedGene;
  from: string;
  to: string;
  effect: number; // modeled reward delta of the swap (to − from), in dollars
}

export interface Offspring {
  genome: Genome;
  changes: GeneChange[];
  estimatedLift: number; // Σ change effects — what attribution predicts
  rationale: string[]; // human-readable lines, one per change
}

function effectOf(attribution: Attribution, gene: AttributedGene, allele: string): number {
  const g = attribution.genes.find((x) => x.gene === gene);
  return g?.alleles.find((a) => a.allele === allele)?.effect ?? 0;
}

/**
 * Apply the promoted alleles to a parent genome. Only promoted genes change;
 * everything unproven is inherited untouched.
 */
export function generateOffspring(
  base: Genome,
  attribution: Attribution,
  promotion: PromotionResult,
): Offspring {
  const genome: Genome = { ...base };
  const changes: GeneChange[] = [];

  for (const p of promotion.promoted) {
    const from = String(base[p.gene]);
    if (from === p.allele) continue; // parent already had the winning allele
    const effect = effectOf(attribution, p.gene, p.allele) - effectOf(attribution, p.gene, from);
    (genome as unknown as Record<AttributedGene, string>)[p.gene] = p.allele;
    changes.push({ gene: p.gene, from, to: p.allele, effect });
  }

  const estimatedLift = changes.reduce((s, c) => s + c.effect, 0);
  const rationale = changes.map(
    (c) =>
      `Set ${c.gene} to “${c.to}” — attribution modeled ${
        c.effect >= 0 ? '+' : '−'
      }$${Math.abs(Math.round(c.effect))} vs the parent’s “${c.from}”.`,
  );

  return { genome, changes, estimatedLift, rationale };
}

// ---- Orchestration --------------------------------------------------------

export interface GenerationConfig {
  mixKey: string;
  genomes: number;
  visitsPerGenome: number;
  seed: number;
  minSamples?: number;
}

export interface GenerationRun {
  base: Variant; // the parent — the best seed under this mix
  offspring: Offspring;
  baseExpectedReward: number;
  offspringExpectedReward: number;
  actualLift: number; // true lift via the oracle (for the honesty check)
  attribution: Attribution;
  promotion: PromotionResult;
}

/**
 * Run the full generation step: attribute → pick the current champion (best
 * seed under the mix) → breed the informed offspring → measure its true lift.
 * Estimated lift (from attribution) vs actual lift (from the oracle) is itself
 * an honesty check on the whole pipeline.
 */
export function runGeneration(cfg: GenerationConfig): GenerationRun {
  const { attribution, promotion } = runAttribution(cfg);
  const mix = AUDIENCE_MIXES[cfg.mixKey];

  const ranked = SEED_VARIANTS.map((v) => ({ v, er: expectedRewardUnderMix(v.genome, mix) })).sort(
    (a, b) => b.er - a.er,
  );
  const base = ranked[0];
  const offspring = generateOffspring(base.v.genome, attribution, promotion);
  const offspringExpectedReward = expectedRewardUnderMix(offspring.genome, mix);

  return {
    base: base.v,
    offspring,
    baseExpectedReward: base.er,
    offspringExpectedReward,
    actualLift: offspringExpectedReward - base.er,
    attribution,
    promotion,
  };
}
