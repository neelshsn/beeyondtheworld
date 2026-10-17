import { describe, it, expect } from 'vitest';
import {
  cleanItem,
  usable,
  canPublish,
  transition,
  type CreativeItem,
} from '../src/lib/creative/model';
const content: CreativeItem = {
  id: 'c',
  scope: 'studio',
  kind: 'content',
  title: 'Local story',
  status: 'curated',
  data: {
    credit: 'Creator',
    rights: 'Public showreel',
    rightsEvidence: 'https://example.com/licence',
    provenance: 'Organic original',
    verification: 'verified',
    mediaId: 'f',
    destinationId: 'd',
  },
  version: 1,
  created_by: 'scout',
  updated_by: 'studio',
  updated_at: '',
};
const place = {
  ...content,
  id: 'd',
  kind: 'destination',
  status: 'feasible',
  data: { feasibilityNote: 'Permits reviewed' },
} as CreativeItem;
describe('creative CRM publication and approvals', () => {
  it('retains an honest source draft without inventing a creator or destination', () => {
    const draft = cleanItem(
      {
        title: 'Archived campaign source',
        data: {
          medium: 'Photo',
          sourceUrl: 'https://drive.google.com/file/d/source/view',
          credit: 'Individual credits to verify',
          creditStatus: 'To verify',
          rights: 'Internal only',
          provenance: 'Unknown',
          referenceUrl: 'https://drive.google.com/drive/folders/source',
          sourceContext: 'Production archive',
          sourceNotes: 'Date and credits need review.',
        },
      },
      'content'
    );
    expect(draft.data.talentId).toBe('');
    expect(draft.data.destinationId).toBe('');
    expect(draft.data.sourceNotes).toBe('Date and credits need review.');
    expect(() =>
      transition({ ...content, ...draft, status: 'draft' }, 'curate', 'curator', [])
    ).toThrow();
  });
  it('blocks external export and publication while credits remain unverified', () => {
    const pending = { ...content, data: { ...content.data, creditStatus: 'To verify' } };
    expect(usable(pending, true)).toBe(false);
    expect(canPublish(pending, [place])).toBe(false);
  });
  it('preserves connected people and rejects malformed references', () => {
    const base = {
      title: 'Historical casting',
      data: {
        intention: 'Source-backed proposals',
        contentIds: [],
        talentIds: ['00000000-0000-4000-8000-000000000001'],
        sourceContext: 'Historical proposal',
      },
    };
    expect(cleanItem(base, 'collection').data.talentIds).toEqual(base.data.talentIds);
    expect(() =>
      cleanItem({ ...base, data: { ...base.data, talentIds: ['not-an-id'] } }, 'collection')
    ).toThrow();
  });
  it('keeps internal-use content out of external portfolios', () =>
    expect(usable({ ...content, data: { ...content.data, rights: 'Internal only' } }, true)).toBe(
      false
    ));
  it('rejects expired permissions', () =>
    expect(
      usable({ ...content, data: { ...content.data, rightsExpiry: '2020-01-01' } }, true)
    ).toBe(false));
  it('requires evidence even for claimed permission', () =>
    expect(usable({ ...content, data: { ...content.data, rightsEvidence: '' } }, true)).toBe(
      false
    ));
  it('requires Bloom feasibility for a public destination', () =>
    expect(canPublish(content, [])).toBe(false));
  it('never certifies AI as organic', () =>
    expect(
      canPublish({ ...content, data: { ...content.data, provenance: 'AI concept' } }, [place])
    ).toBe(false));
  it('allows publication only after every gate', () =>
    expect(canPublish(content, [place])).toBe(true));
  it('reserves feasibility for Bloom / Bee', () => {
    expect(() => transition(place, 'feasible', 'curator', [])).toThrow();
    expect(transition(place, 'feasible', 'production', [])).toBe('feasible');
  });
  it('reserves curation for Studio', () =>
    expect(() => transition(content, 'curate', 'contributor', [])).toThrow());
  it('cannot approve missing selected content', () =>
    expect(() =>
      transition(
        { ...content, kind: 'collection', data: { contentIds: ['c', 'missing'] } },
        'approve',
        'curator',
        [content]
      )
    ).toThrow());
  it('cannot approve an empty selection', () =>
    expect(() =>
      transition({ ...content, kind: 'collection', data: { contentIds: [] } }, 'approve', 'bee', [])
    ).toThrow());
  it('cannot silently reopen a confirmed booking', () =>
    expect(() =>
      transition({ ...content, kind: 'activation', status: 'confirmed' }, 'reopen', 'bee', [])
    ).toThrow());
  it('rejects unsafe sources', () =>
    expect(() =>
      cleanItem(
        {
          title: 'A scout',
          data: { discipline: 'Local scout', owner: 'Studio', portfolio: 'javascript:alert(1)' },
        },
        'talent'
      )
    ).toThrow());
  it('requires owner and dated next action', () =>
    expect(() =>
      cleanItem(
        {
          title: 'A scout',
          data: { discipline: 'Local scout', owner: 'Studio', nextAction: 'Call' },
        },
        'talent'
      )
    ).toThrow());
  it('discards client-injected verification', () =>
    expect(
      cleanItem(
        {
          title: 'A place',
          data: { country: 'Morocco', territory: 'Atlas', verification: 'verified' },
        },
        'destination'
      ).data.verification
    ).toBeUndefined());
});
