import { NextResponse } from 'next/server';
import { createHash, randomUUID } from 'node:crypto';
import { sqlClient, workspace } from '@/lib/community/server';
import { canEdit } from '@/lib/community/model';
import { rejectCrossSiteWrite } from '@/lib/db/admin-guard';
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export async function POST(request: Request) {
  const denied = rejectCrossSiteWrite(request);
  if (denied) return denied;
  try {
    if (Number(request.headers.get('content-length') || 0) > 3300000)
      return NextResponse.json(
        { error: 'Files must be 3 MB or smaller. Use a shared link for larger files.' },
        { status: 413 }
      );
    const form = await request.formData();
    const w = await workspace(String(form.get('projectId')));
    const record = w?.records.find((r) => r.id === form.get('recordId'));
    if (!w || !record || !canEdit(w.project.role, record, w.user))
      return NextResponse.json({ error: 'Access denied.' }, { status: 403 });
    const file = form.get('file');
    if (!(file instanceof File) || file.size > 3145728 || file.size === 0)
      return NextResponse.json({ error: 'Choose a file up to 3 MB.' }, { status: 400 });
    const bytes = Buffer.from(await file.arrayBuffer());
    let mime = '';
    if (bytes.subarray(0, 5).toString() === '%PDF-') mime = 'application/pdf';
    else if (bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255) mime = 'image/jpeg';
    else if (bytes.subarray(0, 8).toString('hex') === '89504e470d0a1a0a') mime = 'image/png';
    else if (
      bytes.subarray(0, 4).toString() === 'RIFF' &&
      bytes.subarray(8, 12).toString() === 'WEBP'
    )
      mime = 'image/webp';
    if (!mime)
      return NextResponse.json({ error: 'Use a PDF, JPG, PNG or WebP file.' }, { status: 400 });
    const name = file.name.replace(/[^a-zA-Z0-9._ -]/g, '_').slice(0, 160);
    const id = randomUUID();
    await sqlClient().query(
      `WITH added AS (INSERT INTO bee_community_files(id,record_id,name,mime,size,content,sha256) VALUES($1,$2,$3,$4,$5,decode($6,'base64'),$7) RETURNING id), logged AS (INSERT INTO bee_community_events(id,project_id,record_id,actor_id,action,new_state,comment) SELECT $8,$9,$2,$10,'file_attached',$11,$3 FROM added) SELECT id FROM added`,
      [
        id,
        record.id,
        name,
        mime,
        file.size,
        bytes.toString('base64'),
        createHash('sha256').update(bytes).digest('hex'),
        randomUUID(),
        w.project.id,
        w.user.id,
        record.status,
      ]
    );
    return NextResponse.json({ ok: true, id });
  } catch {
    return NextResponse.json({ error: 'Upload failed. Please retry.' }, { status: 500 });
  }
}
export async function GET(request: Request) {
  try {
    const q = new URL(request.url).searchParams;
    const w = await workspace(q.get('project') || undefined);
    if (!w) return new Response('Unauthorized', { status: 401 });
    const r = w.records.find((x) => x.files?.some((f) => f.id === q.get('id')));
    if (!r) return new Response('Not found', { status: 404 });
    const [file] = await sqlClient().query(
      "SELECT name,mime,encode(content,'base64') AS content FROM bee_community_files WHERE id=$1 AND record_id=$2",
      [q.get('id'), r.id]
    );
    if (!file) return new Response('Not found', { status: 404 });
    return new Response(Buffer.from(file.content, 'base64'), {
      headers: {
        'Content-Type': file.mime,
        'Content-Disposition': `attachment; filename="${file.name}"`,
        'Cache-Control': 'private, no-store',
        'X-Content-Type-Options': 'nosniff',
      },
    });
  } catch {
    return new Response('Unavailable', { status: 503 });
  }
}
