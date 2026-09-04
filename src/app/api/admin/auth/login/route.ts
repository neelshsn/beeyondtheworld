import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';

import { adminUsers, getDb } from '@/lib/db';
import {
  ADMIN_SESSION_COOKIE,
  createAdminSession,
  sessionCookieOptions,
  verifyPassword,
} from '@/lib/db/admin-auth';
import { ensureAdminAuthSchema } from '@/lib/db/ensure-admin-auth-schema';
import { rejectCrossSiteWrite } from '@/lib/db/admin-guard';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const denied = rejectCrossSiteWrite(request);
  if (denied) return denied;
  try {
    await ensureAdminAuthSchema();
    const body = (await request.json().catch(() => ({}))) as {
      email?: string;
      password?: string;
    };
    const email = body.email?.trim().toLowerCase() ?? '';
    const password = body.password ?? '';

    const db = getDb();
    const [user] = await db.select().from(adminUsers).where(eq(adminUsers.email, email)).limit(1);

    if (!user || !user.passwordHash || !verifyPassword(password, user.passwordHash)) {
      return NextResponse.json({ error: 'E-mail ou mot de passe incorrect.' }, { status: 401 });
    }

    const session = await createAdminSession(user.id);
    const response = NextResponse.json({ ok: true, email: user.email });
    response.cookies.set(
      ADMIN_SESSION_COOKIE,
      session.token,
      sessionCookieOptions(session.expiresAt)
    );
    return response;
  } catch (error) {
    console.error('Admin login failed:', error);
    return NextResponse.json(
      { error: 'Connexion temporairement impossible. Réessaie dans un instant.' },
      { status: 500 }
    );
  }
}
