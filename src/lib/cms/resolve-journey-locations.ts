import type {
  CmsJourneyLocation,
  JourneyLocationStoryView,
  JourneyLocationView,
} from '../../types/journey-location';

const ALL_SEASONS = ['spring-summer', 'fall-winter'] as const;

type ResolveJourneyLocationOptions = {
  appendMissingFallbacks?: boolean;
  preferFallbackMedia?: boolean;
};

function normalizeLocationName(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLocaleLowerCase('en');
}

export function resolveJourneyLocationContent(
  cmsLocations: CmsJourneyLocation[],
  fallbackLocations: JourneyLocationView[],
  fallbackStories: JourneyLocationStoryView[],
  options: ResolveJourneyLocationOptions = {}
) {
  if (cmsLocations.length === 0) {
    return { locations: fallbackLocations, stories: fallbackStories };
  }

  const claimedFallbackIds = new Set<string>();
  const cmsEntries = cmsLocations.map((location, index) => {
    const namedFallback = fallbackLocations.find(
      (candidate) =>
        !claimedFallbackIds.has(candidate.id) &&
        normalizeLocationName(candidate.title) === normalizeLocationName(location.name)
    );
    const positionalFallback = fallbackLocations[index];
    const fallback =
      namedFallback ??
      (positionalFallback && !claimedFallbackIds.has(positionalFallback.id)
        ? positionalFallback
        : undefined);
    if (fallback) claimedFallbackIds.add(fallback.id);

    const view: JourneyLocationView = {
      id: `cms-location-${location.id}`,
      title: location.name,
      region: location.subtitle ?? fallback?.region ?? '',
      image: options.preferFallbackMedia
        ? (fallback?.image ?? location.image ?? fallbackLocations[0]?.image ?? '')
        : (location.image ?? fallback?.image ?? fallbackLocations[0]?.image ?? ''),
      backgroundVideo: options.preferFallbackMedia
        ? (fallback?.backgroundVideo ?? location.video ?? undefined)
        : (location.video ?? fallback?.backgroundVideo),
      seasons: fallback?.seasons ?? [...ALL_SEASONS],
    };

    return { cms: location, fallback, view };
  });

  const locations = [
    ...cmsEntries.map(({ view }) => view),
    ...(options.appendMissingFallbacks
      ? fallbackLocations.filter((location) => !claimedFallbackIds.has(location.id))
      : []),
  ];

  const stories = locations.map((current, index): JourneyLocationStoryView => {
    const next = locations[(index + 1) % locations.length];
    const cmsEntry = cmsEntries.find(({ view }) => view.id === current.id);
    const fallbackLocation = cmsEntry?.fallback ?? current;
    const fallback = fallbackStories.find((story) => story.locationId === fallbackLocation.id);

    if (!cmsEntry) {
      return {
        id: fallback?.id ?? `fallback-story-${current.id}`,
        locationId: current.id,
        image: fallback?.image ?? current.image,
        leftTitle: fallback?.leftTitle ?? [current.title],
        narrative: fallback?.narrative ?? '',
        nextLocationId: next.id,
        nextLocation: next.title,
      };
    }

    const { cms } = cmsEntry;
    const cmsStoryImage = cms.media.find((item) => item.type === 'image')?.url;
    const storyImage = options.preferFallbackMedia
      ? (fallback?.image ?? cmsStoryImage ?? current.image)
      : (cmsStoryImage ?? fallback?.image ?? current.image);

    return {
      id: `cms-story-${cms.id}`,
      locationId: current.id,
      image: storyImage,
      leftTitle: cms.leftTitle.length > 0 ? cms.leftTitle : (fallback?.leftTitle ?? []),
      narrative: cms.narrative || fallback?.narrative || '',
      nextLocationId: next.id,
      nextLocation: next.title,
    };
  });

  return { locations, stories };
}
