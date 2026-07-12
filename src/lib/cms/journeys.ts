import { asc, eq } from 'drizzle-orm';

import { journeys as staticJourneys } from '@/data/journeys-carousel';
import { getDb, isDbConfigured, journeys } from '@/lib/db';
import type { Journey } from '@/types/journey';

/**
 * T-050 — source de vérité des voyages côté site : Neon d'abord, fallback sur
 * le contenu statique si la base est vide, absente ou injoignable (le site ne
 * casse jamais à cause du CMS).
 */
export async function getJourneys(): Promise<Journey[]> {
  if (!isDbConfigured()) {
    return staticJourneys;
  }

  try {
    const rows = await getDb()
      .select()
      .from(journeys)
      .where(eq(journeys.published, true))
      .orderBy(asc(journeys.position), asc(journeys.id));

    if (rows.length === 0) {
      return staticJourneys;
    }

    return rows.map((row) => ({
      id: row.slug,
      slug: row.slug,
      title: row.title,
      season: (row.season as Journey['season']) ?? 'spring-summer',
      seasonTags: (row.seasonTags as Journey['seasonTags']) ?? undefined,
      seasonVisuals: (row.seasonVisuals as Journey['seasonVisuals']) ?? undefined,
      date: row.dateLabel,
      location: row.location,
      image: row.image,
      backgroundVideo: row.backgroundVideo ?? undefined,
      regions: (row.regions as Journey['regions']) ?? [],
      moods: (row.moods as Journey['moods']) ?? [],
    }));
  } catch {
    return staticJourneys;
  }
}
