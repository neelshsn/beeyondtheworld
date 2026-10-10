import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { COOKIE, currentUser, sqlClient } from '@/lib/community/server';
import { DEMO_ROLE_COOKIE, signDemoRole } from '@/lib/community/demo-role';
import { roles } from '@/lib/community/types';
import { rejectCrossSiteWrite } from '@/lib/db/admin-guard';
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const denied = rejectCrossSiteWrite(request);
  if (denied) return denied;
  try {
    const user = await currentUser();
    if (!user?.is_test) return NextResponse.json({ error: 'Test accounts only.' }, { status: 403 });
    if (Number(request.headers.get('content-length') || 0) > 1024)
      return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });
    const { projectId, role } = await request.json();
    if (
      typeof projectId !== 'string' ||
      !/^[a-f0-9-]{36}$/.test(projectId) ||
      !roles.includes(role)
    )
      return NextResponse.json({ error: 'Choose a test role.' }, { status: 400 });
    const [target] = await sqlClient().query(
      `SELECT u.id FROM bee_community_projects p
      JOIN bee_community_members own ON own.project_id=p.id AND own.user_id=$1
      JOIN bee_community_members m ON m.project_id=p.id AND m.role=$3
      JOIN bee_community_users u ON u.id=m.user_id AND u.is_test AND NOT u.disabled
      WHERE p.id=$2 AND p.is_demo ORDER BY u.id LIMIT 1`,
      [user.id, projectId, role]
    );
    if (!target)
      return NextResponse.json(
        { error: 'This role is not available in this test project.' },
        { status: 403 }
      );
    const token = (await cookies()).get(COOKIE)?.value;
    if (!token) return NextResponse.json({ error: 'Sign in again.' }, { status: 401 });
    const response = NextResponse.json({ ok: true }, { headers: { 'Cache-Control': 'no-store' } });
    response.cookies.set(DEMO_ROLE_COOKIE, signDemoRole(token, projectId, role), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 43200,
    });
    return response;
  } catch {
    return NextResponse.json({ error: 'Could not switch role. Please retry.' }, { status: 503 });
  }
}
