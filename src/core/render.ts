// render.ts
// ---------------------------------------------------------------------------
// PURE. No React, no I/O. Turns a Genome into a concrete render plan the thin
// UI can walk. Kept here (not in components) so the "which sections, in what
// order" decision is a testable function, not buried in JSX. See CLAUDE.md §3.
// ---------------------------------------------------------------------------

import type { Genome, Section } from './genome';

// `length` controls how many of the ordered body sections actually render.
// Hero + FinalCTA always frame the page; these are the middle sections.
// short = leaner page (fewer proof points), long = the full argument.
const LENGTH_COUNT: Record<Genome['length'], number> = {
  short: 3,
  medium: 4,
  long: 5,
};

/**
 * The ordered list of body sections to render for a genome.
 * Reordering `sectionOrder` and changing `length` is how variants differ
 * structurally — not just cosmetically (CLAUDE.md §4).
 */
export function bodySections(g: Genome): Section[] {
  const count = LENGTH_COUNT[g.length];
  return g.sectionOrder.slice(0, count);
}

/** Does this genome show a secondary CTA button? (dual-CTA style only.) */
export function hasSecondaryCta(g: Genome): boolean {
  return g.ctaStyle === 'dual';
}
