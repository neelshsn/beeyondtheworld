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

const curatedJourneys: Journey[] = journeyShowcases
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

const placeholderJourneys: Journey[] = [
  {
    id: 'ibiza-midnight-regatta',
    slug: 'ibiza-midnight-regatta',
    title: 'Ibiza Midnight Regatta',
    season: 'spring-summer',
    date: 'July 2025',
    location: 'Ibiza & Formentera, Spain',
    image: '/assets/campaigns/maradji-ibiza/maradji-ibiza-carousel-02.jpg',
    regions: ['europe'],
    moods: ['beach', 'city'],
  },
  {
    id: 'marrakech-dune-caravan',
    slug: 'marrakech-dune-caravan',
    title: 'Marrakech Dune Caravan',
    season: 'fall-winter',
    date: 'November 2025',
    location: 'Agafay Desert, Morocco',
    image: '/assets/campaigns/craie-maroc/craie-maroc-carousel-04.jpg',
    regions: ['africa'],
    moods: ['desert', 'spiritual'],
  },
  {
    id: 'kenya-canopy-lab',
    slug: 'kenya-canopy-lab',
    title: 'Kenya Canopy Lab',
    season: 'spring-summer',
    date: 'June 2025',
    location: 'Laikipia, Kenya',
    image: '/assets/campaigns/almaaz-kenya/almaaz-kenya-carousel-01.jpg',
    regions: ['africa'],
    moods: ['nature', 'spiritual'],
  },
  {
    id: 'aegean-color-studio',
    slug: 'aegean-color-studio',
    title: 'Aegean Color Studio',
    season: 'spring-summer',
    date: 'May 2025',
    location: 'Cyclades, Greece',
    image: '/assets/journeys/greece/greece-gallery-05.png',
    regions: ['europe'],
    moods: ['beach', 'nature'],
  },
  {
    id: 'siargao-cosmic-tide',
    slug: 'siargao-cosmic-tide',
    title: 'Siargao Cosmic Tide',
    season: 'fall-winter',
    date: 'January 2026',
    location: 'Siargao, Philippines',
    image: '/assets/journeys/philippines/philippines-gallery-12.png',
    regions: ['asia'],
    moods: ['beach', 'spiritual'],
  },
];

export const journeys: Journey[] = [...curatedJourneys, ...placeholderJourneys];
