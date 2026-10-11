import { NextResponse } from 'next/server';
import gallery from '@/lib/review/gallery.json';
import { reviewAccess, REVIEW_COOKIE, privateHeaders } from '@/lib/review/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export async function GET(request: Request) {
  const url = new URL(request.url);
  const token = url.searchParams.get('access');
  const author = await reviewAccess(token || undefined);
  if (!author)
    return new Response(
      '<!doctype html><html lang="fr"><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>Comparateur Beeyond</title><body style="background:#f5f0e6;color:#244555;font:18px/1.6 Arial;max-width:650px;margin:15vh auto;padding:24px"><h1 style="font-family:Georgia;font-weight:400">Le comparateur Beeyond.</h1><p>Ouvrez votre lien personnel de revue, Eugénie ou Rachid, pour consulter les écrans et retrouver vos feedbacks.</p></body></html>',
      { status: 401, headers: { ...privateHeaders, 'Content-Type': 'text/html; charset=utf-8' } }
    );
  if (token) {
    // Relative redirect retains the incoming #view fragment without exposing the access link.
    const response = new NextResponse(null, {
      status: 303,
      headers: { ...privateHeaders, Location: '/community/comparator' },
    });
    response.cookies.set(REVIEW_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 180,
    });
    return response;
  }
  return new Response(gallery, {
    headers: {
      ...privateHeaders,
      'Content-Type': 'text/html; charset=utf-8',
      'Content-Security-Policy':
        "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' blob: data:; connect-src 'self'; object-src 'none'; base-uri 'none'; frame-ancestors 'none'; form-action 'self'",
    },
  });
}
