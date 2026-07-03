import { describe, it, expect } from 'vitest';
import { createRng } from './rng';

describe('createRng — determinism', () => {
  it('same seed produces the identical sequence', () => {
    const a = createRng(42);
    const b = createRng(42);
    const seqA = Array.from({ length: 10 }, () => a.next());
    const seqB = Array.from({ length: 10 }, () => b.next());
    expect(seqA).toEqual(seqB);
  });

  it('different seeds produce different sequences', () => {
    const a = createRng(1);
    const b = createRng(2);
    const seqA = Array.from({ length: 10 }, () => a.next());
    const seqB = Array.from({ length: 10 }, () => b.next());
    expect(seqA).not.toEqual(seqB);
  });

  it('gaussian draws are also reproducible from the seed', () => {
    const a = createRng(7);
    const b = createRng(7);
    expect([a.gaussian(), a.gaussian()]).toEqual([b.gaussian(), b.gaussian()]);
  });
});

describe('createRng — distributions', () => {
  it('next() stays in [0, 1)', () => {
    const r = createRng(123);
    for (let i = 0; i < 1000; i++) {
      const x = r.next();
      expect(x).toBeGreaterThanOrEqual(0);
      expect(x).toBeLessThan(1);
    }
  });

  it('range(min, max) stays within [min, max)', () => {
    const r = createRng(99);
    for (let i = 0; i < 1000; i++) {
      const x = r.range(5, 9);
      expect(x).toBeGreaterThanOrEqual(5);
      expect(x).toBeLessThan(9);
    }
  });

  it('int(n) returns integers in [0, n) and covers the range', () => {
    const r = createRng(3);
    const seen = new Set<number>();
    for (let i = 0; i < 2000; i++) {
      const x = r.int(4);
      expect(Number.isInteger(x)).toBe(true);
      expect(x).toBeGreaterThanOrEqual(0);
      expect(x).toBeLessThan(4);
      seen.add(x);
    }
    expect(seen).toEqual(new Set([0, 1, 2, 3]));
  });

  it('gaussian(mean, stdev) recovers approx mean and stdev over many draws', () => {
    const r = createRng(2024);
    const n = 20000;
    const xs = Array.from({ length: n }, () => r.gaussian(10, 2));
    const mean = xs.reduce((a, b) => a + b, 0) / n;
    const variance = xs.reduce((a, b) => a + (b - mean) ** 2, 0) / n;
    const stdev = Math.sqrt(variance);
    expect(mean).toBeGreaterThan(9.8);
    expect(mean).toBeLessThan(10.2);
    expect(stdev).toBeGreaterThan(1.85);
    expect(stdev).toBeLessThan(2.15);
  });

  it('bool(p) fires at approximately rate p', () => {
    const r = createRng(555);
    const n = 20000;
    let hits = 0;
    for (let i = 0; i < n; i++) if (r.bool(0.3)) hits++;
    const rate = hits / n;
    expect(rate).toBeGreaterThan(0.28);
    expect(rate).toBeLessThan(0.32);
  });
});
