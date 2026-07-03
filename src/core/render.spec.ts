import { describe, it, expect } from 'vitest';
import { bodySections, hasSecondaryCta } from './render';
import type { Genome } from './genome';

// A base genome we can tweak per-assertion. Section order has all 5 sections so
// `length` truncation is observable.
const base: Genome = {
  headline: 'team_capability',
  primaryCta: 'book_demo',
  ctaStyle: 'single',
  socialProof: 'company_logos',
  tone: 'consultative',
  sectionOrder: ['benefits', 'howItWorks', 'proof', 'credibility', 'pricing'],
  length: 'long',
  heroLayout: 'split_image',
};

describe('bodySections', () => {
  it('renders all 5 ordered sections when length is long', () => {
    expect(bodySections({ ...base, length: 'long' })).toEqual([
      'benefits',
      'howItWorks',
      'proof',
      'credibility',
      'pricing',
    ]);
  });

  it('truncates to the first 4 sections when length is medium', () => {
    expect(bodySections({ ...base, length: 'medium' })).toEqual([
      'benefits',
      'howItWorks',
      'proof',
      'credibility',
    ]);
  });

  it('truncates to the first 3 sections when length is short', () => {
    expect(bodySections({ ...base, length: 'short' })).toEqual([
      'benefits',
      'howItWorks',
      'proof',
    ]);
  });

  it('preserves the genome section order (not a fixed order)', () => {
    const reordered: Genome = {
      ...base,
      length: 'short',
      sectionOrder: ['pricing', 'credibility', 'benefits', 'howItWorks', 'proof'],
    };
    expect(bodySections(reordered)).toEqual(['pricing', 'credibility', 'benefits']);
  });

  it('never returns more sections than the genome defines', () => {
    const shortOrder: Genome = { ...base, length: 'long', sectionOrder: ['benefits', 'pricing'] };
    expect(bodySections(shortOrder)).toEqual(['benefits', 'pricing']);
  });
});

describe('hasSecondaryCta', () => {
  it('is true only for dual CTA style', () => {
    expect(hasSecondaryCta({ ...base, ctaStyle: 'dual' })).toBe(true);
    expect(hasSecondaryCta({ ...base, ctaStyle: 'single' })).toBe(false);
  });
});
