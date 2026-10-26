import { describe, expect, it } from 'vitest';
import { pages, roleKey, utilityPages } from '@/lib/community/horizon';
import type { Workspace } from '@/lib/community/types';
import {
  dashboardProgress,
  dashboardProjectArtwork,
  projectDate,
  projectRoleLabel,
  visibleDashboardStages,
} from './dashboard-model';

function workspace(role: Workspace['project']['role']): Workspace {
  return {
    user: {
      id: 'user-1',
      email: 'private@example.invalid',
      name: 'Private fixture',
      organization: 'Dashboard test',
      is_test: true,
    },
    projects: [
      {
        id: 'project-1',
        title: 'Fixture journey',
        territory: 'Morocco',
        season: 'Spring Summer',
        starts_on: '2026-10-01',
        ends_on: '2026-10-04',
        is_demo: true,
        role,
      },
    ],
    project: {
      id: 'project-1',
      title: 'Fixture journey',
      territory: 'Morocco',
      season: 'Spring Summer',
      starts_on: '2026-10-01',
      ends_on: '2026-10-04',
      is_demo: true,
      role,
    },
    records: [
      {
        id: 'record-1',
        project_id: 'project-1',
        kind: 'horizon:brief-scope',
        title: 'Scope',
        status: 'approved',
        data: {},
        organization: 'Dashboard test',
        created_by: 'user-1',
        version: 1,
        created_at: '2026-10-01T00:00:00Z',
        updated_at: '2026-10-01T00:00:00Z',
      },
    ],
    members: [],
    events: [],
  };
}

describe('dashboard stage projection', () => {
  it('derives visible steps from the canonical Horizon role matrix', () => {
    const fixture = workspace('brand');
    const stages = visibleDashboardStages(fixture);
    const expected = pages.filter(
      (page) =>
        !utilityPages.includes(page.id) && Boolean(page.roles[roleKey(fixture.project.role)])
    );

    expect(stages.reduce((sum, stage) => sum + stage.total, 0)).toBe(expected.length);
    expect(stages.every((stage) => stage.total > 0)).toBe(true);
  });

  it('counts only records already projected into the authenticated workspace', () => {
    const stages = visibleDashboardStages(workspace('bee'));
    expect(dashboardProgress(stages)).toMatchObject({ started: 1, documented: 1 });
  });

  it('uses stable English presentation labels without changing canonical permissions', () => {
    const stages = visibleDashboardStages(workspace('bee'));
    expect(stages.find((stage) => stage.id === 'trust')?.title).toBe('Trust');
    expect(stages.some((stage) => stage.title === 'Confiance')).toBe(false);
  });

  it('uses the canonical role label', () => {
    expect(projectRoleLabel(workspace('production').project)).toBe('Production director');
  });

  it('formats nullable and partial project dates without throwing', () => {
    expect(projectDate(null, undefined)).toBe('');
    expect(projectDate('2026-10-01T12:30:00Z', null)).toBe('1 Oct 2026');
    expect(projectDate(undefined, '2026-10-04')).toBe('4 Oct 2026');
    expect(projectDate('not-a-date', '2026-02-30')).toBe('');
    expect(projectDate('2026-10-01', '2026-10-04')).toBe('1 Oct 2026 — 4 Oct 2026');
  });

  it('uses Namibia artwork instead of the Morocco fallback', () => {
    expect(
      dashboardProjectArtwork({ id: 'namibia-demo', territory: 'Namib Desert · Namibia' })
    ).toBe('/assets/community/namibia.webp');
    expect(dashboardProjectArtwork({ id: 'morocco-demo', territory: 'Morocco' })).toContain(
      'morocco'
    );
  });
});
