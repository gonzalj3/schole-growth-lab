// Social proof, switchable by the `socialProof` gene. Same section slot, four
// very different presentations — this is one of the biggest visible differences
// between variants, and one the simulator has real opinions about.

import { Section } from './Section';
import type { SocialProof as SocialProofKind } from '@/core/genome';
import { SOCIAL_PROOF_COPY } from '@/core/genome';

export function SocialProof({
  kind,
  eyebrow,
  tint,
}: {
  kind: SocialProofKind;
  eyebrow: string;
  tint?: boolean;
}) {
  const { label, items } = SOCIAL_PROOF_COPY[kind];

  return (
    <Section eyebrow={eyebrow} heading={label} tint={tint}>
      {kind === 'company_logos' && (
        <div className="flex flex-wrap items-center gap-3">
          {items.map((it) => (
            <span
              key={it}
              className="rounded-xl border border-line bg-surface px-5 py-3 text-sm font-medium text-ink"
            >
              {it}
            </span>
          ))}
        </div>
      )}

      {kind === 'case_studies' && (
        <div className="grid gap-5 md:grid-cols-2">
          {items.map((it) => (
            <blockquote
              key={it}
              className="rounded-2xl border border-line bg-surface p-6"
            >
              <div className="mb-3 text-2xl leading-none text-accent">“</div>
              <p className="text-sm leading-relaxed text-body">{it}</p>
            </blockquote>
          ))}
        </div>
      )}

      {kind === 'research_stats' && (
        <div className="grid gap-4 sm:grid-cols-2">
          {items.map((it) => (
            <div
              key={it}
              className="flex items-start gap-3 rounded-2xl border border-line bg-surface p-5"
            >
              <span className="mt-0.5 text-accent">◆</span>
              <span className="text-sm text-body">{it}</span>
            </div>
          ))}
        </div>
      )}

      {kind === 'compliance_security' && (
        <ul className="grid gap-3 sm:grid-cols-2">
          {items.map((it) => (
            <li
              key={it}
              className="flex items-start gap-3 rounded-2xl border border-line bg-surface p-5"
            >
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-positive/10 text-xs text-positive">
                ✓
              </span>
              <span className="text-sm text-body">{it}</span>
            </li>
          ))}
        </ul>
      )}
    </Section>
  );
}
