// Ray Delgado @ July 2024 — the "too much spend, too little benefit" turn.
import type { TimedPersona } from './types';

export const ray_2024_07: TimedPersona = {
  id: 'ray_2024_07',
  person: 'Ray Delgado',
  role: 'VP of IT & Technology Adoption, MercadoFresh',
  date: '2024-07',
  era: '2024_first_doubts',
  macroContext:
    'Goldman Sachs publishes "Gen AI: too much spend, too little benefit?" (Jun 25 2024) and Sequoia asks the "$600B question." Ray now has to justify last year\'s spend; the "trough of disillusionment" enters the discourse.',
  sentiment: {
    understandingSelf: 3,
    understandingOrg: 2,
    comfortSelf: 3,
    comfortOrg: 2,
    perceivedNeedPersonal: 3,
    perceivedNeedBusiness: 4,
    roiBelief: 3, // first real dip
    vendorSentiment: 3, // cooling
    stackValueBelief: 'application_layer', // the model is not enough; it's what we do with it
  },
  why: "Where's the value? I have to justify the spend.",
  willingnessToBuy: 4,
  preferredAction: 'book_demo',
  conversionValue: { book_demo: 450, get_diagnostic: 175, get_pricing: 90, none: 0 },
  weights: {
    headline: { measurable_adoption: 0.9, admin_control: 0.5, team_capability: 0.4, research_credibility: 0.4, governance_ready: 0.3, value_realization: 0.2 },
    primaryCta: { book_demo: 0.8, get_diagnostic: 0.6, get_pricing: 0.4 },
    socialProof: { case_studies: 0.9, research_stats: 0.5, company_logos: 0.5, compliance_security: 0.2 },
    tone: { punchy: 0.5, consultative: 0.5, academic: 0.2 },
    length: { medium: 0.5, short: 0.2, long: 0.1 },
  },
  winningFrame:
    'measurable_adoption. "Learning" quietly reframes as "ROI recovery." CTA: see the ROI / book a demo.',
};

export default ray_2024_07;
