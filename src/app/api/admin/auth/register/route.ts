import { timingSafeEqual } from 'node:crypto';

import { NextResponse } from 'next/server';

import { adminUsers, getDb } from '@/lib/db';
import {
  ADMIN_SESSION_COOKIE,
  adminCount,
  createAdminSession,
  getSessionAdmin,
  hashPassword,
  sessionCookieOptions,
} from '@/lib/db/admin-auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_MIN_LENGTH = 8;

function validBootstrapToken(candidate: string): boolean {
  if (process.env.NODE_ENV !== 'production') return true;
  const expected = process.env.ADMIN_BOOTSTRAP_TOKEN;
  if (!expected || !candidate || expected.length !== candidate.length) return false;
  return timingSafeEqual(Buffer.from(candidate), Buffer.from(expected));
}

/**
 * Création de compte éditeur :
 * - si AUCUN compte n'existe → bootstrap libre (premier compte) ;
 * - sinon → réservé à un éditeur déjà connecté (ajout de collègues).
 */
export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => ({}))) as {
      email?: string;
      password?: string;
      bootstrapToken?: string;
    };
    const email = body.email?.trim().toLowerCase() ?? '';
    const password = body.password ?? '';

    if (!EMAIL_PATTERN.test(email)) {
      return NextResponse.json({ error: 'E-mail invalide.' }, { status: 400 });
    }
    if (password.length < PASSWORD_MIN_LENGTH) {
      return NextResponse.json(
        { error: `Mot de passe trop court (minimum ${PASSWORD_MIN_LENGTH} caractères).` },
        { status: 400 }
      );
    }

    const total = await adminCount();
    if (total === 0 && !validBootstrapToken(body.bootstrapToken ?? '')) {
      return NextResponse.json(
        { error: 'Le code de bootstrap administrateur est requis.' },
        { status: 403 }
      );
    }
    if (total > 0) {
      const requester = await getSessionAdmin();
      if (!requester) {
        return NextResponse.json(
          { error: 'Un compte existe déjà — seul un éditeur connecté peut en créer un autre.' },
          { status: 403 }
        );
      }
    }

    const db = getDb();
    const [created] = await db
      .insert(adminUsers)
      .values({ email, passwordHash: hashPassword(password) })
      .onConflictDoNothing({ target: adminUsers.email })
      .returning();

    if (!created) {
      return NextResponse.json({ error: 'Cet e-mail a déjà un compte.' }, { status: 409 });
    }

    const session = await createAdminSession(created.id);
    const response = NextResponse.json({ ok: true, email: created.email }, { status: 201 });
    response.cookies.set(
      ADMIN_SESSION_COOKIE,
      session.token,
      sessionCookieOptions(session.expiresAt)
    );
    return response;
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Création impossible.' },
      { status: 500 }
    );
  }
}
