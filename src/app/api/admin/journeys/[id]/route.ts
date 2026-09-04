import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';

import { getDb, journeys, type NewJourneyRow } from '@/lib/db';
import { rejectCrossSiteWrite, requireAdmin } from '@/lib/db/admin-guard';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type RouteContext = { params: Promise<{ id: string }> };

const EDITABLE_FIELDS = [
  'slug',
  'title',
  'season',
  'seasonTags',
  'seasonVisuals',
  'dateLabel',
  'dateFrom',
  'dateTo',
  'location',
  'image',
  'backgroundVideo',
  'regions',
  'moods',
  'sustainablePdf',
  'position',
  'published',
] as const;

export async function PATCH(request: Request, context: RouteContext) {
  const unauthorized = (await requireAdmin()) ?? rejectCrossSiteWrite(request);
  if (unauthorized) return unauthorized;

  try {
    const { id } = await context.params;
    const journeyId = Number.parseInt(id, 10);
    if (!Number.isFinite(journeyId)) {
      return NextResponse.json({ error: 'Identifiant invalide.' }, { status: 400 });
    }

    const body = (await request.json()) as Partial<NewJourneyRow>;
    const updates: Record<string, unknown> = {};
    for (const field of EDITABLE_FIELDS) {
      if (field in body) {
        updates[field] = body[field];
      }
    }
    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'Aucun champ à mettre à jour.' }, { status: 400 });
    }
    updates.updatedAt = new Date();

    const db = getDb();
    const [updated] = await db
      .update(journeys)
      .set(updates)
      .where(eq(journeys.id, journeyId))
      .returning();

    if (!updated) {
      return NextResponse.json({ error: 'Voyage introuvable.' }, { status: 404 });
    }

    return NextResponse.json({ journey: updated });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Mise à jour impossible.' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request, context: RouteContext) {
  const unauthorized = (await requireAdmin()) ?? rejectCrossSiteWrite(request);
  if (unauthorized) return unauthorized;

  try {
    const { id } = await context.params;
    const journeyId = Number.parseInt(id, 10);
    if (!Number.isFinite(journeyId)) {
      return NextResponse.json({ error: 'Identifiant invalide.' }, { status: 400 });
    }

    const db = getDb();
    const [deleted] = await db.delete(journeys).where(eq(journeys.id, journeyId)).returning();
    if (!deleted) {
      return NextResponse.json({ error: 'Voyage introuvable.' }, { status: 404 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Suppression impossible.' },
      { status: 500 }
    );
  }
}
