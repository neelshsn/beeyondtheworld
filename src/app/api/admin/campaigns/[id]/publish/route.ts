import { revalidatePath } from 'next/cache';
import { NextResponse } from 'next/server';

import { publishCampaignDocument } from '@/lib/cms/campaign-content';
import { getSessionAdmin } from '@/lib/db/admin-auth';
import { rejectCrossSiteWrite, requireAdmin } from '@/lib/db/admin-guard';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(request: Request, context: RouteContext) {
  const denied = (await requireAdmin()) ?? rejectCrossSiteWrite(request);
  if (denied) return denied;

  try {
    const { id } = await context.params;
    const documentId = Number.parseInt(id, 10);
    const body = (await request.json()) as { revision?: number };
    if (!Number.isInteger(documentId) || !Number.isInteger(body.revision)) {
      return NextResponse.json({ error: 'Publication incomplète.' }, { status: 400 });
    }
    const admin = await getSessionAdmin();
    if (!admin) return NextResponse.json({ error: 'Session expirée.' }, { status: 401 });

    const updated = await publishCampaignDocument({
      id: documentId,
      expectedRevision: body.revision as number,
      updatedBy: admin.email,
    });
    if (updated === 'conflict') {
      return NextResponse.json(
        { error: 'Le brouillon a changé. Recharge la page puis vérifie-le avant de publier.' },
        { status: 409 }
      );
    }
    if (!updated) return NextResponse.json({ error: 'Campagne introuvable.' }, { status: 404 });

    revalidatePath('/campaigns');
    revalidatePath(`/campaigns/${updated.slug}`);
    return NextResponse.json({ campaign: updated });
  } catch (error) {
    console.error('Campaign publish failed:', error);
    return NextResponse.json(
      { error: "La publication a échoué. L'ancienne version reste en ligne." },
      { status: 500 }
    );
  }
}
