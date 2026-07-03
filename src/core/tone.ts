// tone.ts
// ---------------------------------------------------------------------------
// PURE. The `tone` gene changes the *voice* of the copy across sections without
// changing the facts. Kept as data (not scattered ternaries in components) so a
// reader can see, in one place, exactly how each tone reframes the page — and so
// the interpreter can quote it. Three tones (CLAUDE.md §5):
//   academic     — measured, rigorous, evidence-first (for skeptics / risk).
//   punchy       — short, outcome- and urgency-driven (for ROI buyers).
//   consultative — warm advisory partner, "you / your team" (for champions).
// ---------------------------------------------------------------------------

import type { Tone } from './genome';

export interface ToneCopy {
  /** A short eyebrow shown above section headings, in this voice. */
  benefitsIntro: string;
  howItWorksIntro: string;
  proofIntro: string;
  /** The closing CTA block. */
  finalHeadline: string;
  finalSub: string;
}

export const TONE_COPY: Record<Tone, ToneCopy> = {
  academic: {
    benefitsIntro: 'What the platform is designed to produce',
    howItWorksIntro: 'The method, step by step',
    proofIntro: 'The evidence base',
    finalHeadline: 'Evaluate Scholé against your own bar',
    finalSub:
      'We will walk your team through the methodology, the outcome data, and the security posture. No hand-waving.',
  },
  punchy: {
    benefitsIntro: 'What your team gets',
    howItWorksIntro: 'How it works',
    proofIntro: 'Proof it works',
    finalHeadline: 'Turn AI access into AI results',
    finalSub:
      'Stop paying for tools nobody uses well. See measurable adoption in weeks, not quarters.',
  },
  consultative: {
    benefitsIntro: 'What this means for your team',
    howItWorksIntro: "How we'll roll this out together",
    proofIntro: 'Teams like yours, already ahead',
    finalHeadline: "Let's map the right path for your team",
    finalSub:
      "Tell us your roles, tools, and goals — we'll show you exactly how Scholé fits into how your people already work.",
  },
};
