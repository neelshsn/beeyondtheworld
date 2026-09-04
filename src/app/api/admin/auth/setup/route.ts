import { NextResponse } from 'next/server';

import {
  ADMIN_SESSION_COOKIE,
  activateInvitedAdmin,
  createAdminSession,
  sessionCookieOptions,
} from '@/lib/db/admin-auth';
import { rejectCrossSiteWrite } from '@/lib/db/admin-guard';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const PASSWORD_MIN_LENGTH = 8;

/**
 * Activation d'un compte invité : l'invité ouvre son lien
 * /admin#invite=TOKEN et choisit son mot de passe ici.
 * Le token est à usage unique, stocké sous forme de digest et expire après 72 h.
 */
export async function POST(request: Request) {
  const denied = rejectCrossSiteWrite(request);
  if (denied) return denied;
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
        { error: "Ce lien d'invitation est invalide, expiré ou déjà utilisé." },
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
    console.error('Admin invitation activation failed:', error);
    return NextResponse.json(
      { error: 'Activation temporairement impossible. Réessaie dans un instant.' },
      { status: 500 }
    );
  }
}
