import { NextResponse } from 'next/server';

import { getSupabaseServerClient } from '@/lib/supabase/server-client';

/**
 * T-050 — garde d'accès des routes API du dashboard : session Supabase requise.
 * Retourne une réponse 401 si l'appelant n'est pas authentifié, null sinon.
 */
export async function requireAdmin(): Promise<NextResponse | null> {
  try {
    const supabase = await getSupabaseServerClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: 'Authentification requise.' }, { status: 401 });
    }

    return null;
  } catch {
    return NextResponse.json({ error: 'Authentification indisponible.' }, { status: 401 });
  }
}
