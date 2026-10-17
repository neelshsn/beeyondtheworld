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
