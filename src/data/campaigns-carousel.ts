import type { Campaign } from '@/types/campaign';
import { campaignShowcases } from '@/data/showcases';
import type { CampaignShowcase } from '@/data/showcases';

const COUNTRY_BY_ID: Record<string, string> = {
  'maradji-ibiza': 'Spain',
  'almaaz-kenya': 'Kenya',
  'craie-maroc': 'Morocco',
};

const SHOOT_YEAR_BY_ID: Record<string, number> = {
  'maradji-ibiza': 2024,
  'almaaz-kenya': 2023,
  'craie-maroc': 2023,
};

const BRAND_TYPE_BY_ID: Record<string, string> = {
  'maradji-ibiza': 'Clothing',
  'almaaz-kenya': 'Cosmetics',
  'craie-maroc': 'Accesories',
};

const ART_DIRECTOR_BY_ID: Record<string, string> = {
  'maradji-ibiza': 'Eugenie',
  'almaaz-kenya': 'Eugenie',
  'craie-maroc': 'Eugenie',
};

const TALENT_BY_ID: Record<string, string> = {
  'maradji-ibiza': 'Zak',
  'almaaz-kenya': 'Zak',
  'craie-maroc': 'Zak',
};

const DOP_BY_ID: Record<string, string> = {
  'maradji-ibiza': 'Brian',
  'almaaz-kenya': 'Brian',
  'craie-maroc': 'Brian',
};

const PRODUCTION_TEAM_BY_ID: Record<string, string[]> = {
  'maradji-ibiza': ['Clara'],
  'almaaz-kenya': ['Clara'],
  'craie-maroc': ['Rachid'],
};

const MODELS_BY_ID: Record<string, string[]> = {
  'maradji-ibiza': ['Karimah'],
  'almaaz-kenya': ['Veronika', 'Eden', 'Bianca'],
  'craie-maroc': ['Berta', 'Malak'],
};

const MAKEUP_ARTISTS_BY_ID: Record<string, string[]> = {
  'maradji-ibiza': ['Estelle'],
  'almaaz-kenya': ['Estelle'],
  'craie-maroc': ['Estelle'],
};

const RELEASE_WINDOW_BY_ID: Record<string, string> = {
  'maradji-ibiza': 'Summer 2025',
  'almaaz-kenya': 'Autumn 2024',
  'craie-maroc': 'Spring 2025',
};

const LOGO_BY_ID: Record<string, { src: string; alt: string }> = {
  'maradji-ibiza': { src: '/assets/brands/maradji.svg', alt: 'Maradji logo' },
  'almaaz-kenya': { src: '/assets/brands/almaaz.png', alt: 'Almaaz logo' },
  'craie-maroc': { src: '/assets/brands/craiestudio.png', alt: 'Craie Studio logo' },
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

export const campaigns: Campaign[] = campaignShowcases.map((showcase) => {
  const client = extractClientFromTitle(showcase.title);
  const cover = resolveCoverAsset(showcase);
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
    coverAlt: cover.alt,
  } satisfies Campaign;
});
