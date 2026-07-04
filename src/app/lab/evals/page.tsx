'use client';

// Phase 6 — the eval scorecard. Because we authored the ground truth, we can
// grade the system's own inferences across many seeds and report frequencies,
// not one lucky run. Runs off the paint tick so the page stays responsive.

import { useEffect, useState } from 'react';
import { LabNav } from '@/components/lab/LabNav';
import { AUDIENCE_MIXES, MIX_LABEL } from '@/core/personas';
import { runEvals, type Scorecard } from '@/core/evals';

const MIXES = Object.keys(AUDIENCE_MIXES);
const SEED_COUNTS = [8, 12, 20];

export default function EvalsPage() {
  const [mixKey, setMixKey] = useState('roi_driven');
  const [nSeeds, setNSeeds] = useState(12);
  const [card, setCard] = useState<Scorecard | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    setCard(null);
    // defer so the "grading…" state paints before the synchronous crunch
    const t = setTimeout(() => {
      setCard(runEvals({ mixKey, seeds: Array.from({ length: nSeeds }, (_, i) => i + 1) }));
      setLoading(false);
    }, 30);
    return () => clearTimeout(t);
  }, [mixKey, nSeeds]);

  const allPass = card?.scores.every((s) => s.pass) ?? false;

  return (
    <main className="min-h-screen">
      <LabNav here="/lab/evals" />

      <div className="mx-auto max-w-4xl px-6 py-10">
        <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-accent">
          Eval-driven development · the report card
        </div>
        <h1 className="font-display text-3xl font-semibold text-ink">
          How we grade ourselves
        </h1>
        <p className="mt-3 max-w-3xl text-muted">
          We authored the hidden ground truth, so we can check the system&rsquo;s
          inferences against a known answer — across many seeds, so a lucky run
          can&rsquo;t hide. These five evals run in your browser and double as the
          test suite (<span className="tnum">npm test</span>). Green isn&rsquo;t
          decoration; it&rsquo;s the claim that the story generalizes.
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
                <option key={m} value={m}>{MIX_LABEL[m] ?? m}</option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-xs font-medium text-muted">Seeds</span>
            <select
              value={nSeeds}
              onChange={(e) => setNSeeds(Number(e.target.value))}
              className="rounded-lg border border-line bg-paper px-3 py-2 text-sm text-ink"
            >
              {SEED_COUNTS.map((n) => (
                <option key={n} value={n}>{n} seeds</option>
              ))}
            </select>
          </label>
          <div className="ml-auto text-xs text-muted">
            {loading ? 'grading…' : `graded across ${card?.seeds} seeds`}
          </div>
        </div>

        {/* Overall */}
        {!loading && card && (
          <div
            className={`mt-6 rounded-2xl border p-5 ${
              allPass ? 'border-positive/40 bg-positive/5' : 'border-accent/40 bg-accent-soft'
            }`}
          >
            <div className="font-display text-lg font-semibold text-ink">
              {allPass ? '✓ All five evals pass' : 'Some evals need attention'}
            </div>
            <p className="mt-1 text-sm text-muted">
              Grading the system against the ground truth we planted — the honesty
              layer that separates a real result from a lucky one.
            </p>
          </div>
        )}

        {/* Scores */}
        <div className="mt-6 space-y-3">
          {loading &&
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-24 animate-pulse rounded-2xl border border-line bg-surface" />
            ))}
          {!loading &&
            card?.scores.map((s) => (
              <div
                key={s.key}
                className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-line bg-surface p-5"
              >
                <div className="flex items-start gap-3">
                  <span
                    className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-sm ${
                      s.pass ? 'bg-positive/10 text-positive' : 'bg-negative/10 text-negative'
                    }`}
                  >
                    {s.pass ? '✓' : '✗'}
                  </span>
                  <div>
                    <div className="font-medium text-ink">{s.label}</div>
                    <div className="text-sm text-muted">{s.detail}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="tnum text-2xl font-semibold text-ink">{s.display}</div>
                  <div className="text-[11px] text-muted">target {s.target}</div>
                </div>
              </div>
            ))}
        </div>

        <p className="mt-6 text-xs text-muted">
          Note on calibration: reward is heteroscedastic (mostly zero, occasional
          large conversions), so classical OLS intervals under-cover. We use HC1
          robust (sandwich) standard errors, which is why the 95% intervals
          actually cover the truth near 95% of the time.
        </p>
      </div>
    </main>
  );
}
