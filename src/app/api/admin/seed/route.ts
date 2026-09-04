import { NextResponse } from 'next/server';

import { journeys as staticJourneys } from '@/data/journeys-carousel';
import { getSustainableImpactPdf } from '@/data/sustainable-impact';
import { getDb, journeys } from '@/lib/db';
import { rejectCrossSiteWrite, requireAdmin } from '@/lib/db/admin-guard';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * T-050 — seed initial : migre le contenu hardcodé (src/data/journeys-carousel.ts)
 * vers Neon. Ré-exécutable : upsert par slug (les éditions manuelles des champs
 * seedés sont écrasées, les voyages créés à la main sont conservés).
 */
export async function POST(request: Request) {
  const unauthorized = (await requireAdmin()) ?? rejectCrossSiteWrite(request);
  if (unauthorized) return unauthorized;

  try {
    const db = getDb();
    let seeded = 0;

    for (const [index, journey] of staticJourneys.entries()) {
      await db
        .insert(journeys)
        .values({
          slug: journey.slug,
          title: journey.title,
          season: journey.season,
          seasonTags: journey.seasonTags ?? [journey.season],
          seasonVisuals: (journey.seasonVisuals ?? {}) as Record<
            string,
            { image?: string; backgroundVideo?: string }
          >,
          dateLabel: journey.date,
          location: journey.location,
          image: journey.image,
          backgroundVideo: journey.backgroundVideo ?? null,
          regions: journey.regions,
          moods: journey.moods,
          sustainablePdf: getSustainableImpactPdf(journey.slug),
          position: index,
          published: true,
        })
        .onConflictDoUpdate({
          target: journeys.slug,
          set: {
            title: journey.title,
            season: journey.season,
            seasonTags: journey.seasonTags ?? [journey.season],
            seasonVisuals: (journey.seasonVisuals ?? {}) as Record<
              string,
              { image?: string; backgroundVideo?: string }
            >,
            dateLabel: journey.date,
            location: journey.location,
            image: journey.image,
            backgroundVideo: journey.backgroundVideo ?? null,
            regions: journey.regions,
            moods: journey.moods,
            sustainablePdf: getSustainableImpactPdf(journey.slug),
            position: index,
            updatedAt: new Date(),
          },
        });
      seeded += 1;
    }

    return NextResponse.json({ ok: true, seeded });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Seed impossible.' },
      { status: 500 }
    );
  }
}
