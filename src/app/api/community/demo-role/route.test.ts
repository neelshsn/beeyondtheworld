// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from 'vitest';
const mocked = vi.hoisted(() => ({
  currentUser: vi.fn(),
  query: vi.fn(),
  cookies: vi.fn(),
  guard: vi.fn(),
}));
vi.mock('@/lib/community/server', () => ({
  COOKIE: 'bee-community-session',
  currentUser: mocked.currentUser,
  sqlClient: () => ({ query: mocked.query }),
}));
vi.mock('next/headers', () => ({ cookies: mocked.cookies }));
vi.mock('@/lib/db/admin-guard', () => ({ rejectCrossSiteWrite: mocked.guard }));
import { POST } from './route';
const projectId = 'b0000000-0000-4000-8000-000000000001';
const request = (body: unknown) =>
  new Request('http://localhost/api/community/demo-role', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
beforeEach(() => {
  vi.clearAllMocks();
  mocked.currentUser.mockResolvedValue({ id: 'test-user', is_test: true });
  mocked.query.mockResolvedValue([{ id: 'target-test-user' }]);
  mocked.cookies.mockResolvedValue({ get: () => ({ value: 'session-a' }) });
  mocked.guard.mockReturnValue(null);
});
describe('Test role endpoint boundary', () => {
  it('refuses anonymous and real accounts before looking up targets', async () => {
    for (const user of [null, { id: 'real-user', is_test: false }]) {
      mocked.currentUser.mockResolvedValue(user);
      expect((await POST(request({ projectId, role: 'bee' }))).status).toBe(403);
    }
    expect(mocked.query).not.toHaveBeenCalled();
  });
  it('rejects a role without an authorized demo project and test member', async () => {
    mocked.query.mockResolvedValue([]);
    expect((await POST(request({ projectId, role: 'bee' }))).status).toBe(403);
    expect(mocked.query.mock.calls[0][0]).toContain('own.user_id=$1');
    expect(mocked.query.mock.calls[0][0]).toContain('p.is_demo');
    expect(mocked.query.mock.calls[0][0]).toContain('u.is_test AND NOT u.disabled');
  });
  it('returns only a signed HttpOnly choice, never credentials or a different account session', async () => {
    const response = await POST(request({ projectId, role: 'ngo' }));
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ ok: true });
    expect(response.headers.get('set-cookie')).toContain('bee-demo-role=');
    expect(response.headers.get('set-cookie')).toContain('HttpOnly');
    expect(response.headers.get('set-cookie')).not.toContain('bee-community-session=');
  });
  it('rejects malformed input and preserves the cross-site guard', async () => {
    expect((await POST(request({ projectId, role: 'admin' }))).status).toBe(400);
    expect((await POST(request({ projectId: 'other', role: 'bee' }))).status).toBe(400);
    mocked.guard.mockReturnValue(new Response('Forbidden', { status: 403 }));
    expect((await POST(request({ projectId, role: 'bee' }))).status).toBe(403);
  });
});
