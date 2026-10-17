import { sqlClient } from '@/lib/db/client';
import { canPublish, type CreativeItem } from '@/lib/creative/model';
export const dynamic = 'force-dynamic';
export async function GET(request: Request) {
  const all = await sqlClient().query<CreativeItem>(
    "SELECT * FROM bee_creative_items WHERE scope='studio'"
  );
  const visible = all.filter((x) => x.data.published === 'yes' && canPublish(x, all));
  const id = new URL(request.url).searchParams.get('image');
  if (id) {
    const item = visible.find((x) => x.id === id);
    if (!item) return new Response('Unavailable', { status: 404 });
    const [file] = await sqlClient().query(
      'SELECT bytes,mime FROM bee_creative_files WHERE id=$1 AND item_id=$2',
      [item.data.mediaId, item.id]
    );
    if (!file) return new Response('Unavailable', { status: 404 });
    return new Response(new Uint8Array(file.bytes), {
      headers: {
        'Content-Type': file.mime,
        'Cache-Control': 'no-store',
        'X-Content-Type-Options': 'nosniff',
      },
    });
  }
  return Response.json(
    {
      items: visible.map((x) => ({
        id: x.id,
        title: x.title,
        description: x.data.description,
        credit: x.data.credit,
        destination: all.find((p) => p.id === x.data.destinationId)?.title,
        source: x.data.sourceUrl,
      })),
    },
    { headers: { 'Cache-Control': 'no-store' } }
  );
}
