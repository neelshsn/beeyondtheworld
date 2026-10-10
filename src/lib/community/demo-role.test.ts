import { describe, it, expect } from 'vitest';
import { readDemoRole, signDemoRole } from './demo-role';
describe('Demo role scope', () => {
  it('binds a role to a single authenticated session and project', () => {
    const value = signDemoRole('random-session-a', 'demo-a', 'ngo');
    expect(readDemoRole(value, 'random-session-a', 'demo-a')).toBe('ngo');
    expect(readDemoRole(value, 'other-session', 'demo-a')).toBeNull();
    expect(readDemoRole(value, 'random-session-a', 'real-project')).toBeNull();
  });
  it('rejects tampering and malformed values without throwing', () => {
    const value = signDemoRole('session', 'demo', 'brand');
    for (const invalid of [
      undefined,
      '',
      'a.b',
      value + '.extra',
      value.replace(/^./, 'x'),
      'x'.repeat(513),
    ])
      expect(readDemoRole(invalid, 'session', 'demo')).toBeNull();
    expect(readDemoRole(value, undefined, 'demo')).toBeNull();
  });
});
