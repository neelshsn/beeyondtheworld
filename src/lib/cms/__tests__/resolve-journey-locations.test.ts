import { describe, expect, it } from 'vitest';

import type {
  JourneyLocationStoryView,
  JourneyLocationView,
} from '../../../types/journey-location';
import { resolveJourneyLocationContent } from '../resolve-journey-locations';

const fallbackLocations: JourneyLocationView[] = [
  {
    id: 'fallback-one',
    title: 'Old title',
    region: 'Old region',
    image: '/old-thumbnail.jpg',
    backgroundVideo: '/old-background.mp4',
    seasons: ['spring-summer'],
  },
];

const fallbackStories: JourneyLocationStoryView[] = [
  {
    id: 'fallback-story-one',
    locationId: 'fallback-one',
    image: '/old-story.jpg',
    leftTitle: ['Old', 'Tale'],
    narrative: 'Old narrative',
    nextLocationId: 'fallback-one',
    nextLocation: 'Old title',
  },
];

describe('resolveJourneyLocationContent', () => {
  it('keeps the static content when the CMS has no published Locations', () => {
    expect(resolveJourneyLocationContent([], fallbackLocations, fallbackStories)).toEqual({
      locations: fallbackLocations,
      stories: fallbackStories,
    });
  });

  it('maps CMS fields to the Journey card and Tale', () => {
    const result = resolveJourneyLocationContent(
      [
        {
          id: 42,
          name: 'New title',
          subtitle: 'New region',
          leftTitle: ['New', 'Tale'],
          narrative: 'New narrative',
          image: '/new-thumbnail.jpg',
          video: '/new-background.mp4',
          media: [{ url: '/new-story.jpg', type: 'image', alt: 'New tale' }],
          position: 0,
        },
      ],
      fallbackLocations,
      fallbackStories
    );

    expect(result.locations[0]).toMatchObject({
      id: 'cms-location-42',
      title: 'New title',
      region: 'New region',
      image: '/new-thumbnail.jpg',
      backgroundVideo: '/new-background.mp4',
    });
    expect(result.stories[0]).toEqual({
      id: 'cms-story-42',
      locationId: 'cms-location-42',
      image: '/new-story.jpg',
      leftTitle: ['New', 'Tale'],
      narrative: 'New narrative',
      nextLocationId: 'cms-location-42',
      nextLocation: 'New title',
    });
  });

  it('keeps newly added fallback Locations when the CMS only contains an older subset', () => {
    const locations: JourneyLocationView[] = [
      {
        id: 'azores',
        title: 'Azores',
        region: 'Volcanic Lakes',
        image: '/azores.jpg',
        seasons: ['spring-summer', 'fall-winter'],
      },
      {
        id: 'madeira',
        title: 'Madeira',
        region: 'Cloud Mountains',
        image: '/madeira.jpg',
        seasons: ['spring-summer', 'fall-winter'],
      },
      {
        id: 'lisboa',
        title: 'Lisboa',
        region: 'Tiled Light',
        image: '/lisboa.jpg',
        seasons: ['spring-summer', 'fall-winter'],
      },
    ];
    const stories: JourneyLocationStoryView[] = locations.map((location, index) => ({
      id: `story-${location.id}`,
      locationId: location.id,
      image: location.image,
      leftTitle: [location.title],
      narrative: `${location.title} narrative`,
      nextLocationId: locations[(index + 1) % locations.length].id,
      nextLocation: locations[(index + 1) % locations.length].title,
    }));

    const result = resolveJourneyLocationContent(
      [
        {
          id: 7,
          name: 'Azores',
          subtitle: 'CMS region',
          leftTitle: [],
          narrative: '',
          image: null,
          video: null,
          media: [],
          position: 0,
        },
      ],
      locations,
      stories,
      { appendMissingFallbacks: true, preferFallbackMedia: true }
    );

    expect(result.locations.map((location) => location.title)).toEqual([
      'Azores',
      'Madeira',
      'Lisboa',
    ]);
    expect(result.stories.map((story) => story.nextLocation)).toEqual([
      'Madeira',
      'Lisboa',
      'Azores',
    ]);
    expect(result.locations[0].image).toBe('/azores.jpg');
  });

  it('keeps a populated CMS authoritative unless compatibility is explicitly enabled', () => {
    const extraFallback: JourneyLocationView = {
      id: 'fallback-two',
      title: 'Hidden fallback',
      region: 'Fallback region',
      image: '/fallback-two.jpg',
      seasons: ['fall-winter'],
    };

    const result = resolveJourneyLocationContent(
      [
        {
          id: 42,
          name: 'New title',
          subtitle: 'New region',
          leftTitle: ['New', 'Tale'],
          narrative: 'New narrative',
          image: '/new-thumbnail.jpg',
          video: '/new-background.mp4',
          media: [{ url: '/new-story.jpg', type: 'image' }],
          position: 0,
        },
      ],
      [...fallbackLocations, extraFallback],
      fallbackStories
    );

    expect(result.locations.map((location) => location.title)).toEqual(['New title']);
  });
});
