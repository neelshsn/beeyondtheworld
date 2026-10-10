import { NextResponse } from 'next/server';
import { randomUUID } from 'node:crypto';
import { currentUser, sqlClient } from '@/lib/community/server';
import { withTransaction } from '@/lib/db/client';
import { rejectCrossSiteWrite } from '@/lib/db/admin-guard';
export const runtime = 'nodejs';
export async function POST(request: Request) {
  const denied = rejectCrossSiteWrite(request);
  if (denied) return denied;
  try {
    const user = await currentUser();
    if (!user) return NextResponse.json({ error: 'Sign in first.' }, { status: 401 });
    const [access] = await sqlClient().query(
      "SELECT project_id FROM bee_community_members WHERE user_id=$1 AND role='bee' LIMIT 1",
      [user.id]
    );
    if (!access)
      return NextResponse.json({ error: 'Only Bee can create a journey.' }, { status: 403 });
    const raw = await request.text();
    if (raw.length > 5000)
      return NextResponse.json({ error: 'Request too large.' }, { status: 400 });
    const b = JSON.parse(raw);
    const clean = (k: string) => (typeof b[k] === 'string' ? b[k].trim() : '');
    const title = clean('title'),
      territory = clean('territory'),
      season = clean('season'),
      start = clean('starts_on'),
      end = clean('ends_on');
    if (!title || title.length > 160 || !territory || territory.length > 120 || season.length > 120)
      return NextResponse.json({ error: 'Add the project name and destination.' }, { status: 400 });
    if (
      [start, end].some(
        (d) => d && (!/^\d{4}-\d{2}-\d{2}$/.test(d) || !Number.isFinite(Date.parse(d)))
      ) ||
      (start && end && end < start)
    )
      return NextResponse.json({ error: 'Check the production dates.' }, { status: 400 });
    const id = randomUUID();
    await withTransaction(async (sql) => {
      await sql.query(
        'INSERT INTO bee_community_projects(id,title,territory,season,starts_on,ends_on,is_demo) VALUES($1,$2,$3,$4,$5,$6,$7)',
        [id, title, territory, season, start || null, end || null, user.is_test || b.demo === true]
      );
      await sql.query(
        "INSERT INTO bee_community_members(project_id,user_id,role) VALUES($1,$2,'bee')",
        [id, user.id]
      );
    });
    return NextResponse.json({ id, demo: user.is_test || b.demo === true });
  } catch {
    return NextResponse.json(
      { error: 'Could not create the journey. Check the dates and retry.' },
      { status: 400 }
    );
  }
}
