import type { JourneySeason } from '@/types/journey';

export type JourneyLocationMedia = {
  url: string;
  type: 'image' | 'video';
  alt?: string;
};

export type CmsJourneyLocation = {
  id: number;
  name: string;
  subtitle: string | null;
  leftTitle: string[];
  narrative: string;
  image: string | null;
  video: string | null;
  media: JourneyLocationMedia[];
  position: number;
};

export type JourneyLocationView = {
  id: string;
  title: string;
  region: string;
  image: string;
  backgroundVideo?: string;
  seasons: JourneySeason[];
};

export type JourneyLocationStoryView = {
  id: string;
  locationId: string;
  image: string;
  leftTitle: string[];
  narrative: string;
  nextLocationId: string;
  nextLocation: string;
};
