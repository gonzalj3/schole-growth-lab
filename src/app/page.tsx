// Growth Lab home — the "outer app" entry point. Frames the project and links
// into each challenge deliverable. Right now deliverable #1 (the five seed
// pages) is live; the lab views (#2–#6) light up as later phases land.

import Link from 'next/link';
import { SEED_VARIANTS, HEADLINE_COPY, CTA_COPY } from '@/core/genome';

const DELIVERABLES: {
  n: number;
  title: string;
  desc: string;
  live: boolean;
  href?: string;
}[] = [
  { n: 1, title: 'Initial versions', desc: 'Six real Scholé Teams pages, each a different "why".', live: true, href: '/#variants' },
  { n: 2, title: 'How pages were compared', desc: 'The experiment design + live traffic allocation.', live: true, href: '/lab/experiment' },
  { n: 3, title: 'Simulated behavior', desc: 'Section-level engagement + revenue per variant.', live: true, href: '/lab/behavior' },
  { n: 4, title: 'Which performed better', desc: 'Leaderboard with confidence intervals + regret.', live: true, href: '/lab/experiment' },
  { n: 5, title: 'New generated variation', desc: "The system's informed offspring page.", live: true, href: '/lab/generate' },
  { n: 6, title: 'What changed & why', desc: 'The interpreter’s plain-language explanation.', live: false },
];

function GeneChip({ label }: { label: string }) {
  return (
    <span className="rounded-md border border-line bg-paper px-2 py-0.5 text-[11px] text-muted">
      {label}
    </span>
  );
}

export default function Home() {
  return (
    <main className="min-h-screen">
      {/* Lab top bar */}
      <header className="border-b border-line">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <span className="font-display text-lg font-semibold text-ink">Scholé</span>
            <span className="rounded-full bg-brand-soft px-2 py-0.5 text-[11px] font-medium text-brand">
              Growth Lab
            </span>
          </div>
          <span className="text-xs text-muted">A GTM challenge by Martin Gonzalez</span>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-4xl px-6 pt-20 pb-14 text-center">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-line bg-surface px-3 py-1 text-xs font-medium text-accent">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-accent" />
          Self-improving landing pages
        </div>
        <h1 className="font-display text-4xl font-semibold leading-[1.1] text-ink sm:text-6xl">
          A landing page that learns.
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-muted">
          Six Scholé Teams concepts compete for simulated buyer traffic. A
          bandit finds the winning <em>why</em>, an interpretable model attributes{' '}
          <em>which genes</em>{' '}earned the revenue, and the system breeds a better
          page — then explains itself. It&rsquo;s{' '}
          <span className="text-ink">knowledge tracing, pointed at the market.</span>
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <a
            href="#variants"
            className="inline-flex items-center rounded-lg bg-brand px-6 py-3 text-sm font-medium text-white hover:bg-brand-hover"
          >
            See the six concepts
          </a>
          <Link
            href="/lab/behavior"
            className="inline-flex items-center rounded-lg border border-line bg-surface px-6 py-3 text-sm font-medium text-ink hover:border-brand"
          >
            Open the lab →
          </Link>
        </div>
      </section>

      {/* Deliverables roadmap */}
      <section className="border-y border-line bg-surface/60">
        <div className="mx-auto max-w-6xl px-6 py-14">
          <h2 className="mb-8 font-display text-2xl font-semibold text-ink">
            What this app lets you see
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {DELIVERABLES.map((d) => {
              const inner = (
                <>
                  <div className="mb-2 flex items-center justify-between">
                    <span className="tnum text-sm font-semibold text-muted">
                      {String(d.n).padStart(2, '0')}
                    </span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${
                        d.live ? 'bg-positive/10 text-positive' : 'bg-line text-muted'
                      }`}
                    >
                      {d.live ? 'live' : 'building'}
                    </span>
                  </div>
                  <h3 className="font-display text-base font-semibold text-ink">
                    {d.title}
                  </h3>
                  <p className="mt-1 text-sm text-muted">{d.desc}</p>
                  {d.href && (
                    <span className="mt-3 inline-block text-sm font-medium text-brand">
                      Open →
                    </span>
                  )}
                </>
              );
              return d.href ? (
                <Link
                  key={d.n}
                  href={d.href}
                  className="group rounded-2xl border border-line bg-surface p-5 transition-colors hover:border-brand"
                >
                  {inner}
                </Link>
              ) : (
                <div key={d.n} className="rounded-2xl border border-line bg-surface p-5">
                  {inner}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Variant gallery */}
      <section id="variants" className="mx-auto max-w-6xl px-6 py-16 scroll-mt-6">
        <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-accent">
          Phase 1 · Why Discovery
        </div>
        <h2 className="mb-2 font-display text-3xl font-semibold text-ink">
          The five seed concepts
        </h2>
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

      <footer className="border-t border-line">
        <div className="mx-auto max-w-6xl px-6 py-8 text-xs text-muted">
          Scholé Growth Lab · deterministic &amp; reproducible from a seed · built
          for the Scholé Founding Growth Engineer challenge.
        </div>
      </footer>
    </main>
  );
}
