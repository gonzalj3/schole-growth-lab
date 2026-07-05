// Ray Delgado @ January 2026 — ROI-engineered-through-adoption + governance.
import type { TimedPersona } from './types';

export const ray_2026_01: TimedPersona = {
  id: 'ray_2026_01',
  person: 'Ray Delgado',
  role: 'VP of IT & Technology Adoption, MercadoFresh',
  date: '2026-01',
  era: '2026_resentment',
  macroContext:
    'Post-disillusionment discipline sets in; ROI tracking becomes standard ("accountability is now the lens" — Wharton, Oct 2025) and EU AI Act obligations add governance pressure. Ray wants ROI engineered through adoption + governance.',
  sentiment: {
    understandingSelf: 5,
    understandingOrg: 4,
    comfortSelf: 5,
    comfortOrg: 4,
    perceivedNeedPersonal: 4,
    perceivedNeedBusiness: 5,
    roiBelief: 3, // pragmatic: ROI is real but must be engineered
    vendorSentiment: 4, // guarded
    stackValueBelief: 'outcome_layer',
  },
  why: 'ROI via adoption + governance, or it does not ship.',
  willingnessToBuy: 4,
  preferredAction: 'book_demo',
  conversionValue: { book_demo: 650, get_diagnostic: 200, get_pricing: 130, none: 0 },
  weights: {
    headline: { measurable_adoption: 1.1, admin_control: 0.9, governance_ready: 0.9, value_realization: 0.8, research_credibility: 0.6, team_capability: -0.2 },
    primaryCta: { book_demo: 1.0, get_pricing: 0.6, get_diagnostic: 0.6 },
    socialProof: { case_studies: 1.0, compliance_security: 0.9, research_stats: 0.7, company_logos: 0.4 },
    tone: { consultative: 0.5, academic: 0.4, punchy: 0.4 },
    length: { medium: 0.4, long: 0.4, short: -0.2 },
  },
  winningFrame: 'governance_ready + admin_control + measurable_adoption.',
};

export default ray_2026_01;
