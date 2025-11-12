export type JourneySeason = 'spring-summer' | 'fall-winter';
export type JourneyRegion = 'europe' | 'asia' | 'africa' | 'americas';
export type JourneyMood = 'city' | 'nature' | 'beach' | 'desert' | 'spiritual';

export type Journey = {
  id: string;
  slug: string;
  title: string;
  season: JourneySeason;
  date: string;
  location: string;
  image: string;
  regions: JourneyRegion[];
  moods: JourneyMood[];
};
