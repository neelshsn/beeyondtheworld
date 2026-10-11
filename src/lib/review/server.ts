import 'server-only';
import { createHash } from 'node:crypto';
import { cookies } from 'next/headers';
import { sqlClient } from '@/lib/db/client';
import keys from './screen-keys.json';

export const REVIEW_COOKIE = 'bee-review-access';
export const AUTHORS = { eugenie: 'Eugénie', rachid: 'Rachid' } as const;
export type Author = keyof typeof AUTHORS;
export const privateHeaders = {
  'Cache-Control': 'private, no-store',
  'X-Robots-Tag': 'noindex, nofollow',
  'Referrer-Policy': 'no-referrer',
};
export async function reviewAccess(token?: string): Promise<Author | null> {
  token ??= (await cookies()).get(REVIEW_COOKIE)?.value;
  if (!token || !/^[a-f0-9]{64}$/.test(token)) return null;
  const rows = await sqlClient().query(
    'SELECT author FROM bee_review_access WHERE token_hash=$1 AND expires_at>now() AND revoked_at IS NULL',
    [createHash('sha256').update(token).digest('hex')]
  );
  return rows[0]?.author || null;
}
const screens = new Set(keys);
export function validScreen(role: unknown, page: unknown): boolean {
  return typeof role === 'string' && typeof page === 'string' && screens.has(`${role}/${page}`);
}
