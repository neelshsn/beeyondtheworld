import { describe, it, expect } from 'vitest';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const calc = require('../public/review/review-metrics.js');
describe('review scenario calculations', () => {
  it('preserves missing inputs and zero outcomes', () => {
    expect(calc.ratio('', 10)).toBeNull();
    expect(calc.ratio(0, 10)).toBe(0);
    expect(calc.ratio(10, 0)).toBeNull();
  });
  it('keeps impact separate from the local production numerator', () => {
    const r = calc.ledger([
      { id: 'p1', bucket: 'production', amount: 100, local: true },
      { id: 'p2', bucket: 'production', amount: 50, local: false },
      { id: 'i1', bucket: 'impact', amount: 200, local: true },
    ]);
    expect(r.total).toBe(350);
    expect(r.local).toBe(100);
    expect(r.production).toBe(150);
    expect(r.localShare).toBeCloseTo(2 / 3);
  });
  it('rejects duplicate capital and invalid amounts', () => {
    expect(() =>
      calc.ledger([
        { id: 'a', amount: 1 },
        { id: 'a', amount: 2 },
      ])
    ).toThrow();
    expect(() => calc.ledger([{ id: 'a', amount: -1 }])).toThrow();
  });
  it('requires a comparable carbon scope and positive baseline', () => {
    expect(calc.carbon('', 100, 1)).toBeNull();
    expect(calc.carbon(20, 100, 0.8)).toBeNull();
    expect(calc.carbon(20, 0, 1)).toBeNull();
    expect(calc.carbon(20, 100, 1)).toBe(0.8);
    expect(calc.carbon(120, 100, 1)).toBe(-0.2);
  });
  it('reconciles brand attribution without claiming causal ownership', () => {
    const result = calc.attribution(40, [2000, 3000, 5000]);
    expect(result).toEqual([8, 12, 20]);
    expect(result.reduce((a: number, b: number) => a + b, 0)).toBe(40);
    expect(calc.attribution(40, [0, 0])).toBeNull();
    expect(calc.attribution('', [100])).toBeNull();
  });
  it('never certifies an AI concept or infers certification from checkboxes', () => {
    const complete = {
      origin: 'ai',
      original: true,
      rights: true,
      consent: true,
      reviewer: true,
      certificate: true,
    };
    expect(calc.authenticator(complete).eligible).toBe(false);
    expect(calc.authenticator({ ...complete, origin: 'original' }).status).toContain(
      'final decision required'
    );
    expect(calc.authenticator({ ...complete, origin: 'unknown' }).eligible).toBe(false);
  });
});
