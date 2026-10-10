import { NextResponse } from 'next/server';
import { randomBytes, randomUUID } from 'node:crypto';
import { workspace, currentUser, digest, sqlClient } from '@/lib/community/server';
import { rejectCrossSiteWrite } from '@/lib/db/admin-guard';
import { roles } from '@/lib/community/types';
export const runtime = 'nodejs';
export async function GET(request: Request) {
  try {
    const w = await workspace(new URL(request.url).searchParams.get('project') || '');
    if (!w || !['bee', 'production'].includes(w.project.role))
      return NextResponse.json({ error: 'Access denied.' }, { status: 403 });
    const invitations = await sqlClient().query(
      'SELECT id,email,name,organization,role,expires_at,accepted_at,revoked_at FROM bee_community_invitations WHERE project_id=$1 ORDER BY created_at DESC',
      [w.project.id]
    );
    return NextResponse.json({ invitations }, { headers: { 'Cache-Control': 'no-store' } });
  } catch {
    return NextResponse.json({ error: 'Invitations unavailable.' }, { status: 503 });
  }
}
export async function POST(request: Request) {
  const denied = rejectCrossSiteWrite(request);
  if (denied) return denied;
  try {
    const raw = await request.text();
    if (raw.length > 5000)
      return NextResponse.json({ error: 'Request too large.' }, { status: 400 });
    const b = JSON.parse(raw);
    const w = typeof b.projectId === 'string' ? await workspace(b.projectId) : null;
    const actual = await currentUser();
    // A test-role preview must never grant additional coordination powers.
    const own =
      actual &&
      (
        await sqlClient().query(
          'SELECT role FROM bee_community_members WHERE project_id=$1 AND user_id=$2',
          [w?.project.id, actual.id]
        )
      )[0];
    if (
      !w ||
      !own ||
      !['bee', 'production'].includes(own.role) ||
      !['bee', 'production'].includes(w.project.role)
    )
      return NextResponse.json(
        { error: 'Only the coordination team can invite members.' },
        { status: 403 }
      );
    if (b.revoke) {
      await sqlClient().query(
        'UPDATE bee_community_invitations SET revoked_at=now() WHERE id=$1 AND project_id=$2 AND accepted_at IS NULL',
        [b.revoke, w.project.id]
      );
      return NextResponse.json({ ok: true });
    }
    const email = typeof b.email === 'string' ? b.email.trim().toLowerCase() : '';
    const name = typeof b.name === 'string' ? b.name.trim() : '';
    const organization = typeof b.organization === 'string' ? b.organization.trim() : '';
    if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
      email.length > 254 ||
      !name ||
      name.length > 120 ||
      !organization ||
      organization.length > 160 ||
      !roles.includes(b.role)
    )
      return NextResponse.json(
        { error: 'Complete the name, email, organization and role.' },
        { status: 400 }
      );
    if (own.role !== 'bee' && ['bee', 'brand', 'ngo', 'expert'].includes(b.role))
      return NextResponse.json({ error: 'Bee manages this role.' }, { status: 403 });
    const token = randomBytes(32).toString('hex'),
      id = randomUUID();
    await sqlClient().query(
      "INSERT INTO bee_community_invitations(id,project_id,email,name,organization,role,token_hash,created_by,expires_at) VALUES($1,$2,$3,$4,$5,$6,$7,$8,now()+interval '7 days')",
      [id, w.project.id, email, name, organization, b.role, digest(token), actual!.id]
    );
    return NextResponse.json(
      { id, path: '/community/join#' + token },
      { headers: { 'Cache-Control': 'no-store' } }
    );
  } catch {
    return NextResponse.json({ error: 'Could not prepare the invitation.' }, { status: 500 });
  }
}
