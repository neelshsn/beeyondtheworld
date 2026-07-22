import { existsSync } from 'node:fs';
import path from 'node:path';

import { describe, expect, it } from 'vitest';

import { journeys } from '../journeys-carousel';
import { campaignShowcases, journeyShowcases, type ShowcaseMedia } from '../showcases';

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
});
