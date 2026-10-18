import { describe, it, expect, vi } from 'vitest';
vi.mock('../src/lib/db/client', () => ({ withTransaction: vi.fn() }));
import {
  validResetPassword,
  validResetToken,
  resetDigest,
} from '../src/lib/community/password-reset';
describe('Community recovery input boundaries', () => {
  it('accepts only a full cryptographic token', () => {
    expect(validResetToken('a'.repeat(64))).toBe(true);
    for (const v of ['a'.repeat(63), 'g'.repeat(64), undefined, {}, 'abc'])
      expect(validResetToken(v)).toBe(false);
  });
  it('keeps the same password bounds as Community accounts', () => {
    expect(validResetPassword('a'.repeat(12))).toBe(true);
    expect(validResetPassword('a'.repeat(200))).toBe(true);
    for (const v of ['a'.repeat(11), 'a'.repeat(201), undefined, 14])
      expect(validResetPassword(v)).toBe(false);
  });
  it('stores a fixed one-way token fingerprint', () => {
    const token = 'a'.repeat(64);
    expect(resetDigest(token)).toMatch(/^[a-f0-9]{64}$/);
    expect(resetDigest(token)).not.toBe(token);
    expect(resetDigest(token)).not.toBe(resetDigest('b'.repeat(64)));
  });
});
