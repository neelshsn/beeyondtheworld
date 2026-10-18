import sharp from 'sharp';
import { rejectCrossSiteWrite } from '@/lib/db/admin-guard';
import { ecosystemAccess, ecosystemAssetAccess, ecosystemFailure } from '@/lib/ecosystem/server';
import { need } from '@/lib/ecosystem/model';
import { MEDIA_CHUNK, mediaRange } from '@/lib/ecosystem/media-model';
import {
  abortMedia,
  completeMedia,
  initMedia,
  mediaBytes,
  mediaRecord,
  preparePublicMedia,
  putMediaChunk,
} from '@/lib/ecosystem/media';
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 120;
const headers = {
  'Cache-Control': 'private, no-store',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'no-referrer',
};
const reply = (data: unknown) => Response.json(data, { headers });
export async function POST(request: Request) {
  const denied = rejectCrossSiteWrite(request);
  if (denied) return denied;
  try {
    const a = await ecosystemAccess(request),
      raw = await request.text();
    need(raw.length <= 8192, 'Request too large.', 413);
    let b;
    try {
      b = JSON.parse(raw);
    } catch {
      need(false, 'Invalid request.');
    }
    need(b && typeof b === 'object' && !Array.isArray(b), 'Invalid request.');
    if (b.action === 'init') return reply(await initMedia(a, b));
    if (b.action === 'complete') return reply(await completeMedia(a, b.id));
    if (b.action === 'abort') return reply(await abortMedia(a, b.id));
    if (b.action === 'prepare-public') return reply(await preparePublicMedia(a, b.assetId));
    need(false, 'Unknown upload action.');
  } catch (e) {
    return ecosystemFailure(e);
  }
}
export async function PUT(request: Request) {
  const denied = rejectCrossSiteWrite(request);
  if (denied) return denied;
  try {
    const a = await ecosystemAccess(request),
      url = new URL(request.url);
    const index = url.searchParams.get('index');
    need(index !== null && /^\d+$/.test(index), 'Choose a valid upload part.');
    need(
      Number(request.headers.get('content-length') || 0) <= MEDIA_CHUNK,
      'Upload parts must be at most 2 MB.',
      413
    );
    const data = Buffer.from(await request.arrayBuffer());
    return reply(await putMediaChunk(a, url.searchParams.get('id') || '', Number(index), data));
  } catch (e) {
    return ecosystemFailure(e);
  }
}
export async function GET(request: Request) {
  try {
    const a = await ecosystemAccess(request),
      u = new URL(request.url),
      m = await mediaRecord(u.searchParams.get('id') || '');
    await ecosystemAssetAccess(a, m.asset_id);
    need(
      m.scope === a.scope && m.storage_state === 'complete',
      'Media unavailable.',
      404,
      'NOT_FOUND'
    );
    const size = Number(m.size);
    if (u.searchParams.get('meta') === '1')
      return reply({
        id: m.id,
        name: m.name,
        mime: m.mime,
        size,
        sha256: m.sha256,
        metadata: m.metadata,
      });
    if (
      m.mime.startsWith('image/') &&
      u.searchParams.get('download') !== '1' &&
      !request.headers.get('range')
    ) {
      const b = await sharp(await mediaBytes(m), { limitInputPixels: 50_000_000 })
        .rotate()
        .resize({ width: 1400, height: 1400, fit: 'inside', withoutEnlargement: true })
        .webp({ quality: 78 })
        .toBuffer();
      return new Response(new Uint8Array(b), {
        headers: { ...headers, 'Content-Type': 'image/webp', 'Content-Length': String(b.length) },
      });
    }
    const range = mediaRange(request.headers.get('range'), size);
    if (range === false)
      return new Response(null, {
        status: 416,
        headers: { ...headers, 'Content-Range': `bytes */${size}` },
      });
    need(range || size <= MEDIA_CHUNK, 'Download this original in parts.', 413);
    const start = range ? range.start : 0,
      end = range ? range.end : size - 1,
      bytes = await mediaBytes(m, start, end);
    return new Response(new Uint8Array(bytes), {
      status: range ? 206 : 200,
      headers: {
        ...headers,
        'Content-Type': m.mime,
        'Content-Length': String(bytes.length),
        'Accept-Ranges': 'bytes',
        ...(range ? { 'Content-Range': `bytes ${start}-${end}/${size}` } : {}),
        'Content-Disposition': `${u.searchParams.get('download') === '1' ? 'attachment' : 'inline'}; filename="${m.name.replace(/[^\x20-\x7e]/g, '_')}"; filename*=UTF-8''${encodeURIComponent(m.name)}`,
      },
    });
  } catch (e) {
    return ecosystemFailure(e);
  }
}
