import { NextResponse } from 'next/server';

import { adminCount, getSessionAdmin } from '@/lib/db/admin-auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** État d'auth du dashboard : connecté ? premier compte à créer (bootstrap) ? */
export async function GET() {
  try {
    const [admin, total] = await Promise.all([getSessionAdmin(), adminCount()]);
    return NextResponse.json({
      authenticated: Boolean(admin),
      email: admin?.email ?? null,
      bootstrap: total === 0,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Base indisponible.' },
      { status: 500 }
    );
  }
}
