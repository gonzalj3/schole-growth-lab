// Shared lab top-bar so the six views feel like one product. `here` dims the
// current page's link.

import Link from 'next/link';

const LINKS = [
  { href: '/lab/story', label: 'story' },
  { href: '/lab/experiment', label: 'experiment' },
  { href: '/lab/behavior', label: 'behavior' },
  { href: '/lab/attribution', label: 'attribution' },
  { href: '/lab/generate', label: 'generate' },
  { href: '/lab/evals', label: 'evals' },
];

export function LabNav({ here }: { here: string }) {
  return (
    <header className="border-b border-line">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-4">
        <Link href="/" className="flex items-center gap-2">
          <span className="font-display text-lg font-semibold text-ink">Scholé</span>
          <span className="rounded-full bg-brand-soft px-2 py-0.5 text-[11px] font-medium text-brand">
            Growth Lab
          </span>
        </Link>
        <nav className="flex flex-wrap gap-x-4 gap-y-1 text-xs">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={
                l.href === here ? 'font-medium text-ink' : 'text-muted hover:text-ink'
              }
            >
              {l.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
