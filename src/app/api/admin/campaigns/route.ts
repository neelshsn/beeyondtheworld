import { NextResponse } from 'next/server';

import { listAdminCampaignDocuments } from '@/lib/cms/campaign-content';
import { requireAdmin } from '@/lib/db/admin-guard';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  const denied = await requireAdmin();
  if (denied) return denied;

  try {
    const campaigns = await listAdminCampaignDocuments();
    return NextResponse.json(
      { campaigns, source: 'database' },
      { headers: { 'Cache-Control': 'private, no-store, max-age=0' } }
    );
  } catch (error) {
    console.error('Campaign admin list failed:', error);
    return NextResponse.json(
      { error: 'Les campagnes ne peuvent pas être chargées pour le moment.' },
      { status: 500 }
    );
  }
}
