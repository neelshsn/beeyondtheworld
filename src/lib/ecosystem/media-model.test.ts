import { describe, it, expect } from 'vitest';
import {
  MEDIA_CHUNK,
  mediaRange,
  mediaSignature,
  safeMediaName,
  validMediaInput,
} from './media-model';
describe('media safety and range protocol', () => {
  it('bounds file sizes and accepts only supported original formats', () => {
    expect(validMediaInput('video/mp4', 200 * 1024 * 1024)).toBe(true);
    expect(validMediaInput('video/mp4', 200 * 1024 * 1024 + 1)).toBe(false);
    expect(validMediaInput('image/jpeg', 21 * 1024 * 1024)).toBe(false);
    expect(validMediaInput('image/svg+xml', 100)).toBe(false);
    expect(validMediaInput('image/jpeg', -1)).toBe(false);
  });
  it('checks original signatures rather than trusting MIME declarations', () => {
    expect(mediaSignature(Buffer.from([255, 216, 255, 1]), 'image/jpeg')).toBe(true);
    expect(mediaSignature(Buffer.from('<script>alert(1)</script>'), 'image/jpeg')).toBe(false);
    expect(mediaSignature(Buffer.from([26, 69, 223, 163, 0]), 'video/webm')).toBe(true);
  });
  it('caps open and explicit ranges under the hosting response size limit', () => {
    expect(mediaRange('bytes=0-', 10_000_000)).toEqual({ start: 0, end: MEDIA_CHUNK - 1 });
    expect(mediaRange('bytes=100-200', 1000)).toEqual({ start: 100, end: 200 });
    expect(mediaRange('bytes=-10', 1000)).toEqual({ start: 990, end: 999 });
    expect(mediaRange('bytes=999-', 1000)).toEqual({ start: 999, end: 999 });
    expect(mediaRange('bytes=1000-', 1000)).toBe(false);
    expect(mediaRange('bytes=0-1,4-5', 1000)).toBe(false);
    expect(mediaRange('bytes=2-1', 1000)).toBe(false);
  });
  it('keeps user filenames out of response header syntax', () => {
    expect(safeMediaName('../a\r\n";.jpg')).not.toMatch(/[\r\n";/\\]/);
  });
});
