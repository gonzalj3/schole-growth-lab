// LandingPage — the renderer that turns a Genome into a real page.
// This is the "inner app": everything visible is derived from the genome, so
// changing a gene changes the page. Derivation happens here (thin), the section
// components stay dumb. See CLAUDE.md §4.

import type { Genome, Section as SectionKind } from '@/core/genome';
import { HEADLINE_COPY, CTA_COPY, SECONDARY_CTA_COPY } from '@/core/genome';
import { bodySections, hasSecondaryCta } from '@/core/render';
import { TONE_COPY } from '@/core/tone';

import { TopBar } from './TopBar';
import { Hero } from './Hero';
import { Benefits } from './Benefits';
import { HowItWorks } from './HowItWorks';
import { SocialProof } from './SocialProof';
import { Credibility } from './Credibility';
import { Pricing } from './Pricing';
import { FinalCTA } from './FinalCTA';

export function LandingPage({
  genome,
  highlight = [],
}: {
  genome: Genome;
  // Gene names to highlight (pulsing ring) — used on the before/after view so a
  // reviewer can see exactly where the bred page differs.
  highlight?: string[];
}) {
  const h = HEADLINE_COPY[genome.headline];
  const primaryCtaLabel = CTA_COPY[genome.primaryCta];
  const secondaryCtaLabel = hasSecondaryCta(genome) ? SECONDARY_CTA_COPY : undefined;
  const tone = TONE_COPY[genome.tone];
  const sections = bodySections(genome);
  const changed = new Set(highlight);
  const glowCta = changed.has('ctaStyle') || changed.has('primaryCta');

  // Alternate tinted backgrounds down the page for rhythm — computed by the
  // position each section actually lands in, not its identity.
  const renderSection = (kind: SectionKind, tint: boolean) => {
    switch (kind) {
      case 'benefits':
        return <Benefits key={kind} eyebrow={tone.benefitsIntro} tint={tint} />;
      case 'howItWorks':
        return <HowItWorks key={kind} eyebrow={tone.howItWorksIntro} tint={tint} />;
      case 'proof':
        return (
          <SocialProof
            key={kind}
            kind={genome.socialProof}
            eyebrow={tone.proofIntro}
            tint={tint}
            glow={changed.has('socialProof')}
          />
        );
      case 'credibility':
        return <Credibility key={kind} tint={tint} />;
      case 'pricing':
        return <Pricing key={kind} primaryCtaLabel={primaryCtaLabel} tint={tint} />;
    }
  };

  return (
    <div className="bg-paper">
      <TopBar primaryCtaLabel={primaryCtaLabel} />
      <Hero
        eyebrow={h.eyebrow}
        headline={h.headline}
        subhead={h.subhead}
        layout={genome.heroLayout}
        primaryCtaLabel={primaryCtaLabel}
        secondaryCtaLabel={secondaryCtaLabel}
        glowHeadline={changed.has('headline')}
        glowCta={glowCta}
      />
      {sections.map((kind, i) => renderSection(kind, i % 2 === 1))}
      <FinalCTA
        headline={tone.finalHeadline}
        sub={tone.finalSub}
        primaryCtaLabel={primaryCtaLabel}
        secondaryCtaLabel={secondaryCtaLabel}
        glow={glowCta || changed.has('tone')}
      />
    </div>
  );
}
