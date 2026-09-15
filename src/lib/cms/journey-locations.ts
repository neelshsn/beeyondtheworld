import { asc, eq } from 'drizzle-orm';

import { getDb, isDbConfigured, journeys, locations } from '@/lib/db';
import type { CmsJourneyLocation } from '@/types/journey-location';
import { isJourneyLocationCollectionManaged } from './journey-location-management';

export async function getPublishedJourneyLocationCollection(
  slug: string
): Promise<{ locations: CmsJourneyLocation[]; managed: boolean; edited?: boolean }> {
  if (!isDbConfigured()) return { locations: [], managed: false };

  try {
    const db = getDb();
    const [journey] = await db
      .select({ id: journeys.id, seasonVisuals: journeys.seasonVisuals })
      .from(journeys)
      .where(eq(journeys.slug, slug))
      .limit(1);

    if (!journey) return { locations: [], managed: false };

    const rows = await db
      .select()
      .from(locations)
      .where(eq(locations.journeyId, journey.id))
      .orderBy(asc(locations.position), asc(locations.id));

    const published = rows
      .filter((row) => row.published)
      .map((row) => ({
        id: row.id,
        name: row.name,
        subtitle: row.subtitle,
        leftTitle: row.leftTitle,
        narrative: row.narrative,
        image: row.image,
        video: row.video,
        media: row.media,
        position: row.position,
      }));
    return {
      locations: published,
      managed: isJourneyLocationCollectionManaged(journey.seasonVisuals, rows.length),
      edited: isJourneyLocationCollectionManaged(journey.seasonVisuals, 0),
    };
  } catch {
    return { locations: [], managed: false };
  }
}

export async function getPublishedJourneyLocations(slug: string): Promise<CmsJourneyLocation[]> {
  return (await getPublishedJourneyLocationCollection(slug)).locations;
}
