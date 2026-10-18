import { publicPoetAssets, publicPoetMedia } from '@/lib/ecosystem/public';
import { mediaBytes } from '@/lib/ecosystem/media';
import { mediaRange, MEDIA_CHUNK } from '@/lib/ecosystem/media-model';
import { isUuid } from '@/lib/ecosystem/model';
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
const headers = {
  'Cache-Control': 'no-store',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'no-referrer',
};
export async function GET(request: Request) {
  try {
    const u = new URL(request.url),
      asset = u.searchParams.get('asset');
    if (asset) {
      if (!isUuid(asset)) return new Response('Unavailable', { status: 404, headers });
      const m = await publicPoetMedia(asset);
      if (!m) return new Response('Unavailable', { status: 404, headers });
      const size = Number(m.size),
        range = mediaRange(request.headers.get('range'), size);
      if (range === false)
        return new Response(null, {
          status: 416,
          headers: { ...headers, 'Content-Range': `bytes */${size}` },
        });
      const chosen =
        range ||
        (m.mime.startsWith('video/') ? { start: 0, end: Math.min(size, MEDIA_CHUNK) - 1 } : null);
      const start = chosen ? chosen.start : 0,
        end = chosen ? chosen.end : size - 1;
      if (end - start + 1 > 4 * 1024 * 1024)
        return new Response('Unavailable', { status: 413, headers });
      const bytes = await mediaBytes(m, start, end);
      return new Response(new Uint8Array(bytes), {
        status: chosen ? 206 : 200,
        headers: {
          ...headers,
          'Content-Type': m.mime,
          'Content-Length': String(bytes.length),
          'Accept-Ranges': 'bytes',
          ...(chosen ? { 'Content-Range': `bytes ${start}-${end}/${size}` } : {}),
        },
      });
    }
    const slug = u.searchParams.get('journey') || '';
    if (!/^[a-z0-9-]{1,120}$/.test(slug)) return Response.json({ items: [] }, { headers });
    return Response.json({ items: await publicPoetAssets(slug) }, { headers });
  } catch {
    return Response.json(
      { error: 'The showreel is temporarily unavailable.' },
      { status: 503, headers }
    );
  }
}
