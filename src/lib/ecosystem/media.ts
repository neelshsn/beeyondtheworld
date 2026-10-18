import 'server-only';
import { createHash, randomUUID } from 'node:crypto';
import sharp from 'sharp';
import { sqlClient, withTransaction } from '@/lib/db/client';
import { need, isUuid, assetIsApproved } from './model';
import { ecosystemAssetAccess, canUploadToAsset, mapAsset, type EcosystemAccess } from './server';
import {
  MEDIA_CHUNK,
  MAX_IMAGE,
  mediaSignature,
  safeMediaName,
  validMediaInput,
} from './media-model';

export type StoredMedia = {
  id: string;
  scope: string;
  asset_id: string;
  owner_user_id: string;
  purpose: string;
  source_media_id: string | null;
  name: string;
  mime: string;
  size: string | number;
  sha256: string | null;
  storage_state: string;
  chunk_size: number;
  chunk_count: number;
  metadata: Record<string, unknown>;
};
const hash = (b: Uint8Array) => createHash('sha256').update(b).digest('hex');
export async function mediaRecord(id: string, sql = sqlClient()) {
  need(isUuid(id), 'Invalid media.');
  const [m] = await sql.query<StoredMedia>('SELECT * FROM bee_ecosystem_media WHERE id=$1', [id]);
  need(m, 'Media unavailable.', 404, 'NOT_FOUND');
  return m;
}
export async function mediaBytes(
  m: StoredMedia,
  start = 0,
  end = Number(m.size) - 1,
  sql = sqlClient()
) {
  let source = m;
  if (m.source_media_id) {
    source = await mediaRecord(m.source_media_id, sql);
    need(
      source.asset_id === m.asset_id &&
        source.scope === m.scope &&
        source.storage_state === 'complete' &&
        !source.source_media_id,
      'Media unavailable.',
      404,
      'NOT_FOUND'
    );
  }
  const first = Math.floor(start / source.chunk_size),
    last = Math.floor(end / source.chunk_size);
  const rows = await sql.query<{ chunk_index: number; bytes: Buffer }>(
    'SELECT chunk_index,bytes FROM bee_ecosystem_media_chunks WHERE media_id=$1 AND chunk_index BETWEEN $2 AND $3 ORDER BY chunk_index',
    [source.id, first, last]
  );
  need(rows.length === last - first + 1, 'Media is incomplete.', 503);
  return Buffer.concat(rows.map((r) => r.bytes)).subarray(
    start - first * source.chunk_size,
    end - first * source.chunk_size + 1
  );
}
export async function initMedia(a: EcosystemAccess, b: Record<string, unknown>) {
  need(isUuid(b.assetId), 'Choose an asset slot.');
  const name = safeMediaName(b.name);
  need(
    name && validMediaInput(b.mime, b.size),
    'Use a supported image up to 20 MB or video up to 200 MB.'
  );
  const purpose = 'original';
  need(
    !b.purpose || b.purpose === 'original',
    'Public versions must be generated through the reviewed publication workflow.',
    403,
    'FORBIDDEN'
  );
  return withTransaction(async (sql) => {
    await sql.query("SELECT pg_advisory_xact_lock(hashtext('ecosystem-media:'||$1))", [a.userId]);
    const asset = await ecosystemAssetAccess(a, b.assetId as string, sql);
    need(
      canUploadToAsset(a, asset),
      'Creator approval is required before uploading.',
      403,
      'FORBIDDEN'
    );
    const [details] = await sql.query(
      'SELECT slot,version,authenticity,rights_review,safety,human_creative FROM bee_ecosystem_assets WHERE id=$1',
      [asset.id]
    );
    need(
      details.slot === 'photo'
        ? String(b.mime).startsWith('image/')
        : String(b.mime).startsWith('video/'),
      'Choose the right file format for this slot.'
    );
    const [quota] = await sql.query(
      "SELECT count(*) FILTER (WHERE storage_state='uploading')::int AS uploads,coalesce(sum(size) FILTER(WHERE storage_state<>'aborted'),0)::bigint AS bytes FROM bee_ecosystem_media WHERE owner_user_id=$1 AND scope=$2",
      [a.userId, a.scope]
    );
    need(quota.uploads < 4, 'Finish or cancel an upload before starting another.', 429);
    need(
      Number(quota.bytes) + Number(b.size) <= (a.isTeam ? 10 : 2) * 1024 ** 3,
      'Your media storage allowance has been reached.',
      413
    );
    const id = randomUUID(),
      count = Math.ceil(Number(b.size) / MEDIA_CHUNK);
    const declared: Record<string, unknown> = {
      baseVersion: details.version,
      technicalMetadataDeclared: true,
    };
    for (const field of ['width', 'height', 'durationSeconds'])
      if (b[field] !== undefined && b[field] !== null) {
        need(
          typeof b[field] === 'number' &&
            Number.isFinite(b[field]) &&
            Number(b[field]) > 0 &&
            Number(b[field]) <= (field === 'durationSeconds' ? 86400 : 50000),
          'Invalid technical media metadata.'
        );
        declared[field] = b[field];
      }
    await sql.query(
      'INSERT INTO bee_ecosystem_media(id,scope,asset_id,owner_user_id,purpose,name,mime,size,chunk_size,chunk_count,metadata) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11::jsonb)',
      [
        id,
        a.scope,
        asset.id,
        a.userId,
        purpose,
        name,
        b.mime,
        b.size,
        MEDIA_CHUNK,
        count,
        JSON.stringify(declared),
      ]
    );
    return { mediaId: id, chunkSize: MEDIA_CHUNK, chunks: count };
  });
}
export async function putMediaChunk(a: EcosystemAccess, id: string, index: number, bytes: Buffer) {
  need(isUuid(id) && Number.isInteger(index) && index >= 0 && index < 100, 'Invalid upload part.');
  need(bytes.length > 0 && bytes.length <= MEDIA_CHUNK, 'Upload parts must be at most 2 MB.', 413);
  return withTransaction(async (sql) => {
    const m = await mediaRecord(id, sql),
      asset = await ecosystemAssetAccess(a, m.asset_id, sql);
    need(
      m.purpose === 'original',
      'Public versions must use the reviewed publication workflow.',
      403,
      'FORBIDDEN'
    );
    need(
      m.scope === a.scope && m.owner_user_id === a.userId && canUploadToAsset(a, asset),
      'Upload access denied.',
      403,
      'FORBIDDEN'
    );
    await sql.query('SELECT id FROM bee_ecosystem_media WHERE id=$1 FOR UPDATE', [id]);
    const live = await mediaRecord(id, sql);
    need(live.storage_state === 'uploading', 'This upload is closed.', 409, 'CONFLICT');
    need(
      index < m.chunk_count &&
        bytes.length === Math.min(m.chunk_size, Number(m.size) - index * m.chunk_size),
      'Invalid part size.'
    );
    if (index === 0)
      need(mediaSignature(bytes, m.mime), 'The file does not match its declared format.');
    const [old] = await sql.query(
      'SELECT sha256 FROM bee_ecosystem_media_chunks WHERE media_id=$1 AND chunk_index=$2',
      [id, index]
    );
    const checksum = hash(bytes);
    if (old) {
      need(old.sha256 === checksum, 'This upload part has changed.', 409, 'CONFLICT');
      return { ok: true, index };
    }
    await sql.query(
      'INSERT INTO bee_ecosystem_media_chunks(media_id,chunk_index,size,sha256,bytes) VALUES($1,$2,$3,$4,$5)',
      [id, index, bytes.length, checksum, bytes]
    );
    await sql.query(
      'UPDATE bee_ecosystem_media SET received_chunks=received_chunks+1 WHERE id=$1',
      [id]
    );
    return { ok: true, index };
  });
}
export async function completeMedia(a: EcosystemAccess, id: string) {
  return withTransaction(async (sql) => {
    const initial = await mediaRecord(id, sql),
      asset = await ecosystemAssetAccess(a, initial.asset_id, sql);
    need(
      initial.scope === a.scope && initial.owner_user_id === a.userId && canUploadToAsset(a, asset),
      'Upload access denied.',
      403,
      'FORBIDDEN'
    );
    await sql.query('SELECT id FROM bee_ecosystem_assets WHERE id=$1 FOR UPDATE', [asset.id]);
    await sql.query('SELECT id FROM bee_ecosystem_media WHERE id=$1 FOR UPDATE', [id]);
    const m = await mediaRecord(id, sql);
    need(
      m.purpose === 'original',
      'Public versions must use the reviewed publication workflow.',
      403,
      'FORBIDDEN'
    );
    if (m.storage_state === 'complete') return { mediaId: id, sha256: m.sha256 };
    need(m.storage_state === 'uploading', 'This upload is closed.', 409, 'CONFLICT');
    const [current] = await sql.query(
      'SELECT version,authenticity,rights_review,safety,human_creative FROM bee_ecosystem_assets WHERE id=$1',
      [asset.id]
    );
    need(
      current.version === Number(m.metadata.baseVersion),
      'This slot changed during upload. Reload it before replacing the file.',
      409,
      'CONFLICT'
    );
    const parts = await sql.query<{ chunk_index: number; size: number }>(
      'SELECT chunk_index,size FROM bee_ecosystem_media_chunks WHERE media_id=$1 ORDER BY chunk_index',
      [id]
    );
    need(
      parts.length === m.chunk_count &&
        parts.every((p, i) => p.chunk_index === i) &&
        parts.reduce((n, p) => n + p.size, 0) === Number(m.size),
      'Upload all parts before finishing.'
    );
    const checksum = createHash('sha256');
    for (let i = 0; i < m.chunk_count; i++) {
      const [part] = await sql.query<{ bytes: Buffer }>(
        'SELECT bytes FROM bee_ecosystem_media_chunks WHERE media_id=$1 AND chunk_index=$2',
        [id, i]
      );
      checksum.update(part.bytes);
    }
    const sha256 = checksum.digest('hex');
    let metadata: Record<string, unknown> = { ...m.metadata };
    if (m.mime.startsWith('image/')) {
      const image = await mediaBytes(m, 0, Number(m.size) - 1, sql);
      const info = await sharp(image, { limitInputPixels: 50_000_000 })
        .metadata()
        .catch(() => {
          need(
            false,
            'This image is damaged or exceeds the supported pixel limit. Choose another original.'
          );
        });
      await sharp(image, { limitInputPixels: 50_000_000 })
        .resize(1, 1)
        .raw()
        .toBuffer()
        .catch(() => {
          need(false, 'This image is damaged. Choose another original.');
        });
      need(info.width && info.height, 'This image could not be read.');
      metadata = {
        ...metadata,
        width: info.width,
        height: info.height,
        hasExif: !!info.exif,
        metadataDoesNotProveAuthenticity: true,
      };
    }
    await sql.query(
      "UPDATE bee_ecosystem_media SET storage_state='complete',sha256=$2,metadata=$3::jsonb,completed_at=now() WHERE id=$1",
      [id, sha256, JSON.stringify(metadata)]
    );
    await sql.query('DELETE FROM bee_ecosystem_journey_assets WHERE asset_id=$1', [asset.id]);
    if (m.purpose === 'original') {
      await sql.query(
        "UPDATE bee_ecosystem_assets SET active_media_id=$2,public_media_id=NULL,duration_seconds=$3,width=$4,height=$5,status='draft',authenticity='pending',rights_review='pending',safety='pending',human_creative='pending',version=version+1,updated_at=now() WHERE id=$1",
        [
          asset.id,
          id,
          m.mime.startsWith('video/') ? (metadata.durationSeconds ?? null) : null,
          metadata.width ?? null,
          metadata.height ?? null,
        ]
      );
      await sql.query(
        "UPDATE bee_ecosystem_kits SET status='draft',version=version+1,updated_at=now() WHERE id=(SELECT kit_id FROM bee_ecosystem_assets WHERE id=$1)",
        [asset.id]
      );
    } else
      await sql.query(
        'UPDATE bee_ecosystem_assets SET public_media_id=$2,version=version+1,updated_at=now() WHERE id=$1',
        [asset.id, id]
      );
    await sql.query(
      "INSERT INTO bee_ecosystem_events(scope,entity_type,entity_id,actor_id,action,snapshot) VALUES($1,'asset',$2,$3,'media_uploaded',$4::jsonb)",
      [
        a.scope,
        asset.id,
        a.userId,
        JSON.stringify({ mediaId: id, purpose: m.purpose, sha256, size: Number(m.size) }),
      ]
    );
    return { mediaId: id, sha256, metadata };
  });
}
export async function abortMedia(a: EcosystemAccess, id: string) {
  return withTransaction(async (sql) => {
    const m = await mediaRecord(id, sql);
    await ecosystemAssetAccess(a, m.asset_id, sql);
    need(
      m.scope === a.scope && m.owner_user_id === a.userId,
      'Upload access denied.',
      403,
      'FORBIDDEN'
    );
    const rows = await sql.query(
      "UPDATE bee_ecosystem_media SET storage_state='aborted' WHERE id=$1 AND storage_state='uploading' RETURNING id",
      [id]
    );
    if (rows.length)
      await sql.query('DELETE FROM bee_ecosystem_media_chunks WHERE media_id=$1', [id]);
    return { ok: true };
  });
}
export async function preparePublicMedia(a: EcosystemAccess, assetId: string) {
  need(a.isTeam, 'The studio prepares publication.', 403, 'FORBIDDEN');
  return withTransaction(async (sql) => {
    const asset = await ecosystemAssetAccess(a, assetId, sql);
    await sql.query('SELECT id FROM bee_ecosystem_assets WHERE id=$1 FOR UPDATE', [asset.id]);
    const [details] = await sql.query('SELECT * FROM bee_ecosystem_assets WHERE id=$1', [asset.id]);
    need(
      assetIsApproved(mapAsset(details)),
      'Complete authenticity, rights, safety and creative reviews first.'
    );
    need(
      details.rights_scope === 'public_journeys' &&
        details.rights_evidence &&
        details.rights_expires_at &&
        new Date(details.rights_expires_at).getTime() + 86400000 > Date.now(),
      'A current public licence is required.'
    );
    need(asset.active_media_id, 'Upload the original file first.');
    const original = await mediaRecord(asset.active_media_id, sql);
    need(original.storage_state === 'complete', 'The original file is incomplete.');
    let bytes: Buffer | null = null,
      mime = original.mime,
      name = original.name,
      sourceId: string | null = original.id;
    if (original.mime.startsWith('image/')) {
      need(Number(original.size) <= MAX_IMAGE, 'Image exceeds the supported size.');
      let transform = sharp(await mediaBytes(original, 0, Number(original.size) - 1, sql), {
        limitInputPixels: 50_000_000,
      })
        .rotate()
        .resize({ width: 1600, height: 1600, fit: 'inside', withoutEnlargement: true });
      if (details.soft_fade_consent) {
        const resized = await transform.png().toBuffer(),
          info = await sharp(resized).metadata(),
          w = info.width!,
          h = info.height!;
        const overlay = Buffer.from(
          `<svg width="${w}" height="${h}"><defs><linearGradient id="f" x1="0" y1="0" x2="0" y2="1"><stop offset="55%" stop-color="#193743" stop-opacity="0"/><stop offset="100%" stop-color="#193743" stop-opacity=".32"/></linearGradient></defs><rect width="100%" height="100%" fill="url(#f)"/></svg>`
        );
        transform = sharp(resized).composite([{ input: overlay }]);
      }
      bytes = await transform.webp({ quality: 84 }).toBuffer();
      mime = 'image/webp';
      name = original.name.replace(/\.[^.]+$/, '') + '-bee.webp';
      sourceId = null;
    }
    const id = randomUUID(),
      size = bytes?.length ?? Number(original.size),
      count = Math.ceil(size / MEDIA_CHUNK),
      sha256 = bytes ? hash(bytes) : original.sha256;
    await sql.query(
      "INSERT INTO bee_ecosystem_media(id,scope,asset_id,owner_user_id,purpose,source_media_id,name,mime,size,sha256,storage_state,chunk_size,chunk_count,received_chunks,metadata,completed_at) VALUES($1,$2,$3,$4,'public_rendition',$5,$6,$7,$8,$9,'complete',$10,$11,$11,$12::jsonb,now())",
      [
        id,
        a.scope,
        asset.id,
        a.userId,
        sourceId,
        name,
        mime,
        size,
        sha256,
        MEDIA_CHUNK,
        count,
        JSON.stringify({
          preparedBy: a.email,
          originalId: original.id,
          softFade: !!bytes && !!details.soft_fade_consent,
          softFadeApplied: !!bytes && !!details.soft_fade_consent,
          originalEditPreserved: !bytes,
        }),
      ]
    );
    if (bytes)
      for (let i = 0; i < count; i++) {
        const part = bytes.subarray(i * MEDIA_CHUNK, (i + 1) * MEDIA_CHUNK);
        await sql.query(
          'INSERT INTO bee_ecosystem_media_chunks(media_id,chunk_index,size,sha256,bytes) VALUES($1,$2,$3,$4,$5)',
          [id, i, part.length, hash(part), part]
        );
      }
    await sql.query('DELETE FROM bee_ecosystem_journey_assets WHERE asset_id=$1', [asset.id]);
    await sql.query(
      "UPDATE bee_ecosystem_assets SET public_media_id=$2,status=CASE WHEN status='published' THEN 'approved' ELSE status END,version=version+1,updated_at=now() WHERE id=$1",
      [asset.id, id]
    );
    await sql.query(
      "UPDATE bee_ecosystem_kits SET status='ready',version=version+1,updated_at=now() WHERE id=(SELECT kit_id FROM bee_ecosystem_assets WHERE id=$1) AND status='published'",
      [asset.id]
    );
    await sql.query(
      "INSERT INTO bee_ecosystem_events(scope,entity_type,entity_id,actor_id,action,snapshot) VALUES($1,'asset',$2,$3,'public_version_prepared',$4::jsonb)",
      [
        a.scope,
        asset.id,
        a.userId,
        JSON.stringify({
          mediaId: id,
          sourceMediaId: original.id,
          softFadeApplied: !!bytes && !!details.soft_fade_consent,
        }),
      ]
    );
    return { mediaId: id, mime, size };
  });
}
