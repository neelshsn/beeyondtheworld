import { workspace } from '@/lib/community/server';
import { sqlClient } from '@/lib/db/client';
import { relatedContent, usable, type CreativeItem } from '@/lib/creative/model';
export const dynamic = 'force-dynamic';
export async function GET(request: Request) {
  const w = await workspace(new URL(request.url).searchParams.get('project') || undefined);
  if (!w) return Response.json({ error: 'Sign in to this project.' }, { status: 403 });
  const all = await sqlClient().query<CreativeItem>(
    'SELECT * FROM bee_creative_items WHERE scope=$1',
    [w.project.is_demo ? 'demo' : 'studio']
  );
  const internal = ['bee', 'art_director', 'production'].includes(w.project.role);
  const collections = all.filter(
    (x) =>
      x.kind === 'collection' &&
      x.data.projectId === w.project.id &&
      x.status !== 'archived' &&
      (internal || x.status === 'approved')
  );
  return Response.json(
    {
      internal,
      collections: collections.map((c) => ({
        id: c.id,
        title: c.title,
        status: c.status,
        intention: c.data.intention,
        contents: relatedContent(c, all)
          .filter((x) => internal || usable(x, true))
          .map((x) => ({
            id: x.id,
            title: x.title,
            credit: x.data.credit,
            medium: x.data.medium,
            provenance: x.data.provenance,
            chapter: x.data.chapter,
          })),
        activations: all
          .filter((x) => x.kind === 'activation' && x.data.collectionId === c.id)
          .map((x) => ({ title: x.title, status: x.status })),
      })),
    },
    { headers: { 'Cache-Control': 'private, no-store' } }
  );
}
