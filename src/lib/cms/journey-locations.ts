import { and, asc, eq } from 'drizzle-orm';

import { getDb, isDbConfigured, journeys, locations } from '@/lib/db';
import type { CmsJourneyLocation } from '@/types/journey-location';

export async function getPublishedJourneyLocations(slug: string): Promise<CmsJourneyLocation[]> {
  if (!isDbConfigured()) return [];

  try {
    const db = getDb();
    const [journey] = await db
      .select({ id: journeys.id })
      .from(journeys)
      .where(eq(journeys.slug, slug))
      .limit(1);

    if (!journey) return [];

    const rows = await db
      .select()
      .from(locations)
      .where(and(eq(locations.journeyId, journey.id), eq(locations.published, true)))
      .orderBy(asc(locations.position), asc(locations.id));

    return rows.map((row) => ({
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
  } catch {
    return [];
  }
}
