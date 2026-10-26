import { NextResponse } from 'next/server';

const privateHeaders = {
  'Cache-Control': 'private, no-store',
  'Referrer-Policy': 'no-referrer',
  'X-Robots-Tag': 'noindex, nofollow',
};

export function privatePermanentRedirect(request: Request, pathname: string) {
  const target = new URL(request.url);
  target.pathname = pathname;
  const response = NextResponse.redirect(target, 308);
  for (const [name, value] of Object.entries(privateHeaders)) response.headers.set(name, value);
  return response;
}
