import { NextResponse } from 'next/server';
import { randomUUID } from 'node:crypto';
import { workspace, sqlClient } from '@/lib/community/server';
import { rejectCrossSiteWrite } from '@/lib/db/admin-guard';
export const runtime = 'nodejs';
export async function POST(request: Request) {
  const denied = rejectCrossSiteWrite(request);
  if (denied) return denied;
  try {
    const raw = await request.text();
    if (raw.length > 8000)
      return NextResponse.json({ error: 'Comment is too long.' }, { status: 400 });
    const body = JSON.parse(raw);
    const w = typeof body.projectId === 'string' ? await workspace(body.projectId) : null;
    const record = w?.records.find((r) => r.id === body.recordId);
    if (!w || !record) return NextResponse.json({ error: 'Access denied.' }, { status: 403 });
    const comment = typeof body.comment === 'string' ? body.comment.trim() : '';
    if (!comment || comment.length > 2000)
      return NextResponse.json(
        { error: 'Write a note of up to 2000 characters.' },
        { status: 400 }
      );
    await sqlClient().query(
      "INSERT INTO bee_community_events(id,project_id,record_id,actor_id,action,new_state,comment) VALUES($1,$2,$3,$4,'commented',$5,$6)",
      [randomUUID(), w.project.id, record.id, w.user.id, record.status, comment]
    );
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'Could not save this note.' }, { status: 500 });
  }
}
