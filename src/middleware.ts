import { NextRequest, NextResponse } from 'next/server';

// Previously issued private project links keep their destination. The bare
// Community URL always remains the public Bloom experience, for every visitor.
export function middleware(request: NextRequest) {
  const privateKeys = ['project', 'view', 'page', 'role', 'scope', 'tab', 'company', 'production'];
  if (privateKeys.some((key) => request.nextUrl.searchParams.has(key))) {
    const target = request.nextUrl.clone();
    target.pathname = '/dashboard';
    const response = NextResponse.redirect(target, 308);
    response.headers.set('Cache-Control', 'private, no-store');
    response.headers.set('X-Robots-Tag', 'noindex, nofollow');
    response.headers.set('Referrer-Policy', 'no-referrer');
    return response;
  }
  return NextResponse.next();
}
export const config = { matcher: ['/community'] };
