// Ray Delgado @ January 2024 — pilots begin.
import type { TimedPersona } from './types';

export const ray_2024_01: TimedPersona = {
  id: 'ray_2024_01',
  person: 'Ray Delgado',
  role: 'VP of IT & Technology Adoption, MercadoFresh',
  date: '2024-01',
  era: '2024_first_doubts',
  macroContext:
    'Copilot has shipped; 2024 becomes "solving specific business problems." Ray has bought some licenses; the first "nobody is actually using these" murmurs appear (Marketing AI Institute, Dec 2024).',
  sentiment: {
    understandingSelf: 3,
    understandingOrg: 2,
    comfortSelf: 3,
    comfortOrg: 2,
    perceivedNeedPersonal: 2,
    perceivedNeedBusiness: 3,
    roiBelief: 4,
    vendorSentiment: 2,
    stackValueBelief: 'model_layer',
  },
  why: 'Make the pilots solve a real problem.',
  willingnessToBuy: 3,
  preferredAction: 'book_demo',
  conversionValue: { book_demo: 8000, get_diagnostic: 3000, get_pricing: 1200, none: 0 },
  weights: {
    headline: { team_capability: 0.7, measurable_adoption: 0.5, admin_control: 0.4, research_credibility: 0.3, governance_ready: 0.2, value_realization: -0.2 },
    primaryCta: { book_demo: 0.6, get_diagnostic: 0.5, get_pricing: 0.2 },
    socialProof: { case_studies: 0.7, company_logos: 0.6, research_stats: 0.3, compliance_security: 0.1 },
    tone: { consultative: 0.5, punchy: 0.4, academic: 0.1 },
    length: { medium: 0.4, short: 0.3, long: 0.0 },
  },
  winningFrame: 'Role-specific capability tilting toward adoption. book_demo now viable.',
};

export default ray_2024_01;
