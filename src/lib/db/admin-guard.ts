import { NextResponse } from 'next/server';

import { getSessionAdmin } from '@/lib/db/admin-auth';

/**
 * T-050 — garde d'accès des routes API du dashboard : session éditeur Neon
 * requise (cookie `bee-admin-session`, comptes `admin_users`).
 * Retourne une réponse 401 si l'appelant n'est pas authentifié, null sinon.
 */
export async function requireAdmin(): Promise<NextResponse | null> {
  try {
    const admin = await getSessionAdmin();
    if (!admin) {
      return NextResponse.json({ error: 'Authentification requise.' }, { status: 401 });
    }
    return null;
  } catch {
    return NextResponse.json({ error: 'Authentification indisponible.' }, { status: 401 });
  }
}
