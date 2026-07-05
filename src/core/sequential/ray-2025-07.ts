// Ray Delgado @ July 2025 — the MIT "learning gap" reckoning (Scholé's wedge).
import type { TimedPersona } from './types';

export const ray_2025_07: TimedPersona = {
  id: 'ray_2025_07',
  person: 'Ray Delgado',
  role: 'VP of IT & Technology Adoption, MercadoFresh',
  date: '2025-07',
  era: '2025_reckoning',
  macroContext:
    'MIT\'s "GenAI Divide: State of AI in Business 2025" reports ~95% of enterprise GenAI pilots deliver no measurable P&L impact, and names the root cause the "learning gap" — the human/organizational inability to integrate AI, not model quality. Ray\'s first serious budget-review cycle arrives (Fortune, Aug 2025; MIT NANDA, Jul 2025).',
  sentiment: {
    understandingSelf: 4,
    understandingOrg: 3,
    comfortSelf: 4,
    comfortOrg: 3,
    perceivedNeedPersonal: 4,
    perceivedNeedBusiness: 5,
    roiBelief: 2, // disillusioned with pilots
    vendorSentiment: 3, // disillusioned, not yet resentful
    stackValueBelief: 'outcome_layer', // the gap is adoption, not the model
  },
  why: 'The gap is US, not the model. Fix adoption.',
  willingnessToBuy: 5, // the most-cited report just diagnosed Scholé's wedge
  preferredAction: 'get_diagnostic',
  conversionValue: { book_demo: 600, get_diagnostic: 210, get_pricing: 125, none: 0 },
  weights: {
    headline: { measurable_adoption: 1.2, admin_control: 0.8, value_realization: 0.6, research_credibility: 0.5, governance_ready: 0.5, team_capability: -0.1 },
    primaryCta: { book_demo: 0.9, get_diagnostic: 0.8, get_pricing: 0.5 },
    socialProof: { case_studies: 1.1, research_stats: 0.7, compliance_security: 0.4, company_logos: 0.4 },
    tone: { punchy: 0.5, consultative: 0.5, academic: 0.3 },
    length: { medium: 0.5, long: 0.2, short: 0.1 },
  },
  winningFrame:
    'measurable_adoption + the learning-gap reframe ("the reason your AI is not paying off is not the model — it is adoption"). Caution: wary of anything that sounds like soft "training."',
};

export default ray_2025_07;
