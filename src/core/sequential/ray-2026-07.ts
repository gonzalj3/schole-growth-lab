// Ray Delgado @ July 2026 — resentment & sovereignty (TODAY, the Karp moment).
import type { TimedPersona } from './types';

export const ray_2026_07: TimedPersona = {
  id: 'ray_2026_07',
  person: 'Ray Delgado',
  role: 'VP of IT & Technology Adoption, MercadoFresh',
  date: '2026-07',
  era: '2026_resentment',
  macroContext:
    'Alex Karp\'s Jul 1 2026 CNBC interview crystallizes the mood: enterprises are "livid," paying for "tokens that create no value," AI pricing as a "wealth tax"; a shift from tokenmaxxing toward ROI and owning "the means of production." Ray understands AI well and his org uses it, but he is resentful of AI vendors generally and control-obsessed (CNBC, Jul 1 2026).',
  sentiment: {
    understandingSelf: 5,
    understandingOrg: 4,
    comfortSelf: 5,
    comfortOrg: 4,
    perceivedNeedPersonal: 4,
    perceivedNeedBusiness: 5,
    roiBelief: 3, // value only where we control + adopt
    vendorSentiment: 5, // resentful of AI vendors
    stackValueBelief: 'outcome_layer', // durable value (and his job) is at the adoption layer
  },
  why: 'Make the AI we already bought finally pay off — and let us own it.',
  willingnessToBuy: 4, // high, but vendor-skeptical: Scholé must not read as "another AI tool"
  preferredAction: 'book_demo',
  conversionValue: { book_demo: 700, get_diagnostic: 225, get_pricing: 140, none: 0 },
  weights: {
    headline: { value_realization: 1.3, measurable_adoption: 1.0, admin_control: 0.9, research_credibility: 0.6, governance_ready: 0.6, team_capability: -0.5 },
    primaryCta: { book_demo: 1.0, get_diagnostic: 0.7, get_pricing: 0.6 },
    socialProof: { case_studies: 1.0, research_stats: 0.7, compliance_security: 0.7, company_logos: 0.3 },
    tone: { punchy: 0.6, consultative: 0.5, academic: 0.3 },
    length: { medium: 0.5, short: 0.2, long: 0.2 },
  },
  winningFrame:
    'value_realization (anti-token) + admin_control + research_credibility, anti-hype. Lead with results, ROI, control; research_credibility (Berkeley/EPFL) counters vendor distrust.',
};

export default ray_2026_07;
