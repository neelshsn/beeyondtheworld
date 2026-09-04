import { describe, expect, it } from 'vitest';

import type { Journey } from '../../../types/journey';

import { applyPublishedJourneyOverrides } from '../apply-published-journey-overrides';

const legacyPortugal: Journey = {
  id: 'azores',
  slug: 'azores',
  title: 'Azores',
  season: 'spring-summer',
  seasonTags: ['spring-summer', 'fall-winter'],
  date: 'From 1st June to 30th September',
  location: 'Azores',
  image: '/assets/journeys/azores-2026/azores-all-journeys-thumbnail.jpg',
  backgroundVideo: '/assets/journeys/azores-2026/azores-all-journeys-thumbnail.jpg',
  regions: ['europe'],
  moods: ['nature'],
};

describe('applyPublishedJourneyOverrides', () => {
  it('upgrades a legacy Azores CMS card to the Portugal presentation', () => {
    expect(applyPublishedJourneyOverrides(legacyPortugal)).toMatchObject({
      slug: 'azores',
      title: 'Portugal',
      location: 'Azores, Madeira & Lisboa, Portugal',
      image: '/assets/journeys/portugal-2026/portugal-azores.webp',
    });
  });

  it('leaves a fully migrated Portugal CMS card authoritative', () => {
    const migrated = {
      ...legacyPortugal,
      title: 'Portugal',
      location: 'Custom Portugal route',
      image: '/assets/custom-portugal.jpg',
      backgroundVideo: '/assets/custom-portugal.mp4',
      seasonVisuals: {
        'spring-summer': { image: '/assets/custom-portugal-summer.jpg' },
      },
    };

    expect(applyPublishedJourneyOverrides(migrated)).toBe(migrated);
  });

  it('preserves CMS fields that have already been migrated', () => {
    const partiallyMigrated: Journey = {
      ...legacyPortugal,
      title: 'Portugal',
      date: 'A custom editorial date',
      location: 'A custom Portugal route',
      regions: ['africa'],
      moods: ['city'],
    };

    expect(applyPublishedJourneyOverrides(partiallyMigrated)).toMatchObject({
      title: 'Portugal',
      date: 'A custom editorial date',
      location: 'A custom Portugal route',
      regions: ['africa'],
      moods: ['city'],
      image: '/assets/journeys/portugal-2026/portugal-azores.webp',
    });
  });
});
