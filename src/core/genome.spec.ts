import { describe, it, expect } from 'vitest';
import {
  SEED_VARIANTS,
  HEADLINE_COPY,
  CTA_COPY,
  SOCIAL_PROOF_COPY,
} from './genome';
import { bodySections } from './render';
// Tests + /evals are the sanctioned readers of GROUND_TRUTH (CLAUDE.md §10):
// because we author the truth, we can assert the system is fully wired to it.
import { GROUND_TRUTH, PERSONAS } from './personas';

describe('genome copy completeness', () => {
  it('every headline allele has non-empty copy (headline + why)', () => {
    for (const [allele, copy] of Object.entries(HEADLINE_COPY)) {
      expect(copy.headline, `${allele}.headline`).toBeTruthy();
      expect(copy.why, `${allele}.why`).toBeTruthy();
      expect(copy.subhead, `${allele}.subhead`).toBeTruthy();
    }
  });

  it('every social-proof allele has a label and at least 2 items', () => {
    for (const [allele, copy] of Object.entries(SOCIAL_PROOF_COPY)) {
      expect(copy.label, `${allele}.label`).toBeTruthy();
      expect(copy.items.length, `${allele}.items`).toBeGreaterThanOrEqual(2);
    }
  });
});

describe('GROUND_TRUTH wiring', () => {
  // The guard that catches a new headline allele added to the page copy but
  // never given a preference weight — the simulator would silently treat it as
  // neutral, quietly biasing the experiment.
  it('every persona has a headline weight for every headline allele', () => {
    const alleles = Object.keys(HEADLINE_COPY);
    for (const personaId of Object.keys(PERSONAS)) {
      const weights = GROUND_TRUTH[personaId as keyof typeof GROUND_TRUTH].headline;
      for (const allele of alleles) {
        expect(
          weights[allele as keyof typeof weights],
          `${personaId} is missing a GROUND_TRUTH.headline weight for "${allele}"`,
        ).toBeDefined();
      }
    }
  });
});

describe('seed variants render coherently', () => {
  it('each seed maps to real copy and a non-empty section plan', () => {
    for (const v of SEED_VARIANTS) {
      const g = v.genome;
      expect(HEADLINE_COPY[g.headline], `${v.id} headline`).toBeTruthy();
      expect(CTA_COPY[g.primaryCta], `${v.id} cta`).toBeTruthy();
      expect(SOCIAL_PROOF_COPY[g.socialProof], `${v.id} proof`).toBeTruthy();
      expect(bodySections(g).length, `${v.id} sections`).toBeGreaterThan(0);
      expect(v.why, `${v.id} why`).toBeTruthy();
    }
  });

  it('includes the Karp-inspired "value realization" concept', () => {
    const v6 = SEED_VARIANTS.find((v) => v.genome.headline === 'value_realization');
    expect(v6, 'a seed built on the value_realization why').toBeDefined();
    expect(v6!.why.toLowerCase()).toMatch(/value|return|roi|waste/);
  });
});
