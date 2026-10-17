import { describe, expect, it } from 'vitest';
import {
  initialProposal,
  mutateProposal,
  M,
  type ProposalState,
} from '../src/lib/community/proposal';
import type { Member, Project } from '../src/lib/community/types';
const members: Member[] = [
  { id: 'art-id', name: 'Art', role: 'art_director', organization: 'Bee' },
  { id: 'photo-id', name: 'Photo', role: 'photographer', organization: 'Bee' },
];
const project = { title: 'A real production', territory: 'Namibia', is_demo: false } as Project;
const ready = () => {
  const s: ProposalState = {
    ...initialProposal(project),
    'tale-brand': 'Brand',
    'tale-intention': 'Intent',
    'tale-scout': true,
    'tale-cost': true,
  };
  for (const p of M.poles) {
    s['da-owner-' + p.id] = 'art-id';
    s['da-content-' + p.id] = 'A contribution';
    s['da-evidence-' + p.id] = 'Reference';
    s['da-status-' + p.id] = 'Approved for proposal';
  }
  return s;
};
describe('Community shared proposal permissions and review cycle', () => {
  it('does not seed fictional claims into real projects', () => {
    const s = initialProposal(project);
    expect(s['tale-brand']).toBe('');
    expect(s['tale-intention']).toBe('');
    expect(s['tale-title']).toBe(project.title);
  });
  it('rejects arbitrary state and forged approvals', () => {
    const s = ready();
    for (const key of [
      'da-bee-approved',
      'da-brand-approved',
      'da-upload-cover',
      '__proto__',
      'da-status-photo',
    ])
      expect(
        mutateProposal(
          s,
          { action: 'edit', fields: { [key]: 'approved' } },
          'bee',
          members,
          'art-id'
        )
      ).toMatch(/Unknown/);
  });
  it('reserves budget confirmation for Bee', () => {
    const s = ready();
    expect(
      mutateProposal(s, { action: 'edit', fields: { 'tale-cost': true } }, 'art', members, 'art-id')
    ).toMatch(/reserved/);
  });
  it('assigns only an actual member in the correct pole', () => {
    const s = ready();
    expect(
      mutateProposal(
        s,
        { action: 'edit', fields: { 'da-owner-photo': 'outside' } },
        'art',
        members,
        'art-id'
      )
    ).toMatch(/project member/);
    expect(
      mutateProposal(
        s,
        { action: 'edit', fields: { 'da-owner-photo': 'photo-id' } },
        'art',
        members,
        'art-id'
      )
    ).toBeNull();
  });
  it('does not allow contributors to reassign their head', () => {
    expect(
      mutateProposal(
        ready(),
        { action: 'edit', fields: { 'da-head-photo': 'photo' } },
        'photo',
        members,
        'photo-id'
      )
    ).toMatch(/reserved/);
  });
  it('prevents another contributor from submitting the assigned work', () => {
    const s = ready();
    s['da-owner-photo'] = 'photo-id';
    s['da-status-photo'] = 'Draft';
    expect(
      mutateProposal(s, { action: 'task-submit', pole: 'photo' }, 'photo', members, 'another-id')
    ).toMatch(/assigned contributor/);
  });
  it('rejects undefined task or decision actions', () => {
    expect(
      mutateProposal(ready(), { action: 'task-hack', pole: 'photo' }, 'bee', members, 'art-id')
    ).toMatch(/Unknown/);
    expect(mutateProposal(ready(), { action: 'proposal-hack' }, 'bee', members, 'art-id')).toMatch(
      /Unknown/
    );
  });
  it('requires head review, then Bee, then brand and preserves the decision note', () => {
    const s = ready();
    expect(mutateProposal(s, { action: 'proposal-brand' }, 'brand', members, 'art-id')).toMatch(
      /follows Bee/
    );
    expect(mutateProposal(s, { action: 'proposal-submit' }, 'art', members, 'art-id')).toBeNull();
    expect(mutateProposal(s, { action: 'proposal-bee' }, 'bee', members, 'art-id')).toBeNull();
    expect(
      mutateProposal(
        s,
        { action: 'edit', fields: { 'da-review-note': 'Please adjust chapter two.' } },
        'brand',
        members,
        'art-id'
      )
    ).toBeNull();
    expect(s['da-bee-approved']).toBe(true);
    expect(mutateProposal(s, { action: 'proposal-return' }, 'brand', members, 'art-id')).toBeNull();
    expect(s['da-bee-approved']).toBe(false);
    expect(s['da-revision']).toBe(2);
  });
  it('reopens an approved revision when a source or image changes', () => {
    const s = ready();
    s['da-brand-approved'] = true;
    s['da-bee-approved'] = true;
    expect(
      mutateProposal(
        s,
        { action: 'image', key: 'cover', asset: 'm:craft' },
        'art',
        members,
        'art-id'
      )
    ).toBeNull();
    expect(s['da-brand-approved']).toBe(false);
    s['da-brand-approved'] = true;
    expect(
      mutateProposal(
        s,
        { action: 'edit', fields: { 'sound-brief-0': 'New musical direction' } },
        'sound',
        members,
        'sound-id'
      )
    ).toBeNull();
    expect(s['da-status-sound']).toBe('Draft');
    expect(s['da-brand-approved']).toBe(false);
  });
  it('limits chapters, retains order, and rejects arbitrary visual URLs', () => {
    const s = ready();
    for (let i = 0; i < 9; i++)
      expect(mutateProposal(s, { action: 'add-chapter' }, 'art', members, 'art-id')).toBeNull();
    expect(mutateProposal(s, { action: 'add-chapter' }, 'art', members, 'art-id')).toMatch(
      /twelve/
    );
    expect(
      mutateProposal(s, { action: 'move-down', chapter: 0 }, 'art', members, 'art-id')
    ).toBeNull();
    expect((s['da-chapter-order'] as number[]).slice(0, 2)).toEqual([1, 0]);
    expect(
      mutateProposal(
        s,
        { action: 'image', key: 'cover', asset: 'javascript:alert(1)' },
        'art',
        members,
        'art-id'
      )
    ).toMatch(/journey visual/);
  });
});
