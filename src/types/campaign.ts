import type { JourneySeason } from '@/types/journey';

export type Campaign = {
  id: string;
  slug: string;
  title: string;
  client: string;
  season: JourneySeason;
  seasonTags?: JourneySeason[];
  date: string;
  location: string;
  image: string;
  backgroundVideo?: string;
  destination: string;
  country: string;
  shootYear: number;
  releaseWindow: string;
  brandType: string;
  artDirector: string;
  talent: string;
  dop: string;
  productionTeam: string[];
  models: string[];
  makeupArtists: string[];
  synopsis: string;
  highlight: string;
  cardVideo?: string;
  cardPoster?: string;
  logo: {
    src: string;
    alt: string;
  };
  cover: string;
  coverAlt: string;
};
