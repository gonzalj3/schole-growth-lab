// sequential/types.ts
// ---------------------------------------------------------------------------
// A SEQUENTIAL persona: the SAME person (Ray Delgado, a grocery-chain IT VP)
// sampled every 6 months, July 2023 → July 2026. Each snapshot is its own file
// with its OWN baked weights — because the system consumes one persona's weights
// at a time, each timepoint is a drop-in "world" the whole loop can run against.
//
// `weights` is a full PreferenceWeights table (same shape as a GROUND_TRUTH row),
// already adjusted for the era — no delta needs to be applied on top. The
// anti-token frame uses the `value_realization` allele (the challenge's existing
// gene; the colleague's `results_over_tokens` is the same concept, merged here).
//
// This is non-stationarity in TIME — the second stress-test axis alongside the
// audience mix. Sweep the timeline and the winning page rotates on its own.
// ---------------------------------------------------------------------------

import type { ConversionAction, PreferenceWeights } from '../personas';

export type SentimentEra =
  | '2023_fomo'
  | '2024_first_doubts'
  | '2025_reckoning'
  | '2026_resentment';

// Where the buyer believes durable value lives in the AI stack (drifts down the
// stack toward the adoption/outcome layer — the "deliver results" thesis).
export type StackValueBelief = 'model_layer' | 'application_layer' | 'outcome_layer';

export interface TimedPersona {
  id: string; // 'ray_2023_07'
  person: string;
  role: string;
  date: string; // 'YYYY-MM'
  era: SentimentEra;
  macroContext: string; // grounded, with dated sources

  sentiment: {
    understandingSelf: number; // 1-5
    understandingOrg: number;
    comfortSelf: number;
    comfortOrg: number;
    perceivedNeedPersonal: number;
    perceivedNeedBusiness: number;
    roiBelief: number; // 5 = hype, 2 = disillusioned, 3 = pragmatic
    vendorSentiment: number; // 1 = hopeful … 5 = resentful
    stackValueBelief: StackValueBelief;
  };

  why: string; // dominant buying rationale at this time
  willingnessToBuy: number; // 1-5
  preferredAction: ConversionAction;
  conversionValue: Record<ConversionAction, number>;

  weights: PreferenceWeights; // point-in-time preference table (era folded in)
  winningFrame: string; // the optimal Scholé frame at this moment
}
