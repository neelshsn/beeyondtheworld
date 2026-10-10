import { NextResponse } from 'next/server';
import { randomBytes, randomUUID, scrypt as callback } from 'node:crypto';
import { promisify } from 'node:util';
import { currentUser, digest, sqlClient, createSession, COOKIE } from '@/lib/community/server';
import { withTransaction } from '@/lib/db/client';
import { rejectCrossSiteWrite } from '@/lib/db/admin-guard';
const scrypt = promisify(callback);
export const runtime = 'nodejs';
export async function POST(request: Request) {
  const denied = rejectCrossSiteWrite(request);
  if (denied) return denied;
  try {
    const raw = await request.text();
    if (raw.length > 5000)
      return NextResponse.json({ error: 'Request too large.' }, { status: 400 });
    const b = JSON.parse(raw);
    if (typeof b.token !== 'string' || !/^[a-f0-9]{64}$/.test(b.token))
      return NextResponse.json({ error: 'Invalid invitation.' }, { status: 400 });
    const [invite] = await sqlClient().query(
      'SELECT i.*,p.title,p.is_demo FROM bee_community_invitations i JOIN bee_community_projects p ON p.id=i.project_id WHERE token_hash=$1 AND expires_at>now() AND accepted_at IS NULL AND revoked_at IS NULL',
      [digest(b.token)]
    );
    if (!invite)
      return NextResponse.json(
        { error: 'This invitation has expired or was already used.' },
        { status: 410 }
      );
    const [existing] = await sqlClient().query(
      'SELECT id,disabled FROM bee_community_users WHERE email=$1',
      [invite.email]
    );
    if (b.preview)
      return NextResponse.json(
        {
          name: invite.name,
          email: invite.email,
          project: invite.title,
          role: invite.role,
          existing: !!existing,
        },
        { headers: { 'Cache-Control': 'no-store' } }
      );
    const user = await currentUser();
    if (existing && (existing.disabled || user?.id !== existing.id))
      return NextResponse.json(
        { error: 'Sign in with the invited email, then reopen this link.' },
        { status: 403 }
      );
    if (
      !existing &&
      (typeof b.password !== 'string' || b.password.length < 12 || b.password.length > 200)
    )
      return NextResponse.json(
        { error: 'Use a password of at least 12 characters.' },
        { status: 400 }
      );
    const salt = randomBytes(16).toString('hex'),
      hash = !existing
        ? salt + ':' + ((await scrypt(b.password, salt, 64)) as Buffer).toString('hex')
        : null,
      id = existing?.id || randomUUID();
    const accepted = await withTransaction(async (sql) => {
      const [live] = await sql.query(
        'SELECT * FROM bee_community_invitations WHERE id=$1 FOR UPDATE',
        [invite.id]
      );
      if (
        !live ||
        live.accepted_at ||
        live.revoked_at ||
        new Date(live.expires_at).getTime() < Date.now()
      )
        return false;
      if (!existing)
        await sql.query(
          'INSERT INTO bee_community_users(id,email,name,organization,password_hash,is_test) VALUES($1,$2,$3,$4,$5,$6)',
          [id, invite.email, invite.name, invite.organization, hash, invite.is_demo]
        );
      const [membership] = await sql.query(
        'SELECT role FROM bee_community_members WHERE project_id=$1 AND user_id=$2',
        [invite.project_id, id]
      );
      if (membership && membership.role !== invite.role)
        throw Error('A member already has a different role.');
      await sql.query(
        'INSERT INTO bee_community_members(project_id,user_id,role) VALUES($1,$2,$3) ON CONFLICT DO NOTHING',
        [invite.project_id, id, invite.role]
      );
      await sql.query('UPDATE bee_community_invitations SET accepted_at=now() WHERE id=$1', [
        invite.id,
      ]);
      return true;
    });
    if (!accepted)
      return NextResponse.json(
        { error: 'This invitation is no longer available.' },
        { status: 410 }
      );
    const token = await createSession(id),
      r = NextResponse.json({ projectId: invite.project_id });
    r.cookies.set(COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 43200,
    });
    return r;
  } catch {
    return NextResponse.json(
      { error: 'Could not accept this invitation. Sign in if you already have an account.' },
      { status: 400 }
    );
  }
}
