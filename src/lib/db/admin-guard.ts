import { NextResponse } from 'next/server';

import { getSupabaseServerClient } from '@/lib/supabase/server-client';

/**
 * T-050 — garde d'accès des routes API du dashboard : session Supabase requise
 * ET e-mail dans la liste des éditeurs autorisés.
 *
 * Liste configurable via la variable d'environnement `ADMIN_EMAILS`
 * (e-mails séparés par des virgules). À défaut, la liste par défaut ci-dessous.
 */
const DEFAULT_ADMIN_EMAILS = [
  'neelshsn@gmail.com',
  'neels@beeyondtheworld.com',
  'client@beeyondtheworld.com',
];

function getAdminEmails(): string[] {
  const raw = process.env.ADMIN_EMAILS;
  if (raw && raw.trim()) {
    return raw
      .split(',')
      .map((email) => email.trim().toLowerCase())
      .filter(Boolean);
  }
  return DEFAULT_ADMIN_EMAILS;
}

export async function requireAdmin(): Promise<NextResponse | null> {
  try {
    const supabase = await getSupabaseServerClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: 'Authentification requise.' }, { status: 401 });
    }

    const email = session.user?.email?.toLowerCase();
    if (!email || !getAdminEmails().includes(email)) {
      return NextResponse.json(
        { error: 'Accès réservé aux éditeurs autorisés (ADMIN_EMAILS).' },
        { status: 403 }
      );
    }

    return null;
  } catch {
    return NextResponse.json({ error: 'Authentification indisponible.' }, { status: 401 });
  }
}
