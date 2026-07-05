// The three team benefit cards. Content is fixed (BENEFIT_CARDS); the eyebrow
// is tone-derived so the voice matches the rest of the page.

import { Section } from './Section';
import { BENEFIT_CARDS } from '@/core/genome';

export function Benefits({
  eyebrow,
  tint,
  glowEyebrow = false,
}: {
  eyebrow: string;
  tint?: boolean;
  glowEyebrow?: boolean;
}) {
  return (
    <Section
      eyebrow={eyebrow}
      heading="Built for how your team actually works"
      tint={tint}
      glowEyebrow={glowEyebrow}
    >
      <div className="grid gap-5 md:grid-cols-3">
        {BENEFIT_CARDS.map((c) => (
          <div
            key={c.title}
            className="rounded-2xl border border-line bg-surface p-6"
          >
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-brand-soft text-brand">
              <span className="text-lg">◆</span>
            </div>
            <h3 className="font-display text-lg font-semibold text-ink">
              {c.title}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-muted">{c.body}</p>
          </div>
        ))}
      </div>
    </Section>
  );
}
