'use client';

// The temporal stress-test — the buyer is a moving target.
// One real IT buyer (Ray Delgado), sampled every 6 months 2023->2026, each
// snapshot grounded in dated sources. The system runs against each and the
// winning message rotates on its own: capability -> ROI/adoption -> results
// over tokens. Plus an out-of-sample holdout A/B of today's champion.

import { useEffect, useState } from 'react';
import { LabNav } from '@/components/lab/LabNav';
import { HEADLINE_COPY } from '@/core/genome';
import type { Headline } from '@/core/genome';
import { runTimeline, type TimelineStep } from '@/core/sequential/timeline';
import { runHoldout, type HoldoutResult } from '@/core/holdout';

const money = (v: number) => `$${Math.round(v).toLocaleString()}`;
const pretty = (s: string) => s.replace(/_/g, ' ');
const ERA_LABEL: Record<string, string> = {
  '2023_fomo': 'FOMO',
  '2024_first_doubts': 'first doubts',
  '2025_reckoning': 'the reckoning',
  '2026_resentment': 'resentment',
};
const headlineText = (h: string) => HEADLINE_COPY[h as Headline]?.headline ?? h;

function Dots({ n, max = 5, color }: { n: number; max?: number; color: string }) {
  return (
    <span className="inline-flex gap-0.5 align-middle">
      {Array.from({ length: max }).map((_, i) => (
        <span
          key={i}
          className={`h-1.5 w-1.5 rounded-full ${i < n ? color : 'bg-line'}`}
        />
      ))}
    </span>
  );
}

export default function TimelinePage() {
  const [steps, setSteps] = useState<TimelineStep[] | null>(null);
  const [holdout, setHoldout] = useState<HoldoutResult | null>(null);

  useEffect(() => {
    const t = setTimeout(() => {
      setSteps(runTimeline({ genomes: 150, visitsPerGenome: 30, seed: 7, minSamples: 300 }));
      setHoldout(runHoldout('roi_driven', { seeds: Array.from({ length: 20 }, (_, i) => 100 + i) }));
    }, 30);
    return () => clearTimeout(t);
  }, []);

  // the distinct winning frames in order of first appearance
  const arc = steps
    ? steps.reduce<string[]>((acc, s) => (acc.at(-1) === s.trueTopHeadline ? acc : [...acc, s.trueTopHeadline]), [])
    : [];

  return (
    <main className="min-h-screen">
      <LabNav here="/lab/timeline" />

      <div className="mx-auto max-w-6xl px-6 py-10">
        <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-accent">
          Augmentation · the temporal stress-test
        </div>
        <h1 className="font-display text-3xl font-semibold text-ink">
          The buyer is a moving target
        </h1>
        <p className="mt-3 max-w-3xl text-muted">
          Audience <em>mix</em> was one axis of non-stationarity. <em>Time</em> is
          the other. Here is one real IT buyer — Ray Delgado, VP of Technology
          Adoption at a national grocery chain — sampled every 6 months from July
          2023, each snapshot grounded in dated sources. We run the whole system
          against each. As his sentiment about AI drifts, the winning message
          rotates on its own. That rotation is the argument a static page
          can&rsquo;t answer.
        </p>

        {/* The arc */}
        {steps && (
          <div className="mt-6 flex flex-wrap items-center gap-2 rounded-2xl border border-line bg-surface p-4 text-sm">
            <span className="text-xs font-medium uppercase tracking-wide text-muted">the winning “why” rotated:</span>
            {arc.map((h, i) => (
              <span key={h} className="flex items-center gap-2">
                {i > 0 && <span className="text-muted">→</span>}
                <span className="rounded-full bg-brand-soft px-3 py-1 font-medium text-brand">
                  {pretty(h)}
                </span>
              </span>
            ))}
          </div>
        )}

        {/* Filmstrip */}
        {!steps && (
          <div className="mt-8 flex gap-4 overflow-hidden">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-72 w-72 shrink-0 animate-pulse rounded-2xl border border-line bg-surface" />
            ))}
          </div>
        )}
        {steps && (
          <div className="mt-8 flex snap-x gap-4 overflow-x-auto pb-4">
            {steps.map((s, i) => {
              const recovered = s.inferredTopHeadline === s.trueTopHeadline;
              const isNow = s.date === '2026-07';
              return (
                <div
                  key={s.id}
                  className={`flex w-80 shrink-0 snap-start flex-col rounded-2xl border bg-surface p-5 ${
                    isNow ? 'border-brand' : 'border-line'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="tnum font-display text-lg font-semibold text-ink">
                      {s.date}
                    </span>
                    <span className="rounded-full bg-paper px-2 py-0.5 text-[11px] font-medium text-muted">
                      {ERA_LABEL[s.era]}
                      {isNow ? ' · today' : ''}
                    </span>
                  </div>

                  {/* the winning message this era */}
                  <div className="mt-3 rounded-xl bg-brand-soft p-3">
                    <div className="text-[11px] font-medium uppercase tracking-wide text-brand">
                      the market wants
                    </div>
                    <div className="mt-1 font-display text-[15px] font-semibold leading-snug text-ink">
                      &ldquo;{headlineText(s.trueTopHeadline)}&rdquo;
                    </div>
                    <div className="mt-1 text-[11px] text-muted">
                      {recovered ? '✓ system recovered it' : `system inferred: ${pretty(s.inferredTopHeadline)}`}
                    </div>
                  </div>

                  {/* Ray's state */}
                  <div className="mt-3 space-y-1.5 text-xs text-muted">
                    <div className="flex items-center justify-between">
                      <span>vendor resentment</span>
                      <Dots n={s.vendorSentiment} color="bg-negative" />
                    </div>
                    <div className="flex items-center justify-between">
                      <span>willingness to buy</span>
                      <Dots n={s.willingnessToBuy} color="bg-positive" />
                    </div>
                    <div className="flex items-center justify-between">
                      <span>value lives at</span>
                      <span className="text-ink">{pretty(s.stackValueBelief)}</span>
                    </div>
                  </div>

                  <p className="mt-3 border-t border-line pt-3 text-[11px] italic leading-snug text-muted">
                    &ldquo;{s.why}&rdquo;
                  </p>

                  <div className="mt-auto pt-3 text-[11px] text-muted">
                    best current page: <span className="text-ink">{s.bestSeedName}</span>{' '}
                    ({money(s.offspring.offspringReward)}/visit)
                  </div>
                  <div className="mt-1 text-[10px] leading-tight text-muted/80">{s.macroContext.split(/\(/)[0].trim()}</div>
                </div>
              );
            })}
          </div>
        )}

        {/* The takeaway */}
        {steps && (
          <div className="mt-6 rounded-2xl border border-line bg-surface p-5 text-sm text-body">
            <span className="font-medium text-ink">What this proves.</span> No single
            page is the answer. In 2023 the buyer wanted <em>capability</em>; through
            the disillusionment years he wanted <em>proof of ROI</em>; and by July
            2026, post-Karp, he wants <em>results, not tokens</em> — and he&rsquo;s
            readier to buy (deal value roughly 10&times; the 2023 level). A page
            frozen at any one of those loses the others. The system re-derives the
            optimum whenever the target moves.
          </div>
        )}

        {/* Holdout A/B */}
        <section className="mt-10">
          <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-accent">
            Stress-test · out-of-sample validation
          </div>
          <h2 className="font-display text-xl font-semibold text-ink">
            Is today&rsquo;s champion real, or overfit?
          </h2>
          <p className="mt-1 max-w-3xl text-sm text-muted">
            The generator bred its challenger on one population; that lift is
            in-sample. Here we A/B the parent vs the bred challenger on 20{' '}
            <em>fresh</em> seeds it never saw, equal traffic to each.
          </p>
          {holdout && (
            <div className="mt-4 grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl border border-line bg-surface p-5">
                <div className="tnum text-2xl font-semibold text-ink">
                  {(holdout.challengerWinRate * 100).toFixed(0)}%
                </div>
                <div className="text-xs text-muted">
                  of {holdout.seeds} fresh seeds the challenger beat the parent
                </div>
              </div>
              <div className="rounded-2xl border border-line bg-surface p-5">
                <div className="tnum text-2xl font-semibold text-positive">
                  +{money(holdout.meanObservedLift)}
                </div>
                <div className="text-xs text-muted">
                  mean out-of-sample lift / visit (true: +{money(holdout.trueLift)})
                </div>
              </div>
              <div className="rounded-2xl border border-line bg-surface p-5">
                <div className="tnum text-2xl font-semibold text-ink">
                  {money(holdout.parentMeanObserved)} → {money(holdout.challengerMeanObserved)}
                </div>
                <div className="text-xs text-muted">
                  parent → challenger, observed on holdout
                </div>
              </div>
            </div>
          )}
          {!holdout && (
            <div className="mt-4 h-24 animate-pulse rounded-2xl border border-line bg-surface" />
          )}
          <p className="mt-3 text-xs text-muted">
            The observed lift tracks the true (oracle) gap, so the +9.4% wasn&rsquo;t
            an artifact of the data it was bred from — it survives on data it never saw.
          </p>
        </section>
      </div>
    </main>
  );
}
