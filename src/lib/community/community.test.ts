import { describe, it, expect } from 'vitest';
import { canRead, canEdit, availableTransitions, validateFields } from './model';
import { calculateMetrics } from './metrics';
import { transitionError } from './rules';
import type { CommunityRecord, Workspace } from './types';
const user = { id: 'ngo-1', organization: 'Partner One' };
const record = (extra: Partial<CommunityRecord>): CommunityRecord => ({
  id: 'one',
  project_id: 'p1',
  kind: 'evidence',
  title: 'Proof',
  status: 'draft',
  organization: 'Partner One',
  created_by: 'ngo-1',
  version: 1,
  data: {},
  created_at: '',
  updated_at: '',
  ...extra,
});
describe('Community project visibility', () => {
  it('hides creative and production capital from NGO users, even in their project', () => {
    for (const layer of ['Creative', 'Production', 'Bee operations'])
      expect(
        canRead(
          'ngo',
          record({ kind: 'allocation', data: { layer, partner: 'Partner One' } }),
          user
        )
      ).toBe(false);
    expect(
      canRead(
        'ngo',
        record({ kind: 'allocation', data: { layer: 'Impact', partner: 'Partner One' } }),
        user
      )
    ).toBe(true);
  });
  it('does not leak another partner allocation, trust documents or expenses', () => {
    expect(
      canRead(
        'ngo',
        record({ kind: 'allocation', data: { layer: 'Impact', partner: 'Partner Two' } }),
        user
      )
    ).toBe(false);
    for (const kind of ['trust', 'expense', 'evidence'])
      expect(canRead('ngo', record({ kind, organization: 'Partner Two' }), user)).toBe(false);
    expect(canRead('brand', record({ kind: 'trust' }), user)).toBe(false);
    expect(canRead('production', record({ kind: 'expense' }), user)).toBe(false);
  });
  it('shows brands only reviewed evidence and validated indicators', () => {
    expect(canRead('brand', record({ status: 'submitted' }), user)).toBe(false);
    expect(canRead('brand', record({ status: 'bee_reviewed' }), user)).toBe(true);
    expect(canRead('brand', record({ kind: 'result', status: 'draft' }), user)).toBe(false);
  });
  it('limits an expert to specifically assigned records', () => {
    expect(canRead('expert', record({ status: 'bee_reviewed' }), user)).toBe(false);
    expect(canRead('expert', record({ data: { reviewerId: user.id } }), user)).toBe(true);
  });
});
describe('Community workflow integrity', () => {
  it('prevents partner self-validation and edits after submission', () => {
    const r = record({ status: 'submitted' });
    expect(availableTransitions('ngo', r, user)).toEqual([]);
    expect(canEdit('ngo', r, user)).toBe(false);
    expect(availableTransitions('bee', r, user)).not.toContainEqual(
      expect.objectContaining({ to: 'bee_reviewed' })
    );
  });
  it('requires evidence for an external result and expert review where requested', () => {
    const r = record({
      kind: 'result',
      data: { evidenceId: 'ev', actionId: 'a', expertRequired: 'Yes', actual: 12 },
    });
    const w = {
      records: [record({ id: 'ev', status: 'bee_reviewed', data: { actionId: 'a' } })],
    } as Workspace;
    expect(transitionError(r, 'validated', w)).toMatch(/Expert/);
    w.records[0].status = 'expert_validated';
    expect(transitionError(r, 'validated', w)).toBe(null);
    w.records[0].data.actionId = 'wrong';
    expect(transitionError(r, 'validated', w)).toMatch(/same action/);
  });
  it('rejects source links that could execute script', () => {
    const input = {
      actionId: 'a',
      observed: '2026-10-09',
      location: 'Field',
      description: 'Proof',
      method: 'Photo',
      reference: 'javascript:alert(1)',
    };
    expect(validateFields('evidence', input).error).toMatch(/HTTPS/);
  });
  it('counts only approved bookings and keeps impact separate from footprint', () => {
    const rs = [
      record({
        kind: 'booking',
        status: 'approved',
        data: { quantity: 1000, factorKey: 'shared_van' },
      }),
      record({
        kind: 'booking',
        status: 'draft',
        data: { quantity: 9000, factorKey: 'shared_van' },
      }),
      record({
        kind: 'result',
        status: 'validated',
        data: { actual: 9999, pillar: 'Environmental' },
      }),
    ];
    expect(calculateMetrics(rs).footprint).toBe(90);
  });
  it('does not invent full evidence coverage for zero spend', () =>
    expect(calculateMetrics([]).coverage).toBe(null));
  it('keeps unestimated activities out of the measured footprint coverage', () => {
    const metrics = calculateMetrics([
      record({
        kind: 'booking',
        status: 'approved',
        data: { quantity: 100, factorKey: 'shared_van' },
      }),
      record({
        kind: 'booking',
        status: 'approved',
        data: { quantity: 0, factorKey: 'not_estimated' },
      }),
    ]);
    expect(metrics.footprint).toBe(9);
    expect(metrics.estimatedBookings).toBe(1);
    expect(metrics.unestimatedBookings).toBe(1);
    expect(metrics.bookings).toBe(2);
  });
  it('allows explicitly unestimated bookings but rejects a missing activity quantity for a factor', () => {
    const r = record({
      kind: 'booking',
      data: {
        category: 'Production',
        locationId: 'place',
        charter: 'Yes',
        agreement: 'SIM-01',
        quantity: 0,
        factorKey: 'not_estimated',
      },
    });
    const w = {
      records: [record({ id: 'place', kind: 'studio:place', status: 'approved' })],
    } as Workspace;
    expect(transitionError(r, 'submitted', w)).toBe(null);
    r.data.factorKey = 'local_equipment';
    expect(transitionError(r, 'submitted', w)).toMatch(/quantity/);
  });
  it('saves catalogue fields without predefined options as free text', () => {
    expect(
      validateFields('horizon:brief-people', {
        'brief-people-0': 1,
        'brief-people-1': 'Adult woman',
        'brief-people-2': 'Adults',
      }).error
    ).toBeUndefined();
    expect(validateFields('horizon:invite', { 'invite-2': 'Unknown option' }).error).toMatch(
      /Availability/
    );
  });
  it('checks supporting documents when moving an expense to evidenced', () => {
    expect(
      transitionError(record({ kind: 'expense' }), 'evidenced', {
        records: [],
      } as unknown as Workspace)
    ).toMatch(/Attach/);
  });
});
