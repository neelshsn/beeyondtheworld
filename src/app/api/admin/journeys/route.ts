import { asc } from 'drizzle-orm';
import { NextResponse } from 'next/server';

import { getDb, journeys, locations, type NewJourneyRow } from '@/lib/db';
import { requireAdmin } from '@/lib/db/admin-guard';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  try {
    const db = getDb();
    const [journeyRows, locationRows] = await Promise.all([
      db.select().from(journeys).orderBy(asc(journeys.position), asc(journeys.id)),
      db.select().from(locations).orderBy(asc(locations.position), asc(locations.id)),
    ]);

    const withLocations = journeyRows.map((journey) => ({
      ...journey,
      locations: locationRows.filter((location) => location.journeyId === journey.id),
    }));

    return NextResponse.json({ journeys: withLocations });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erreur base de données.' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  try {
    const body = (await request.json()) as Partial<NewJourneyRow>;
    if (!body.slug || !body.title) {
      return NextResponse.json({ error: 'slug et title sont requis.' }, { status: 400 });
    }

    const db = getDb();
    const [created] = await db
      .insert(journeys)
      .values({
        slug: body.slug,
        title: body.title,
        season: body.season ?? 'spring-summer',
        seasonTags: body.seasonTags ?? [],
        seasonVisuals: body.seasonVisuals ?? {},
        dateLabel: body.dateLabel ?? '',
        dateFrom: body.dateFrom ?? null,
        dateTo: body.dateTo ?? null,
        location: body.location ?? '',
        image: body.image ?? '',
        backgroundVideo: body.backgroundVideo ?? null,
        regions: body.regions ?? [],
        moods: body.moods ?? [],
        sustainablePdf: body.sustainablePdf ?? null,
        position: body.position ?? 0,
        published: body.published ?? true,
      })
      .returning();

    return NextResponse.json({ journey: created }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Création impossible.' },
      { status: 500 }
    );
  }
}
