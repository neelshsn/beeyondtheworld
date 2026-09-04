import { asc, eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';

import { journeyLocationSeeds } from '@/data/journey-location-seeds';
import { getDb, journeys, locations } from '@/lib/db';
import { rejectCrossSiteWrite, requireAdmin } from '@/lib/db/admin-guard';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Importe uniquement les Tales manquants. Les voyages, dates et Locations déjà
 * présentes ne sont jamais modifiés.
 */
export async function POST(request: Request) {
  const unauthorized = (await requireAdmin()) ?? rejectCrossSiteWrite(request);
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
        .select({ name: locations.name })
        .from(locations)
        .where(eq(locations.journeyId, journey.id));
      const existingNames = new Set(existing.map((location) => location.name.trim().toLowerCase()));
      const missingLocations = seed
        .map((location, position) => ({ location, position }))
        .filter(({ location }) => !existingNames.has(location.name.trim().toLowerCase()));
      if (missingLocations.length === 0) continue;

      await db.insert(locations).values(
        missingLocations.map(({ location, position }) => ({
          journeyId: journey.id,
          ...location,
          position,
          published: true,
        }))
      );
      seededJourneys += 1;
      seededLocations += missingLocations.length;
    }

    return NextResponse.json({ ok: true, seededJourneys, seededLocations });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Import des Tales impossible.' },
      { status: 500 }
    );
  }
}
