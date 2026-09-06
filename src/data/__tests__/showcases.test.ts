import { existsSync } from 'node:fs';
import path from 'node:path';

import { describe, expect, it } from 'vitest';

import { CAMPAIGN_FORMAT_BY_ID } from '../campaign-formats';
import { campaigns } from '../campaigns-carousel';
import { journeyLocationSeeds } from '../journey-location-seeds';
import { journeys } from '../journeys-carousel';
import { campaignShowcases, journeyShowcases, type ShowcaseMedia } from '../showcases';

const EXPECTED_CAMPAIGN_THUMBNAILS: Record<string, string> = {
  'maradji-ibiza': '/assets/campaigns/maradji-ibiza/maradji-ibiza-carousel-02.jpg',
  'almaaz-kenya': '/assets/campaigns/almaaz-kenya/almaaz-kenya-carousel-02.jpg',
  'craie-maroc': '/assets/campaigns/craie-maroc/craie-maroc-carousel-05.jpg',
  'craie-suisse': '/assets/campaigns/craie-suisse/craie-suisse-spring-03.jpg',
  'grace-mila-morocco': '/assets/campaigns/grace-mila-morocco/grace-mila-morocco-fw-01.jpg',
  'veganboost-greece': '/assets/campaigns/veganboost-greece/feedback-20260906-carousel.webp',
  'almaaz-new-york': '/assets/campaigns/almaaz-new-york/almaaz-new-york-gallery-02.webp',
  'ange-new-york': '/assets/campaigns/ange-new-york/ange-new-york-drive-01.jpg',
};

const EXPECTED_CAMPAIGN_FORMATS = {
  'maradji-ibiza': 'gallery',
  'almaaz-kenya': 'tale',
  'craie-maroc': 'tale',
  'craie-suisse': 'gallery',
  'grace-mila-morocco': 'gallery',
  'veganboost-greece': 'tale',
  'almaaz-new-york': 'tale',
  'ange-new-york': 'gallery',
};

function expectUniqueSlugs(items: Array<{ slug: string }>) {
  const slugs = items.map((item) => item.slug);
  expect(new Set(slugs).size).toBe(slugs.length);
}

function expectLocalAsset(media: ShowcaseMedia) {
  expect(media.src.startsWith('/assets/')).toBe(true);
  expect(existsSync(path.join(process.cwd(), 'public', media.src))).toBe(true);
}

describe('public showcase integrity', () => {
  it('keeps every public journey card connected to a detail page', () => {
    expect(new Set(journeys.map((journey) => journey.slug))).toEqual(
      new Set(journeyShowcases.map((journey) => journey.slug))
    );
    expectUniqueSlugs(journeyShowcases);
  });

  it('keeps campaign slugs unique', () => {
    expectUniqueSlugs(campaignShowcases);
  });

  it('assigns one fixed feedback format to every campaign', () => {
    expect(CAMPAIGN_FORMAT_BY_ID).toEqual(EXPECTED_CAMPAIGN_FORMATS);
    expect(new Set(Object.keys(CAMPAIGN_FORMAT_BY_ID))).toEqual(
      new Set(campaignShowcases.map((campaign) => campaign.id))
    );
  });

  it('ships every local showcase asset referenced by the data', () => {
    for (const journey of journeyShowcases) {
      expectLocalAsset(journey.hero);
      journey.gallery.forEach(expectLocalAsset);
    }

    for (const campaign of campaignShowcases) {
      expectLocalAsset(campaign.hero);
      campaign.gallery.forEach(expectLocalAsset);
    }
  });

  it('provides a still-image fallback for every campaign video', () => {
    for (const campaign of campaignShowcases) {
      for (const media of [campaign.hero, ...campaign.gallery]) {
        if (media.type === 'video') {
          expect(media.poster).toMatch(/^\/assets\//);
          expect(existsSync(path.join(process.cwd(), 'public', media.poster ?? ''))).toBe(true);
        }
      }
    }
  });

  it('keeps every All Campaigns card on its approved campaign media', () => {
    expect(Object.fromEntries(campaigns.map((campaign) => [campaign.id, campaign.image]))).toEqual(
      EXPECTED_CAMPAIGN_THUMBNAILS
    );

    for (const campaign of campaigns) {
      expect(existsSync(path.join(process.cwd(), 'public', campaign.image))).toBe(true);
      expect(campaign.backgroundVideo).toMatch(/^\/assets\/campaigns\//);
      expect(existsSync(path.join(process.cwd(), 'public', campaign.backgroundVideo ?? ''))).toBe(
        true
      );
    }
  });

  it('publishes Portugal as one Journey with Azores, Madeira, and Lisboa', () => {
    const portugalCard = journeys.find((journey) => journey.slug === 'azores');
    const portugalShowcase = journeyShowcases.find((journey) => journey.slug === 'azores');

    expect(portugalCard).toMatchObject({
      title: 'Portugal',
      location: 'Azores, Madeira & Lisboa, Portugal',
    });
    expect(portugalShowcase).toMatchObject({
      title: 'Portugal',
      locale: 'Azores, Madeira & Lisboa, Portugal',
    });
    expect(journeyLocationSeeds.azores.map((location) => location.name)).toEqual([
      'Azores',
      'Madeira',
      'Lisboa',
    ]);
  });

  it('keeps the approved Dolomites title', () => {
    const dolomites = journeyLocationSeeds.italy.find((location) => location.name === 'Dolomites');

    expect(dolomites?.leftTitle).toEqual(['The', 'Silent Majesty', 'of Stone']);
  });
});
