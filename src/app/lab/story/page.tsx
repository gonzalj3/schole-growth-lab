'use client';

// Deliverable #6 — "What changed & why." The star screen. It reads the
// interpreter's narrative and tells the whole story on one page: winning why →
// bandit verdict → which genes earned it → the bred page → honest caveats. Every
// claim links to the lab view that proves it. Flip the mix and the story rewrites.

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { LabNav } from '@/components/lab/LabNav';
import { interpret } from '@/core/interpret';
import { AUDIENCE_MIXES } from '@/core/personas';

const MIXES = Object.keys(AUDIENCE_MIXES);
const pretty = (s: string) => s.replace(/_/g, ' ');
const GENE_LABEL: Record<string, string> = {
  headline: 'headline',
  primaryCta: 'CTA',
  ctaStyle: 'CTA style',
  socialProof: 'proof',
  tone: 'tone',
  length: 'length',
  heroLayout: 'hero',
};
const money = (v: number) =>
  `${v < 0 ? '−' : '+'}$${Math.abs(Math.round(v)).toLocaleString()}`;

export default function StoryPage() {
  const [mixKey, setMixKey] = useState('roi_driven');
  const [seed, setSeed] = useState(7);

  const n = useMemo(() => interpret({ mixKey, seed }), [mixKey, seed]);

  return (
    <main className="min-h-screen">
      <LabNav here="/lab/story" />

      <div className="mx-auto max-w-3xl px-6 py-12">
        <div className="mb-3 text-xs font-semibold uppercase tracking-wider text-accent">
          Deliverable 06 · What changed &amp; why
        </div>
        <h1 className="font-display text-3xl font-semibold leading-tight text-ink sm:text-4xl">
          {n.summary}
        </h1>

        {/* Controls */}
        <div className="mt-8 flex flex-wrap items-end gap-4 rounded-2xl border border-line bg-surface p-4">
          <label className="flex flex-col gap-1">
            <span className="text-xs font-medium text-muted">Audience mix</span>
            <select
              value={mixKey}
              onChange={(e) => setMixKey(e.target.value)}
              className="rounded-lg border border-line bg-paper px-3 py-2 text-sm text-ink"
            >
              {MIXES.map((m) => (
                <option key={m} value={m}>{pretty(m)}</option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-xs font-medium text-muted">Seed</span>
            <input
              type="number"
              value={seed}
              onChange={(e) => setSeed(Number(e.target.value) || 0)}
              className="w-24 rounded-lg border border-line bg-paper px-3 py-2 text-sm text-ink tnum"
            />
          </label>
          <p className="ml-auto max-w-[16rem] text-xs text-muted">
            Flip the mix and the whole story rewrites — proof the system reasons
            about the audience, not a fixed winner.
          </p>
        </div>

        {/* Story beats — a narrative timeline */}
        <div className="mt-10">
          {n.beats.map((b, i) => (
            <div key={b.phase} className="relative flex gap-5 pb-10">
              {/* rail */}
              {i < n.beats.length - 1 && (
                <div className="absolute left-[19px] top-11 bottom-0 w-px bg-line" />
              )}
              <div className="tnum z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-ink text-sm font-semibold text-white">
                {b.phase}
              </div>
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-3">
                  <h2 className="font-display text-xl font-semibold text-ink">{b.title}</h2>
                  {b.stat && (
                    <span className="rounded-full bg-accent-soft px-2.5 py-0.5 text-[11px] font-medium text-accent">
                      {b.stat}
                    </span>
                  )}
                </div>
                <p className="mt-2 text-[15px] leading-relaxed text-body">{b.detail}</p>

                {/* Phase 4: show the concrete gene changes */}
                {b.phase === 4 && n.offspring.changes.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {n.offspring.changes.map((c) => (
                      <span
                        key={c.gene}
                        className="flex items-center gap-1.5 rounded-md border border-line bg-surface px-2 py-1 text-xs"
                      >
                        <span className="text-muted">{GENE_LABEL[c.gene] ?? pretty(c.gene)}:</span>
                        <span className="text-muted line-through">{pretty(c.from)}</span>
                        <span className="text-muted">→</span>
                        <span className="font-medium text-brand">{pretty(c.to)}</span>
                        <span className="tnum text-positive">{money(c.effect)}</span>
                      </span>
                    ))}
                  </div>
                )}

                {b.href && (
                  <Link
                    href={b.href}
                    className="mt-3 inline-block text-sm font-medium text-brand hover:underline"
                  >
                    See the evidence →
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Honesty */}
        <section className="rounded-2xl border border-line bg-surface p-6">
          <h2 className="font-display text-lg font-semibold text-ink">
            What we&rsquo;re being honest about
          </h2>
          <ul className="mt-3 space-y-2">
            {n.caveats.map((c, i) => (
              <li key={i} className="flex gap-2 text-sm text-muted">
                <span className="mt-1 text-accent">•</span>
                <span>{c}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* Framing + reproducibility */}
        <div className="mt-8 rounded-2xl border border-brand/30 bg-brand-soft p-6 text-center">
          <p className="font-display text-lg text-ink">
            The landing page is a learner: it forms hypotheses, gets assessed,
            has its misconceptions surfaced, and improves within reach.
          </p>
          <p className="mt-2 text-sm text-brand">
            This is knowledge tracing — pointed at the market.
          </p>
          <p className="mt-4 text-xs text-muted">
            Every number on this page regenerates exactly from seed{' '}
            <span className="tnum text-ink">{n.seed}</span>. Same seed, same story.
          </p>
        </div>
      </div>
    </main>
  );
}
