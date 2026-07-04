'use client';

// Deliverables #2 (how pages were compared) + #4 (which performed better).
// Runs the full bandit experiment client-side and shows: the design, live
// traffic allocation shifting toward winners over rounds, a leaderboard with
// confidence intervals, and a regret curve vs a uniform baseline + the oracle.

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { SEED_VARIANTS } from '@/core/genome';
import { AUDIENCE_MIXES, PERSONAS } from '@/core/personas';
import type { PersonaId } from '@/core/personas';
import { runExperiment, type ExperimentConfig } from '@/core/experiment';
import type { BanditKind } from '@/core/bandit';
import { StackedAreaChart, LineChart, ARM_COLORS } from '@/components/lab/charts';

const MIXES = Object.keys(AUDIENCE_MIXES);
const BANDITS: { key: BanditKind; label: string }[] = [
  { key: 'thompson', label: 'Thompson sampling' },
  { key: 'ucb1', label: 'UCB1' },
  { key: 'epsilon_greedy', label: 'ε-greedy' },
];
const nameById = Object.fromEntries(SEED_VARIANTS.map((v) => [v.id, v.name]));

const fmtMoney = (x: number) =>
  `$${x.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
const fmtPct = (x: number) => `${(x * 100).toFixed(1)}%`;

export default function ExperimentPage() {
  const [mixKey, setMixKey] = useState('roi_driven');
  const [banditKind, setBanditKind] = useState<BanditKind>('thompson');
  const [rounds, setRounds] = useState(30);
  const [seed, setSeed] = useState(42);

  const cfg: ExperimentConfig = useMemo(
    () => ({ mixKey, banditKind, rounds, visitorsPerRound: 60, seed, epsilon: 0.1 }),
    [mixKey, banditKind, rounds, seed],
  );

  const result = useMemo(() => runExperiment(cfg), [cfg]);
  // Uniform (pure-exploration) baseline for the regret contrast.
  const baseline = useMemo(
    () => runExperiment({ ...cfg, banditKind: 'epsilon_greedy', epsilon: 1 }),
    [cfg],
  );

  const shares = useMemo(
    () => result.rounds.map((r) => r.allocation.map((a) => a / cfg.visitorsPerRound)),
    [result, cfg.visitorsPerRound],
  );

  const recovered = result.empiricalBestId === result.oracleBestId;
  const maxCiHi = Math.max(...result.arms.map((a) => a.ci[1]));

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
          <div className="flex gap-4 text-xs text-muted">
            <Link href="/lab/behavior" className="hover:text-ink">
              behavior
            </Link>
            <Link href="/lab/attribution" className="hover:text-ink">
              attribution
            </Link>
            <Link href="/" className="hover:text-ink">
              ← back to lab
            </Link>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-6 py-10">
        <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-accent">
          Deliverables 02 + 04 · Comparison &amp; results
        </div>
        <h1 className="font-display text-3xl font-semibold text-ink">
          How the pages competed — and which won
        </h1>
        <p className="mt-3 max-w-3xl text-muted">
          A multi-armed bandit allocates simulated traffic across the six
          concepts in rounds, learning online. It spends less on losers and more
          on winners. Below: the experiment design, traffic shifting over time,
          the leaderboard with confidence intervals, and how much reward we lost
          to exploration (regret).
        </p>

        {/* Controls */}
        <div className="mt-6 flex flex-wrap items-end gap-5 rounded-2xl border border-line bg-surface p-5">
          <Control label="Audience mix">
            <select
              value={mixKey}
              onChange={(e) => setMixKey(e.target.value)}
              className="rounded-lg border border-line bg-paper px-3 py-2 text-sm text-ink"
            >
              {MIXES.map((m) => (
                <option key={m} value={m}>
                  {m.replace(/_/g, ' ')}
                </option>
              ))}
            </select>
          </Control>
          <Control label="Bandit">
            <select
              value={banditKind}
              onChange={(e) => setBanditKind(e.target.value as BanditKind)}
              className="rounded-lg border border-line bg-paper px-3 py-2 text-sm text-ink"
            >
              {BANDITS.map((b) => (
                <option key={b.key} value={b.key}>
                  {b.label}
                </option>
              ))}
            </select>
          </Control>
          <Control label="Rounds">
            <select
              value={rounds}
              onChange={(e) => setRounds(Number(e.target.value))}
              className="rounded-lg border border-line bg-paper px-3 py-2 text-sm text-ink"
            >
              {[15, 30, 50, 80].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </Control>
          <Control label="Seed">
            <input
              type="number"
              value={seed}
              onChange={(e) => setSeed(Number(e.target.value) || 0)}
              className="w-24 rounded-lg border border-line bg-paper px-3 py-2 text-sm text-ink tnum"
            />
          </Control>
          <div className="ml-auto text-xs text-muted">
            {result.totalVisitors.toLocaleString()} visitors ·{' '}
            {cfg.visitorsPerRound}/round · deterministic from seed
          </div>
        </div>

        {/* The verdict */}
        <div
          className={`mt-6 rounded-2xl border p-5 ${
            recovered ? 'border-positive/40 bg-positive/5' : 'border-accent/40 bg-accent-soft'
          }`}
        >
          <div className="text-sm text-muted">
            The bandit crowned{' '}
            <span className="font-semibold text-ink">
              {nameById[result.empiricalBestId]}
            </span>
            . The hidden truth says the best page under this mix is{' '}
            <span className="font-semibold text-ink">
              {nameById[result.oracleBestId]}
            </span>
            .
          </div>
          <div className="mt-1 font-display text-lg font-semibold text-ink">
            {recovered
              ? '✓ The system recovered the true winner.'
              : '≠ Not yet matched — the leader is within noise; needs more traffic or a promotion gate (Phase 3).'}
          </div>
        </div>

        {/* View #2 — traffic allocation */}
        <section className="mt-10">
          <h2 className="font-display text-xl font-semibold text-ink">
            Traffic allocation over rounds
          </h2>
          <p className="mt-1 max-w-3xl text-sm text-muted">
            Each band is a variant&rsquo;s share of traffic. Watch the winner&rsquo;s
            band widen as the bandit exploits what it learns — losers get starved.
          </p>
          <div className="mt-4 rounded-2xl border border-line bg-surface p-4">
            <StackedAreaChart shares={shares} colors={ARM_COLORS} />
          </div>
          <div className="mt-3 flex flex-wrap gap-3">
            {result.armOrder.map((id, i) => (
              <span key={id} className="flex items-center gap-1.5 text-xs text-muted">
                <span
                  className="inline-block h-3 w-3 rounded-sm"
                  style={{ background: ARM_COLORS[i % ARM_COLORS.length] }}
                />
                {nameById[id]}
              </span>
            ))}
          </div>
        </section>

        {/* View #4 — leaderboard */}
        <section className="mt-10">
          <h2 className="font-display text-xl font-semibold text-ink">
            Leaderboard — mean revenue per visit (95% CI)
          </h2>
          <p className="mt-1 max-w-3xl text-sm text-muted">
            Ranked by observed mean reward. The whisker is the 95% confidence
            interval; overlapping intervals mean we can&rsquo;t yet separate those
            variants. The ★ marks the variant that is <em>truly</em> best (the
            hidden oracle) — the check that the system recovered reality.
          </p>
          <div className="mt-4 space-y-2">
            {result.arms.map((a, rank) => (
              <div
                key={a.variantId}
                className={`rounded-xl border bg-surface p-4 ${
                  a.variantId === result.oracleBestId ? 'border-brand' : 'border-line'
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="tnum rounded-md bg-ink px-2 py-0.5 text-xs font-semibold text-white">
                      #{rank + 1}
                    </span>
                    <span className="font-medium text-ink">{a.name}</span>
                    {a.variantId === result.oracleBestId && (
                      <span className="rounded-full bg-brand-soft px-2 py-0.5 text-[11px] font-medium text-brand">
                        ★ true best
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-5 text-right">
                    <div>
                      <div className="tnum text-base font-semibold text-ink">
                        {fmtMoney(a.meanReward)}
                      </div>
                      <div className="text-[11px] text-muted">
                        oracle {fmtMoney(a.trueExpectedReward)}
                      </div>
                    </div>
                    <div className="w-16">
                      <div className="tnum text-sm text-ink">
                        {fmtPct(a.pulls / result.totalVisitors)}
                      </div>
                      <div className="text-[11px] text-muted">of traffic</div>
                    </div>
                  </div>
                </div>
                {/* CI bar */}
                <div className="relative mt-3 h-2 rounded-full bg-line">
                  <div
                    className="absolute top-0 h-2 rounded-full bg-brand/25"
                    style={{
                      left: `${(Math.max(0, a.ci[0]) / maxCiHi) * 100}%`,
                      width: `${((a.ci[1] - Math.max(0, a.ci[0])) / maxCiHi) * 100}%`,
                    }}
                  />
                  <div
                    className="absolute top-[-2px] h-3 w-[2px] bg-brand"
                    style={{ left: `${(a.meanReward / maxCiHi) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Regret */}
        <section className="mt-10">
          <h2 className="font-display text-xl font-semibold text-ink">
            Regret — the cost of learning
          </h2>
          <p className="mt-1 max-w-3xl text-sm text-muted">
            Cumulative revenue lost versus an all-knowing oracle that always
            served the best page. The {BANDITS.find((b) => b.key === banditKind)?.label}{' '}
            line bends toward flat as it stops wasting traffic on losers; the
            uniform baseline keeps paying the same penalty every round.
          </p>
          <div className="mt-4 rounded-2xl border border-line bg-surface p-4">
            <LineChart
              yLabel="cumulative regret ($)"
              lines={[
                { label: 'bandit', color: '#2e7d57', points: result.regretCurve },
                { label: 'uniform', color: '#b4442f', points: baseline.regretCurve },
              ]}
            />
            <div className="mt-2 flex gap-4 text-xs text-muted">
              <span className="flex items-center gap-1.5">
                <span className="inline-block h-2 w-4 rounded bg-positive" />
                {BANDITS.find((b) => b.key === banditKind)?.label}:{' '}
                {fmtMoney(result.regretCurve.at(-1) ?? 0)}
              </span>
              <span className="flex items-center gap-1.5">
                <span className="inline-block h-2 w-4 rounded bg-negative" />
                uniform: {fmtMoney(baseline.regretCurve.at(-1) ?? 0)}
              </span>
            </div>
          </div>
        </section>

        {/* Mix composition footnote */}
        <div className="mt-8 flex flex-wrap gap-2">
          {(Object.entries(AUDIENCE_MIXES[mixKey]) as [PersonaId, number][])
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
      </div>
    </main>
  );
}

function Control({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-xs font-medium text-muted">{label}</span>
      {children}
    </label>
  );
}
