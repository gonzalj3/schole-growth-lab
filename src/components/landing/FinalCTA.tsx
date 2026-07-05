// The closing call to action. Headline + subhead are tone-derived (TONE_COPY);
// the buttons follow the genome's primary/secondary CTA.

import { CtaButton } from './Button';

export function FinalCTA({
  headline,
  sub,
  primaryCtaLabel,
  secondaryCtaLabel,
  glow = false,
}: {
  headline: string;
  sub: string;
  primaryCtaLabel: string;
  secondaryCtaLabel?: string;
  glow?: boolean;
}) {
  return (
    <section className="border-t border-line bg-ink">
      <div className={`mx-auto max-w-4xl px-6 py-20 text-center ${glow ? 'hl-glow' : ''}`}>
        <h2 className="font-display text-3xl font-semibold text-white sm:text-4xl">
          {headline}
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-base text-white/70">{sub}</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <CtaButton label={primaryCtaLabel} size="lg" />
          {secondaryCtaLabel && (
            <span className="inline-flex items-center justify-center rounded-lg border border-white/25 px-7 py-3.5 text-base font-medium text-white transition-colors hover:bg-white/10">
              {secondaryCtaLabel}
            </span>
          )}
        </div>
      </div>
    </section>
  );
}
