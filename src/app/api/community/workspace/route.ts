import { NextResponse } from 'next/server';
import { workspace } from '@/lib/community/server';
export const dynamic = 'force-dynamic';
export async function GET(request: Request) {
  try {
    const data = await workspace(new URL(request.url).searchParams.get('project') || undefined);
    return data
      ? NextResponse.json(data, { headers: { 'Cache-Control': 'private, no-store' } })
      : NextResponse.json({ error: 'Sign in with an assigned account.' }, { status: 401 });
  } catch {
    return NextResponse.json(
      { error: 'The workspace could not be loaded. Please retry.' },
      { status: 503 }
    );
  }
}
