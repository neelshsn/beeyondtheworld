import { createHmac, timingSafeEqual } from 'node:crypto';
import { roles, type Role } from './types';

export const DEMO_ROLE_COOKIE = 'bee-demo-role';
// Bound to the authenticated session, never to a client-supplied account identifier.
export function signDemoRole(session: string, project: string, role: Role) {
  const payload = Buffer.from(JSON.stringify({ project, role })).toString('base64url');
  return `${payload}.${createHmac('sha256', session).update(payload).digest('hex')}`;
}
export function readDemoRole(
  value: string | undefined,
  session: string | undefined,
  project: string
): Role | null {
  if (!value || !session || value.length > 512) return null;
  const [payload, signature, extra] = value.split('.');
  if (extra || !/^[a-f0-9]{64}$/.test(signature || '')) return null;
  const expected = createHmac('sha256', session).update(payload).digest();
  if (!timingSafeEqual(expected, Buffer.from(signature, 'hex'))) return null;
  try {
    const data = JSON.parse(Buffer.from(payload, 'base64url').toString());
    return data.project === project && roles.includes(data.role) ? data.role : null;
  } catch {
    return null;
  }
}
