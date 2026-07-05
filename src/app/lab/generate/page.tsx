'use client';

// Deliverable #5 — the new generated variation.
// Runs the generation step client-side: attribute → pick the champion → breed an
// informed offspring from the gate-cleared alleles → render it as a real page.
// Shows estimated lift (attribution) vs actual lift (oracle) — the honesty check.

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { AUDIENCE_MIXES } from '@/core/personas';
import { runGeneration } from '@/core/generate';
import type { AttributedGene } from '@/core/genome';
import { LandingPage } from '@/components/landing/LandingPage';
import { LabNav } from '@/components/lab/LabNav';

const MIXES = Object.keys(AUDIENCE_MIXES);
const pretty = (s: string) => s.replace(/_/g, ' ');
const GENE_LABEL: Record<AttributedGene, string> = {
  headline: 'Headline',
  primaryCta: 'Primary CTA',
  ctaStyle: 'CTA style',
  socialProof: 'Social proof',
  tone: 'Tone',
  length: 'Length',
  heroLayout: 'Hero layout',
};
const money = (v: number) =>
  `${v >= 0 ? '+' : '−'}$${Math.abs(v).toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
const dollars = (v: number) => `$${v.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;

export default function GeneratePage() {
  const [mixKey, setMixKey] = useState('roi_driven');
  const [seed, setSeed] = useState(7);

  const run = useMemo(
    () => runGeneration({ mixKey, genomes: 450, visitsPerGenome: 50, seed, minSamples: 400 }),
    [mixKey, seed],
  );

  const { base, offspring } = run;
  const liftPct = run.baseExpectedReward > 0 ? run.actualLift / run.baseExpectedReward : 0;
  const changedGenes = offspring.changes.map((c) => c.gene);

  // Auto-scroll each before/after frame to the first highlighted (changed) element.
  const origRef = useRef<HTMLDivElement>(null);
  const genRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const scrollToGlow = (container: HTMLDivElement | null) => {
      if (!container) return;
      const el = container.querySelector('.hl-glow') as HTMLElement | null;
      if (!el) {
        container.scrollTop = 0;
        return;
      }
      const top =
        el.getBoundingClientRect().top - container.getBoundingClientRect().top + container.scrollTop;
      container.scrollTop = Math.max(0, top - container.clientHeight / 2 + el.clientHeight / 2);
    };
    const t = setTimeout(() => {
      scrollToGlow(origRef.current);
      scrollToGlow(genRef.current);
    }, 350);
    return () => clearTimeout(t);
  }, [run]);

  return (
    <main className="min-h-screen">
      <LabNav here="/lab/generate" />

      <div className="mx-auto max-w-5xl px-6 py-10">
        <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-accent">
          Deliverable 05 · The generated variation
        </div>
        <h1 className="font-display text-3xl font-semibold text-ink">
          The page the system bred
        </h1>
        <p className="mt-3 max-w-3xl text-muted">
          The generator starts from the current champion and swaps in{' '}
          <em>only</em> the alleles the promotion gate cleared — proven ingredients,
          nothing guessed. Every unproven gene is inherited untouched. Below: what
          changed, the predicted lift versus the true lift, and the live page it
          produced.
        </p>

        {/* Controls */}
        <div className="mt-6 flex flex-wrap items-end gap-5 rounded-2xl border border-line bg-surface p-5">
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
          <div className="ml-auto text-sm text-muted">
            parent:{' '}
            <Link href={`/variants/${base.id}`} className="font-medium text-brand hover:underline">
              {base.name}
            </Link>
          </div>
        </div>

        {/* Lift summary */}
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-line bg-surface p-5">
            <div className="text-xs text-muted">Parent expected reward</div>
            <div className="tnum mt-1 text-2xl font-semibold text-ink">
              {dollars(run.baseExpectedReward)}
            </div>
            <div className="text-[11px] text-muted">expected/visit · simulated · {base.name}</div>
          </div>
          <div className="rounded-2xl border border-brand bg-brand-soft p-5">
            <div className="text-xs text-brand">Offspring expected reward</div>
            <div className="tnum mt-1 text-2xl font-semibold text-ink">
              {dollars(run.offspringExpectedReward)}
            </div>
            <div className="text-[11px] text-muted">expected/visit · simulated</div>
          </div>
          {offspring.changes.length === 0 ? (
            <div className="rounded-2xl border border-line bg-surface p-5">
              <div className="text-xs text-muted">True lift</div>
              <div className="mt-1 text-2xl font-semibold text-ink">Unchanged</div>
              <div className="text-[11px] text-muted">champion already optimal</div>
            </div>
          ) : (
            <div className="rounded-2xl border border-positive/40 bg-positive/5 p-5">
              <div className="text-xs text-positive">True lift</div>
              <div className="tnum mt-1 text-2xl font-semibold text-positive">
                +{(liftPct * 100).toFixed(1)}%
              </div>
              <div className="text-[11px] text-muted">expected revenue per visit</div>
            </div>
          )}
        </div>
        <p className="mt-2 text-xs text-muted">
          These are <em>expected revenue per visit inside the simulation</em> — a
          relative score for comparing pages, not literal per-visitor revenue.
          The trustworthy result is the <span className="text-ink">lift</span>.
        </p>

        {/* Changes */}
        <section className="mt-8">
          <h2 className="font-display text-xl font-semibold text-ink">What changed &amp; why</h2>
          {offspring.changes.length === 0 ? (
            <p className="mt-2 rounded-2xl border border-line bg-surface p-5 text-sm text-muted">
              The champion already carries every proven allele — the gate found
              nothing safe to change. That&rsquo;s an honest result, not a failure:
              the system won&rsquo;t swap a gene it can&rsquo;t defend.
            </p>
          ) : (
            <div className="mt-3 space-y-2">
              {offspring.changes.map((c) => (
                <div
                  key={c.gene}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-line bg-surface p-4"
                >
                  <div className="flex items-center gap-3 text-sm">
                    <span className="w-24 text-muted">{GENE_LABEL[c.gene]}</span>
                    <span className="rounded-md border border-line bg-paper px-2 py-0.5 text-muted line-through">
                      {pretty(c.from)}
                    </span>
                    <span className="text-muted">→</span>
                    <span className="rounded-md border border-brand bg-brand-soft px-2 py-0.5 font-medium text-brand">
                      {pretty(c.to)}
                    </span>
                  </div>
                  <span className="tnum text-sm font-medium text-positive">
                    modeled {money(c.effect)}
                  </span>
                </div>
              ))}
            </div>
          )}
          {offspring.changes.length > 0 && (
            <p className="mt-3 text-xs text-muted">
              The true lift is {(liftPct * 100).toFixed(1)}% — it differs from the sum
              of the individual gene effects because of interactions the main-effects
              model can&rsquo;t see, stated honestly rather than hidden.
            </p>
          )}
        </section>

        {/* Before & after — parent vs bred page, side by side */}
        <section className="mt-10">
          <h2 className="font-display text-xl font-semibold text-ink">
            Before &amp; after
          </h2>
          <p className="mt-1 max-w-3xl text-sm text-muted">
            The champion the system started from, next to the page it bred — both
            real, each rendered from its own genome.{' '}
            {offspring.changes.length > 0
              ? 'Each frame auto-scrolls to the first change, which glows.'
              : 'They are identical — the champion already carried every proven allele.'}
          </p>
          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            {/* Parent / original */}
            <div className="overflow-hidden rounded-2xl border border-line">
              <div className="flex items-center gap-2 border-b border-line bg-surface px-4 py-2">
                <span className="rounded-full bg-ink px-2 py-0.5 text-[11px] font-medium text-white">
                  Original
                </span>
                <span className="text-[11px] text-muted">{base.name} (champion)</span>
              </div>
              <div ref={origRef} className="max-h-[75vh] overflow-y-auto">
                <LandingPage genome={base.genome} highlight={changedGenes} />
              </div>
            </div>
            {/* Offspring / generated */}
            <div className="overflow-hidden rounded-2xl border-2 border-brand">
              <div className="flex items-center gap-2 border-b border-brand/40 bg-brand-soft px-4 py-2">
                <span className="rounded-full bg-brand px-2 py-0.5 text-[11px] font-medium text-white">
                  Generated
                </span>
                <span className="text-[11px] text-brand">the page the system bred</span>
              </div>
              <div ref={genRef} className="max-h-[75vh] overflow-y-auto">
                <LandingPage genome={offspring.genome} highlight={changedGenes} />
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
