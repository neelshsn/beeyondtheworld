export interface ClientJourneySection {
  id: string;
  title: string;
  description: string;
  highlights: string[];
  media: Array<{
    id: string;
    type: 'image' | 'video';
    url: string;
    alt: string;
  }>;
}

export interface ClientJourney {
  id: string;
  slug: string;
  title: string;
  country: string;
  regionTags: string[];
  season: string;
  budgetRange: string;
  startDate: string;
  endDate: string;
  summary: string;
  heroVideo: string;
  heroPoster: string;
  moodboard: string[];
  creativeDirector: string;
  logisticsLead: string;
  deliverables: string[];
  sections: ClientJourneySection[];
  attachments: Array<{
    label: string;
    fileName: string;
  }>;
}
