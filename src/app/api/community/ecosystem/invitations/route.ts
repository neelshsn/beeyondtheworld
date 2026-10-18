import { randomBytes, randomUUID, scrypt as callback } from 'node:crypto';
import { promisify } from 'node:util';
import { NextResponse } from 'next/server';
import { COOKIE, currentUser, digest } from '@/lib/community/server';
import { sqlClient, withTransaction } from '@/lib/db/client';
import { rejectCrossSiteWrite } from '@/lib/db/admin-guard';
import { ecosystemAccess, ecosystemFailure } from '@/lib/ecosystem/server';
import { need, isUuid } from '@/lib/ecosystem/model';
const scrypt = promisify(callback);
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
const headers = { 'Cache-Control': 'private, no-store', 'Referrer-Policy': 'no-referrer' };
const reply = (body: unknown, status = 200) => NextResponse.json(body, { status, headers });
export async function GET(request: Request) {
  try {
    const a = await ecosystemAccess(request),
      id = new URL(request.url).searchParams.get('creatorId');
    need(
      a.isTeam && ['bee', 'curator'].includes(a.role),
      'Studio access required.',
      403,
      'FORBIDDEN'
    );
    need(isUuid(id), 'Choose a creator.');
    const invitations = await sqlClient().query(
      'SELECT id,email,expires_at,accepted_at,revoked_at FROM bee_ecosystem_invitations WHERE creator_id=$1 AND scope=$2 ORDER BY created_at DESC LIMIT 20',
      [id, a.scope]
    );
    return reply({ invitations });
  } catch (e) {
    return ecosystemFailure(e);
  }
}
export async function POST(request: Request) {
  const denied = rejectCrossSiteWrite(request);
  if (denied) return denied;
  try {
    const raw = await request.text();
    need(raw.length <= 8192, 'Request too large.', 413);
    let b;
    try {
      b = JSON.parse(raw);
    } catch {
      return reply({ error: 'Invalid request.' }, 400);
    }
    need(b && typeof b === 'object' && !Array.isArray(b), 'Invalid request.');
    if (b.action === 'issue' || b.action === 'revoke') {
      const a = await ecosystemAccess(request);
      need(
        a.isTeam && ['bee', 'curator'].includes(a.role),
        'Only the Studio can invite creators.',
        403,
        'FORBIDDEN'
      );
      if (b.action === 'revoke') {
        need(isUuid(b.id), 'Invalid invitation.');
        await sqlClient().query(
          'UPDATE bee_ecosystem_invitations SET revoked_at=now() WHERE id=$1 AND scope=$2 AND accepted_at IS NULL',
          [b.id, a.scope]
        );
        return reply({ ok: true });
      }
      need(isUuid(b.creatorId), 'Choose a creator.');
      return await withTransaction(async (sql) => {
        const [creator] = await sql.query(
          'SELECT id,email,user_id,status FROM bee_ecosystem_creators WHERE id=$1 AND scope=$2 FOR UPDATE',
          [b.creatorId, a.scope]
        );
        need(creator, 'Creator unavailable.', 404, 'NOT_FOUND');
        need(
          !creator.user_id,
          'This creator already has an account. They can sign in with their existing password.'
        );
        need(
          !['declined', 'suspended'].includes(creator.status),
          'Reopen the application before inviting this creator.'
        );
        await sql.query(
          'UPDATE bee_ecosystem_invitations SET revoked_at=now() WHERE creator_id=$1 AND accepted_at IS NULL AND revoked_at IS NULL',
          [creator.id]
        );
        const token = randomBytes(32).toString('hex'),
          id = randomUUID();
        const [row] = await sql.query(
          "INSERT INTO bee_ecosystem_invitations(id,scope,creator_id,email,token_hash,created_by,expires_at) VALUES($1,$2,$3,$4,$5,$6,now()+interval '7 days') RETURNING expires_at",
          [id, a.scope, creator.id, creator.email, digest(token), a.userId]
        );
        await sql.query(
          "INSERT INTO bee_ecosystem_events(scope,entity_type,entity_id,actor_id,action,snapshot) VALUES($1,'creator',$2,$3,'invitation_prepared',$4::jsonb)",
          [
            a.scope,
            creator.id,
            a.userId,
            JSON.stringify({ invitationId: id, expiresAt: row.expires_at }),
          ]
        );
        return reply({ id, path: '/community/ecosystem/join#' + token, expiresAt: row.expires_at });
      });
    }
    need(
      typeof b.token === 'string' && /^[a-f0-9]{64}$/.test(b.token),
      'This invitation is unavailable.',
      410,
      'NOT_FOUND'
    );
    const sql = sqlClient(),
      ip = (
        request.headers.get('x-vercel-forwarded-for') ||
        request.headers.get('x-forwarded-for') ||
        'local'
      ).split(',')[0];
    for (const [key, max] of [
      [digest('poet-invite-ip:' + ip), 100],
      [digest('poet-invite-token:' + b.token), 30],
    ] as const) {
      const [rate] = await sql.query(
        "INSERT INTO bee_community_login_limits(key,attempts,window_at) VALUES($1,1,now()) ON CONFLICT(key) DO UPDATE SET attempts=CASE WHEN bee_community_login_limits.window_at<now()-interval '15 minutes' THEN 1 ELSE bee_community_login_limits.attempts+1 END,window_at=CASE WHEN bee_community_login_limits.window_at<now()-interval '15 minutes' THEN now() ELSE bee_community_login_limits.window_at END RETURNING attempts",
        [key]
      );
      need(rate.attempts <= max, 'Too many attempts. Please try again in 15 minutes.', 429);
    }
    const [invite] = await sql.query(
      "SELECT i.id,i.scope,i.creator_id,i.email,i.expires_at,c.display_name FROM bee_ecosystem_invitations i JOIN bee_ecosystem_creators c ON c.id=i.creator_id AND c.scope=i.scope WHERE i.token_hash=$1 AND i.accepted_at IS NULL AND i.revoked_at IS NULL AND i.expires_at>now() AND c.status NOT IN ('declined','suspended') AND c.user_id IS NULL",
      [digest(b.token)]
    );
    need(invite, 'This invitation has expired or is no longer available.', 410, 'NOT_FOUND');
    const existing = (
      await sql.query('SELECT id,disabled FROM bee_community_users WHERE lower(email)=lower($1)', [
        invite.email,
      ])
    )[0];
    if (b.preview === true)
      return reply({
        name: invite.display_name,
        email: invite.email,
        existing: !!existing,
        expiresAt: invite.expires_at,
      });
    const user = await currentUser();
    if (existing)
      need(
        !existing.disabled && user?.id === existing.id,
        'Sign in with the invited email, then accept this invitation.',
        403,
        'FORBIDDEN'
      );
    else
      need(
        typeof b.password === 'string' &&
          b.password.length >= 12 &&
          b.password.length <= 200 &&
          b.confirmation === b.password,
        'Use 12–200 characters and enter the same password twice.'
      );
    const salt = randomBytes(16).toString('hex'),
      passwordHash = existing
        ? null
        : salt + ':' + ((await scrypt(b.password, salt, 64)) as Buffer).toString('hex');
    const sessionToken = randomBytes(32).toString('hex');
    await withTransaction(async (tx) => {
      const [live] = await tx.query(
        'SELECT * FROM bee_ecosystem_invitations WHERE id=$1 FOR UPDATE',
        [invite.id]
      );
      need(
        live &&
          !live.accepted_at &&
          !live.revoked_at &&
          new Date(live.expires_at).getTime() > Date.now(),
        'This invitation is no longer available.',
        410,
        'NOT_FOUND'
      );
      await tx.query("SELECT pg_advisory_xact_lock(hashtext('poet-invite-email:'||$1))", [
        invite.email.toLowerCase(),
      ]);
      const [profile] = await tx.query(
        'SELECT user_id,status FROM bee_ecosystem_creators WHERE id=$1 FOR UPDATE',
        [invite.creator_id]
      );
      need(
        profile && !profile.user_id && !['declined', 'suspended'].includes(profile.status),
        'This invitation is no longer available.',
        410,
        'NOT_FOUND'
      );
      const [account] = await tx.query(
        'SELECT id,disabled FROM bee_community_users WHERE lower(email)=lower($1)',
        [invite.email]
      );
      if (account)
        need(
          !account.disabled && user?.id === account.id,
          'Sign in with the invited email, then reopen this link.',
          403,
          'FORBIDDEN'
        );
      const id = account?.id || randomUUID();
      if (!account) {
        need(passwordHash, 'Sign in with the invited account.', 403, 'FORBIDDEN');
        await tx.query(
          'INSERT INTO bee_community_users(id,email,name,organization,password_hash,is_test) VALUES($1,$2,$3,$4,$5,$6)',
          [
            id,
            invite.email.toLowerCase(),
            invite.display_name,
            'Visual Poet',
            passwordHash,
            invite.scope === 'demo',
          ]
        );
      }
      await tx.query(
        'UPDATE bee_ecosystem_creators SET user_id=$2,version=version+1,updated_at=now() WHERE id=$1',
        [invite.creator_id, id]
      );
      await tx.query('UPDATE bee_ecosystem_invitations SET accepted_at=now() WHERE id=$1', [
        invite.id,
      ]);
      await tx.query(
        'UPDATE bee_ecosystem_invitations SET revoked_at=now() WHERE creator_id=$1 AND id<>$2 AND accepted_at IS NULL AND revoked_at IS NULL',
        [invite.creator_id, invite.id]
      );
      await tx.query(
        "INSERT INTO bee_community_sessions(token_hash,user_id,expires_at) VALUES($1,$2,now()+interval '12 hours')",
        [digest(sessionToken), id]
      );
      await tx.query(
        "INSERT INTO bee_ecosystem_events(scope,entity_type,entity_id,actor_id,action,snapshot) VALUES($1,'creator',$2,$3,'invitation_accepted',$4::jsonb)",
        [invite.scope, invite.creator_id, id, JSON.stringify({ invitationId: invite.id })]
      );
    });
    const response = reply({ ok: true, path: '/community/ecosystem?scope=' + invite.scope });
    response.cookies.set(COOKIE, sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 43200,
    });
    return response;
  } catch (e) {
    return ecosystemFailure(e);
  }
}
