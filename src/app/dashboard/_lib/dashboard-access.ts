export type DashboardFallback =
  { kind: 'signed-out' } | { kind: 'ecosystem'; scope: 'studio' | 'demo' } | { kind: 'unassigned' };

type Fetcher = (input: string, init?: RequestInit) => Promise<Pick<Response, 'ok' | 'json'>>;

export async function resolveDashboardFallback(fetcher: Fetcher): Promise<DashboardFallback> {
  const auth = await fetcher('/api/community/auth', { cache: 'no-store' })
    .then((result) => result.json())
    .catch(() => ({ user: null }));
  if (!auth.user) return { kind: 'signed-out' };

  for (const scope of ['studio', 'demo'] as const) {
    const ecosystem = await fetcher(`/api/community/ecosystem?scope=${scope}`, {
      cache: 'no-store',
    }).catch(() => null);
    if (ecosystem?.ok) return { kind: 'ecosystem', scope };
  }
  return { kind: 'unassigned' };
}
