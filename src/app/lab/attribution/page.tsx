'use client';

// Deliverable support for #4 (which genes performed) + the heart of #6.
// Runs the randomized attribution experiment client-side, estimates each
// allele's effect on revenue with CIs, and shows the promotion gate's restraint.
// Overlays the TRUE hidden effect (◇) so you can see the system recover reality.

import { useMemo, useState } from 'react';
import { ATTRIBUTED_GENES, ALLELES, type AttributedGene } from '@/core/genome';
import { AUDIENCE_MIXES } from '@/core/personas';
import { runAttribution, type GeneAttribution } from '@/core/attribute';
import { LabNav } from '@/components/lab/LabNav';
import { expectedRewardUnderMix, randomGenome, createRng } from '@/core/simulate';

const MIXES = Object.keys(AUDIENCE_MIXES);
const pretty = (s: string) => s.replace(/_/g, ' ');
const GENE_LABEL: Record<AttributedGene, string> = {
  headline: 'Headline (the "why")',
  primaryCta: 'Primary CTA',
  ctaStyle: 'CTA style',
  socialProof: 'Social proof',
  tone: 'Tone',
  length: 'Page length',
  heroLayout: 'Hero layout',
};
const fmt = (v: number) => `${v >= 0 ? '+' : '−'}$${Math.abs(v).toLocaleString(undefined, { maximumFractionDigits: 0 })}`;

// The TRUE effect of each allele on expected revenue, per gene — a low-noise
// Monte Carlo of the exact expected reward over random genomes. This is the
// hidden truth the regression is trying to recover.
function trueEffects(mixKey: string): Record<string, Map<string, number>> {
  const rng = createRng(9999);
  const mix = AUDIENCE_MIXES[mixKey];
  const acc: Record<string, Map<string, { sum: number; n: number }>> = {};
  const grand: Record<string, { sum: number; n: number }> = {};
  for (const g of ATTRIBUTED_GENES) {
    acc[g] = new Map();
    grand[g] = { sum: 0, n: 0 };
  }
  for (let i = 0; i < 4000; i++) {
    const genome = randomGenome(rng);
    const r = expectedRewardUnderMix(genome, mix);
    for (const g of ATTRIBUTED_GENES) {
      const a = String(genome[g]);
      const cell = acc[g].get(a) ?? { sum: 0, n: 0 };
      cell.sum += r;
      cell.n += 1;
      acc[g].set(a, cell);
      grand[g].sum += r;
      grand[g].n += 1;
    }
  }
  const out: Record<string, Map<string, number>> = {};
  for (const g of ATTRIBUTED_GENES) {
    const gm = grand[g].sum / grand[g].n;
    out[g] = new Map([...acc[g].entries()].map(([a, c]) => [a, c.sum / c.n - gm]));
  }
  return out;
}

export default function AttributionPage() {
  const [mixKey, setMixKey] = useState('roi_driven');
  const [seed, setSeed] = useState(7);

  const run = useMemo(
    () => runAttribution({ mixKey, genomes: 450, visitsPerGenome: 50, seed, minSamples: 400 }),
    [mixKey, seed],
  );
  const truth = useMemo(() => trueEffects(mixKey), [mixKey]);

  const promotedGenes = new Set(run.promotion.promoted.map((p) => p.gene));
  const rejectionByGene = new Map(run.promotion.rejected.map((r) => [r.gene, r]));

  return (
    <main className="min-h-screen">
      <LabNav here="/lab/attribution" />

      <div className="mx-auto max-w-5xl px-6 py-10">
        <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-accent">
          The trust layer · attribution &amp; the promotion gate
        </div>
        <h1 className="font-display text-3xl font-semibold text-ink">
          Which <em>genes</em> earned the revenue?
        </h1>
        <p className="mt-3 max-w-3xl text-muted">
          Knowing which page won isn&rsquo;t enough to breed a better one — we need
          to know which <em>ingredients</em> drove it. An interpretable
          regression estimates each allele&rsquo;s effect on revenue while
          controlling for the others. Bars are estimates; whiskers are 95%
          confidence intervals; the <span className="text-ink">◇</span> marks the{' '}
          <em>true</em> hidden effect — so you can see the system recover reality.
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
          <div className="ml-auto text-xs text-muted">
            {run.nGenomes} random genomes · {run.nVisits.toLocaleString()} visits ·
            gate ≥ {run.promotion.minSamples} samples
          </div>
        </div>

        {/* Gate summary */}
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-positive/40 bg-positive/5 p-5">
            <div className="text-xs font-semibold uppercase tracking-wider text-positive">
              Promoted ({run.promotion.promoted.length})
            </div>
            <p className="mt-1 text-sm text-muted">
              Effects strong and separated enough to breed on.
            </p>
            <ul className="mt-3 space-y-1 text-sm">
              {run.promotion.promoted.map((p) => (
                <li key={p.gene} className="text-ink">
                  <span className="text-muted">{GENE_LABEL[p.gene]}:</span>{' '}
                  <span className="font-medium">{pretty(p.allele)}</span>{' '}
                  <span className="tnum text-positive">{fmt(p.effect)}</span>
                </li>
              ))}
              {run.promotion.promoted.length === 0 && (
                <li className="text-muted">Nothing cleared the bar yet.</li>
              )}
            </ul>
          </div>
          <div className="rounded-2xl border border-accent/40 bg-accent-soft p-5">
            <div className="text-xs font-semibold uppercase tracking-wider text-accent">
              Held back ({run.promotion.rejected.length})
            </div>
            <p className="mt-1 text-sm text-muted">
              A raw lead, but the evidence doesn&rsquo;t support promoting it. This
              restraint is the point.
            </p>
            <ul className="mt-3 space-y-1 text-sm">
              {run.promotion.rejected.map((r) => (
                <li key={r.gene} className="text-ink">
                  <span className="text-muted">{GENE_LABEL[r.gene]}:</span>{' '}
                  <span className="font-medium">{pretty(r.allele)}</span>{' '}
                  <span className="text-muted">— {r.reason}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Per-gene effect charts */}
        <div className="mt-8 space-y-4">
          {run.attribution.genes.map((g) => (
            <GenePanel
              key={g.gene}
              gene={g}
              truth={truth[g.gene]}
              promoted={promotedGenes.has(g.gene)}
              rejection={rejectionByGene.get(g.gene)?.reason}
            />
          ))}
        </div>
      </div>
    </main>
  );
}

function GenePanel({
  gene,
  truth,
  promoted,
  rejection,
}: {
  gene: GeneAttribution;
  truth: Map<string, number>;
  promoted: boolean;
  rejection?: string;
}) {
  // scale by the largest magnitude among effects, CI bounds, and true effects
  const maxAbs = Math.max(
    1,
    ...gene.alleles.flatMap((a) => [Math.abs(a.effect), Math.abs(a.ci[0]), Math.abs(a.ci[1])]),
    ...[...truth.values()].map((v) => Math.abs(v)),
  );
  const pos = (v: number) => 50 + (v / maxAbs) * 48; // percent, center at 50

  // preserve the gene's declared allele order for readability
  const order = ALLELES[gene.gene] as readonly string[];
  const rows = order.map((al) => gene.alleles.find((a) => a.allele === al)!);

  return (
    <div className="rounded-2xl border border-line bg-surface p-5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-display text-base font-semibold text-ink">
          {GENE_LABEL[gene.gene]}
        </h3>
        {promoted ? (
          <span className="rounded-full bg-positive/10 px-2.5 py-0.5 text-[11px] font-medium text-positive">
            promoted · winner separates
          </span>
        ) : (
          <span className="rounded-full bg-line px-2.5 py-0.5 text-[11px] font-medium text-muted">
            not promoted
          </span>
        )}
      </div>

      <div className="space-y-2.5">
        {rows.map((a) => {
          const isBest = a.allele === gene.bestAllele;
          const barLeft = Math.min(pos(0), pos(a.effect));
          const barWidth = Math.abs(pos(a.effect) - pos(0));
          return (
            <div key={a.allele} className="grid grid-cols-[130px_1fr_84px] items-center gap-3">
              <span className={`truncate text-xs ${isBest ? 'font-semibold text-ink' : 'text-muted'}`}>
                {pretty(a.allele)}
              </span>
              <div className="relative h-5">
                {/* zero axis */}
                <div className="absolute top-0 bottom-0 w-px bg-line" style={{ left: '50%' }} />
                {/* CI whisker */}
                <div
                  className="absolute top-1/2 h-px -translate-y-1/2 bg-muted/50"
                  style={{ left: `${pos(a.ci[0])}%`, width: `${Math.max(0, pos(a.ci[1]) - pos(a.ci[0]))}%` }}
                />
                {/* effect bar */}
                <div
                  className={`absolute top-1/2 h-2.5 -translate-y-1/2 rounded-sm ${
                    isBest ? 'bg-brand' : a.effect >= 0 ? 'bg-positive/70' : 'bg-negative/60'
                  }`}
                  style={{ left: `${barLeft}%`, width: `${Math.max(0.5, barWidth)}%` }}
                />
                {/* true effect marker ◇ */}
                <div
                  className="absolute top-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rotate-45 border border-ink bg-paper"
                  style={{ left: `${pos(truth.get(a.allele) ?? 0)}%` }}
                  title="true hidden effect"
                />
              </div>
              <span className={`tnum text-right text-xs ${isBest ? 'text-ink' : 'text-muted'}`}>
                {fmt(a.effect)}
              </span>
            </div>
          );
        })}
      </div>

      {!promoted && rejection && (
        <p className="mt-3 border-t border-line pt-3 text-xs text-muted">
          Gate: <span className="text-ink">{pretty(gene.bestAllele)}</span> not promoted — {rejection}
        </p>
      )}
    </div>
  );
}
