import { NextResponse } from 'next/server';
import { randomUUID } from 'node:crypto';
import sharp from 'sharp';
import { sqlClient, withTransaction } from '@/lib/db/client';
import { rejectCrossSiteWrite } from '@/lib/db/admin-guard';
import { reviewAccess, validScreen, privateHeaders } from '@/lib/review/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
const json = (value: unknown, status = 200) =>
  NextResponse.json(value, { status, headers: privateHeaders });
const uuid = /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/;
export async function GET(request: Request) {
  if (!(await reviewAccess())) return json({ error: 'Accès requis.' }, 401);
  const id = new URL(request.url).searchParams.get('id');
  if (!id || !uuid.test(id)) return json({ error: 'Image inconnue.' }, 404);
  const [file] = await sqlClient().query(
    'SELECT content FROM bee_review_images WHERE id=$1 AND deleted_at IS NULL',
    [id]
  );
  if (!file) return json({ error: 'Image inconnue.' }, 404);
  return new Response(new Uint8Array(file.content), {
    headers: {
      ...privateHeaders,
      'Content-Type': 'image/webp',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}
export async function POST(request: Request) {
  const blocked = rejectCrossSiteWrite(request);
  if (blocked) return blocked;
  const author = await reviewAccess();
  if (!author) return json({ error: 'Votre accès a expiré. Ouvrez votre lien personnel.' }, 401);
  if (Number(request.headers.get('content-length')) > 3500000)
    return json({ error: 'Image trop volumineuse.' }, 413);
  let form;
  try {
    form = await request.formData();
  } catch {
    return json({ error: 'Envoi invalide.' }, 400);
  }
  const role = form.get('role'),
    page = form.get('page'),
    file = form.get('file');
  if (form.get('author') !== author)
    return json({ error: 'Votre lien de contribution a changé. Actualisez les retours.' }, 409);
  if (
    !validScreen(role, page) ||
    !(file instanceof File) ||
    !file.size ||
    file.size > 3145728 ||
    !['image/jpeg', 'image/png', 'image/webp'].includes(file.type)
  )
    return json(
      { error: 'Choisissez une image JPG, PNG ou WebP (3 Mo maximum après optimisation).' },
      400
    );
  let content: Buffer;
  try {
    content = await sharp(Buffer.from(await file.arrayBuffer()), { limitInputPixels: 40000000 })
      .rotate()
      .resize({ width: 2400, height: 2400, fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 88 })
      .toBuffer();
  } catch {
    return json({ error: 'Cette image ne peut pas être lue.' }, 400);
  }
  if (content.length > 3145728) return json({ error: 'Image trop volumineuse.' }, 413);
  const id = randomUUID(),
    name = file.name.replace(/[\x00-\x1f\x7f]/g, '').slice(0, 160) || 'Image';
  const inserted = await withTransaction(async (sql) => {
    await sql.query(
      'INSERT INTO bee_review_feedback(role,page,author) VALUES($1,$2,$3) ON CONFLICT DO NOTHING',
      [role, page, author]
    );
    await sql.query(
      'SELECT version FROM bee_review_feedback WHERE role=$1 AND page=$2 AND author=$3 FOR UPDATE',
      [role, page, author]
    );
    const [count] = await sql.query(
      'SELECT count(*)::int AS n FROM bee_review_images WHERE role=$1 AND page=$2 AND author=$3 AND deleted_at IS NULL',
      [role, page, author]
    );
    if (count.n >= 20) return false;
    await sql.query(
      'INSERT INTO bee_review_images(id,role,page,author,name,content,size) VALUES($1,$2,$3,$4,$5,$6,$7)',
      [id, role, page, author, name, content, content.length]
    );
    return true;
  });
  return inserted
    ? json({ id, name, author, size: content.length }, 201)
    : json({ error: '20 images maximum par personne et par écran.' }, 409);
}
export async function DELETE(request: Request) {
  const blocked = rejectCrossSiteWrite(request);
  if (blocked) return blocked;
  const author = await reviewAccess();
  if (!author) return json({ error: 'Accès requis.' }, 401);
  const id = new URL(request.url).searchParams.get('id');
  if (!id || !uuid.test(id)) return json({ error: 'Image inconnue.' }, 404);
  const rows = await sqlClient().query(
    'UPDATE bee_review_images SET deleted_at=now() WHERE id=$1 AND author=$2 AND deleted_at IS NULL RETURNING id',
    [id, author]
  );
  return rows.length
    ? json({ ok: true })
    : json({ error: 'Image inconnue ou appartenant à l’autre personne.' }, 404);
}
