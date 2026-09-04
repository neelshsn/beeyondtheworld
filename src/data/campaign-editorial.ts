import { CAMPAIGN_FORMAT_BY_ID } from './campaign-formats';
import { buildDefaultCampaignTale } from './campaign-tale-content';
import { campaigns } from './campaigns-carousel';
import { campaignShowcases } from './showcases';
import type { Campaign } from '@/types/campaign';
import type { CampaignEditorContent, PublishedCampaign } from '@/types/editorial-content';

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

export const staticCampaignEditorialContent: PublishedCampaign[] = campaignShowcases.map(
  (showcase, position) => {
    const card = campaigns.find((item) => item.slug === showcase.slug);
    if (!card) {
      throw new Error(`Campaign card missing for ${showcase.slug}`);
    }

    return {
      type: 'campaign',
      format: CAMPAIGN_FORMAT_BY_ID[showcase.id] ?? 'tale',
      showcase: clone(showcase),
      listing: {
        client: card.client,
        season: card.season,
        seasonTags: card.seasonTags ?? [card.season],
        country: card.country,
        shootYear: card.shootYear,
        releaseWindow: card.releaseWindow,
        brandType: card.brandType,
        artDirector: card.artDirector,
        talent: card.talent,
        dop: card.dop,
        productionTeam: clone(card.productionTeam),
        models: clone(card.models),
        makeupArtists: clone(card.makeupArtists),
        thumbnail: { src: card.image, alt: card.coverAlt },
        backgroundVideo: card.backgroundVideo,
        cardPoster: card.cardPoster,
        logo: clone(card.logo),
      },
      tale: buildDefaultCampaignTale(showcase),
      position,
    };
  }
);

export function getStaticCampaignContent(slug: string): CampaignEditorContent | null {
  const entry = staticCampaignEditorialContent.find((item) => item.showcase.slug === slug);
  if (!entry) return null;
  const content = { ...entry };
  delete (content as Partial<PublishedCampaign>).position;
  return clone(content);
}

export function deriveCampaignCard(content: CampaignEditorContent): Campaign {
  const { showcase, listing } = content;
  const heroCover = showcase.hero.type === 'image' ? showcase.hero.src : showcase.hero.poster;
  const cover = heroCover ?? listing.thumbnail.src;

  return {
    id: showcase.id,
    slug: showcase.slug,
    title: showcase.title,
    client: listing.client,
    season: listing.season,
    seasonTags: listing.seasonTags,
    date: listing.releaseWindow,
    location: showcase.destination,
    image: listing.thumbnail.src,
    backgroundVideo: listing.backgroundVideo,
    destination: showcase.destination,
    country: listing.country,
    shootYear: listing.shootYear,
    releaseWindow: listing.releaseWindow,
    brandType: listing.brandType,
    artDirector: listing.artDirector,
    talent: listing.talent,
    dop: listing.dop,
    productionTeam: listing.productionTeam,
    models: listing.models,
    makeupArtists: listing.makeupArtists,
    synopsis: showcase.summary,
    highlight: showcase.headline,
    cardVideo: listing.backgroundVideo,
    cardPoster: listing.cardPoster ?? cover,
    logo: listing.logo,
    cover,
    coverAlt: listing.thumbnail.alt,
  };
}
