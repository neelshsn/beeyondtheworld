import { journeys as staticJourneys } from '../../data/journeys-carousel';
import type { Journey } from '../../types/journey';

const PORTUGAL_LEGACY_SLUG = 'azores';
const PORTUGAL_LEGACY_ASSET_SEGMENT = '/assets/journeys/azores-2026/';

const portugalJourney = staticJourneys.find((journey) => journey.slug === PORTUGAL_LEGACY_SLUG);

/**
 * Bridges the one-time Azores -> Portugal content migration without making all
 * static data override the CMS. Once the CMS row no longer contains a legacy
 * title, location, or asset, it becomes authoritative again automatically.
 */
export function applyPublishedJourneyOverrides(journey: Journey): Journey {
  if (journey.slug !== PORTUGAL_LEGACY_SLUG || !portugalJourney) return journey;

  const hasLegacyTitle = journey.title.trim().toLowerCase() === 'azores';
  const hasLegacyLocation = journey.location.trim().toLowerCase() === 'azores';
  const hasLegacyImage = journey.image.includes(PORTUGAL_LEGACY_ASSET_SEGMENT);
  const hasLegacyBackground = journey.backgroundVideo?.includes(PORTUGAL_LEGACY_ASSET_SEGMENT);
  const hasLegacySeasonVisuals = JSON.stringify(journey.seasonVisuals ?? {}).includes(
    PORTUGAL_LEGACY_ASSET_SEGMENT
  );

  if (
    !hasLegacyTitle &&
    !hasLegacyLocation &&
    !hasLegacyImage &&
    !hasLegacyBackground &&
    !hasLegacySeasonVisuals
  ) {
    return journey;
  }

  return {
    ...journey,
    title: hasLegacyTitle ? portugalJourney.title : journey.title,
    location: hasLegacyLocation ? portugalJourney.location : journey.location,
    image: hasLegacyImage ? portugalJourney.image : journey.image,
    backgroundVideo: hasLegacyBackground
      ? portugalJourney.backgroundVideo
      : journey.backgroundVideo,
    seasonVisuals: hasLegacySeasonVisuals ? portugalJourney.seasonVisuals : journey.seasonVisuals,
  };
}
