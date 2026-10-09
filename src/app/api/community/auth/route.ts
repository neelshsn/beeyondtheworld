import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import {
  COOKIE,
  createSession,
  currentUser,
  digest,
  sqlClient,
  verify,
} from '@/lib/community/server';
import { rejectCrossSiteWrite } from '@/lib/db/admin-guard';
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export async function GET() {
  try {
    return NextResponse.json(
      { user: await currentUser() },
      { headers: { 'Cache-Control': 'no-store' } }
    );
  } catch {
    return NextResponse.json({ error: 'Community is temporarily unavailable.' }, { status: 503 });
  }
}
export async function POST(request: Request) {
  const denied = rejectCrossSiteWrite(request);
  if (denied) return denied;
  try {
    if (Number(request.headers.get('content-length') || 0) > 4096)
      return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });
    const { email, password } = await request.json();
    if (
      typeof email !== 'string' ||
      typeof password !== 'string' ||
      email.length > 254 ||
      password.length > 200 ||
      password.length < 1
    )
      return NextResponse.json({ error: 'Enter your email and password.' }, { status: 400 });
    const normalized = email.trim().toLowerCase();
    const sql = sqlClient();
    const key = digest(normalized);
    const ipKey = digest(
      'ip:' +
        (
          request.headers.get('x-vercel-forwarded-for') ||
          request.headers.get('x-forwarded-for') ||
          'local'
        ).split(',')[0]
    );
    for (const k of [key, ipKey]) {
      const [limit] = await sql.query(
        `INSERT INTO bee_community_login_limits(key,attempts,window_at) VALUES($1,1,now()) ON CONFLICT(key) DO UPDATE SET attempts=CASE WHEN bee_community_login_limits.window_at<now()-interval '15 minutes' THEN 1 ELSE bee_community_login_limits.attempts+1 END, window_at=CASE WHEN bee_community_login_limits.window_at<now()-interval '15 minutes' THEN now() ELSE bee_community_login_limits.window_at END RETURNING attempts`,
        [k]
      );
      if (limit.attempts > (k === key ? 10 : 80))
        return NextResponse.json(
          { error: 'Too many attempts. Please try again in 15 minutes.' },
          { status: 429 }
        );
    }
    const [user] = await sql.query(
      'SELECT id,password_hash,disabled FROM bee_community_users WHERE email=$1',
      [normalized]
    );
    const valid = await verify(
      password,
      user?.password_hash || '00000000000000000000000000000000:' + '0'.repeat(128)
    );
    if (!user || !valid || user.disabled)
      return NextResponse.json({ error: 'Email or password not recognized.' }, { status: 401 });
    const token = await createSession(user.id);
    await sql.query('DELETE FROM bee_community_login_limits WHERE key=$1', [key]);
    const response = NextResponse.json({ ok: true });
    response.cookies.set(COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 43200,
    });
    return response;
  } catch {
    return NextResponse.json(
      { error: 'Sign-in is temporarily unavailable. Please retry.' },
      { status: 503 }
    );
  }
}
export async function DELETE(request: Request) {
  const denied = rejectCrossSiteWrite(request);
  if (denied) return denied;
  const token = (await cookies()).get(COOKIE)?.value;
  if (token)
    await sqlClient().query('DELETE FROM bee_community_sessions WHERE token_hash=$1', [
      digest(token),
    ]);
  const r = NextResponse.json({ ok: true });
  r.cookies.set(COOKIE, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });
  return r;
}
