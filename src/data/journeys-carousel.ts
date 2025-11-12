import type { Journey, JourneyMood, JourneyRegion, JourneySeason } from '@/types/journey';
import { journeyShowcases } from '@/data/showcases';

const SEASON_BY_ID: Record<string, JourneySeason> = {
  philippines: 'fall-winter',
  mallorca: 'spring-summer',
  greece: 'fall-winter',
};

const REGION_BY_ID: Record<string, JourneyRegion[]> = {
  philippines: ['asia'],
  mallorca: ['europe'],
  greece: ['europe'],
};

const MOOD_BY_ID: Record<string, JourneyMood[]> = {
  philippines: ['nature', 'beach', 'spiritual'],
  mallorca: ['nature', 'beach'],
  greece: ['nature', 'beach', 'city'],
};

export const journeys: Journey[] = journeyShowcases
  .filter((journey) => journey.id in SEASON_BY_ID)
  .map((journey) => ({
    id: journey.id,
    slug: journey.slug,
    title: journey.title,
    season: SEASON_BY_ID[journey.id],
    date: journey.timeframe,
    location: journey.locale,
    image: journey.hero.src,
    regions: REGION_BY_ID[journey.id] ?? [],
    moods: MOOD_BY_ID[journey.id] ?? [],
  }));
