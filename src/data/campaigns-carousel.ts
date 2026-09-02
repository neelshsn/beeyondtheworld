import type { Campaign } from '@/types/campaign';
import { campaignShowcases, type CampaignShowcase } from './showcases';

const COUNTRY_BY_ID: Record<string, string> = {
  'maradji-ibiza': 'Spain',
  'almaaz-kenya': 'Kenya',
  'craie-maroc': 'Morocco',
  'craie-suisse': 'Switzerland',
  'grace-mila-morocco': 'Morocco',
  'veganboost-greece': 'Greece',
  'almaaz-new-york': 'United States',
  'ange-new-york': 'United States',
};

const SHOOT_YEAR_BY_ID: Record<string, number> = {
  'maradji-ibiza': 2024,
  'almaaz-kenya': 2023,
  'craie-maroc': 2025,
  'craie-suisse': 2024,
  'grace-mila-morocco': 2024,
  'veganboost-greece': 2023,
  'almaaz-new-york': 2024,
  'ange-new-york': 2024,
};

const BRAND_TYPE_BY_ID: Record<string, string> = {
  'maradji-ibiza': 'Clothing',
  'almaaz-kenya': 'Cosmetics',
  'craie-maroc': 'Accessories',
  'craie-suisse': 'Accessories',
  'grace-mila-morocco': 'Clothing',
  'veganboost-greece': 'Beauty & wellness',
  'almaaz-new-york': 'Jewellery',
  'ange-new-york': 'Clothing',
};

const ART_DIRECTOR_BY_ID: Record<string, string> = {
  'maradji-ibiza': 'Eugenie',
  'almaaz-kenya': 'Eugenie',
  'craie-maroc': 'Eugenie',
  'craie-suisse': 'Eugenie',
  'grace-mila-morocco': 'To be confirmed',
  'veganboost-greece': 'To be confirmed',
  'almaaz-new-york': 'To be confirmed',
  'ange-new-york': 'To be confirmed',
};

const TALENT_BY_ID: Record<string, string> = {
  'maradji-ibiza': 'Zak',
  'almaaz-kenya': 'Vera',
  'craie-maroc': 'To be confirmed',
  'craie-suisse': 'To be confirmed',
  'grace-mila-morocco': 'To be confirmed',
  'veganboost-greece': 'To be confirmed',
  'almaaz-new-york': 'To be confirmed',
  'ange-new-york': 'To be confirmed',
};

const DOP_BY_ID: Record<string, string> = {
  'maradji-ibiza': 'Brian',
  'almaaz-kenya': 'Brian',
  'craie-maroc': 'Brian',
  'craie-suisse': 'To be confirmed',
  'grace-mila-morocco': 'To be confirmed',
  'veganboost-greece': 'To be confirmed',
  'almaaz-new-york': 'To be confirmed',
  'ange-new-york': 'To be confirmed',
};

const PRODUCTION_TEAM_BY_ID: Record<string, string[]> = {
  'maradji-ibiza': ['Clara'],
  'almaaz-kenya': ['Clara'],
  'craie-maroc': ['Rachid'],
  'craie-suisse': [],
  'grace-mila-morocco': [],
  'veganboost-greece': [],
  'almaaz-new-york': [],
  'ange-new-york': [],
};

const MODELS_BY_ID: Record<string, string[]> = {
  'maradji-ibiza': ['Karimah'],
  'almaaz-kenya': ['Veronika', 'Eden', 'Bianca'],
  'craie-maroc': ['Berta', 'Malak'],
  'craie-suisse': [],
  'grace-mila-morocco': [],
  'veganboost-greece': [],
  'almaaz-new-york': [],
  'ange-new-york': [],
};

const MAKEUP_ARTISTS_BY_ID: Record<string, string[]> = {
  'maradji-ibiza': ['Estelle'],
  'almaaz-kenya': ['Estelle'],
  'craie-maroc': ['Estelle'],
  'craie-suisse': [],
  'grace-mila-morocco': [],
  'veganboost-greece': [],
  'almaaz-new-york': [],
  'ange-new-york': [],
};

const RELEASE_WINDOW_BY_ID: Record<string, string> = {
  'maradji-ibiza': 'Summer 2025',
  'almaaz-kenya': 'Spring Summer 2023',
  'craie-maroc': 'Spring Summer 2025',
  'craie-suisse': 'Spring Summer 2023 / 2024',
  'grace-mila-morocco': 'Fall Winter 2024 / Spring Summer 2024',
  'veganboost-greece': 'Fall Winter 2023',
  'almaaz-new-york': 'Fall Winter / Summer 2024',
  'ange-new-york': 'Fall Winter 2024',
};

const SEASON_BY_ID: Record<string, Campaign['season']> = {
  'maradji-ibiza': 'spring-summer',
  'almaaz-kenya': 'spring-summer',
  'craie-maroc': 'spring-summer',
  'craie-suisse': 'spring-summer',
  'grace-mila-morocco': 'fall-winter',
  'veganboost-greece': 'fall-winter',
  'almaaz-new-york': 'fall-winter',
  'ange-new-york': 'fall-winter',
};

const SEASON_TAGS_BY_ID: Partial<Record<string, Campaign['season'][]>> = {
  'grace-mila-morocco': ['fall-winter', 'spring-summer'],
  'almaaz-new-york': ['fall-winter', 'spring-summer'],
};

const LOGO_BY_ID: Record<string, { src: string; alt: string }> = {
  'maradji-ibiza': { src: '/assets/brands/maradji.svg', alt: 'Maradji logo' },
  'almaaz-kenya': { src: '/assets/brands/almaaz.png', alt: 'Almaaz logo' },
  'craie-maroc': { src: '/assets/brands/craiestudio.png', alt: 'Craie Studio logo' },
  'craie-suisse': { src: '/assets/brands/craiestudio.png', alt: 'Craie Studio logo' },
  'grace-mila-morocco': { src: '/assets/brands/grace&mila.png', alt: 'Grace & Mila logo' },
  'almaaz-new-york': { src: '/assets/brands/almaaz.png', alt: 'Almaaz logo' },
};

const THUMBNAIL_BY_ID: Partial<Record<string, { src: string; alt: string }>> = {
  'maradji-ibiza': {
    src: '/assets/campaigns/maradji-ibiza/maradji-ibiza-carousel-02.jpg',
    alt: 'Maradji portrait in front of white Ibizan architecture',
  },
  'almaaz-kenya': {
    src: '/assets/campaigns/almaaz-kenya/almaaz-kenya-carousel-02.jpg',
    alt: 'Almaaz campaign portrait among the red rocks of Kenya',
  },
  'craie-maroc': {
    src: '/assets/campaigns/craie-maroc/craie-maroc-carousel-05.jpg',
    alt: 'Craie Studio campaign portrait with a blue bag in Morocco',
  },
  'craie-suisse': {
    src: '/assets/campaigns/craie-suisse/craie-suisse-spring-03.jpg',
    alt: 'Craie Studio spring portrait in the Swiss landscape',
  },
  'grace-mila-morocco': {
    src: '/assets/campaigns/grace-mila-morocco/grace-mila-morocco-fw-01.jpg',
    alt: 'Grace and Mila Fall Winter portrait in Morocco',
  },
  'veganboost-greece': {
    src: '/assets/campaigns/veganboost-greece/veganboost-greece-gallery-02.webp',
    alt: 'Veganboost portrait reflected in the clear waters of Milos',
  },
  'almaaz-new-york': {
    src: '/assets/campaigns/almaaz-new-york/almaaz-new-york-gallery-02.webp',
    alt: 'Almaaz New York campaign portrait overlooking the skyline',
  },
  'ange-new-york': {
    src: '/assets/campaigns/ange-new-york/ange-new-york-drive-01.jpg',
    alt: 'AN’GE Fall Winter portrait on a New York street',
  },
};

function extractClientFromTitle(title: string) {
  const [client] = title.split(' - ');
  return client?.trim() ?? title;
}

function resolveCoverAsset(showcase: CampaignShowcase) {
  if (showcase.hero.type === 'image') {
    return { src: showcase.hero.src, alt: showcase.hero.alt };
  }

  const coverSrc = showcase.hero.poster ?? showcase.hero.src;
  return { src: coverSrc, alt: showcase.hero.alt };
}

function resolveThumbnailPhoto(showcase: CampaignShowcase, fallback: { src: string; alt: string }) {
  const explicitThumbnail = THUMBNAIL_BY_ID[showcase.id];
  if (explicitThumbnail) {
    return explicitThumbnail;
  }

  const stills = showcase.gallery.filter((media) => media.type === 'image');
  const rankedStills = [...stills].sort((left, right) => {
    const leftScore =
      (left.aspectRatio === 'portrait' ? 100 : 0) +
      (left.src.includes('-carousel-') ? 10 : 0) +
      (left.src.includes('-cover') ? 5 : 0);
    const rightScore =
      (right.aspectRatio === 'portrait' ? 100 : 0) +
      (right.src.includes('-carousel-') ? 10 : 0) +
      (right.src.includes('-cover') ? 5 : 0);

    return rightScore - leftScore;
  });
  const preferredStill = rankedStills[0];

  if (!preferredStill) {
    return fallback;
  }

  return {
    src: preferredStill.src,
    alt: preferredStill.alt,
  };
}

export const campaigns: Campaign[] = campaignShowcases.map((showcase) => {
  const client = extractClientFromTitle(showcase.title);
  const cover = resolveCoverAsset(showcase);
  const thumbnail = resolveThumbnailPhoto(showcase, cover);
  const primaryVideo = showcase.hero.type === 'video' ? showcase.hero.src : undefined;
  const fallbackVideo = showcase.gallery.find((media) => media.type === 'video')?.src;
  const cardVideo = primaryVideo ?? fallbackVideo;
  const cardPoster =
    showcase.hero.type === 'video' ? (showcase.hero.poster ?? cover.src) : cover.src;
  const logo = LOGO_BY_ID[showcase.id] ?? { src: cover.src, alt: `${client} brand mark` };

  return {
    id: showcase.id,
    slug: showcase.slug,
    title: showcase.title,
    client,
    season: SEASON_BY_ID[showcase.id] ?? 'spring-summer',
    seasonTags: SEASON_TAGS_BY_ID[showcase.id] ?? [SEASON_BY_ID[showcase.id] ?? 'spring-summer'],
    date: RELEASE_WINDOW_BY_ID[showcase.id] ?? 'To be announced',
    location: showcase.destination,
    image: thumbnail.src,
    backgroundVideo: cardVideo,
    destination: showcase.destination,
    country: COUNTRY_BY_ID[showcase.id] ?? showcase.destination,
    shootYear: SHOOT_YEAR_BY_ID[showcase.id] ?? new Date().getFullYear(),
    releaseWindow: RELEASE_WINDOW_BY_ID[showcase.id] ?? 'To be announced',
    brandType: BRAND_TYPE_BY_ID[showcase.id] ?? 'Lifestyle',
    artDirector: ART_DIRECTOR_BY_ID[showcase.id] ?? 'Beeyondtheworld Studio',
    talent: TALENT_BY_ID[showcase.id] ?? 'Beeyondtheworld Collective',
    dop: DOP_BY_ID[showcase.id] ?? 'Beeyondtheworld Collective',
    productionTeam: PRODUCTION_TEAM_BY_ID[showcase.id] ?? [],
    models: MODELS_BY_ID[showcase.id] ?? [],
    makeupArtists: MAKEUP_ARTISTS_BY_ID[showcase.id] ?? [],
    synopsis: showcase.summary,
    highlight: showcase.headline,
    cardVideo,
    cardPoster,
    logo,
    cover: cover.src,
    coverAlt: thumbnail.alt,
  } satisfies Campaign;
});
