import { NextResponse } from 'next/server';
import { sqlClient, withTransaction } from '@/lib/db/client';
import { rejectCrossSiteWrite } from '@/lib/db/admin-guard';
import { reviewAccess, validScreen, privateHeaders } from '@/lib/review/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
const json = (value: unknown, status = 200) =>
  NextResponse.json(value, { status, headers: privateHeaders });
export async function GET(request: Request) {
  const author = await reviewAccess();
  if (!author) return json({ error: 'Ouvrez votre lien personnel de revue.' }, 401);
  const url = new URL(request.url),
    role = url.searchParams.get('role'),
    page = url.searchParams.get('page');
  if (!validScreen(role, page)) return json({ error: 'Écran inconnu.' }, 400);
  const [feedback, images, summary] = await Promise.all([
    sqlClient().query(
      'SELECT author,body,version,updated_at FROM bee_review_feedback WHERE role=$1 AND page=$2',
      [role, page]
    ),
    sqlClient().query(
      'SELECT id,author,name,size,created_at FROM bee_review_images WHERE role=$1 AND page=$2 AND deleted_at IS NULL ORDER BY created_at,id',
      [role, page]
    ),
    sqlClient().query(
      'SELECT f.role,f.page,f.author FROM bee_review_feedback f WHERE length(trim(f.body))>0 OR EXISTS(SELECT 1 FROM bee_review_images i WHERE i.role=f.role AND i.page=f.page AND i.author=f.author AND i.deleted_at IS NULL)'
    ),
  ]);
  return json({ author, feedback, images, summary });
}
export async function POST(request: Request) {
  const blocked = rejectCrossSiteWrite(request);
  if (blocked) return blocked;
  const author = await reviewAccess();
  if (!author) return json({ error: 'Votre accès a expiré. Ouvrez votre lien personnel.' }, 401);
  if (Number(request.headers.get('content-length')) > 70000)
    return json({ error: 'Texte trop long.' }, 413);
  let data;
  try {
    data = await request.json();
  } catch {
    return json({ error: 'Contenu invalide.' }, 400);
  }
  if (!data || typeof data !== 'object') return json({ error: 'Contenu invalide.' }, 400);
  if (data.author !== author)
    return json(
      {
        error:
          'Votre lien de contribution a changé dans un autre onglet. Actualisez les retours avant de continuer.',
      },
      409
    );
  const { role, page, body, version } = data;
  if (
    !validScreen(role, page) ||
    typeof body !== 'string' ||
    body.length > 15000 ||
    !Number.isSafeInteger(version) ||
    version < 0
  )
    return json({ error: 'Feedback invalide.' }, 400);
  const result = await withTransaction(async (sql) => {
    await sql.query(
      'INSERT INTO bee_review_feedback(role,page,author) VALUES($1,$2,$3) ON CONFLICT DO NOTHING',
      [role, page, author]
    );
    return sql.query(
      'UPDATE bee_review_feedback SET body=$4,version=version+1,updated_at=now() WHERE role=$1 AND page=$2 AND author=$3 AND version=$5 RETURNING version,updated_at',
      [role, page, author, body, version]
    );
  });
  if (!result.length)
    return json(
      {
        error:
          'Ce feedback a changé dans un autre onglet. Votre texte est conservé ici : rechargez les retours puis fusionnez vos modifications.',
      },
      409
    );
  return json(result[0]);
}
