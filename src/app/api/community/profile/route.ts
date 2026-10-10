import { NextResponse } from 'next/server';
import { workspace, sqlClient } from '@/lib/community/server';
import { rejectCrossSiteWrite } from '@/lib/db/admin-guard';
export async function PATCH(request: Request) {
  const denied = rejectCrossSiteWrite(request);
  if (denied) return denied;
  try {
    const raw = await request.text();
    if (raw.length > 12000)
      return NextResponse.json({ error: 'Profile is too large.' }, { status: 413 });
    const body = JSON.parse(raw),
      w = await workspace(body.projectId);
    if (!w) return NextResponse.json({ error: 'Access denied.' }, { status: 403 });
    const data: Record<string, string> = {};
    for (const key of ['profile-0', 'profile-1', 'profile-2', 'profile-3']) {
      const value = body.data?.[key];
      if (value !== undefined && (typeof value !== 'string' || value.length > 500))
        return NextResponse.json({ error: 'Use a short profile value.' }, { status: 400 });
      data[key] = String(value || '').trim();
    }
    if (!data['profile-0'] || data['profile-0'].length > 160)
      return NextResponse.json({ error: 'Add your display name.' }, { status: 400 });
    if (data['profile-3']) {
      try {
        if (new URL(data['profile-3']).protocol !== 'https:') throw Error();
      } catch {
        return NextResponse.json({ error: 'Use an HTTPS portfolio link.' }, { status: 400 });
      }
    }
    await sqlClient().query(
      'UPDATE bee_community_users SET name=$1,profile=$2::jsonb WHERE id=$3',
      [data['profile-0'], JSON.stringify(data), w.user.id]
    );
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'Your profile could not be saved.' }, { status: 500 });
  }
}
