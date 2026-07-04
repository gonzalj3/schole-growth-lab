// Ray Delgado @ January 2025 — cost anxiety, prove-it-before-renewal.
import type { TimedPersona } from './types';

export const ray_2025_01: TimedPersona = {
  id: 'ray_2025_01',
  person: 'Ray Delgado',
  role: 'VP of IT & Technology Adoption, MercadoFresh',
  date: '2025-01',
  era: '2025_reckoning',
  macroContext:
    'Cheaper open-weight models (DeepSeek) crash the "you must pay frontier prices" assumption; agentic hype begins. Ray is cost-anxious and wants proof of value before more spend.',
  sentiment: {
    understandingSelf: 4,
    understandingOrg: 3,
    comfortSelf: 4,
    comfortOrg: 3,
    perceivedNeedPersonal: 3,
    perceivedNeedBusiness: 4,
    roiBelief: 3, // value exists but we're not capturing it
    vendorSentiment: 3, // cost-resentment beginning
    stackValueBelief: 'application_layer',
  },
  why: "Prove it's worth the spend before I renew.",
  willingnessToBuy: 4,
  preferredAction: 'book_demo',
  conversionValue: { book_demo: 10000, get_diagnostic: 3800, get_pricing: 2200, none: 0 },
  weights: {
    headline: { measurable_adoption: 1.0, admin_control: 0.7, value_realization: 0.5, research_credibility: 0.4, governance_ready: 0.4, team_capability: 0.2 },
    primaryCta: { book_demo: 0.8, get_pricing: 0.6, get_diagnostic: 0.6 },
    socialProof: { case_studies: 1.0, research_stats: 0.5, compliance_security: 0.4, company_logos: 0.4 },
    tone: { punchy: 0.6, consultative: 0.4, academic: 0.2 },
    length: { medium: 0.5, short: 0.3, long: -0.1 },
  },
  winningFrame: 'measurable_adoption + admin_control (prove usage, not just access).',
};

export default ray_2025_01;
