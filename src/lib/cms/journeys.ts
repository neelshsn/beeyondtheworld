import { asc, eq } from 'drizzle-orm';

import { journeys as staticJourneys } from '@/data/journeys-carousel';
import { journeyShowcases, type JourneyShowcase } from '@/data/showcases';
import { getDb, isDbConfigured, journeys } from '@/lib/db';
import type { Journey } from '@/types/journey';

import { applyPublishedJourneyOverrides } from './apply-published-journey-overrides';

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

    return rows.map((row) =>
      applyPublishedJourneyOverrides({
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
      })
    );
  } catch {
    return staticJourneys;
  }
}

/** Répercute les champs éditables du Journey sur sa page détail et son SEO. */
export async function getPublishedJourneyShowcase(slug: string): Promise<JourneyShowcase | null> {
  const fallback = journeyShowcases.find((item) => item.slug === slug) ?? null;
  if (!fallback || !isDbConfigured()) return fallback;

  try {
    const [row] = await getDb().select().from(journeys).where(eq(journeys.slug, slug)).limit(1);
    if (!row?.published) return fallback;

    return {
      ...fallback,
      title: row.title || fallback.title,
      locale: row.location || fallback.locale,
      timeframe: row.dateLabel || fallback.timeframe,
      hero: row.image
        ? {
            ...fallback.hero,
            type: 'image',
            src: row.image,
            poster: undefined,
          }
        : fallback.hero,
    };
  } catch {
    return fallback;
  }
}
