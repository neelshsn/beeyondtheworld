import { journeyShowcases } from './showcases';

export type Journey = {
  id: string;
  slug: string;
  title: string;
  season: 'spring-summer' | 'fall-winter';
  date: string;
  location: string;
  image: string;
};

const SEASON_MAP: Record<string, Journey['season']> = {
  philippines: 'fall-winter',
  mallorca: 'spring-summer',
  greece: 'fall-winter',
};

const DATE_MAP: Record<string, string> = {
  philippines: 'October 2025',
  mallorca: 'May 2025',
  greece: 'September 2025',
};

export const journeys: Journey[] = journeyShowcases.map((journey) => ({
  id: journey.id,
  slug: journey.slug,
  title: journey.title,
  season: SEASON_MAP[journey.id] ?? 'spring-summer',
  date: DATE_MAP[journey.id] ?? journey.timeframe,
  location: journey.locale,
  image: journey.hero.src,
}));
