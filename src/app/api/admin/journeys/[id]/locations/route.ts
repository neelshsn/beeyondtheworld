import { asc, eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';

import { getDb, journeys, locations, type LocationRow, type NewLocationRow } from '@/lib/db';
import { rejectCrossSiteWrite, requireAdmin } from '@/lib/db/admin-guard';
import { journeyLocationSeeds } from '@/data/journey-location-seeds';
import { isLocationSeasonSelection, LOCATION_SEASONS } from '@/lib/cms/journey-location-settings';
import {
  markJourneyLocationsManaged,
  planLegacyPortugalLocationImports,
} from '@/lib/cms/journey-location-management';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  try {
    const { id } = await context.params;
    const journeyId = Number.parseInt(id, 10);
    if (!Number.isFinite(journeyId)) {
      return NextResponse.json({ error: 'Identifiant invalide.' }, { status: 400 });
    }

    const db = getDb();
    const rows = await db
      .select()
      .from(locations)
      .where(eq(locations.journeyId, journeyId))
      .orderBy(asc(locations.position), asc(locations.id));

    return NextResponse.json({ locations: rows });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erreur base de données.' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request, context: RouteContext) {
  const unauthorized = (await requireAdmin()) ?? rejectCrossSiteWrite(request);
  if (unauthorized) return unauthorized;

  try {
    const { id } = await context.params;
    const journeyId = Number.parseInt(id, 10);
    if (!Number.isFinite(journeyId)) {
      return NextResponse.json({ error: 'Identifiant invalide.' }, { status: 400 });
    }

    const body = (await request.json()) as Partial<NewLocationRow>;
    if (typeof body.name !== 'string' || !body.name.trim()) {
      return NextResponse.json({ error: 'Le nom de la Location est requis.' }, { status: 400 });
    }
    if ('seasonTags' in body && !isLocationSeasonSelection(body.seasonTags)) {
      return NextResponse.json(
        { error: 'Choisis SS, FW ou les deux pour cette Location.' },
        { status: 400 }
      );
    }

    const db = getDb();
    const [journey] = await db.select().from(journeys).where(eq(journeys.id, journeyId)).limit(1);
    if (!journey) return NextResponse.json({ error: 'Voyage introuvable.' }, { status: 404 });
    const existing = await db
      .select({
        id: locations.id,
        position: locations.position,
        name: locations.name,
        published: locations.published,
      })
      .from(locations)
      .where(eq(locations.journeyId, journeyId));
    const metadata = journey.seasonVisuals._cms as { locationsManaged?: boolean } | undefined;
    const initialSeed =
      existing.length === 0 && !metadata?.locationsManaged
        ? (journeyLocationSeeds[journey.slug] ?? [])
        : [];
    const imports: NewLocationRow[] =
      initialSeed.length > 0
        ? initialSeed.map((location, position) => ({
            journeyId,
            ...location,
            position,
            published: true,
          }))
        : planLegacyPortugalLocationImports(journey, existing);
    // Preserve the live static steps when the first CMS Location is added.
    const nextPosition =
      Math.max(
        -1,
        ...existing.map((location) => location.position),
        ...imports.map((location) => location.position ?? 0)
      ) + 1;
    const createQuery = db
      .insert(locations)
      .values({
        journeyId,
        name: body.name.trim(),
        subtitle: body.subtitle ?? null,
        leftTitle: body.leftTitle ?? [],
        narrative: body.narrative ?? '',
        image: body.image ?? null,
        video: body.video ?? null,
        seasonTags: body.seasonTags ?? [...LOCATION_SEASONS],
        media: body.media ?? [],
        position: nextPosition,
        published: body.published ?? false,
      })
      .returning();
    const markQuery = markJourneyLocationsManaged(journeyId);
    let created: LocationRow;
    if (imports.length > 0) {
      const [, createdRows] = await db.batch([
        db.insert(locations).values(imports),
        createQuery,
        markQuery,
      ]);
      [created] = createdRows;
    } else {
      const [createdRows] = await db.batch([createQuery, markQuery]);
      [created] = createdRows;
    }

    return NextResponse.json({ location: created }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Création impossible.' },
      { status: 500 }
    );
  }
}
