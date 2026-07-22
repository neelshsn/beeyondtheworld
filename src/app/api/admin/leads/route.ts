import { NextResponse } from 'next/server';

import { requireAdmin } from '@/lib/db/admin-guard';
import { listLeads } from '@/lib/leads/repository';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const url = new URL(request.url);
  const requestedLimit = Number(url.searchParams.get('limit') ?? 100);
  const leads = await listLeads(Number.isFinite(requestedLimit) ? requestedLimit : 100);
  return NextResponse.json(
    { leads },
    { headers: { 'Cache-Control': 'private, no-store, max-age=0' } }
  );
}
