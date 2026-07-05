// The three-step team deployment flow (onboard → assign → track). Content is
// fixed (HOW_IT_WORKS_STEPS); eyebrow is tone-derived.

import { Section } from './Section';
import { HOW_IT_WORKS_STEPS } from '@/core/genome';

export function HowItWorks({
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
      heading="From access to adoption in three steps"
      tint={tint}
      glowEyebrow={glowEyebrow}
    >
      <div className="grid gap-6 md:grid-cols-3">
        {HOW_IT_WORKS_STEPS.map((s, i) => (
          <div key={s.title} className="relative">
            <div className="mb-4 flex items-center gap-3">
              <span className="tnum flex h-9 w-9 items-center justify-center rounded-full bg-ink text-sm font-semibold text-white">
                {i + 1}
              </span>
              {i < HOW_IT_WORKS_STEPS.length - 1 && (
                <span className="hidden h-px flex-1 bg-line md:block" />
              )}
            </div>
            <h3 className="font-display text-lg font-semibold text-ink">
              {s.title}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-muted">{s.body}</p>
          </div>
        ))}
      </div>
    </Section>
  );
}
