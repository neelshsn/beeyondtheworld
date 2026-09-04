import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';
import { NextResponse } from 'next/server';

import { getDb, mediaAssets } from '@/lib/db';
import { getSessionAdmin } from '@/lib/db/admin-auth';
import { rejectCrossSiteWrite } from '@/lib/db/admin-guard';
import { ensureEditorialSchema } from '@/lib/db/ensure-editorial-schema';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const MAX_UPLOAD_BYTES = 500 * 1024 * 1024;
const ALLOWED_CONTENT_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/avif',
  'image/gif',
  'video/mp4',
  'video/webm',
  'video/quicktime',
  'application/pdf',
];

type UploadPayload = { originalName?: string; uploader?: string; size?: number };

function parsePayload(value: string | null | undefined): UploadPayload {
  try {
    return value ? (JSON.parse(value) as UploadPayload) : {};
  } catch {
    return {};
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as HandleUploadBody;
    if (!body || typeof body !== 'object' || !('type' in body)) {
      return NextResponse.json({ error: 'Demande de fichier invalide.' }, { status: 400 });
    }

    let uploader: string | null = null;
    if (body.type === 'blob.generate-client-token') {
      const denied = rejectCrossSiteWrite(request);
      if (denied) return denied;
      const admin = await getSessionAdmin();
      if (!admin) return NextResponse.json({ error: 'Session expirée.' }, { status: 401 });
      uploader = admin.email;
    }

    await ensureEditorialSchema();
    const response = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname, clientPayload) => {
        if (!uploader) throw new Error('Authentication required.');
        if (!pathname.startsWith('bee-media/')) throw new Error('Invalid upload path.');
        const payload = parsePayload(clientPayload);
        return {
          allowedContentTypes: ALLOWED_CONTENT_TYPES,
          maximumSizeInBytes: MAX_UPLOAD_BYTES,
          addRandomSuffix: true,
          tokenPayload: JSON.stringify({
            originalName: payload.originalName?.slice(0, 500) || pathname.split('/').pop(),
            uploader,
            size:
              typeof payload.size === 'number'
                ? Math.max(0, Math.min(MAX_UPLOAD_BYTES, Math.round(payload.size)))
                : 0,
          }),
        };
      },
      onUploadCompleted: async ({ blob, tokenPayload }) => {
        const payload = parsePayload(tokenPayload);
        const contentType = blob.contentType || 'application/octet-stream';
        const mediaType = contentType.startsWith('image/')
          ? 'image'
          : contentType.startsWith('video/')
            ? 'video'
            : 'document';
        await getDb()
          .insert(mediaAssets)
          .values({
            url: blob.url,
            pathname: blob.pathname,
            originalName: payload.originalName || blob.pathname.split('/').pop() || 'media',
            contentType,
            mediaType,
            size: payload.size ?? 0,
            uploadedBy: payload.uploader ?? null,
          })
          .onConflictDoNothing();
      },
    });
    return NextResponse.json(response);
  } catch (error) {
    console.error('Admin media upload failed:', error);
    return NextResponse.json(
      { error: "Le fichier n'a pas été envoyé. Réessaie dans un instant." },
      { status: 400 }
    );
  }
}
