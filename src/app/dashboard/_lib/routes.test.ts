import { describe, expect, it } from 'vitest';
import { dashboardProjectHref, dashboardProjectRouteHref, withSearchParams } from './routes';

describe('dashboard routes', () => {
  it('builds a stable project preview route', () => {
    expect(dashboardProjectRouteHref('550e8400-e29b-41d4-a716-446655440000')).toBe(
      '/dashboard/projects/550e8400-e29b-41d4-a716-446655440000#project'
    );
  });

  it('builds a permission-filtered Horizon deep link', () => {
    expect(dashboardProjectHref('project/unsafe', 'brief scope')).toBe(
      '/dashboard?project=project%2Funsafe#brief%20scope'
    );
  });

  it('preserves repeated legacy query parameters', () => {
    expect(
      withSearchParams('/dashboard/ecosystem', { scope: 'demo', tab: ['kits', 'partners'] })
    ).toBe('/dashboard/ecosystem?scope=demo&tab=kits&tab=partners');
  });
});
