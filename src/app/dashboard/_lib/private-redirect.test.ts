import { describe, expect, it } from 'vitest';
import { privatePermanentRedirect } from './private-redirect';

describe('private legacy redirects', () => {
  it('preserves the query and applies private crawler headers', () => {
    const response = privatePermanentRedirect(
      new Request('https://example.test/community/ecosystem?scope=demo&tab=kits'),
      '/dashboard/ecosystem'
    );

    expect(response.status).toBe(308);
    expect(response.headers.get('location')).toBe(
      'https://example.test/dashboard/ecosystem?scope=demo&tab=kits'
    );
    expect(response.headers.get('cache-control')).toBe('private, no-store');
    expect(response.headers.get('x-robots-tag')).toBe('noindex, nofollow');
    expect(response.headers.get('referrer-policy')).toBe('no-referrer');
  });
});
