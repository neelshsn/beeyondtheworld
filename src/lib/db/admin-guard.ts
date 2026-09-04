import { NextResponse } from 'next/server';

import { getSessionAdmin } from '@/lib/db/admin-auth';

function configuredOrigin(value: string | undefined, vercelDomain = false): string | null {
  const configured = value?.trim();
  if (!configured) return null;

  try {
    const parsed = new URL(vercelDomain ? `https://${configured}` : configured);
    const validProtocol =
      parsed.protocol === 'https:' ||
      (process.env.NODE_ENV !== 'production' && parsed.protocol === 'http:');
    const validHost = !vercelDomain || parsed.hostname.endsWith('.vercel.app');
    if (!validProtocol || !validHost || parsed.username || parsed.password) return null;
    return parsed.origin;
  } catch {
    return null;
  }
}

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
    return NextResponse.json(
      { error: 'Authentification temporairement indisponible.' },
      { status: 503 }
    );
  }
}

export function canonicalAdminOrigin(request: Request): string {
  const appOrigin = configuredOrigin(process.env.APP_ORIGIN);
  if (appOrigin) return appOrigin;

  const vercelPreviewOrigin = configuredOrigin(process.env.VERCEL_URL, true);
  if (process.env.VERCEL_ENV && process.env.VERCEL_ENV !== 'production' && vercelPreviewOrigin) {
    return vercelPreviewOrigin;
  }
  if (process.env.NODE_ENV === 'production') return 'https://beeyondtheworld.com';
  return new URL(request.url).origin;
}

function allowedAdminOrigins(request: Request): Set<string> {
  const origins = new Set<string>([canonicalAdminOrigin(request)]);
  const appOrigin = configuredOrigin(process.env.APP_ORIGIN);
  const vercelUrlOrigin = configuredOrigin(process.env.VERCEL_URL, true);
  const vercelProductionOrigin = configuredOrigin(process.env.VERCEL_PROJECT_PRODUCTION_URL, true);

  if (appOrigin) origins.add(appOrigin);
  if (vercelUrlOrigin) origins.add(vercelUrlOrigin);
  if (vercelProductionOrigin) origins.add(vercelProductionOrigin);
  if (process.env.NODE_ENV !== 'production') origins.add(new URL(request.url).origin);
  return origins;
}

/** Refuse les écritures provenant d'un autre site, en complément du cookie SameSite. */
export function rejectCrossSiteWrite(request: Request): NextResponse | null {
  const fetchSite = request.headers.get('sec-fetch-site');
  if (fetchSite === 'cross-site') {
    return NextResponse.json({ error: 'Requête refusée.' }, { status: 403 });
  }

  const origin = request.headers.get('origin');
  if (!origin) return null;
  try {
    if (!allowedAdminOrigins(request).has(new URL(origin).origin)) {
      return NextResponse.json({ error: 'Requête refusée.' }, { status: 403 });
    }
  } catch {
    return NextResponse.json({ error: 'Requête refusée.' }, { status: 403 });
  }
  return null;
}
