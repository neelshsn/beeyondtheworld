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
});
