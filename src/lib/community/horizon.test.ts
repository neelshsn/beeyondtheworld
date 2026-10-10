import { describe, it, expect } from 'vitest';
import { canRead, canEdit, availableTransitions, validateFields } from './model';
import { horizonTransitionError, pageKind, pages } from './horizon';
import type { CommunityRecord, Workspace } from './types';
const user = { id: 'reviewer', organization: 'Partner A' };
const r = (page: string, extra: Partial<CommunityRecord> = {}): CommunityRecord => ({
  id: page,
  project_id: 'p',
  kind: pageKind(page),
  title: page,
  status: 'draft',
  data: {},
  organization: 'Partner A',
  created_by: 'author',
  version: 1,
  created_at: '',
  updated_at: '',
  ...extra,
});
const w = (records: CommunityRecord[] = [], role = 'bee') =>
  ({ user, project: { id: 'p', role }, records }) as Workspace;
describe('Horizon production workflow', () => {
  it('covers the 94 approved pages', () => expect(pages).toHaveLength(94));
  it('persists partial drafts but refuses incomplete brief submission', () => {
    expect(
      validateFields(pageKind('brief-message'), { 'brief-message-0': 'Story' }).error
    ).toBeUndefined();
    expect(horizonTransitionError(r('brief-review'), 'submitted', w())).toMatch(/Complete/);
  });
  it('validates choices, quantities and HTTPS source links', () => {
    expect(
      validateFields(pageKind('brief-intention'), { 'brief-intention-0': 'Injected option' }).error
    ).toBeTruthy();
    expect(validateFields(pageKind('brief-people'), { 'brief-people-0': -5 }).error).toBeTruthy();
    expect(
      validateFields(pageKind('version'), { reference: 'javascript:alert(1)' }).error
    ).toBeTruthy();
  });
  it('requires Bee approval before the brand creative decision', () => {
    expect(availableTransitions('brand', r('proposal', { status: 'submitted' }), user)).toEqual([]);
    expect(
      availableTransitions('bee', r('proposal', { status: 'submitted' }), user).map((t) => t.to)
    ).toContain('brand_review');
    expect(
      availableTransitions('brand', r('proposal', { status: 'brand_review' }), user).map(
        (t) => t.to
      )
    ).toContain('approved');
  });
  it('keeps budgets under Bee control and freezes submitted documents', () => {
    expect(availableTransitions('production', r('budget', { status: 'submitted' }), user)).toEqual(
      []
    );
    expect(availableTransitions('brand', r('budget', { status: 'submitted' }), user)).toEqual([]);
    expect(canEdit('bee', r('budget', { status: 'approved' }), user)).toBe(false);
    expect(
      availableTransitions('bee', r('budget', { status: 'submitted' }), user).map((t) => t.to)
    ).toContain('approved');
  });
  it('rejects brand review of a different or outdated version', () => {
    const source = r('version', { id: 'version-2', version: 4 }),
      review = r('brand-review', { data: { sourceId: 'version-2', sourceVersion: 4 } });
    expect(
      horizonTransitionError(
        review,
        'submitted',
        w([
          source,
          r('bee-review', {
            status: 'approved',
            data: { sourceId: 'version-1', sourceVersion: 4 },
          }),
        ])
      )
    ).toMatch(/Bee/);
    expect(
      horizonTransitionError(
        review,
        'submitted',
        w([
          source,
          r('bee-review', {
            status: 'approved',
            data: { sourceId: 'version-2', sourceVersion: 4 },
          }),
        ])
      )
    ).toBeNull();
    expect(
      horizonTransitionError(
        { ...review, data: { sourceId: 'version-2', sourceVersion: 3 } },
        'submitted',
        w([source])
      )
    ).toMatch(/current revision/);
  });
  it('blocks production readiness and delivery without their prerequisites', () => {
    expect(horizonTransitionError(r('ready'), 'approved', w())).toMatch(/Approve/);
    expect(horizonTransitionError(r('delivery'), 'approved', w())).toMatch(/source record/);
  });
  it('isolates local partners, personal talent records and assigned experts', () => {
    expect(canRead('ngo', r('trust-identity', { organization: 'Other partner' }), user)).toBe(
      false
    );
    expect(canRead('model', r('agreements'), user)).toBe(false);
    expect(canRead('expert', r('indicator'), user)).toBe(false);
    expect(canRead('expert', r('indicator', { data: { reviewerId: user.id } }), user)).toBe(true);
  });
  it('requires a scoped independent expert for higher-risk indicators', () => {
    const evidence = r('evidence-add', { id: 'ev', version: 2, status: 'approved' });
    const indicator = r('indicator', {
      id: 'ind',
      data: { sourceId: 'ev', sourceVersion: 2, risk: 'High', indicatorType: 'Public claim' },
      version: 3,
    });
    const wrong = r('expert-review', {
      status: 'expert_validated',
      data: { reviewerId: 'expert', sourceId: 'another', sourceVersion: 3 },
    });
    expect(horizonTransitionError(indicator, 'approved', w([evidence, wrong]))).toMatch(
      /independent expert/
    );
    expect(
      horizonTransitionError(
        indicator,
        'approved',
        w([
          evidence,
          { ...wrong, data: { reviewerId: 'expert', sourceId: 'ind', sourceVersion: 3 } },
        ])
      )
    ).toBeNull();
  });
  it('never allows the indicator author to act as its independent expert', () => {
    const indicator = r('indicator', { id: 'ind', created_by: user.id });
    const expert = r('expert-review', {
      data: { sourceId: 'ind', sourceVersion: 1, reviewerId: user.id },
    });
    expect(horizonTransitionError(expert, 'expert_validated', w([indicator], 'expert'))).toMatch(
      /independent/
    );
  });
  it('connects approved scouting and crew readiness to the production gate', () => {
    const ready = r('ready');
    const data = ['contract', 'travel', 'stay', 'equipment', 'permit', 'brief'].reduce(
      (a, k) => ({ ...a, [k]: 'Ready' }),
      { memberId: 'crew' }
    );
    const snapshot = w([
      r('creative-lock', { status: 'approved' }),
      r('budget', { status: 'approved' }),
      r('location', { kind: 'studio:place', status: 'approved' }),
      r('team', { kind: 'studio:readiness', status: 'approved', data }),
    ]);
    snapshot.members = [{ id: 'crew', name: 'Crew', organization: 'Studio', role: 'photographer' }];
    expect(horizonTransitionError(ready, 'approved', snapshot)).toBeNull();
    snapshot.records.at(-1)!.data.permit = 'Pending';
    expect(horizonTransitionError(ready, 'approved', snapshot)).toMatch(/readiness/);
  });
  it('does not reuse another partner’s trust review', () => {
    expect(
      horizonTransitionError(
        r('trust-verified'),
        'approved',
        w([r('trust-review', { status: 'approved', organization: 'Other' })])
      )
    ).toMatch(/partner/);
  });
});
