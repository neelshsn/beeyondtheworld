export type MediaKind = 'image' | 'video';

export interface MediaAsset {
  id: string;
  kind: MediaKind;
  url: string;
  alt: string;
  caption?: string;
  poster?: string;
  aspectRatio?: 'portrait' | 'landscape' | 'square';
}

export interface JourneySummary {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  location: string;
  accent?: 'rose' | 'peach' | 'lilac';
  coverImage: MediaAsset;
  teaserVideo?: string;
  launchDate?: string;
}

export interface CampaignDetail {
  id: string;
  slug: string;
  title: string;
  heroVideo: string;
  heroPoster?: string;
  gallery: MediaAsset[];
  context: {
    heading: string;
    body: string;
  }[];
  credits: {
    role: string;
    value: string;
  }[];
  impactHighlights: string[];
  callToAction?: {
    label: string;
    href: string;
  };
}

export interface NarrativeSection {
  id: string;
  title: string;
  description: string;
  bulletPoints?: string[];
  media?: MediaAsset;
}

export interface ClientLogo {
  name: string;
  logoUrl: string;
}
