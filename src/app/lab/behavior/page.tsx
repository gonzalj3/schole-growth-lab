'use client';

// Deliverable #3 — Simulated user behavior.
// Runs the deterministic simulation entirely client-side (no server, CLAUDE.md
// §13) and shows the section-level signals each variant produces under a chosen
// audience mix + seed. Flip the mix and watch which concept draws the most
// revenue — the same knob that will later change which "why" the bandit crowns.

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { SEED_VARIANTS, HEADLINE_COPY } from '@/core/genome';
import type { Section } from '@/core/genome';
import { AUDIENCE_MIXES, PERSONAS } from '@/core/personas';
import type { PersonaId } from '@/core/personas';
import {
  simulateVisitors,
  summarizeVisits,
  createRng,
  type VisitSummary,
} from '@/core/simulate';

const MIXES = Object.keys(AUDIENCE_MIXES);
const COUNTS = [200, 500, 1000, 2000];
const SECTION_LABEL: Record<Section, string> = {
  benefits: 'Benefits',
  howItWorks: 'How it works',
  proof: 'Proof',
  credibility: 'Credibility',
  pricing: 'Pricing',
};

const fmtPct = (x: number) => `${(x * 100).toFixed(1)}%`;
const fmtMoney = (x: number) =>
  `$${x.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;

function Bar({ pct, color }: { pct: number; color: string }) {
  return (
    <div className="h-1.5 w-full rounded-full bg-line">
      <div
        className={`h-1.5 rounded-full ${color}`}
        style={{ width: `${Math.max(2, Math.min(100, pct * 100))}%` }}
      />
    </div>
  );
}

export default function BehaviorPage() {
  const [mix, setMix] = useState<string>('balanced');
  const [seed, setSeed] = useState<number>(42);
  const [count, setCount] = useState<number>(500);

  const results = useMemo(() => {
    return SEED_VARIANTS.map((v, i) => {
      // Each variant gets its own reproducible stream, derived from the run seed.
      const rng = createRng(seed * 1000 + i);
      const visits = simulateVisitors(v.genome, AUDIENCE_MIXES[mix], count, rng);
      return { v, summary: summarizeVisits(visits) };
    }).sort((a, b) => b.summary.meanReward - a.summary.meanReward);
  }, [mix, seed, count]);

  const topReward = results[0]?.summary.meanReward ?? 1;

  return (
    <main className="min-h-screen">
      <header className="border-b border-line">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <Link href="/" className="font-display text-lg font-semibold text-ink">
              Scholé
            </Link>
            <span className="rounded-full bg-brand-soft px-2 py-0.5 text-[11px] font-medium text-brand">
              Growth Lab
            </span>
          </div>
          <Link href="/" className="text-xs text-muted hover:text-ink">
            ← back to lab
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-6 py-10">
        <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-accent">
          Deliverable 03 · Simulated behavior
        </div>
        <h1 className="font-display text-3xl font-semibold text-ink">
          What the simulated buyers did
        </h1>
        <p className="mt-3 max-w-3xl text-muted">
          We author a hidden preference matrix (the ground truth) and let it
          generate messy, section-level behavior. This screen shows that raw
          behavior — dwell, scroll depth, CTA clicks, and revenue — for all six
          concepts. The lab&rsquo;s job, later, is to <em>recover</em> the truth
          from these noisy signals. Everything here is{' '}
          <span className="text-ink">deterministic from the seed</span>: same
          seed, same result, every time.
        </p>

        {/* Controls */}
        <div className="mt-6 flex flex-wrap items-end gap-5 rounded-2xl border border-line bg-surface p-5">
          <label className="flex flex-col gap-1">
            <span className="text-xs font-medium text-muted">Audience mix (deal shape)</span>
            <select
              value={mix}
              onChange={(e) => setMix(e.target.value)}
              className="rounded-lg border border-line bg-paper px-3 py-2 text-sm text-ink"
            >
              {MIXES.map((m) => (
                <option key={m} value={m}>
                  {m.replace(/_/g, ' ')}
                </option>
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
          <label className="flex flex-col gap-1">
            <span className="text-xs font-medium text-muted">Visitors / variant</span>
            <select
              value={count}
              onChange={(e) => setCount(Number(e.target.value))}
              className="rounded-lg border border-line bg-paper px-3 py-2 text-sm text-ink"
            >
              {COUNTS.map((c) => (
                <option key={c} value={c}>
                  {c.toLocaleString()}
                </option>
              ))}
            </select>
          </label>
          <div className="ml-auto max-w-xs text-xs text-muted">
            The mix sets which committee role dominates. Flip it and the ranking
            below reshuffles — proof the reward reflects the audience, not a fixed
            winner.
          </div>
        </div>

        {/* Current mix composition */}
        <div className="mt-4 flex flex-wrap gap-2">
          {(Object.entries(AUDIENCE_MIXES[mix]) as [PersonaId, number][])
            .filter(([, p]) => p > 0)
            .sort((a, b) => b[1] - a[1])
            .map(([id, p]) => (
              <span
                key={id}
                className="rounded-full border border-line bg-surface px-3 py-1 text-xs text-muted"
              >
                {PERSONAS[id].label} · <span className="tnum text-ink">{fmtPct(p)}</span>
              </span>
            ))}
        </div>

        {/* Results — ranked by mean reward */}
        <div className="mt-8 space-y-4">
          {results.map(({ v, summary }, rank) => (
            <VariantRow
              key={v.id}
              rank={rank}
              name={v.name}
              why={HEADLINE_COPY[v.genome.headline].why}
              summary={summary}
              rewardFrac={summary.meanReward / topReward}
            />
          ))}
        </div>
      </div>
    </main>
  );
}

function VariantRow({
  rank,
  name,
  why,
  summary,
  rewardFrac,
}: {
  rank: number;
  name: string;
  why: string;
  summary: VisitSummary;
  rewardFrac: number;
}) {
  const isLeader = rank === 0;
  return (
    <div
      className={`rounded-2xl border bg-surface p-5 ${
        isLeader ? 'border-brand' : 'border-line'
      }`}
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        {/* identity */}
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="tnum rounded-md bg-ink px-2 py-0.5 text-xs font-semibold text-white">
              #{rank + 1}
            </span>
            <span className="font-display text-lg font-semibold text-ink">{name}</span>
            {isLeader && (
              <span className="rounded-full bg-brand-soft px-2 py-0.5 text-[11px] font-medium text-brand">
                leads on reward
              </span>
            )}
          </div>
          <p className="mt-1 max-w-md text-sm italic text-muted">{why}</p>
        </div>

        {/* headline numbers */}
        <div className="flex gap-6">
          <div className="text-right">
            <div className="tnum text-xl font-semibold text-ink">
              {fmtMoney(summary.meanReward)}
            </div>
            <div className="text-[11px] text-muted">mean reward / visit</div>
          </div>
          <div className="text-right">
            <div className="tnum text-xl font-semibold text-ink">
              {fmtPct(summary.conversionRate)}
            </div>
            <div className="text-[11px] text-muted">conversion</div>
          </div>
        </div>
      </div>

      {/* reward bar */}
      <div className="mt-3">
        <Bar pct={rewardFrac} color="bg-brand" />
      </div>

      {/* details grid */}
      <div className="mt-4 grid gap-5 border-t border-line pt-4 md:grid-cols-2">
        {/* actions */}
        <div>
          <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted">
            Conversions
          </div>
          <div className="flex flex-wrap gap-2 text-xs">
            {(['book_demo', 'get_diagnostic', 'get_pricing'] as const)
              .filter((a) => summary.actionCounts[a] > 0)
              .map((a) => (
                <span
                  key={a}
                  className="rounded-md border border-line bg-paper px-2 py-1 text-body"
                >
                  {a.replace(/_/g, ' ')}:{' '}
                  <span className="tnum text-ink">{summary.actionCounts[a]}</span>
                </span>
              ))}
            <span className="rounded-md border border-line bg-paper px-2 py-1 text-muted">
              none: <span className="tnum">{summary.actionCounts.none}</span>
            </span>
          </div>
        </div>

        {/* section engagement */}
        <div>
          <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted">
            Section engagement (dwell · scroll)
          </div>
          <div className="space-y-2">
            {(Object.entries(summary.sections) as [
              Section,
              { meanDwellMs: number; meanScrollDepth: number },
            ][]).map(([section, s]) => (
              <div key={section} className="grid grid-cols-[90px_1fr_1fr] items-center gap-3">
                <span className="text-xs text-muted">{SECTION_LABEL[section]}</span>
                <div className="flex items-center gap-2">
                  <Bar pct={Math.min(1, s.meanDwellMs / 12000)} color="bg-accent" />
                  <span className="tnum w-10 shrink-0 text-right text-[11px] text-muted">
                    {(s.meanDwellMs / 1000).toFixed(1)}s
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Bar pct={s.meanScrollDepth} color="bg-positive" />
                  <span className="tnum w-9 shrink-0 text-right text-[11px] text-muted">
                    {fmtPct(s.meanScrollDepth)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
