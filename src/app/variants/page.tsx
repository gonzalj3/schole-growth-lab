// Deliverable #1 — the initial versions, as a real route (not a home anchor).
// A standalone page so browser back-from-a-variant lands here reliably in every
// browser (Safari doesn't reliably scroll to a #hash on back).

import Link from 'next/link';
import { SEED_VARIANTS, HEADLINE_COPY, CTA_COPY } from '@/core/genome';

function GeneChip({ label }: { label: string }) {
  return (
    <span className="rounded-md border border-line bg-paper px-2 py-0.5 text-[11px] text-muted">
      {label}
    </span>
  );
}

export default function VariantsPage() {
  return (
    <main className="min-h-screen">
      <header className="border-b border-line">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2">
            <span className="font-display text-lg font-semibold text-ink">Scholé</span>
            <span className="rounded-full bg-brand-soft px-2 py-0.5 text-[11px] font-medium text-brand">
              Growth Lab
            </span>
          </Link>
          <Link href="/" className="text-xs text-muted hover:text-ink">
            ← home
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-6 py-14">
        <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-accent">
          Deliverable 01 · Phase 1 · Why Discovery
        </div>
        <h1 className="mb-2 font-display text-3xl font-semibold text-ink">
          The six seed concepts
        </h1>
        <p className="mb-10 max-w-2xl text-muted">
          Each is a genuinely different page — not a button-color test. They
          differ in headline, structure, proof, tone, and call to action, so the
          winner tells us <em>which reason to buy</em> resonates.
        </p>

        <div className="grid gap-6 md:grid-cols-2">
          {SEED_VARIANTS.map((v, i) => {
            const g = v.genome;
            return (
              <Link
                key={v.id}
                href={`/variants/${v.id}`}
                className="group flex flex-col rounded-2xl border border-line bg-surface p-6 transition-colors hover:border-brand"
              >
                <div className="mb-3 flex items-center gap-2">
                  <span className="tnum rounded-md bg-ink px-2 py-0.5 text-xs font-semibold text-white">
                    V{i + 1}
                  </span>
                  <span className="font-display text-lg font-semibold text-ink">
                    {v.name}
                  </span>
                </div>
                <p className="text-sm italic text-accent">{v.why}</p>
                <p className="mt-3 line-clamp-2 font-display text-base text-body">
                  &ldquo;{HEADLINE_COPY[g.headline].headline}&rdquo;
                </p>
                <div className="mt-4 flex flex-wrap gap-1.5">
                  <GeneChip label={`CTA: ${CTA_COPY[g.primaryCta].replace(/\s*\(.*/, '')}`} />
                  <GeneChip label={`proof: ${g.socialProof}`} />
                  <GeneChip label={`tone: ${g.tone}`} />
                  <GeneChip label={`hero: ${g.heroLayout}`} />
                  <GeneChip label={g.length} />
                </div>
                <span className="mt-5 text-sm font-medium text-brand group-hover:underline">
                  View full page →
                </span>
              </Link>
            );
          })}
        </div>
      </section>
    </main>
  );
}
