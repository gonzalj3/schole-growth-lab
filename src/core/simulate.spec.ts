import { describe, it, expect } from 'vitest';
import {
  simulateVisit,
  simulateVisitors,
  summarizeVisits,
  trueUtility,
  availableActions,
} from './simulate';
import { SEED_VARIANTS } from './genome';
import { PERSONAS, AUDIENCE_MIXES } from './personas';
import { bodySections } from './render';
import { createRng } from './rng';

const v = (id: string) => SEED_VARIANTS.find((s) => s.id === id)!.genome;

describe('trueUtility', () => {
  it('sums the ground-truth weights for a known (persona, genome)', () => {
    // lnd_leader on V1: team_capability 1.0 + book_demo 1.0 + company_logos 0.7
    // + consultative 0.6 + long 0.3 = 3.6
    expect(trueUtility(v('v1_whole_team'), 'lnd_leader')).toBeCloseTo(3.6, 6);
  });

  it('is deterministic (pure function of inputs)', () => {
    expect(trueUtility(v('v6_value_gap'), 'ops_leader')).toBe(
      trueUtility(v('v6_value_gap'), 'ops_leader'),
    );
  });
});

describe('availableActions', () => {
  it('single-CTA page offers only its primary action', () => {
    expect(availableActions(v('v2_prove_roi'))).toEqual(['book_demo']);
  });
  it('dual-CTA page also offers get_pricing', () => {
    expect(new Set(availableActions(v('v1_whole_team')))).toEqual(
      new Set(['book_demo', 'get_pricing']),
    );
  });
  it('diagnostic page offers only the diagnostic', () => {
    expect(availableActions(v('v5_assess_your_team'))).toEqual(['get_diagnostic']);
  });
});

describe('simulateVisit — structure & integrity', () => {
  it('is deterministic: same seed → identical visit', () => {
    const a = simulateVisit(v('v3_backed_by_science'), 'security_skeptic', createRng(11));
    const b = simulateVisit(v('v3_backed_by_science'), 'security_skeptic', createRng(11));
    expect(a).toEqual(b);
  });

  it('returns one signal per rendered section, in genome order', () => {
    const g = v('v6_value_gap');
    const visit = simulateVisit(g, 'ops_leader', createRng(5));
    expect(visit.sections.map((s) => s.section)).toEqual(bodySections(g));
  });

  it('section signals are within sane bounds', () => {
    const visit = simulateVisit(v('v1_whole_team'), 'lnd_leader', createRng(8));
    for (const s of visit.sections) {
      expect(s.scrollDepth).toBeGreaterThanOrEqual(0);
      expect(s.scrollDepth).toBeLessThanOrEqual(1);
      expect(s.dwellMs).toBeGreaterThan(0);
    }
  });

  it('reward equals the persona conversionValue for the chosen action', () => {
    const visit = simulateVisit(v('v2_prove_roi'), 'ops_leader', createRng(3));
    expect(visit.reward).toBe(
      PERSONAS.ops_leader.conversionValue[visit.action],
    );
  });

  it('never returns an action the page does not offer', () => {
    // v2 is single-CTA book_demo → only book_demo or none, ever.
    const allowed = new Set([...availableActions(v('v2_prove_roi')), 'none']);
    const rng = createRng(1234);
    for (let i = 0; i < 500; i++) {
      const visit = simulateVisit(v('v2_prove_roi'), 'ops_leader', rng);
      expect(allowed.has(visit.action)).toBe(true);
    }
  });
});

describe('simulateVisit — the load-bearing property: utility drives reward', () => {
  it('a high-utility pairing out-earns a low-utility pairing on average', () => {
    // ops_leader on V6 (utility ≈ 2.8) vs security_skeptic on V2 (utility ≈ 0.8)
    const high = summarizeVisits(
      simulateVisitors(v('v6_value_gap'), { ops_leader: 1 } as never, 3000, createRng(1)),
    );
    const low = summarizeVisits(
      simulateVisitors(v('v2_prove_roi'), { security_skeptic: 1 } as never, 3000, createRng(1)),
    );
    expect(high.meanReward).toBeGreaterThan(low.meanReward);
    expect(high.conversionRate).toBeGreaterThan(low.conversionRate);
  });
});

describe('summarizeVisits', () => {
  it('conversion rate matches the non-none action count', () => {
    const visits = simulateVisitors(
      v('v1_whole_team'),
      AUDIENCE_MIXES.balanced,
      1000,
      createRng(2),
    );
    const s = summarizeVisits(visits);
    const conversions = visits.filter((x) => x.action !== 'none').length;
    expect(s.conversions).toBe(conversions);
    expect(s.conversionRate).toBeCloseTo(conversions / visits.length, 6);
  });
});
