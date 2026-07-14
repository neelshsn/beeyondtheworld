import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';

import { count, eq, lt } from 'drizzle-orm';
import { cookies } from 'next/headers';

import { adminSessions, adminUsers, getDb, type AdminUserRow } from '@/lib/db';

/**
 * T-050 — auth du dashboard 100 % Neon (même base que le CMS) :
 * comptes `admin_users` (scrypt) + sessions `admin_sessions` en cookie httpOnly.
 * Bootstrap : tant qu'aucun compte n'existe, le premier peut être créé librement.
 */

export const ADMIN_SESSION_COOKIE = 'bee-admin-session';
const SESSION_DAYS = 30;
const SCRYPT_N = 16384;

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString('hex');
  const hash = scryptSync(password, salt, 64, { N: SCRYPT_N }).toString('hex');
  return `scrypt$${SCRYPT_N}$${salt}$${hash}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [scheme, nRaw, salt, hash] = stored.split('$');
  if (scheme !== 'scrypt' || !nRaw || !salt || !hash) return false;
  const derived = scryptSync(password, salt, 64, { N: Number(nRaw) });
  const expected = Buffer.from(hash, 'hex');
  return derived.length === expected.length && timingSafeEqual(derived, expected);
}

export async function adminCount(): Promise<number> {
  const db = getDb();
  const [row] = await db.select({ value: count() }).from(adminUsers);
  return row?.value ?? 0;
}

/**
 * Active un compte invité : consomme le token à usage unique et enregistre
 * le mot de passe choisi par l'invité. Retourne le compte activé, ou null si
 * le token est invalide/déjà utilisé.
 */
export async function activateInvitedAdmin(
  token: string,
  password: string
): Promise<AdminUserRow | null> {
  const db = getDb();
  const [updated] = await db
    .update(adminUsers)
    .set({ passwordHash: hashPassword(password), setupToken: null })
    .where(eq(adminUsers.setupToken, token))
    .returning();
  return updated ?? null;
}

export async function createAdminSession(adminUserId: number): Promise<{
  token: string;
  expiresAt: Date;
}> {
  const db = getDb();
  const token = randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);
  // Nettoyage opportuniste des sessions expirées.
  await db.delete(adminSessions).where(lt(adminSessions.expiresAt, new Date()));
  await db.insert(adminSessions).values({ token, adminUserId, expiresAt });
  return { token, expiresAt };
}

export async function deleteAdminSession(token: string): Promise<void> {
  const db = getDb();
  await db.delete(adminSessions).where(eq(adminSessions.token, token));
}

/** Retourne l'éditeur connecté (via le cookie de session), ou null. */
export async function getSessionAdmin(): Promise<AdminUserRow | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;
  if (!token) return null;

  const db = getDb();
  const [row] = await db
    .select({ user: adminUsers, expiresAt: adminSessions.expiresAt })
    .from(adminSessions)
    .innerJoin(adminUsers, eq(adminSessions.adminUserId, adminUsers.id))
    .where(eq(adminSessions.token, token))
    .limit(1);

  if (!row || row.expiresAt.getTime() < Date.now()) return null;
  return row.user;
}

export function sessionCookieOptions(expiresAt: Date) {
  return {
    httpOnly: true,
    sameSite: 'lax' as const,
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    expires: expiresAt,
  };
}
