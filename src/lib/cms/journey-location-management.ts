import { eq, sql, type SQL } from 'drizzle-orm';

import { getDb, journeys, locations, type NewLocationRow } from '@/lib/db';
import { journeyLocationSeeds } from '@/data/journey-location-seeds';

/** A reserved key in existing JSON preserves an intentionally empty collection. */
export function markJourneyLocationsManaged(journeyId: number | SQL) {
  return getDb()
    .update(journeys)
    .set({
      seasonVisuals: sql`jsonb_set(${journeys.seasonVisuals}, '{_cms}', '{"locationsManaged":true}'::jsonb, true)`,
    })
    .where(eq(journeys.id, journeyId));
}

export function isJourneyLocationCollectionManaged(
  seasonVisuals: Record<string, unknown>,
  savedLocationCount: number
) {
  const metadata = seasonVisuals._cms as { locationsManaged?: boolean } | undefined;
  return savedLocationCount > 0 || metadata?.locationsManaged === true;
}

/** Materializes only the extra locations already shown by the legacy Portugal page. */
export function planLegacyPortugalLocationImports(
  journey: { id: number; slug: string; seasonVisuals: Record<string, unknown> },
  saved: { name: string; position: number; published: boolean }[]
): NewLocationRow[] {
  if (journey.slug !== 'azores' || isJourneyLocationCollectionManaged(journey.seasonVisuals, 0))
    return [];
  const seed = journeyLocationSeeds.azores;
  const expectedNames = new Set(seed.map((location) => location.name.toLowerCase()));
  const visibleNames = saved
    .filter((location) => location.published)
    .map((location) => location.name.trim().toLowerCase());
  if (
    visibleNames.length === 0 ||
    visibleNames.length >= seed.length ||
    !visibleNames.includes('azores') ||
    !visibleNames.every((name) => expectedNames.has(name))
  )
    return [];
  const savedNames = new Set(saved.map((location) => location.name.trim().toLowerCase()));
  const nextPosition = Math.max(-1, ...saved.map((location) => location.position)) + 1;
  return seed
    .filter((location) => !savedNames.has(location.name.toLowerCase()))
    .map((location, index) => ({
      journeyId: journey.id,
      ...location,
      position: nextPosition + index,
      published: true,
    }));
}

export async function getLegacyPortugalLocationImports(
  journeyId: number
): Promise<NewLocationRow[]> {
  const db = getDb();
  const [journey] = await db.select().from(journeys).where(eq(journeys.id, journeyId)).limit(1);
  if (
    !journey ||
    journey.slug !== 'azores' ||
    isJourneyLocationCollectionManaged(journey.seasonVisuals, 0)
  )
    return [];
  const saved = await db.select().from(locations).where(eq(locations.journeyId, journeyId));
  return planLegacyPortugalLocationImports(journey, saved);
}
