// genome.ts
// ---------------------------------------------------------------------------
// AUDIENCE: the enterprise / team buyer — the person deciding whether to pay
// for Scholé's Teams plan ($5,800/yr, 8 seats, +$725/seat). NOT the individual
// self-serve learner. Grounded in schole.ai/ (the Teams page), not /learners.
// This is the audience the Founding Growth Engineer role is actually about:
// "enterprise sales", "turn conversations into contracts", "admin's first
// perceptions", "leads and contracts".
//
// The landing page is NOT hardcoded. It is a `Genome`: a flat set of discrete
// "genes", each with a small set of "alleles". Discreteness is deliberate — it
// is what makes per-gene attribution honest and interpretable (see
// attribute.ts / CLAUDE.md §9).
//
// Copy is grounded in Scholé's real Teams positioning. Testimonials are marked
// representative — swap in exact on-site quotes.
// ---------------------------------------------------------------------------

// ---- Genes (each is a closed set of alleles) ------------------------------

// Each headline allele carries an explicit strategic "why" — the reason a
// decision-maker buying for a TEAM would care. Phase-1 discovery competes whys.
export type Headline =
  | 'team_capability' //     "make your whole team capable"       — capability
  | 'measurable_adoption' // "from awareness to measured ROI"     — proof of impact
  | 'governance_ready' //    "AI-ready and compliant"             — risk reduction
  | 'admin_control' //       "assign, track, prove from one place"— visibility/control
  | 'research_credibility' //"a decade of science, Berkeley/EPFL" — vendor trust
  | 'value_realization'; //  "you're paying for AI, getting no value" — waste/ROI
// `value_realization` is grounded in a live market signal: Palantir CEO Alex
// Karp (CNBC, Jul 2026) — enterprises are "paying for tokens that create no
// value" and executives fear losing control of their data/"alpha". Reframed
// honestly for Scholé: the AI you already bought is wasted on a team that can't
// use it; Scholé converts that spend into results, grounded in YOUR knowledge.

export type PrimaryCta =
  | 'book_demo' //      the real "contract" path
  | 'get_pricing' //    "see team pricing"
  | 'get_diagnostic'; //"assess your team's AI-readiness" (Martin's wedge, team version)

export type CtaStyle = 'single' | 'dual'; // one button vs. (book demo + see pricing)

export type SocialProof =
  | 'case_studies' //       Decathlon Switzerland, Harvard
  | 'company_logos' //      Decathlon, Berkeley, Harvard, EPFL, "100+ orgs"
  | 'research_stats' //     30+ papers, 20+ countries, Forbes #1, backers
  | 'compliance_security'; //EU AI Act Article 4, SOC2/ISO audit

export type Tone = 'academic' | 'punchy' | 'consultative';
// academic = research-credible/rigorous; punchy = ROI/urgency/outcomes;
// consultative = warm advisory partner.

export type Section = 'benefits' | 'howItWorks' | 'proof' | 'credibility' | 'pricing';

export type Length = 'short' | 'medium' | 'long';

export type HeroLayout = 'split_image' | 'centered_minimal' | 'dashboard_demo';

export interface Genome {
  headline: Headline;
  primaryCta: PrimaryCta;
  ctaStyle: CtaStyle;
  socialProof: SocialProof;
  tone: Tone;
  sectionOrder: Section[];
  length: Length;
  heroLayout: HeroLayout;
}

// ---- Content maps (real Scholé Teams copy, keyed by allele) ---------------

export const HEADLINE_COPY: Record<
  Headline,
  { eyebrow: string; headline: string; subhead: string; why: string }
> = {
  team_capability: {
    eyebrow: 'For teams',
    headline: 'Make your whole team fluent in AI — not just curious about it',
    subhead:
      'Scholé turns AI tools your people already have into skills they actually use, tied to each role, workflow, and task.',
    why: 'I need my team genuinely capable with AI, not just aware of it.',
  },
  measurable_adoption: {
    eyebrow: 'Awareness → adoption',
    headline: 'From AI awareness to measurable adoption across your org',
    subhead:
      'Move past one-off workshops. Scholé embeds learning in the flow of work and shows you the adoption you can report to leadership.',
    why: 'I have to prove real, measured results to leadership.',
  },
  governance_ready: {
    eyebrow: 'Compliance built in',
    headline: 'Get your team AI-ready — and compliant',
    subhead:
      'Scenario-based AI training that helps you meet EU AI Act Article 4 obligations while your people actually build skills.',
    why: 'I need to reduce regulatory and adoption risk for the company.',
  },
  admin_control: {
    eyebrow: 'One dashboard',
    headline: 'Assign, track, and prove AI upskilling from one place',
    subhead:
      'An admin dashboard that maps your team\u2019s progress, grounds the AI coach in your own knowledge base, and shows who\u2019s ready.',
    why: 'I need visibility and control over how my team is progressing.',
  },
  research_credibility: {
    eyebrow: 'Built on a decade of research',
    headline: 'Enterprise AI upskilling, grounded in real learning science',
    subhead:
      'Spun out of the ML-for-Education labs at UC Berkeley and EPFL. 30+ peer-reviewed papers, now a platform trusted by 100+ organizations.',
    why: 'I need to trust this vendor is real before I invest.',
  },
  value_realization: {
    eyebrow: 'The AI value gap',
    headline: "You're already paying for AI. Your team isn't getting the value.",
    subhead:
      'Most of that spend is wasted the moment it reaches people who can’t use it well. Scholé turns the AI tools you already bought into measurable results — grounded in your own knowledge, under your control.',
    why: "I'm paying for AI and getting no return. I need the value, not more tokens.",
  },
};

export const CTA_COPY: Record<PrimaryCta, string> = {
  book_demo: 'Book a demo',
  get_pricing: 'See team pricing',
  get_diagnostic: "Get your team's free AI-Readiness assessment",
};

// Secondary CTA shown only when ctaStyle === 'dual'.
export const SECONDARY_CTA_COPY = 'See team pricing';

export const SOCIAL_PROOF_COPY: Record<
  SocialProof,
  { label: string; items: string[] }
> = {
  case_studies: {
    label: 'Results from teams like yours',
    // Representative — replace with exact on-site case studies.
    items: [
      'Decathlon Switzerland — reshaped their learning strategy and improved perceptions of AI across teams',
      'Harvard Data Science Initiative — co-taught AI intensives, “simply no comparison”',
    ],
  },
  company_logos: {
    label: 'Trusted by teams at',
    items: ['Decathlon', 'UC Berkeley', 'Harvard', 'EPFL', 'and 100+ organizations'],
  },
  research_stats: {
    label: 'The evidence',
    items: [
      '30+ peer-reviewed research papers',
      'Learners in 20+ countries',
      'Recognized by Berkeley, EPFL, Harvard & Forbes (#1 way to learn AI agents, 2026)',
      'Backed by ACE Ventures, The House Fund & Fund F',
    ],
  },
  compliance_security: {
    label: 'Enterprise-ready',
    items: [
      'Supports EU AI Act Article 4 obligations',
      'SOC 2 & ISO audit in progress',
      'Admin controls, SSO, and a 100+ page security & architecture pack on request',
    ],
  },
};

// How-it-works: the team deployment flow (deploy → assign → track).
export const HOW_IT_WORKS_STEPS = [
  {
    title: 'Onboard your team in context',
    body: 'Scholé learns each person\u2019s role, tools, and tasks — and can ground lessons in your own company knowledge base.',
  },
  {
    title: 'Assign role-specific learning',
    body: 'A team of pedagogical agents builds each learner a path from a knowledge graph; you assign scenario-based training by function.',
  },
  {
    title: 'Track adoption and prove impact',
    body: 'An admin dashboard traces skill mastery across the team so you can report real adoption to leadership.',
  },
];

// Team-oriented benefit cards.
export const BENEFIT_CARDS = [
  { title: 'Whole-team fluency', body: 'Every role learns exactly how to use AI in their actual work — not generic theory.' },
  { title: 'Adoption you can measure', body: 'See skill mastery and usage across the team, mapped and reportable.' },
  { title: 'Deploy without the overhead', body: 'Priority onboarding, admin controls, and compliance support out of the box.' },
];

// ---- Seed variants: Phase-1 "Why Discovery" (enterprise) ------------------
// Five boldly different concepts, one strategic `why` each — all aimed at the
// team buyer. This is a MESSAGE test, not a button-color test. Phase 2
// (generate.ts) refines the winner. V1 is the control: closest to schole.ai/.

export interface Variant {
  id: string;
  name: string;
  why: string; // the buying rationale this whole concept is built around
  genome: Genome;
}

export const SEED_VARIANTS: Variant[] = [
  {
    id: 'v1_whole_team',
    name: 'Whole-Team Fluency (control)',
    why: 'Capability — “make my whole team genuinely capable with AI.”',
    genome: {
      headline: 'team_capability',
      primaryCta: 'book_demo',
      ctaStyle: 'dual',
      socialProof: 'company_logos',
      tone: 'consultative',
      sectionOrder: ['benefits', 'howItWorks', 'proof', 'credibility', 'pricing'],
      length: 'long',
      heroLayout: 'split_image',
    },
  },
  {
    id: 'v2_prove_roi',
    name: 'Prove the ROI',
    why: 'Impact — “I have to show leadership measured results.”',
    genome: {
      headline: 'measurable_adoption',
      primaryCta: 'book_demo',
      ctaStyle: 'single',
      socialProof: 'case_studies',
      tone: 'punchy',
      sectionOrder: ['benefits', 'proof', 'howItWorks', 'pricing'],
      length: 'medium',
      heroLayout: 'dashboard_demo',
    },
  },
  {
    id: 'v3_backed_by_science',
    name: 'Backed by Science',
    why: 'Trust — “prove this vendor is real before I buy.”',
    genome: {
      headline: 'research_credibility',
      primaryCta: 'book_demo',
      ctaStyle: 'dual',
      socialProof: 'research_stats',
      tone: 'academic',
      sectionOrder: ['credibility', 'proof', 'benefits', 'howItWorks', 'pricing'],
      length: 'long',
      heroLayout: 'split_image',
    },
  },
  {
    id: 'v4_compliance_ready',
    name: 'Compliance-Ready',
    why: 'Risk — “get us AI-ready without the regulatory exposure.”',
    genome: {
      headline: 'governance_ready',
      primaryCta: 'book_demo',
      ctaStyle: 'single',
      socialProof: 'compliance_security',
      tone: 'academic',
      sectionOrder: ['credibility', 'benefits', 'howItWorks', 'pricing'],
      length: 'medium',
      heroLayout: 'centered_minimal',
    },
  },
  {
    id: 'v5_assess_your_team',
    name: "Assess Your Team's Gaps",
    why: 'Control — “show me where my team actually stands.” (diagnostic wedge)',
    genome: {
      headline: 'admin_control',
      primaryCta: 'get_diagnostic',
      ctaStyle: 'single',
      socialProof: 'case_studies',
      tone: 'consultative',
      sectionOrder: ['benefits', 'howItWorks', 'proof', 'pricing'],
      length: 'medium',
      heroLayout: 'dashboard_demo',
    },
  },
  {
    id: 'v6_value_gap',
    name: 'Close the AI Value Gap',
    why: 'Value — “I’m paying for AI and getting no return.” (the Karp signal)',
    // Grounded in Alex Karp's Jul-2026 CNBC critique that enterprises are
    // "paying for tokens that create no value" and losing control of their data.
    // Leads with proof to rebut "no value" head-on; punchy, ROI-forward.
    genome: {
      headline: 'value_realization',
      primaryCta: 'book_demo',
      ctaStyle: 'dual',
      socialProof: 'research_stats',
      tone: 'punchy',
      sectionOrder: ['proof', 'benefits', 'howItWorks', 'credibility', 'pricing'],
      length: 'long', // show pricing: "here's the cost vs. the value you're wasting"
      heroLayout: 'dashboard_demo',
    },
  },
];

// ---- Allele catalog (runtime) ---------------------------------------------
// The full option set for each gene, as data. Used to build randomized genome
// populations for attribution (Phase 3) — where each allele must appear across
// many genome contexts so its marginal effect can be de-confounded.

export const ALLELES = {
  headline: [
    'team_capability',
    'measurable_adoption',
    'governance_ready',
    'admin_control',
    'research_credibility',
    'value_realization',
  ] as Headline[],
  primaryCta: ['book_demo', 'get_pricing', 'get_diagnostic'] as PrimaryCta[],
  ctaStyle: ['single', 'dual'] as CtaStyle[],
  socialProof: [
    'case_studies',
    'company_logos',
    'research_stats',
    'compliance_security',
  ] as SocialProof[],
  tone: ['academic', 'punchy', 'consultative'] as Tone[],
  length: ['short', 'medium', 'long'] as Length[],
  heroLayout: ['split_image', 'centered_minimal', 'dashboard_demo'] as HeroLayout[],
} as const;

// The genes we attribute reward to. `sectionOrder` is excluded (it's a
// permutation, not a flat allele) — `length` already captures page structure.
// `heroLayout` carries no ground-truth signal on purpose: it's the null control
// that the attribution + promotion gate must correctly decline to promote.
export const ATTRIBUTED_GENES = [
  'headline',
  'primaryCta',
  'ctaStyle',
  'socialProof',
  'tone',
  'length',
  'heroLayout',
] as const;

export type AttributedGene = (typeof ATTRIBUTED_GENES)[number];

// The canonical section order used for randomized attribution genomes (we don't
// attribute section order, so hold it fixed).
export const DEFAULT_SECTION_ORDER: Section[] = [
  'benefits',
  'howItWorks',
  'proof',
  'credibility',
  'pricing',
];

// ---- Small helpers (kept trivial on purpose) ------------------------------

export const ALL_GENES = [
  'headline',
  'primaryCta',
  'ctaStyle',
  'socialProof',
  'tone',
  'sectionOrder',
  'length',
  'heroLayout',
] as const;

/** One-line human description of a genome — used in the interpreter UI. */
export function describeGenome(g: Genome): string {
  return [
    HEADLINE_COPY[g.headline].headline,
    `CTA: ${CTA_COPY[g.primaryCta]} (${g.ctaStyle})`,
    `proof: ${g.socialProof}`,
    `tone: ${g.tone}`,
    `length: ${g.length}`,
  ].join(' \u00b7 ');
}

/** The buying rationale behind a genome, via its headline gene. */
export function whyOf(g: Genome): string {
  return HEADLINE_COPY[g.headline].why;
}
