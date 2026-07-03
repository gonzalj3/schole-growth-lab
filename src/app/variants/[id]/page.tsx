// Full-page render of a single seed variant — challenge deliverable #1.
// Statically generated for every seed at build time (no server needed).

import { notFound } from 'next/navigation';
import Link from 'next/link';
import { SEED_VARIANTS } from '@/core/genome';
import { LandingPage } from '@/components/landing/LandingPage';

export function generateStaticParams() {
  return SEED_VARIANTS.map((v) => ({ id: v.id }));
}

export default async function VariantPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const variant = SEED_VARIANTS.find((v) => v.id === id);
  if (!variant) notFound();

  return (
    <div className="min-h-screen">
      {/* A thin lab ribbon so a reviewer always knows which concept they're on
          and can get back. Not sticky — the page's own nav takes over on scroll. */}
      <div className="bg-ink text-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-2 text-xs">
          <Link href="/" className="text-white/70 hover:text-white">
            ← Growth Lab
          </Link>
          <span className="truncate text-white/90">
            <span className="font-medium">{variant.name}</span>
            <span className="text-white/50"> · {variant.why}</span>
          </span>
        </div>
      </div>
      <LandingPage genome={variant.genome} />
    </div>
  );
}
