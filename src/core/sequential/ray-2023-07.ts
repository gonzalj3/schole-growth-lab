// Ray Delgado @ July 2023 — FOMO peak.
import type { TimedPersona } from './types';

export const ray_2023_07: TimedPersona = {
  id: 'ray_2023_07',
  person: 'Ray Delgado',
  role: 'VP of IT & Technology Adoption, MercadoFresh (national grocery chain, ~900 stores, ~85k employees)',
  date: '2023-07',
  era: '2023_fomo',
  macroContext:
    'ChatGPT hit 100M users by Jan 2023; enterprises are in "huge FOMO"; 2023 is "the year of experimentation." Ray\'s board is asking "what is our AI strategy?" (Sybill, 2023; Marketing AI Institute, Dec 2024).',
  sentiment: {
    understandingSelf: 2,
    understandingOrg: 1,
    comfortSelf: 2,
    comfortOrg: 1,
    perceivedNeedPersonal: 2,
    perceivedNeedBusiness: 3,
    roiBelief: 5, // pure hype
    vendorSentiment: 2, // hopeful
    stackValueBelief: 'model_layer',
  },
  why: "Don't fall behind — the board wants an AI story.",
  willingnessToBuy: 2,
  preferredAction: 'get_diagnostic',
  conversionValue: { book_demo: 300, get_diagnostic: 125, get_pricing: 40, none: 0 },
  weights: {
    headline: { team_capability: 0.9, admin_control: 0.2, research_credibility: 0.2, measurable_adoption: 0.1, governance_ready: 0.1, value_realization: -0.5 },
    primaryCta: { get_diagnostic: 0.5, book_demo: 0.3, get_pricing: 0.0 },
    socialProof: { company_logos: 0.7, case_studies: 0.4, research_stats: 0.2, compliance_security: -0.1 },
    tone: { consultative: 0.4, punchy: 0.3, academic: 0.0 },
    length: { short: 0.4, medium: 0.3, long: -0.2 },
  },
  winningFrame:
    'Capability + urgency (team_capability). Sell ORG capability, not personal study — Ray will not take courses himself (adult-learner bar).',
};

export default ray_2023_07;
