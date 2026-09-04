import { randomBytes } from 'node:crypto';

import { NextResponse } from 'next/server';
import { isNull } from 'drizzle-orm';

import { adminUsers, getDb } from '@/lib/db';
import { getSessionAdmin, hashSetupToken } from '@/lib/db/admin-auth';
import { canonicalAdminOrigin, rejectCrossSiteWrite, requireAdmin } from '@/lib/db/admin-guard';
import { ensureAdminAuthSchema } from '@/lib/db/ensure-admin-auth-schema';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const INVITE_HOURS = 72;

export async function POST(request: Request) {
  const denied = (await requireAdmin()) ?? rejectCrossSiteWrite(request);
  if (denied) return denied;

  try {
    const body = (await request.json().catch(() => ({}))) as { email?: string };
    const email = body.email?.trim().toLowerCase() ?? '';
    if (!EMAIL_PATTERN.test(email)) {
      return NextResponse.json({ error: 'Entre une adresse e-mail valide.' }, { status: 400 });
    }

    const requester = await getSessionAdmin();
    if (!requester) return NextResponse.json({ error: 'Session expirée.' }, { status: 401 });

    await ensureAdminAuthSchema();
    const rawToken = randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + INVITE_HOURS * 60 * 60 * 1000);
    const created = await getDb()
      .insert(adminUsers)
      .values({
        email,
        passwordHash: null,
        setupToken: hashSetupToken(rawToken),
        setupTokenExpiresAt: expiresAt,
      })
      .onConflictDoUpdate({
        target: adminUsers.email,
        setWhere: isNull(adminUsers.passwordHash),
        set: {
          setupToken: hashSetupToken(rawToken),
          setupTokenExpiresAt: expiresAt,
        },
      })
      .returning({ id: adminUsers.id });

    if (created.length === 0) {
      return NextResponse.json(
        { error: 'Cette personne possède déjà un compte actif.' },
        { status: 409 }
      );
    }

    const inviteUrl = new URL('/admin', canonicalAdminOrigin(request));
    inviteUrl.hash = `invite=${rawToken}`;
    return NextResponse.json({
      email,
      inviteUrl: inviteUrl.toString(),
      expiresAt: expiresAt.toISOString(),
      invitedBy: requester.email,
    });
  } catch (error) {
    console.error('Admin invitation failed:', error);
    return NextResponse.json(
      { error: "L'invitation n'a pas pu être créée. Réessaie dans un instant." },
      { status: 500 }
    );
  }
}
