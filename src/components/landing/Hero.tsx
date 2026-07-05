// The above-the-fold hero. Driven by three genes:
//   headline  → eyebrow / headline / subhead copy (the "why")
//   heroLayout→ split_image | centered_minimal | dashboard_demo
//   primaryCta + ctaStyle → the ask(s)

import { CtaButton } from './Button';
import { DashboardMock, LearningPathMock } from './HeroVisual';
import type { HeroLayout } from '@/core/genome';

export function Hero({
  eyebrow,
  headline,
  subhead,
  layout,
  primaryCtaLabel,
  secondaryCtaLabel,
  glowHeadline = false,
  glowCta = false,
}: {
  eyebrow: string;
  headline: string;
  subhead: string;
  layout: HeroLayout;
  primaryCtaLabel: string;
  secondaryCtaLabel?: string;
  glowHeadline?: boolean;
  glowCta?: boolean;
}) {
  const ctas = (
    <div
      className={`flex flex-wrap items-center gap-3 ${glowCta ? 'hl-glow w-fit p-2' : ''}`}
    >
      <CtaButton label={primaryCtaLabel} size="lg" />
      {secondaryCtaLabel && (
        <CtaButton label={secondaryCtaLabel} variant="secondary" size="lg" />
      )}
    </div>
  );
  const hClass = `font-display text-4xl font-semibold leading-[1.1] text-ink sm:text-5xl ${
    glowHeadline ? 'hl-glow p-2' : ''
  }`;

  const eyebrowEl = (
    <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-line bg-surface px-3 py-1 text-xs font-medium tracking-wide text-accent">
      <span className="inline-block h-1.5 w-1.5 rounded-full bg-accent" />
      {eyebrow}
    </div>
  );

  if (layout === 'centered_minimal') {
    return (
      <section className="mx-auto max-w-3xl px-6 pt-20 pb-16 text-center">
        {eyebrowEl}
        <h1 className={hClass}>{headline}</h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-muted">{subhead}</p>
        <div className="mt-8 flex justify-center">{ctas}</div>
      </section>
    );
  }

  // split layouts: text left, product mock right.
  const visual = layout === 'dashboard_demo' ? <DashboardMock /> : <LearningPathMock />;
  return (
    <section className="mx-auto grid max-w-6xl items-center gap-12 px-6 pt-16 pb-14 md:grid-cols-2 md:pt-20">
      <div>
        {eyebrowEl}
        <h1 className={hClass}>{headline}</h1>
        <p className="mt-6 max-w-xl text-lg text-muted">{subhead}</p>
        <div className="mt-8">{ctas}</div>
      </div>
      <div className="md:pl-4">{visual}</div>
    </section>
  );
}
