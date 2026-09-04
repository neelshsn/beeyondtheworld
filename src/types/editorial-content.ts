import type { CampaignFormat } from '@/data/campaign-formats';
import type { CampaignShowcase } from '@/data/showcases';
import type { JourneySeason } from '@/types/journey';

export type CampaignTaleContent = {
  title: string;
  body: string;
  images: string[];
  videos: string[];
  heroVideo?: string;
  storyVideo?: string;
};

/** Une seule source éditoriale pour la carte, la page et le format d'une campagne. */
export type CampaignEditorContent = {
  type: 'campaign';
  format: CampaignFormat;
  showcase: CampaignShowcase;
  listing: {
    client: string;
    season: JourneySeason;
    seasonTags: JourneySeason[];
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
    thumbnail: { src: string; alt: string };
    backgroundVideo?: string;
    cardPoster?: string;
    logo: { src: string; alt: string };
  };
  tale: CampaignTaleContent;
};

export type CampaignEditorDocument = {
  id: number;
  slug: string;
  draft: CampaignEditorContent;
  published: CampaignEditorContent | null;
  revision: number;
  publishedRevision: number;
  position: number;
  archived: boolean;
  hasUnpublishedChanges: boolean;
  updatedAt: string;
  publishedAt: string | null;
};

export type PublishedCampaign = CampaignEditorContent & {
  position: number;
};
