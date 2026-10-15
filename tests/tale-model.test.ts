import { describe, expect, it } from 'vitest';
import { createRequire } from 'node:module';
const M = createRequire(import.meta.url)('../public/review/tale-model.js');
type State = Record<string, unknown>;
const ready = (): State => {
  const s: State = { 'tale-scout': true, 'tale-cost': true };
  for (const p of M.poles) {
    s['da-owner-' + p.id] = 'Example contributor';
    s['da-content-' + p.id] = 'Draft direction';
    s['da-evidence-' + p.id] = 'CM-CH01';
    s['da-status-' + p.id] = 'Approved for proposal';
  }
  return s;
};
describe('proposal contributions and revision control', () => {
  it('requires a real contribution before head review', () => {
    const s: State = {};
    expect(M.transition(s, 'beauty', 'submit', 'beauty')).toMatch(/assignee/);
    expect(M.transition(s, 'beauty', 'approve', 'art')).toMatch(/submitted/);
    expect(M.task(s, 'beauty').status).toBe('Draft');
  });
  it('routes a contribution to its assigned head with actionable change requests', () => {
    const s: State = {
      'da-owner-beauty': 'Example',
      'da-content-beauty': 'Mineral palette',
      'da-evidence-beauty': 'CM-L01',
      'da-head-beauty': 'art',
    };
    expect(M.transition(s, 'beauty', 'submit', 'sound')).toMatch(/contributor/);
    expect(M.transition(s, 'beauty', 'submit', 'beauty')).toBeNull();
    expect(M.transition(s, 'beauty', 'approve', 'beauty')).toMatch(/assigned head/);
    expect(M.transition(s, 'beauty', 'return', 'art')).toMatch(/revision request/);
    M.edit(s, 'da-feedback-beauty', 'Document pigment origins.');
    expect(M.transition(s, 'beauty', 'return', 'art')).toBeNull();
    expect(M.task(s, 'beauty').status).toBe('Changes requested');
    M.edit(s, 'da-content-beauty', 'Palette with origin register.');
    expect(M.transition(s, 'beauty', 'submit', 'beauty')).toBeNull();
    expect(M.transition(s, 'beauty', 'approve', 'art')).toBeNull();
    expect(M.task(s, 'beauty').status).toBe('Approved for proposal');
  });
  it('requires complete head reviews and Bee before the brand', () => {
    const s = ready();
    expect(M.decide(s, 'brand', 'brand')).toMatch(/Bee approval/);
    expect(M.decide(s, 'bee', 'bee')).toMatch(/submitted/);
    expect(M.decide(s, 'submit', 'art')).toBeNull();
    expect(M.decide(s, 'bee', 'art')).toMatch(/Bee reviews/);
    expect(M.decide(s, 'bee', 'bee')).toBeNull();
    expect(M.decide(s, 'brand', 'brand')).toBeNull();
    expect(s['da-brand-approved']).toBe(true);
    M.edit(s, 'tale-title', 'A revised story');
    expect(s['da-brand-approved']).toBe(false);
    expect(s['da-bee-approved']).toBe(false);
    expect(s['da-revision']).toBe(2);
    M.edit(s, 'tale-title', 'A revised story in light');
    expect(s['da-revision']).toBe(2);
  });
  it('reopens a reviewed specialty when its connected source changes', () => {
    const s = ready();
    M.decide(s, 'submit', 'art');
    M.decide(s, 'bee', 'bee');
    M.sourceChanged(s, 'sound-brief-0');
    expect(M.task(s, 'sound').status).toBe('Draft');
    expect(M.blockers(s)).toContain('Sound awaits head review');
    expect(s['da-bee-approved']).toBe(false);
  });
  it('blocks an incomplete or empty proposal without inventing approvals', () => {
    const s = ready();
    s['tale-title'] = '';
    s['tale-cost'] = false;
    expect(M.blockers(s)).toContain('Title is missing');
    expect(M.blockers(s)).toContain('Budget awaits Bee review');
    expect(M.decide(s, 'submit', 'art')).not.toBeNull();
    expect(s['da-proposal-submitted']).not.toBe(true);
  });
});
