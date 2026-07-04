// personas.ts
// ---------------------------------------------------------------------------
// AUDIENCE: the enterprise buying committee for Scholé's Teams plan. One
// audience — the team buyer — but a committee of four roles who want different
// things. That internal variety is what keeps the audience-mix knob meaningful:
// a "champion-led" deal and a "risk-driven" deal crown different pages.
//
// Two ideas live here, and they are the heart of the demo:
//
//   1. MONEY lives on the persona. Each persona has a `conversionValue` for
//      each action. A booked demo with a real budget-holder is worth thousands
//      (it is the front of a $5,800+ contract). This makes "reward = revenue"
//      real (CLAUDE.md §7): reward = conversionValue[persona][action].
//
//   2. TRUTH lives in GROUND_TRUTH. We hand-author how much each persona likes
//      each allele. Only simulate.ts may read it, to produce behavior.
//      Everything else must INFER it. Because we know the truth, evals can
//      grade the system's inferences (attribution recovery, arm ID). This is
//      the honesty layer.
//
// Personas are grounded in Scholé's real footprint: the Decathlon Switzerland
// engagement, the Harvard partnership, public Product Hunt feedback (the ops
// reframing and the security skeptic), and the Teams plan's own feature set
// (admin dashboard, EU AI Act Article 4 compliance).
// ---------------------------------------------------------------------------

import type { Headline, PrimaryCta, SocialProof, Tone, Length } from './genome';

export type PersonaId =
  | 'lnd_leader' //        the champion / economic buyer
  | 'ops_leader' //        the ROI-driven buyer
  | 'compliance_buyer' //  the risk-driven buyer
  | 'security_skeptic'; // the technical gatekeeper

export type ConversionAction = 'book_demo' | 'get_diagnostic' | 'get_pricing' | 'none';

export interface Persona {
  id: PersonaId;
  label: string;
  role: string; // their seat on the buying committee
  why: string; // the buying rationale they respond to
  grounding: string; // which real Scholé signal this persona is based on
  preferredAction: ConversionAction;
  // Expected revenue contribution (USD) of each action FOR THIS persona.
  // Probability-weighted expected values against a $5,800+ Teams contract.
  // ASSUMPTIONS — explicit expected values.
  conversionValue: Record<ConversionAction, number>;
}

export const PERSONAS: Record<PersonaId, Persona> = {
  lnd_leader: {
    id: 'lnd_leader',
    label: 'L&D / People-Development Leader',
    role: 'Champion & economic buyer — owns the budget and the learning strategy.',
    why: 'Reshape our learning strategy and prove measurable adoption to leadership.',
    grounding: "Scholé's Decathlon Switzerland engagement; Harvard People-Development partnership.",
    preferredAction: 'book_demo',
    conversionValue: { book_demo: 15000, get_diagnostic: 4000, get_pricing: 2000, none: 0 },
  },
  ops_leader: {
    id: 'ops_leader',
    label: 'Operations Leader',
    role: 'Outcome owner — feels the cost of inconsistent AI use across the team.',
    why: 'Inconsistency in support/sales/onboarding costs us money. Show me the ROI.',
    grounding: 'Product Hunt feedback that ops teams are the real opportunity — they see a process problem, want outcomes not theory.',
    preferredAction: 'book_demo',
    conversionValue: { book_demo: 12000, get_diagnostic: 3500, get_pricing: 2500, none: 0 },
  },
  compliance_buyer: {
    id: 'compliance_buyer',
    label: 'Compliance / Risk Buyer',
    role: 'Risk owner — accountable for governed, defensible AI adoption.',
    why: 'Get us from AI awareness to measurable, compliant adoption before the regulation bites.',
    grounding: "Scholé's EU AI Act Article 4 support and 'measurable adoption' messaging.",
    preferredAction: 'book_demo',
    conversionValue: { book_demo: 13000, get_diagnostic: 3000, get_pricing: 2000, none: 0 },
  },
  security_skeptic: {
    id: 'security_skeptic',
    label: 'Technical / Security Evaluator',
    role: 'Gatekeeper — no budget, but can veto the deal.',
    why: "Don't get burned by an immature vendor — show me proof, security, and evals.",
    grounding: 'Public Product Hunt reviewer who wanted architecture, security docs, and eval metrics before trusting it as enterprise-ready.',
    preferredAction: 'book_demo',
    conversionValue: { book_demo: 10000, get_diagnostic: 2000, get_pricing: 1500, none: 0 },
  },
};

// ---- GROUND_TRUTH: the hidden preference matrix ---------------------------
// How much each persona likes each allele. Feeds utility in simulate.ts.
// Positive = attracts, negative = repels, absent = neutral (0). Only genes
// that carry real signal are listed. DO NOT import this except in simulate.ts.

interface PreferenceWeights {
  headline: Partial<Record<Headline, number>>;
  primaryCta: Partial<Record<PrimaryCta, number>>;
  socialProof: Partial<Record<SocialProof, number>>;
  tone: Partial<Record<Tone, number>>;
  length: Partial<Record<Length, number>>;
}

export const GROUND_TRUTH: Record<PersonaId, PreferenceWeights> = {
  lnd_leader: {
    headline: { measurable_adoption: 1.2, team_capability: 1.0, value_realization: 0.9, admin_control: 0.7, research_credibility: 0.4, governance_ready: 0.3 },
    primaryCta: { book_demo: 1.0, get_diagnostic: 0.8, get_pricing: 0.2 },
    socialProof: { case_studies: 1.0, company_logos: 0.7, research_stats: 0.6, compliance_security: 0.2 },
    tone: { consultative: 0.6, academic: 0.4, punchy: 0.0 },
    length: { medium: 0.4, long: 0.3, short: -0.2 },
  },
  ops_leader: {
    // The Karp "value gap" why is the ROI buyer's exact language — rank it top.
    headline: { value_realization: 1.4, measurable_adoption: 1.3, admin_control: 0.9, team_capability: 0.7, governance_ready: 0.2, research_credibility: 0.1 },
    primaryCta: { book_demo: 0.9, get_pricing: 0.7, get_diagnostic: 0.7 },
    socialProof: { case_studies: 1.0, company_logos: 0.6, compliance_security: 0.3, research_stats: 0.2 },
    tone: { punchy: 0.6, consultative: 0.4, academic: -0.5 }, // wants outcomes, not a lecture
    length: { medium: 0.4, short: 0.3, long: -0.3 },
  },
  compliance_buyer: {
    headline: { governance_ready: 1.4, measurable_adoption: 0.9, admin_control: 0.6, research_credibility: 0.6, value_realization: 0.6, team_capability: 0.2 },
    primaryCta: { book_demo: 1.0, get_diagnostic: 0.5, get_pricing: 0.4 },
    socialProof: { compliance_security: 1.3, research_stats: 0.8, company_logos: 0.5, case_studies: 0.4 },
    tone: { academic: 0.6, consultative: 0.3, punchy: -0.3 },
    length: { long: 0.5, medium: 0.2, short: -0.5 },
  },
  security_skeptic: {
    // Karp's "own your data/alpha, don't get burned" framing resonates; but the
    // punchy waste-framing reads a touch hype, so a modest positive weight.
    headline: { research_credibility: 1.4, governance_ready: 0.9, value_realization: 0.5, measurable_adoption: 0.4, admin_control: 0.2, team_capability: -0.2 },
    primaryCta: { book_demo: 0.9, get_pricing: 0.4, get_diagnostic: 0.2 },
    socialProof: { research_stats: 1.2, compliance_security: 1.1, case_studies: 0.5, company_logos: 0.4 },
    tone: { academic: 1.0, consultative: -0.2, punchy: -0.9 }, // hype repels
    length: { long: 0.8, medium: -0.1, short: -0.9 },
  },
};

// ---- Audience mixes = deal shape ------------------------------------------
// The mix is WHO on the committee dominates the traffic/attention for a deal.
// Because money lives on the persona, the mix decides which "why" wins. Flip
// the mix and a different concept rises, and the interpreter
// explains why — proof the system reasons, not memorizes. Each mix sums to 1.0.

export const AUDIENCE_MIXES: Record<string, Record<PersonaId, number>> = {
  champion_led: {
    lnd_leader: 0.45,
    ops_leader: 0.25,
    compliance_buyer: 0.15,
    security_skeptic: 0.15,
  },
  roi_driven: {
    ops_leader: 0.45,
    lnd_leader: 0.30,
    compliance_buyer: 0.15,
    security_skeptic: 0.10,
  },
  risk_driven: {
    compliance_buyer: 0.35,
    security_skeptic: 0.35,
    lnd_leader: 0.20,
    ops_leader: 0.10,
  },
  balanced: {
    lnd_leader: 0.30,
    ops_leader: 0.30,
    compliance_buyer: 0.20,
    security_skeptic: 0.20,
  },
};

// Human-friendly labels for the deal-shape mixes (used across the UI + narrative).
export const MIX_LABEL: Record<string, string> = {
  champion_led: 'champion-led',
  roi_driven: 'ROI-driven',
  risk_driven: 'risk-driven',
  balanced: 'balanced',
};

// ---- Helpers ---------------------------------------------------------------

/** Sanity check that a mix is a valid probability distribution. */
export function isValidMix(mix: Record<PersonaId, number>): boolean {
  const total = Object.values(mix).reduce((a, b) => a + b, 0);
  return Math.abs(total - 1) < 1e-6;
}

/** Sample a persona id from a mix using a [0,1) draw from the seeded RNG. */
export function samplePersona(mix: Record<PersonaId, number>, u: number): PersonaId {
  let acc = 0;
  for (const [id, p] of Object.entries(mix) as [PersonaId, number][]) {
    acc += p;
    if (u < acc) return id;
  }
  return Object.keys(mix)[Object.keys(mix).length - 1] as PersonaId;
}
