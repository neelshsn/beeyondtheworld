import { describe, expect, it } from 'vitest';
import { createRequire } from 'node:module';
const model = createRequire(import.meta.url)('../public/review/label-model.js');
const metric = model.metrics.find((m: { id: string }) => m.id === 'natural-beauty');

describe('shared label measurements and evidence', () => {
  it('counts each criterion once across both Hives', () => {
    expect(new Set(model.metrics.map((m: { id: string }) => m.id)).size).toBe(37);
    expect(model.summary({}, 'creative').total + model.summary({}, 'bloom').total).toBe(37);
    expect(model.summary({}).documented).toBe(0);
  });
  it.each([null, '', -1, NaN, Infinity, 'wrong'])(
    'does not treat invalid input %s as a measurement',
    (n) => {
      expect(model.measure(metric, { 'em-natural-beauty-n': n }).value).toBeNull();
    }
  );
  it('distinguishes an observed zero from missing data and rejects invalid denominators', () => {
    expect(model.measure(metric, { 'em-natural-beauty-n': 0 }).value).toBe(0);
    expect(model.measure(metric, { 'em-natural-beauty-d': 0 }).valid).toBe(false);
    expect(model.measure(metric, { 'em-natural-beauty-n': 6 }).valid).toBe(false);
  });
  it('uses the same edited quantity in the register and both consolidation summaries', () => {
    const state = {
      'em-natural-beauty-n': 3,
      'em-natural-beauty-d': 5,
      'em-natural-beauty-ref': 'EXERCISE / product register',
    };
    expect(model.measure(metric, state).value).toBe(0.6);
    expect(model.summary(state, 'creative').documented).toBe(1);
    expect(model.summary(state).documented).toBe(1);
    expect(model.summary(state, 'bloom').documented).toBe(0);
  });
  it('requires proof, review, decision and independent review for elevated risk', () => {
    const state = {
      'em-natural-beauty-n': 3,
      'em-natural-beauty-ref': 'EXERCISE / batch record',
      'em-natural-beauty-review': 'Reviewed in exercise',
      'em-natural-beauty-decision': 'Accepted in exercise',
    };
    expect(model.evidence(metric, state).accepted).toBe(false);
    expect(
      model.evidence(metric, { ...state, 'em-natural-beauty-independent': true }).accepted
    ).toBe(true);
    expect(
      model.evidence(metric, {
        ...state,
        'em-natural-beauty-independent': true,
        'em-natural-beauty-ref': '',
      }).accepted
    ).toBe(false);
    expect(model.summary({ ...state, 'em-natural-beauty-independent': true })).toMatchObject({
      accepted: 1,
      certified: false,
      score: null,
    });
  });
});
