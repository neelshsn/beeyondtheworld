import { describe, expect, it } from 'vitest';

import type {
  CmsJourneyLocation,
  JourneyLocationStoryView,
  JourneyLocationView,
} from '../../../types/journey-location';
import { resolveJourneyLocationContent } from '../resolve-journey-locations';
import { isJourneyLocationCollectionManaged } from '../journey-location-management';

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

const legacyLocation: CmsJourneyLocation = {
  id: 42,
  name: 'Old title',
  subtitle: null,
  leftTitle: [],
  narrative: 'Existing story',
  image: '/thumbnail.jpg',
  video: null,
  media: [],
  position: 0,
};

describe('resolveJourneyLocationContent', () => {
  it.each([undefined, null])(
    'retains historical seasons and background without saved overrides (%s)',
    (seasonTags) => {
      const result = resolveJourneyLocationContent(
        [{ ...legacyLocation, seasonTags }],
        fallbackLocations,
        fallbackStories
      );
      expect(result.locations[0].seasons).toEqual(['spring-summer']);
      expect(result.locations[0].backgroundVideo).toBe('/old-background.mp4');
    }
  );

  it('honors saved seasons and a photo background independently from the card and Tale', () => {
    const result = resolveJourneyLocationContent(
      [
        {
          ...legacyLocation,
          seasonTags: ['fall-winter'],
          video: '/new-background.webp',
          media: [{ type: 'image', url: '/tale.jpg' }],
        },
      ],
      fallbackLocations,
      fallbackStories
    );
    expect(result.locations[0]).toMatchObject({
      seasons: ['fall-winter'],
      backgroundVideo: '/new-background.webp',
      image: '/thumbnail.jpg',
    });
    expect(result.stories[0].image).toBe('/tale.jpg');
  });

  it('keeps intentionally hidden or deleted CMS collections empty', () => {
    expect(
      resolveJourneyLocationContent([], fallbackLocations, fallbackStories, { cmsManaged: true })
    ).toEqual({ locations: [], stories: [] });
  });

  it('preserves legacy fallback before editing and remembers deletion of the final step', () => {
    expect(isJourneyLocationCollectionManaged({}, 0)).toBe(false);
    expect(isJourneyLocationCollectionManaged({}, 1)).toBe(true);
    expect(isJourneyLocationCollectionManaged({ _cms: { locationsManaged: true } }, 0)).toBe(true);
  });

  it('does not copy another place’s Tale or season when a new step is added', () => {
    const result = resolveJourneyLocationContent(
      [
        {
          id: 72,
          name: 'New place',
          subtitle: null,
          leftTitle: [],
          narrative: '',
          image: '/new-place.jpg',
          video: null,
          media: [],
          position: 0,
        },
      ],
      fallbackLocations,
      fallbackStories
    );
    expect(result.locations[0].region).toBe('');
    expect(result.locations[0].seasons).toEqual(['spring-summer', 'fall-winter']);
    expect(result.stories[0].narrative).toBe('');
    expect(result.stories[0].leftTitle).toEqual([]);
    expect(result.stories[0].image).toBe('/new-place.jpg');
  });

  it('honors cleared Tale content and changed main imagery on an existing step', () => {
    const result = resolveJourneyLocationContent(
      [
        {
          id: 72,
          name: 'Old title',
          subtitle: null,
          leftTitle: [],
          narrative: '',
          image: '/edited-main.jpg',
          video: null,
          media: [],
          position: 0,
        },
      ],
      fallbackLocations,
      fallbackStories
    );
    expect(result.stories[0]).toMatchObject({
      narrative: '',
      leftTitle: [],
      image: '/edited-main.jpg',
    });
  });

  it('uses saved order for the next Tale after steps are reordered', () => {
    const steps = ['Last', 'First'].map((name, index) => ({
      id: index + 1,
      name,
      subtitle: null,
      leftTitle: [name],
      narrative: name,
      image: '/place.jpg',
      video: null,
      media: [],
      position: index,
    }));
    const result = resolveJourneyLocationContent(steps, fallbackLocations, fallbackStories);
    expect(result.locations.map((location) => location.title)).toEqual(['Last', 'First']);
    expect(result.stories.map((story) => story.nextLocation)).toEqual(['First', 'Last']);
  });
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
      media: [{ url: '/new-story.jpg', type: 'image', alt: 'New tale' }],
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
