import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';

import { getDb, locations, type NewLocationRow } from '@/lib/db';
import { rejectCrossSiteWrite, requireAdmin } from '@/lib/db/admin-guard';
import {
  getLegacyPortugalLocationImports,
  markJourneyLocationsManaged,
} from '@/lib/cms/journey-location-management';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type RouteContext = { params: Promise<{ id: string }> };

const EDITABLE_FIELDS = [
  'name',
  'subtitle',
  'leftTitle',
  'narrative',
  'image',
  'video',
  'media',
  'position',
  'published',
] as const;

export async function PATCH(request: Request, context: RouteContext) {
  const unauthorized = (await requireAdmin()) ?? rejectCrossSiteWrite(request);
  if (unauthorized) return unauthorized;

  try {
    const { id } = await context.params;
    const locationId = Number.parseInt(id, 10);
    if (!Number.isFinite(locationId)) {
      return NextResponse.json({ error: 'Identifiant invalide.' }, { status: 400 });
    }

    const body = (await request.json()) as Partial<NewLocationRow>;
    if ('name' in body && (typeof body.name !== 'string' || !body.name.trim())) {
      return NextResponse.json({ error: 'Le nom de la Location est requis.' }, { status: 400 });
    }
    if (typeof body.name === 'string') body.name = body.name.trim();
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
    const [existing] = await db
      .select({ journeyId: locations.journeyId })
      .from(locations)
      .where(eq(locations.id, locationId))
      .limit(1);
    if (!existing) return NextResponse.json({ error: 'Location introuvable.' }, { status: 404 });
    const imports = await getLegacyPortugalLocationImports(existing.journeyId);
    const mutation = db
      .update(locations)
      .set(updates)
      .where(eq(locations.id, locationId))
      .returning();
    const marker = markJourneyLocationsManaged(existing.journeyId);
    const updatedRows =
      imports.length > 0
        ? (await db.batch([db.insert(locations).values(imports), mutation, marker]))[1]
        : (await db.batch([mutation, marker]))[0];
    const [updated] = updatedRows;

    if (!updated) {
      return NextResponse.json({ error: 'Location introuvable.' }, { status: 404 });
    }

    return NextResponse.json({ location: updated });
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
    const locationId = Number.parseInt(id, 10);
    if (!Number.isFinite(locationId)) {
      return NextResponse.json({ error: 'Identifiant invalide.' }, { status: 400 });
    }

    const db = getDb();
    const [existing] = await db
      .select({ journeyId: locations.journeyId })
      .from(locations)
      .where(eq(locations.id, locationId))
      .limit(1);
    if (!existing) return NextResponse.json({ error: 'Location introuvable.' }, { status: 404 });
    const imports = await getLegacyPortugalLocationImports(existing.journeyId);
    const mutation = db.delete(locations).where(eq(locations.id, locationId)).returning();
    const marker = markJourneyLocationsManaged(existing.journeyId);
    const deletedRows =
      imports.length > 0
        ? (await db.batch([db.insert(locations).values(imports), mutation, marker]))[1]
        : (await db.batch([mutation, marker]))[0];
    const [deleted] = deletedRows;
    if (!deleted) {
      return NextResponse.json({ error: 'Location introuvable.' }, { status: 404 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Suppression impossible.' },
      { status: 500 }
    );
  }
}
