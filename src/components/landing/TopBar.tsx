// A faux Scholé top navigation bar. Static — it frames the page as a real
// product site. The wordmark uses the display serif to match Scholé's brand.

import { CtaButton } from './Button';

export function TopBar({ primaryCtaLabel }: { primaryCtaLabel: string }) {
  return (
    <header className="sticky top-0 z-20 border-b border-line/70 bg-paper/85 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <div className="flex items-center gap-2">
          <span className="font-display text-xl font-semibold text-ink">
            Scholé
          </span>
          <span className="rounded-full bg-accent-soft px-2 py-0.5 text-[11px] font-medium tracking-wide text-accent">
            for Teams
          </span>
        </div>
        <nav className="hidden items-center gap-7 text-sm text-muted md:flex">
          <span className="cursor-pointer hover:text-ink">Platform</span>
          <span className="cursor-pointer hover:text-ink">Research</span>
          <span className="cursor-pointer hover:text-ink">Customers</span>
          <span className="cursor-pointer hover:text-ink">Pricing</span>
        </nav>
        <div className="hidden sm:block">
          <CtaButton label={primaryCtaLabel} />
        </div>
      </div>
    </header>
  );
}
