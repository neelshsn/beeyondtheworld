import type { JourneySeason } from '@/types/journey';

export const LOCATION_SEASONS: JourneySeason[] = ['spring-summer', 'fall-winter'];

// These are the original single-season Locations. All other historical Locations
// were available in both seasons. Keep the editor and public fallback in agreement.
const LEGACY_SINGLE_SEASONS: Record<string, Record<string, JourneySeason>> = {
  balearic: { ibiza: 'spring-summer', menorca: 'spring-summer' },
  france: { provence: 'spring-summer', avoriaz: 'fall-winter' },
  'india-january-2026': { kerala: 'fall-winter', goa: 'spring-summer' },
  italy: { dolomites: 'fall-winter', sicily: 'spring-summer' },
  morocco: { ouarzazate: 'fall-winter', agafay: 'spring-summer', dakhla: 'spring-summer' },
  philippines: { palawan: 'spring-summer', bukidnon: 'fall-winter' },
  thailand: { bangkok: 'fall-winter', 'koh phi phi': 'spring-summer' },
};

export function getLegacyLocationSeasons(journeySlug: string, name: string): JourneySeason[] {
  const normalizedName = name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLocaleLowerCase('en');
  const season = LEGACY_SINGLE_SEASONS[journeySlug]?.[normalizedName];
  return season ? [season] : [...LOCATION_SEASONS];
}

export function isLocationSeasonSelection(value: unknown): value is JourneySeason[] {
  return (
    Array.isArray(value) &&
    value.length > 0 &&
    value.length <= LOCATION_SEASONS.length &&
    new Set(value).size === value.length &&
    value.every((season) => LOCATION_SEASONS.includes(season))
  );
}

/** Works for uploaded Blob URLs and existing URLs with a query or fragment. */
export function isJourneyBackgroundVideo(src?: string | null) {
  return Boolean(src && /\.(mp4|webm|mov|ogg)$/i.test(src.split(/[?#]/, 1)[0]));
}
