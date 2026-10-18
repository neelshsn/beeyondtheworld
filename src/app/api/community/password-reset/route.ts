import { NextResponse } from 'next/server';
import { rejectCrossSiteWrite } from '@/lib/db/admin-guard';
import { sqlClient } from '@/lib/db/client';
import {
  PasswordResetUnavailable,
  redeemPasswordReset,
  resetDigest,
  validResetPassword,
  validResetToken,
} from '@/lib/community/password-reset';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
const reply = (body: unknown, status = 200) =>
  NextResponse.json(body, {
    status,
    headers: { 'Cache-Control': 'private, no-store', 'Referrer-Policy': 'no-referrer' },
  });
const unavailable = () =>
  reply(
    {
      error:
        'This link has expired or is no longer available. Please request a new link from the Bee team.',
    },
    410
  );
export async function POST(request: Request) {
  const denied = rejectCrossSiteWrite(request);
  if (denied) return denied;
  try {
    const raw = await request.text();
    if (raw.length > 4096) return reply({ error: 'Invalid request.' }, 400);
    let b;
    try {
      b = JSON.parse(raw);
    } catch {
      return reply({ error: 'Invalid request.' }, 400);
    }
    if (!validResetToken(b?.token)) return unavailable();
    const sql = sqlClient();
    const ip = (
      request.headers.get('x-vercel-forwarded-for') ||
      request.headers.get('x-forwarded-for') ||
      'local'
    ).split(',')[0];
    for (const [key, maximum] of [
      [resetDigest('recovery-ip:' + ip), 100],
      [resetDigest('recovery-token:' + b.token), 20],
    ] as const) {
      const [limit] = await sql.query(
        `INSERT INTO bee_community_login_limits(key,attempts,window_at) VALUES($1,1,now()) ON CONFLICT(key) DO UPDATE SET attempts=CASE WHEN bee_community_login_limits.window_at<now()-interval '15 minutes' THEN 1 ELSE bee_community_login_limits.attempts+1 END,window_at=CASE WHEN bee_community_login_limits.window_at<now()-interval '15 minutes' THEN now() ELSE bee_community_login_limits.window_at END RETURNING attempts`,
        [key]
      );
      if (limit.attempts > maximum)
        return reply({ error: 'Too many attempts. Please try again in 15 minutes.' }, 429);
    }
    if (b.preview === true) {
      const [live] = await sql.query(
        `SELECT u.name,r.expires_at,r.password_fingerprint,u.password_hash FROM bee_community_password_resets r JOIN bee_community_users u ON u.id=r.user_id WHERE r.token_hash=$1 AND r.expires_at>now() AND r.used_at IS NULL AND r.revoked_at IS NULL AND NOT u.disabled`,
        [resetDigest(b.token)]
      );
      if (!live || live.password_fingerprint !== resetDigest(live.password_hash))
        return unavailable();
      return reply({ name: live.name, expiresAt: live.expires_at });
    }
    if (!validResetPassword(b.password) || b.password !== b.confirmation)
      return reply({ error: 'Use 12–200 characters and enter the same password twice.' }, 400);
    await redeemPasswordReset(b.token, b.password);
    const response = reply({ ok: true });
    response.cookies.set('bee-community-session', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 0,
    });
    return response;
  } catch (e) {
    if (e instanceof PasswordResetUnavailable) return unavailable();
    return reply(
      { error: 'Password recovery is temporarily unavailable. Please try again later.' },
      503
    );
  }
}
