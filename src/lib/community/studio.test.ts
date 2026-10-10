import { describe, it, expect } from 'vitest';
import { studioMutationError, studioTransitionError } from './studio';
import { canEdit, availableTransitions, validateFields } from './model';
import type { CommunityRecord, Workspace } from './types';
const user = { id: 'stylist-1', organization: 'Production' };
const frame = {
  id: 'frame-1',
  kind: 'studio:frame',
  created_by: 'bee-1',
  status: 'draft',
  data: { placeId: 'place-1' },
  project_id: 'project-1',
  title: 'Frame 01',
  organization: 'Production',
  version: 1,
  created_at: '2026-10-10',
  updated_at: '2026-10-10',
} as CommunityRecord;
const workspace = (role = 'stylist', status = 'draft') =>
  ({
    user,
    project: { role },
    records: [
      { ...frame, status },
      { id: 'place-1', kind: 'studio:place', data: {} },
    ],
  }) as unknown as Workspace;
describe('source-based studio boundaries', () => {
  it('keeps reference assignments in the accessible project', () => {
    expect(
      studioMutationError(
        'studio:reference',
        { frameId: 'another-project-frame', category: 'look' },
        workspace()
      )
    ).toBeTruthy();
  });
  it('allows a stylist to assign a look to an open frame', () => {
    expect(
      studioMutationError('studio:reference', { frameId: 'frame-1', category: 'look' }, workspace())
    ).toBeNull();
  });
  it('requires reopening reviewed frames before changing references', () => {
    for (const state of ['submitted', 'brand_review', 'approved'])
      expect(
        studioMutationError(
          'studio:reference',
          { frameId: 'frame-1', category: 'look' },
          workspace('stylist', state)
        )
      ).toBeTruthy();
  });
  it('keeps beauty references within their production discipline', () => {
    expect(
      studioMutationError(
        'studio:reference',
        { frameId: 'frame-1', category: 'beauty' },
        workspace()
      )
    ).toBeTruthy();
    expect(
      studioMutationError(
        'studio:reference',
        { frameId: 'frame-1', category: 'beauty' },
        workspace('beauty')
      )
    ).toBeNull();
  });
  it('requires Bee before brand approval of a frame', () => {
    expect(availableTransitions('brand', { ...frame, status: 'submitted' }, user)).toEqual([]);
    expect(
      availableTransitions('bee', { ...frame, status: 'submitted' }, user).map((t) => t.to)
    ).toContain('brand_review');
    expect(
      availableTransitions('brand', { ...frame, status: 'brand_review' }, user).map((t) => t.to)
    ).toContain('approved');
  });
  it('requires a location before submitting a frame', () => {
    expect(studioTransitionError({ ...frame, data: {} }, 'submitted', workspace())).toBeTruthy();
  });
  it('locks look edits after approval', () => {
    expect(canEdit('stylist', { ...frame, kind: 'studio:look', status: 'approved' }, user)).toBe(
      false
    );
  });
  it('validates GPS ranges and retains relational identifiers', () => {
    expect(validateFields('studio:place', { latitude: 95 }).error).toBeTruthy();
    expect(
      validateFields('studio:reference', { frameId: 'frame-1', category: 'look', lookId: 'look-1' })
        .data.lookId
    ).toBe('look-1');
  });
  it('does not allow moving a reference out of a locked frame', () => {
    const w = workspace('stylist', 'approved');
    w.records.push(
      { ...frame, id: 'frame-2', status: 'draft' },
      {
        ...frame,
        id: 'ref-1',
        kind: 'studio:reference',
        data: { frameId: 'frame-1', category: 'look' },
      }
    );
    expect(
      studioMutationError('studio:reference', { frameId: 'frame-2', category: 'look' }, w, 'ref-1')
    ).toBeTruthy();
  });
  it('does not allow moving a product away from a reviewed look', () => {
    const w = workspace('stylist', 'approved');
    w.records.push(
      {
        ...frame,
        id: 'ref-1',
        kind: 'studio:reference',
        data: { frameId: 'frame-1', lookId: 'look-1' },
      },
      { ...frame, id: 'product-1', kind: 'studio:product', data: { lookId: 'look-1' } }
    );
    expect(
      studioMutationError('studio:product', { lookId: 'look-2' }, w, 'product-1')
    ).toBeTruthy();
  });
  it('requires a real member and valid availability range', () => {
    const w = workspace();
    w.members = [{ id: 'member-1', name: 'Member', role: 'stylist', organization: 'Studio' }];
    expect(studioMutationError('studio:availability', { memberId: 'other' }, w)).toBeTruthy();
    expect(
      studioMutationError(
        'studio:availability',
        { memberId: 'member-1', starts: '2026-11-06', ends: '2026-11-02' },
        w
      )
    ).toBeTruthy();
    expect(
      studioMutationError(
        'studio:availability',
        { memberId: 'member-1', starts: '2026-11-02', ends: '2026-11-06' },
        w
      )
    ).toBeNull();
  });
  it('does not accept an itinerary stop from another project', () => {
    expect(
      studioMutationError('studio:route', { stops: 'place-1,other' }, workspace())
    ).toBeTruthy();
  });
});
