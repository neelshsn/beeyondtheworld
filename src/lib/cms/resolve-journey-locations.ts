import type {
  CmsJourneyLocation,
  JourneyLocationStoryView,
  JourneyLocationView,
} from '../../types/journey-location';

const ALL_SEASONS = ['spring-summer', 'fall-winter'] as const;

export function resolveJourneyLocationContent(
  cmsLocations: CmsJourneyLocation[],
  fallbackLocations: JourneyLocationView[],
  fallbackStories: JourneyLocationStoryView[]
) {
  if (cmsLocations.length === 0) {
    return { locations: fallbackLocations, stories: fallbackStories };
  }

  const locations = cmsLocations.map((location, index): JourneyLocationView => {
    const fallback = fallbackLocations[index];
    return {
      id: `cms-location-${location.id}`,
      title: location.name,
      region: location.subtitle ?? fallback?.region ?? '',
      image: location.image ?? fallback?.image ?? fallbackLocations[0]?.image ?? '',
      backgroundVideo: location.video ?? fallback?.backgroundVideo,
      seasons: fallback?.seasons ?? [...ALL_SEASONS],
    };
  });

  const stories = cmsLocations.map((location, index): JourneyLocationStoryView => {
    const fallback = fallbackStories[index];
    const current = locations[index];
    const next = locations[(index + 1) % locations.length];
    const storyImage =
      location.media.find((item) => item.type === 'image')?.url ?? fallback?.image ?? current.image;

    return {
      id: `cms-story-${location.id}`,
      locationId: current.id,
      image: storyImage,
      leftTitle: location.leftTitle.length > 0 ? location.leftTitle : (fallback?.leftTitle ?? []),
      narrative: location.narrative || fallback?.narrative || '',
      nextLocationId: next.id,
      nextLocation: next.title,
    };
  });

  return { locations, stories };
}
