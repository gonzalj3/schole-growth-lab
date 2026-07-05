// Shared section shell: consistent vertical rhythm + an optional eyebrow/heading.
// Keeps every body section visually aligned without repeating spacing classes.

export function Section({
  eyebrow,
  heading,
  children,
  tint = false,
  glow = false,
}: {
  eyebrow?: string;
  heading?: string;
  children: React.ReactNode;
  tint?: boolean;
  glow?: boolean;
}) {
  return (
    <section className={tint ? 'border-y border-line bg-surface/60' : ''}>
      <div className={`mx-auto max-w-6xl px-6 py-16 ${glow ? 'hl-glow' : ''}`}>
        {(eyebrow || heading) && (
          <div className="mb-10 max-w-2xl">
            {eyebrow && (
              <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-accent">
                {eyebrow}
              </div>
            )}
            {heading && (
              <h2 className="font-display text-3xl font-semibold text-ink">
                {heading}
              </h2>
            )}
          </div>
        )}
        {children}
      </div>
    </section>
  );
}
