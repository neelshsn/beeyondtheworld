import { NextResponse } from 'next/server';

import { updateCampaignDraft } from '@/lib/cms/campaign-content';
import { getSessionAdmin } from '@/lib/db/admin-auth';
import { rejectCrossSiteWrite, requireAdmin } from '@/lib/db/admin-guard';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: RouteContext) {
  const denied = (await requireAdmin()) ?? rejectCrossSiteWrite(request);
  if (denied) return denied;

  try {
    const { id } = await context.params;
    const documentId = Number.parseInt(id, 10);
    const body = (await request.json()) as { revision?: number; content?: unknown };
    if (!Number.isInteger(documentId) || !Number.isInteger(body.revision) || !body.content) {
      return NextResponse.json({ error: 'Brouillon incomplet.' }, { status: 400 });
    }
    const admin = await getSessionAdmin();
    if (!admin) return NextResponse.json({ error: 'Session expirée.' }, { status: 401 });

    const updated = await updateCampaignDraft({
      id: documentId,
      expectedRevision: body.revision as number,
      content: body.content,
      updatedBy: admin.email,
    });
    if (updated === 'conflict') {
      return NextResponse.json(
        {
          error: "Une version plus récente existe. Recharge la page avant d'enregistrer à nouveau.",
        },
        { status: 409 }
      );
    }
    if (!updated) return NextResponse.json({ error: 'Campagne introuvable.' }, { status: 404 });
    return NextResponse.json({ campaign: updated });
  } catch (error) {
    console.error('Campaign draft update failed:', error);
    return NextResponse.json(
      { error: "Le brouillon n'a pas été enregistré. Rien n'a été publié." },
      { status: 500 }
    );
  }
}
