// The Teams plan card. Grounded in the real plan shape referenced in CLAUDE.md
// ($5,800/yr, 8 seats, +$725/seat). The primary CTA label follows the genome.

import { Section } from './Section';
import { CtaButton } from './Button';

const INCLUDED = [
  '8 team seats included (+$725 per additional seat)',
  'Role-specific learning paths for every function',
  'Admin dashboard with adoption & mastery tracking',
  'Grounding in your own knowledge base',
  'Priority onboarding & EU AI Act Article 4 support',
];

export function Pricing({
  primaryCtaLabel,
  tint,
}: {
  primaryCtaLabel: string;
  tint?: boolean;
}) {
  return (
    <Section eyebrow="Pricing" heading="One plan, built for teams" tint={tint}>
      <div className="grid items-center gap-8 lg:grid-cols-[1fr_1.2fr]">
        <div className="rounded-2xl border-2 border-brand bg-surface p-8">
          <div className="text-sm font-medium text-brand">Scholé Teams</div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-display text-5xl font-semibold text-ink">
              $5,800
            </span>
            <span className="text-muted">/ year</span>
          </div>
          <div className="mt-1 text-sm text-muted">
            8 seats included · +$725 / additional seat
          </div>
          <div className="mt-6">
            <CtaButton label={primaryCtaLabel} size="lg" />
          </div>
        </div>
        <ul className="space-y-3">
          {INCLUDED.map((it) => (
            <li key={it} className="flex items-start gap-3">
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-soft text-xs text-brand">
                ✓
              </span>
              <span className="text-sm text-body">{it}</span>
            </li>
          ))}
        </ul>
      </div>
    </Section>
  );
}
