import { describe, expect, it, vi } from 'vitest';
import { resolveDashboardFallback } from './dashboard-access';

const response = (body: unknown, ok = true) => ({ ok, json: async () => body });

describe('dashboard identity fallback', () => {
  it('keeps an unauthenticated visitor on the dashboard sign-in surface', async () => {
    const fetcher = vi.fn(async () => response({ user: null }));
    await expect(resolveDashboardFallback(fetcher)).resolves.toEqual({ kind: 'signed-out' });
    expect(fetcher).toHaveBeenCalledTimes(1);
  });

  it('routes an independent demo creator to their ecosystem without project membership', async () => {
    const fetcher = vi
      .fn()
      .mockResolvedValueOnce(response({ user: { id: 'creator' } }))
      .mockResolvedValueOnce(response({ error: 'forbidden' }, false))
      .mockResolvedValueOnce(response({ viewer: { role: 'creator', scope: 'demo' } }));

    await expect(resolveDashboardFallback(fetcher)).resolves.toEqual({
      kind: 'ecosystem',
      scope: 'demo',
    });
    expect(fetcher).toHaveBeenCalledTimes(3);
  });

  it('does not turn an authenticated but unassigned identity into a login loop', async () => {
    const fetcher = vi
      .fn()
      .mockResolvedValueOnce(response({ user: { id: 'unassigned' } }))
      .mockResolvedValue(response({ error: 'forbidden' }, false));

    await expect(resolveDashboardFallback(fetcher)).resolves.toEqual({ kind: 'unassigned' });
  });
});
