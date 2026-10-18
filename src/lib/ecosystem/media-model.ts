export const MEDIA_CHUNK = 2 * 1024 * 1024;
export const MAX_IMAGE = 20 * 1024 * 1024;
export const MAX_VIDEO = 200 * 1024 * 1024;
export const mediaMimes = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'video/mp4',
  'video/quicktime',
  'video/webm',
] as const;
export function safeMediaName(value: unknown) {
  return typeof value === 'string'
    ? value
        .replace(/[\x00-\x1f\x7f/\\";]/g, '_')
        .trim()
        .slice(0, 180)
    : '';
}
export function validMediaInput(mime: unknown, size: unknown) {
  return (
    typeof mime === 'string' &&
    (mediaMimes as readonly string[]).includes(mime) &&
    Number.isSafeInteger(size) &&
    Number(size) > 0 &&
    Number(size) <= (mime.startsWith('image/') ? MAX_IMAGE : MAX_VIDEO)
  );
}
export function mediaSignature(bytes: Uint8Array, mime: string) {
  const b = Buffer.from(bytes);
  if (mime === 'image/jpeg') return b[0] === 255 && b[1] === 216 && b[2] === 255;
  if (mime === 'image/png')
    return b.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
  if (mime === 'image/webp')
    return b.toString('ascii', 0, 4) === 'RIFF' && b.toString('ascii', 8, 12) === 'WEBP';
  if (mime === 'video/webm') return b.subarray(0, 4).equals(Buffer.from([26, 69, 223, 163]));
  return ['video/mp4', 'video/quicktime'].includes(mime) && b.toString('ascii', 4, 8) === 'ftyp';
}
export function mediaRange(header: string | null, size: number) {
  if (!header) return null;
  const m = /^bytes=(\d*)-(\d*)$/.exec(header);
  if (!m || (!m[1] && !m[2])) return false;
  const start = m[1] ? Number(m[1]) : Math.max(0, size - Number(m[2]));
  const desiredEnd = m[1] && m[2] ? Number(m[2]) : size - 1;
  if (
    !Number.isSafeInteger(start) ||
    !Number.isSafeInteger(desiredEnd) ||
    start < 0 ||
    start >= size ||
    desiredEnd < start
  )
    return false;
  return { start, end: Math.min(size - 1, desiredEnd, start + MEDIA_CHUNK - 1) };
}
