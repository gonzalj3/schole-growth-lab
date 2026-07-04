// simulate.ts
// ---------------------------------------------------------------------------
// PURE. The world. Given a genome + a visitor (persona) + an Rng, produce the
// section-level behavior and the revenue-weighted conversion we would observe.
//
// THIS IS THE ONLY MODULE ALLOWED TO READ GROUND_TRUTH (CLAUDE.md §7). Everything
// downstream — bandit, attribution, generator, interpreter — must INFER the
// truth from the observable signals this module emits. The hidden driver
// (persona, utility) is returned under `_truth` for the debug view + evals ONLY.
//
// The model (all constants are explicit modeling assumptions):
//   1. utility = Σ GROUND_TRUTH[persona][gene][allele]      — how much they like it
//   2. section behavior: liked content earns more dwell + deeper scroll
//   3. action: softmax over the actions THIS page offers + "none", where a
//      higher utility raises the odds of converting at all
//   4. reward = conversionValue[persona][action]            — money on the persona
// ---------------------------------------------------------------------------

import type { Genome, Section } from './genome';
import { ALLELES, DEFAULT_SECTION_ORDER } from './genome';
import type { PersonaId, ConversionAction, PreferenceWeights } from './personas';
import { PERSONAS, GROUND_TRUTH, samplePersona } from './personas';
import { bodySections } from './render';
import type { Rng } from './rng';
import { createRng } from './rng';

// ---- Observable output ----------------------------------------------------

export interface SectionSignal {
  section: Section;
  dwellMs: number; // time spent on the section
  scrollDepth: number; // 0..1, how far into the section they read
}

export interface Visit {
  sections: SectionSignal[];
  ctaHovered: boolean; // did they hover the primary CTA (intent signal)
  action: ConversionAction; // the conversion they took (or 'none')
  reward: number; // conversionValue[persona][action]
  // Hidden ground truth. For the debug view + evals ONLY. The optimizer must
  // never read `_truth` — it exists so WE can grade the system's inferences.
  _truth: { persona: string; utility: number };
}

// ---- Tunable assumptions (each an explicit modeling assumption) --------------

// action logits
const A_UTIL = 1.0; // how strongly utility pushes toward converting
const NONE_BASE = 3.6; // baseline "do nothing" logit → conversion is a minority
const PREF_BONUS = 0.5; // a persona is likelier to take its preferred action
// lower-friction asks convert more readily than a high-commitment demo
const FRICTION_BONUS: Record<ConversionAction, number> = {
  book_demo: 0,
  get_pricing: 0.5,
  get_diagnostic: 0.9,
  none: 0,
};

// section behavior
const BASE_DWELL_MS: Record<Section, number> = {
  benefits: 5000,
  howItWorks: 5500,
  proof: 6000,
  credibility: 4500,
  pricing: 7000,
};
const DWELL_UTIL_GAIN = 0.35; // how much affinity stretches dwell time
const DWELL_NOISE = 0.25; // multiplicative dwell noise (stdev)
const SCROLL_UTIL_GAIN = 1.1; // how much affinity deepens scroll
const SCROLL_BASE = 0.4; // baseline scroll logit
const SCROLL_NOISE = 0.3;

const sigmoid = (x: number) => 1 / (1 + Math.exp(-x));
const clamp = (x: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, x));

// ---- Persona spec ---------------------------------------------------------
// A self-contained buyer: preference weights + money + preferred action. The
// baked committee (GROUND_TRUTH + PERSONAS) is one source of these, but the same
// loop can run against ANY spec — e.g. a point-in-time sequential persona
// (sequential/). That's what makes the temporal stress-test reuse everything.

export interface PersonaSpec {
  weights: PreferenceWeights;
  conversionValue: Record<ConversionAction, number>;
  preferredAction: ConversionAction;
}

const specOf = (personaId: PersonaId): PersonaSpec => ({
  weights: GROUND_TRUTH[personaId],
  conversionValue: PERSONAS[personaId].conversionValue,
  preferredAction: PERSONAS[personaId].preferredAction,
});

// ---- The hidden truth (readers: this module, plus tests/evals) ------------

/** Total how-much-they-like-it for a genome, from an explicit weight table. */
export function utilityFromWeights(g: Genome, w: PreferenceWeights): number {
  return (
    (w.headline[g.headline] ?? 0) +
    (w.primaryCta[g.primaryCta] ?? 0) +
    (w.socialProof[g.socialProof] ?? 0) +
    (w.tone[g.tone] ?? 0) +
    (w.length[g.length] ?? 0)
  );
}

/** Total how-much-they-like-it for a genome, from the ground-truth weights. */
export function trueUtility(g: Genome, personaId: PersonaId): number {
  return utilityFromWeights(g, GROUND_TRUTH[personaId]);
}

/** The non-"none" actions this page actually offers (from the CTA genes). */
export function availableActions(g: Genome): ConversionAction[] {
  const actions = new Set<ConversionAction>([g.primaryCta]);
  if (g.ctaStyle === 'dual') actions.add('get_pricing'); // the secondary CTA
  return [...actions];
}

// ---- One simulated visit (spec-based core) --------------------------------

/** The action distribution a page induces for a persona spec — multinomial
 *  logit (softmax) over the offered CTAs + "none". Deterministic. */
export function actionProbabilitiesSpec(
  g: Genome,
  spec: PersonaSpec,
): { action: ConversionAction; p: number }[] {
  const utility = utilityFromWeights(g, spec.weights);
  const candidates: { action: ConversionAction; logit: number }[] = availableActions(g).map(
    (a) => ({
      action: a,
      logit: A_UTIL * utility + FRICTION_BONUS[a] + (a === spec.preferredAction ? PREF_BONUS : 0),
    }),
  );
  candidates.push({ action: 'none', logit: NONE_BASE });

  const max = Math.max(...candidates.map((c) => c.logit));
  const exps = candidates.map((c) => Math.exp(c.logit - max));
  const total = exps.reduce((a, b) => a + b, 0);
  return candidates.map((c, i) => ({ action: c.action, p: exps[i] / total }));
}

function chooseActionSpec(g: Genome, spec: PersonaSpec, rng: Rng): ConversionAction {
  const dist = actionProbabilitiesSpec(g, spec);
  let u = rng.next();
  for (const { action, p } of dist) {
    u -= p;
    if (u < 0) return action;
  }
  return 'none';
}

/** One simulated visit against any persona spec — the reusable core. */
export function simulateVisitSpec(
  g: Genome,
  spec: PersonaSpec,
  rng: Rng,
  personaLabel = 'custom',
): Visit {
  const w = spec.weights;
  const utility = utilityFromWeights(g, w);

  // Per-section affinity: tone colors every section; proof is also driven by
  // which social-proof allele shows. (Other sections carry no hidden weight.)
  const toneWeight = w.tone[g.tone] ?? 0;
  const proofWeight = w.socialProof[g.socialProof] ?? 0;

  const sections: SectionSignal[] = bodySections(g).map((section) => {
    const affinity = toneWeight * 0.6 + (section === 'proof' ? proofWeight : 0);
    const dwellFactor = clamp(
      1 + DWELL_UTIL_GAIN * affinity + rng.gaussian(0, DWELL_NOISE),
      0.2,
      2.5,
    );
    const scrollDepth = clamp(
      sigmoid(SCROLL_UTIL_GAIN * affinity + SCROLL_BASE + rng.gaussian(0, SCROLL_NOISE)),
      0,
      1,
    );
    return {
      section,
      dwellMs: Math.round(BASE_DWELL_MS[section] * dwellFactor),
      scrollDepth,
    };
  });

  // Intent: hovering the CTA scales with overall attraction.
  const ctaHovered = rng.bool(sigmoid(0.7 * utility - 0.5));
  const action = chooseActionSpec(g, spec, rng);
  const reward = spec.conversionValue[action];

  return { sections, ctaHovered, action, reward, _truth: { persona: personaLabel, utility } };
}

/** Exact expected reward (revenue) of a page for any spec: Σ P(a)·value(a). */
export function expectedRewardSpec(g: Genome, spec: PersonaSpec): number {
  return actionProbabilitiesSpec(g, spec).reduce(
    (sum, { action, p }) => sum + p * spec.conversionValue[action],
    0,
  );
}

// ---- Committee wrappers (unchanged behavior) ------------------------------

export function simulateVisit(g: Genome, personaId: PersonaId, rng: Rng): Visit {
  return simulateVisitSpec(g, specOf(personaId), rng, personaId);
}

export function actionProbabilities(
  g: Genome,
  personaId: PersonaId,
): { action: ConversionAction; p: number }[] {
  return actionProbabilitiesSpec(g, specOf(personaId));
}

/** Exact expected reward (revenue) of a page for one persona. */
export function expectedReward(g: Genome, personaId: PersonaId): number {
  return expectedRewardSpec(g, specOf(personaId));
}

/** Exact expected reward under an audience mix: Σ_persona mix[p]·expectedReward. */
export function expectedRewardUnderMix(
  g: Genome,
  mix: Record<PersonaId, number>,
): number {
  return (Object.entries(mix) as [PersonaId, number][]).reduce(
    (sum, [personaId, weight]) => sum + weight * expectedReward(g, personaId),
    0,
  );
}

// ---- Many visits + aggregation (for the debug view & experiment loop) -----

/** Run `n` visitors against a genome, drawing each persona from the mix. */
export function simulateVisitors(
  g: Genome,
  mix: Record<PersonaId, number>,
  n: number,
  rng: Rng,
): Visit[] {
  const visits: Visit[] = [];
  for (let i = 0; i < n; i++) {
    const personaId = samplePersona(mix, rng.next());
    visits.push(simulateVisit(g, personaId, rng));
  }
  return visits;
}

export interface VisitSummary {
  n: number;
  conversions: number;
  conversionRate: number;
  totalReward: number;
  meanReward: number;
  actionCounts: Record<ConversionAction, number>;
  sections: Partial<Record<Section, { meanDwellMs: number; meanScrollDepth: number }>>;
}

/** Pure aggregation over a batch of visits. Reads no hidden truth. */
export function summarizeVisits(visits: Visit[]): VisitSummary {
  const n = visits.length;
  const actionCounts: Record<ConversionAction, number> = {
    book_demo: 0,
    get_diagnostic: 0,
    get_pricing: 0,
    none: 0,
  };
  const sectionAcc: Partial<Record<Section, { dwell: number; scroll: number; count: number }>> = {};
  let totalReward = 0;

  for (const v of visits) {
    actionCounts[v.action]++;
    totalReward += v.reward;
    for (const s of v.sections) {
      const acc = (sectionAcc[s.section] ??= { dwell: 0, scroll: 0, count: 0 });
      acc.dwell += s.dwellMs;
      acc.scroll += s.scrollDepth;
      acc.count++;
    }
  }

  const conversions = n - actionCounts.none;
  const sections: VisitSummary['sections'] = {};
  for (const [section, acc] of Object.entries(sectionAcc) as [
    Section,
    { dwell: number; scroll: number; count: number },
  ][]) {
    sections[section] = {
      meanDwellMs: acc.dwell / acc.count,
      meanScrollDepth: acc.scroll / acc.count,
    };
  }

  return {
    n,
    conversions,
    conversionRate: n === 0 ? 0 : conversions / n,
    totalReward,
    meanReward: n === 0 ? 0 : totalReward / n,
    actionCounts,
    sections,
  };
}

/**
 * A genome with each attributed gene drawn independently at random. This
 * randomization is what lets attribution (Phase 3) de-confound genes: because
 * every allele co-occurs with every other gene's alleles roughly equally, the
 * marginal mean reward per allele isolates that allele's own effect. Section
 * order is held fixed (we don't attribute it).
 */
export function randomGenome(rng: Rng): Genome {
  return {
    headline: rng.pick(ALLELES.headline),
    primaryCta: rng.pick(ALLELES.primaryCta),
    ctaStyle: rng.pick(ALLELES.ctaStyle),
    socialProof: rng.pick(ALLELES.socialProof),
    tone: rng.pick(ALLELES.tone),
    length: rng.pick(ALLELES.length),
    heroLayout: rng.pick(ALLELES.heroLayout),
    sectionOrder: DEFAULT_SECTION_ORDER,
  };
}

// Re-export for convenience so callers can build a run from a seed in one import.
export { createRng };
