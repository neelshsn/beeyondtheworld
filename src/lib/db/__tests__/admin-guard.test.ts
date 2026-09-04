import { afterEach, describe, expect, it, vi } from 'vitest';

import { canonicalAdminOrigin, rejectCrossSiteWrite } from '@/lib/db/admin-guard';

afterEach(() => {
  vi.unstubAllEnvs();
});

function adminRequest(origin: string, url = 'https://attacker.example/api/admin/campaigns') {
  return new Request(url, { headers: { origin } });
}

describe('admin origin guard', () => {
  it('allows only configured application and Vercel origins in production', () => {
    vi.stubEnv('NODE_ENV', 'production');
    vi.stubEnv('VERCEL_ENV', 'production');
    vi.stubEnv('APP_ORIGIN', 'https://beeyondtheworld.com');
    vi.stubEnv('VERCEL_URL', 'beeyondtheworld-git-main-team.vercel.app');
    vi.stubEnv('VERCEL_PROJECT_PRODUCTION_URL', 'beeyondtheworld.vercel.app');

    expect(rejectCrossSiteWrite(adminRequest('https://beeyondtheworld.com'))).toBeNull();
    expect(
      rejectCrossSiteWrite(adminRequest('https://beeyondtheworld-git-main-team.vercel.app'))
    ).toBeNull();
    expect(rejectCrossSiteWrite(adminRequest('https://beeyondtheworld.vercel.app'))).toBeNull();
    expect(rejectCrossSiteWrite(adminRequest('https://attacker.example'))?.status).toBe(403);
  });

  it('does not trust the request host as an allowed production origin', () => {
    vi.stubEnv('NODE_ENV', 'production');
    vi.stubEnv('VERCEL_ENV', 'production');
    vi.stubEnv('APP_ORIGIN', 'https://beeyondtheworld.com');
    vi.stubEnv('VERCEL_URL', 'attacker.example');
    vi.stubEnv('VERCEL_PROJECT_PRODUCTION_URL', 'also-attacker.example');

    const request = adminRequest('https://attacker.example');
    expect(canonicalAdminOrigin(request)).toBe('https://beeyondtheworld.com');
    expect(rejectCrossSiteWrite(request)?.status).toBe(403);
  });
});
