// The credibility band — Scholé's research origins. Fixed content; this is the
// "trust the vendor" story that the science / compliance concepts lead with.

import { Section } from './Section';

const STATS = [
  { value: '10+ yrs', label: 'research at the AI × learning-science frontier' },
  { value: '30+', label: 'peer-reviewed papers' },
  { value: '#1', label: 'Forbes: way to learn AI agents (2026)' },
  { value: '20+', label: 'countries with active learners' },
];

export function Credibility({ tint }: { tint?: boolean }) {
  return (
    <Section
      eyebrow="Why trust us"
      heading="Spun out of the ML-for-Education labs at UC Berkeley & EPFL"
      tint={tint}
    >
      <p className="mb-8 max-w-2xl text-muted">
        A decade of research on mastery learning, knowledge tracing, and
        interpretable AI — now co-teaching Harvard&rsquo;s Agentic AI Intensives
        and backed by ACE Ventures, The House Fund &amp; Fund F.
      </p>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {STATS.map((s) => (
          <div
            key={s.label}
            className="rounded-2xl border border-line bg-surface p-5"
          >
            <div className="font-display text-3xl font-semibold text-ink">
              {s.value}
            </div>
            <div className="mt-1 text-sm text-muted">{s.label}</div>
          </div>
        ))}
      </div>
    </Section>
  );
}
