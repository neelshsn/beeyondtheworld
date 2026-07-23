import { asc, eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';

import { journeyLocationSeeds } from '@/data/journey-location-seeds';
import { getDb, journeys, locations } from '@/lib/db';
import { requireAdmin } from '@/lib/db/admin-guard';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Importe uniquement les Tales manquants. Les voyages, dates et Locations déjà
 * présentes ne sont jamais modifiés.
 */
export async function POST() {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  try {
    const db = getDb();
    const journeyRows = await db
      .select({ id: journeys.id, slug: journeys.slug })
      .from(journeys)
      .orderBy(asc(journeys.position), asc(journeys.id));

    let seededJourneys = 0;
    let seededLocations = 0;

    for (const journey of journeyRows) {
      const seed = journeyLocationSeeds[journey.slug];
      if (!seed?.length) continue;

      const existing = await db
        .select({ id: locations.id })
        .from(locations)
        .where(eq(locations.journeyId, journey.id))
        .limit(1);
      if (existing.length > 0) continue;

      await db.insert(locations).values(
        seed.map((location, position) => ({
          journeyId: journey.id,
          ...location,
          position,
          published: true,
        }))
      );
      seededJourneys += 1;
      seededLocations += seed.length;
    }

    return NextResponse.json({ ok: true, seededJourneys, seededLocations });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Import des Tales impossible.' },
      { status: 500 }
    );
  }
}
