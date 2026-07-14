import { NextResponse } from 'next/server';

import {
  ADMIN_SESSION_COOKIE,
  activateInvitedAdmin,
  createAdminSession,
  sessionCookieOptions,
} from '@/lib/db/admin-auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const PASSWORD_MIN_LENGTH = 8;

/**
 * Activation d'un compte invité : l'invité ouvre son lien
 * /admin/journeys?invite=TOKEN et choisit son mot de passe ici.
 * Le token est à usage unique (effacé à l'activation).
 */
export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => ({}))) as {
      token?: string;
      password?: string;
    };
    const token = body.token?.trim() ?? '';
    const password = body.password ?? '';

    if (!token) {
      return NextResponse.json({ error: "Lien d'invitation manquant." }, { status: 400 });
    }
    if (password.length < PASSWORD_MIN_LENGTH) {
      return NextResponse.json(
        { error: `Mot de passe trop court (minimum ${PASSWORD_MIN_LENGTH} caractères).` },
        { status: 400 }
      );
    }

    const activated = await activateInvitedAdmin(token, password);
    if (!activated) {
      return NextResponse.json(
        { error: "Lien d'invitation invalide ou déjà utilisé." },
        { status: 400 }
      );
    }

    const session = await createAdminSession(activated.id);
    const response = NextResponse.json({ ok: true, email: activated.email });
    response.cookies.set(
      ADMIN_SESSION_COOKIE,
      session.token,
      sessionCookieOptions(session.expiresAt)
    );
    return response;
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Activation impossible.' },
      { status: 500 }
    );
  }
}
