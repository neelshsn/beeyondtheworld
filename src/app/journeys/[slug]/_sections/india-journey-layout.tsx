'use client';

import clsx from 'clsx';
import useEmblaCarousel from 'embla-carousel-react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { useBodyScrollLock } from '@/app/concept/_hooks/use-body-scroll-lock';
import { usePrefersReducedMotion } from '@/app/concept/_hooks/use-prefers-reduced-motion';
import type { JourneyShowcase } from '@/data/showcases';
import type { JourneySeason } from '@/types/journey';

type IndiaLocation = {
  id: string;
  title: string;
  region: string;
  image: string;
  backgroundVideo?: string;
  seasons: JourneySeason[];
};
type RenderedLocationSlide = { location: IndiaLocation; sourceIndex: number; renderKey: string };
type LocationSectionValue = 'locations' | 'csr-impact';
type MobileMenuValue = 'locations' | 'csr-impact' | 'back';
type IndiaLocationStory = {
  id: string;
  locationId: IndiaLocation['id'];
  image: string;
  leftTitle: string[];
  narrative: string;
  nextLocationId: IndiaLocation['id'];
  nextLocation: string;
};

const INDIA_BACKGROUND_VIDEO =
  '/assets/journeys/india-january-2026/anime_cette_image__Kling_30__17267.mp4';
const VIDEO_CONTINUITY_STORAGE_KEY = 'journey-background-video-state';
const JOURNEY_SEASON_ICONS: Record<
  JourneySeason,
  { icon: string; hoverIcon: string; label: string }
> = {
  'spring-summer': {
    icon: '/assets/icones/Ico White BEE-14.svg',
    hoverIcon: '/assets/icones/Ico Gold BEE-14.svg',
    label: 'Spring Summer',
  },
  'fall-winter': {
    icon: '/assets/icones/Ico White BEE-01.svg',
    hoverIcon: '/assets/icones/Ico Gold BEE-01.svg',
    label: 'Fall Winter',
  },
};

const INDIA_LOCATIONS: IndiaLocation[] = [
  {
    id: 'india-location-rajasthan',
    title: 'Rajasthan',
    region: 'Jaipur & Udaipur',
    image:
      '/assets/journeys/india-january-2026/india-january-2026-location-rajasthan-thumbnail.jpg',
    seasons: ['spring-summer', 'fall-winter'],
  },
  {
    id: 'india-location-kerala',
    title: 'Kerala',
    region: 'Backwaters & Highlands',
    image: '/assets/journeys/india-january-2026/india-january-2026-location-kerala-thumbnail.jpg',
    backgroundVideo:
      '/assets/journeys/india-january-2026/india-january-2026-location-kerala-background.mp4',
    seasons: ['fall-winter'],
  },
  {
    id: 'india-location-goa',
    title: 'Goa',
    region: 'Coastline & Sunsets',
    image: '/assets/journeys/india-january-2026/india-january-2026-location-goa-thumbnail.jpg',
    backgroundVideo:
      '/assets/journeys/india-january-2026/india-january-2026-location-goa-background.mp4',
    seasons: ['spring-summer'],
  },
];

const SECTION_OPTIONS = [
  {
    label: 'Locations',
    value: 'locations' as const,
    icon: '/assets/icones/Ico White BEE-14.svg',
    hoverIcon: '/assets/icones/Ico Gold BEE-14.svg',
    disabled: false,
  },
  {
    label: 'CSR Impact',
    value: 'csr-impact' as const,
    icon: '/assets/icones/Ico White BEE-06.svg',
    hoverIcon: '/assets/icones/Ico Gold BEE-06.svg',
    disabled: true,
  },
];

const MOBILE_MENU_OPTIONS = [
  {
    label: 'Locations',
    value: 'locations' as const,
    icon: '/assets/icones/Ico White BEE-14.svg',
    hoverIcon: '/assets/icones/Ico Gold BEE-14.svg',
    disabled: false,
  },
  {
    label: 'CSR Impact',
    value: 'csr-impact' as const,
    icon: '/assets/icones/Ico White BEE-06.svg',
    hoverIcon: '/assets/icones/Ico Gold BEE-06.svg',
    disabled: true,
  },
  {
    label: 'Back',
    value: 'back' as const,
    icon: '/assets/icones/Ico White BEE-12.svg',
    hoverIcon: '/assets/icones/Ico Gold BEE-12.svg',
    disabled: false,
  },
];

const LOCATION_STORIES: IndiaLocationStory[] = [
  {
    id: 'india-story-rajasthan',
    locationId: 'india-location-rajasthan',
    image: '/assets/locations/India1.jpg',
    leftTitle: ['Where', 'Sun teach', 'the', 'world', 'to dream.'],
    narrative:
      'In the golden vastness of Rajasthan, the sun melts into the desert like a secret whispered to the earth, setting the dunes ablaze in hues that exist nowhere else. Ancient cities rise like mirages carved from time itself, their temples breathing centuries of devotion and their palaces catching the last light as if holding it gently in their hands. In this land of kings and legends, evenings unfold like sacred rituals: shadows stretch, bells echo, and the horizon becomes a canvas of fire and tenderness. Rajasthan is not a place you visit - it is a dream you step into, a universe suspended between memory and light, where every sunset feels like the beginning of a story you were always meant to hear.',
    nextLocationId: 'india-location-kerala',
    nextLocation: 'Kerala',
  },
  {
    id: 'india-story-kerala',
    locationId: 'india-location-kerala',
    image: '/assets/locations/India2.jpg',
    leftTitle: ['Nature', 'Breathes', 'and the', 'Soul', 'Follows'],
    narrative:
      'Kerala drifts into the heart like a soft exhale, a world where water, forest, and sky speak in a language older than time. Along the tranquil backwaters, life floats at the pace of drifting coconut fronds, and the air is heavy with rain, earth, and the scent of distant spice hills. Mountains rise like whispered promises, tea gardens unfold like emerald waves, and the quiet wisdom of Ayurveda seems to linger in every breath. In Kerala, the boundaries between traveler and nature dissolve; you become part of the slow rhythm, the velvet green, the gentle pulse of life itself. It is a sanctuary where the world pauses, and the soul remembers how to listen.',
    nextLocationId: 'india-location-goa',
    nextLocation: 'Goa',
  },
  {
    id: 'india-story-goa',
    locationId: 'india-location-goa',
    image: '/assets/locations/India3.jpg',
    leftTitle: ['Horizons', 'Made of', 'Ocean', 'lights'],
    narrative:
      'In Goa and across the hidden islands of Lakshadweep, the ocean becomes a dream without edges, stretching into shades of blue that feel almost unreal. Goa hums with a free-spirited heartbeat - golden beaches, palm-framed sunsets, and a breeze that carries a hint of music, salt, and stories of distant lands. Farther out, Lakshadweep emerges like a secret whispered by the sea: a constellation of coral islands suspended over crystal lagoons, untouched and impossibly serene. Here, time slips into the rhythm of the tides, and every horizon feels like a doorway into wonder. These shores are not just destinations - they are states of mind, where the world glows brighter, softer, and endlessly alive.',
    nextLocationId: 'india-location-rajasthan',
    nextLocation: 'Rajasthan',
  },
];

function buildRenderedLocationSlides(data: IndiaLocation[]): RenderedLocationSlide[] {
  if (!data.length) return [];
  const repeatCycles = Math.max(7, Math.ceil(18 / data.length));
  return Array.from({ length: data.length * repeatCycles }, (_, index) => {
    const sourceIndex = index % data.length;
    return {
      location: data[sourceIndex],
      sourceIndex,
      renderKey: `${data[sourceIndex].id}-${index}`,
    };
  });
}

function getForwardOffset(index: number, activeIndex: number, total: number) {
  if (!total) return 0;
  return (index - activeIndex + total) % total;
}

function getDesktopSlideBasisClass(forwardOffset: number) {
  if (forwardOffset === 0) return 'md:flex-[0_0_calc((100%-(var(--journey-gap)*3))*0.4)]';
  if (forwardOffset === 1) return 'md:flex-[0_0_calc((100%-(var(--journey-gap)*3))*0.27)]';
  if (forwardOffset === 2) return 'md:flex-[0_0_calc((100%-(var(--journey-gap)*3))*0.23)]';
  return 'md:flex-[0_0_calc((100%-(var(--journey-gap)*3))*0.18)]';
}

function getCardFadeProfile(forwardOffset: number, isMobileViewport: boolean) {
  if (isMobileViewport) {
    return {
      opacity: forwardOffset === 0 ? 1 : 0.86,
      y: 0,
      scale: forwardOffset === 0 ? 1 : 0.985,
      imageScale: forwardOffset === 0 ? 1.02 : 1.05,
      imageFilter:
        forwardOffset === 0 ? 'saturate(1) brightness(1)' : 'saturate(0.92) brightness(0.92)',
      overlayOpacity: forwardOffset === 0 ? 0.16 : 0.28,
    };
  }
  if (forwardOffset === 0) {
    return {
      opacity: 1,
      y: 0,
      scale: 1,
      imageScale: 1.015,
      imageFilter: 'saturate(1) brightness(1)',
      overlayOpacity: 0.14,
    };
  }
  if (forwardOffset === 1) {
    return {
      opacity: 0.9,
      y: 5,
      scale: 0.996,
      imageScale: 1.03,
      imageFilter: 'saturate(0.95) brightness(0.98)',
      overlayOpacity: 0.18,
    };
  }
  if (forwardOffset === 2) {
    return {
      opacity: 0.78,
      y: 9,
      scale: 0.989,
      imageScale: 1.045,
      imageFilter: 'saturate(0.92) brightness(0.96)',
      overlayOpacity: 0.22,
    };
  }
  return {
    opacity: 0.68,
    y: 12,
    scale: 0.984,
    imageScale: 1.055,
    imageFilter: 'saturate(0.88) brightness(0.92)',
    overlayOpacity: 0.26,
  };
}

export function IndiaJourneyLayout({ journey }: { journey: JourneyShowcase }) {
  useBodyScrollLock();

  const router = useRouter();
  const prefersReducedMotion = usePrefersReducedMotion();
  const [isMobileViewport, setIsMobileViewport] = useState(false);
  const [useLiteEffects, setUseLiteEffects] = useState(false);
  const [activeSection] = useState<LocationSectionValue>('locations');
  const [mobileMenuIndex, setMobileMenuIndex] = useState(0);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mobileQuery = window.matchMedia('(max-width: 767px)');
    const liteQuery = window.matchMedia('(max-width: 1200px)');
    const nav = window.navigator as Navigator & { deviceMemory?: number };
    const lowCpu = typeof nav.hardwareConcurrency === 'number' && nav.hardwareConcurrency <= 4;
    const lowMemory = typeof nav.deviceMemory === 'number' && nav.deviceMemory <= 4;
    const onChange = () => {
      setIsMobileViewport(mobileQuery.matches);
      setUseLiteEffects(liteQuery.matches || lowCpu || lowMemory);
    };
    onChange();
    mobileQuery.addEventListener('change', onChange);
    liteQuery.addEventListener('change', onChange);
    return () => {
      mobileQuery.removeEventListener('change', onChange);
      liteQuery.removeEventListener('change', onChange);
    };
  }, []);

  const renderedLocations = useMemo(() => buildRenderedLocationSlides(INDIA_LOCATIONS), []);
  const renderedIdsSignature = useMemo(
    () => renderedLocations.map((location) => location.renderKey).join('|'),
    [renderedLocations]
  );
  const uniqueLocationCount = INDIA_LOCATIONS.length;
  const centeredStartIndex = useMemo(() => {
    if (!uniqueLocationCount || !renderedLocations.length) return 0;
    return Math.floor(renderedLocations.length / uniqueLocationCount / 2) * uniqueLocationCount;
  }, [renderedLocations.length, uniqueLocationCount]);

  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: 'center',
    loop: false,
    containScroll: false,
    duration: 30,
    skipSnaps: false,
    dragFree: false,
    breakpoints: { '(min-width: 768px)': { align: 'start' } },
  });

  const rootRef = useRef<HTMLDivElement | null>(null);
  const previousSelectedIndexRef = useRef(0);
  const isRecenteringRef = useRef(false);
  const pendingDirectionRef = useRef<1 | -1>(1);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);
  const [backgroundDirection, setBackgroundDirection] = useState<1 | -1>(1);
  const [activeLocationStoryId, setActiveLocationStoryId] = useState<string | null>(null);
  const backgroundVideoRef = useRef<HTMLVideoElement | null>(null);

  const safeLength = renderedLocations.length;
  const displayIndex = safeLength ? Math.min(selectedIndex, safeLength - 1) : 0;
  const activeRenderedLocation = safeLength ? renderedLocations[displayIndex] : null;
  const currentLocation = activeRenderedLocation?.location ?? null;
  const activeLocationStory = useMemo(
    () => LOCATION_STORIES.find((story) => story.id === activeLocationStoryId) ?? null,
    [activeLocationStoryId]
  );
  const activeMobileMenuOption = MOBILE_MENU_OPTIONS[mobileMenuIndex] ?? MOBILE_MENU_OPTIONS[0];

  useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => {
      const nextIndex = emblaApi.selectedScrollSnap();
      const previousIndex = previousSelectedIndexRef.current;
      if (isRecenteringRef.current) {
        isRecenteringRef.current = false;
        previousSelectedIndexRef.current = nextIndex;
        setSelectedIndex(nextIndex);
        setBackgroundDirection(pendingDirectionRef.current);
        setCanScrollPrev(uniqueLocationCount > 1);
        setCanScrollNext(uniqueLocationCount > 1);
        return;
      }
      const rawDirection =
        nextIndex === previousIndex
          ? pendingDirectionRef.current
          : nextIndex > previousIndex
            ? 1
            : -1;
      if (
        uniqueLocationCount > 1 &&
        renderedLocations.length > uniqueLocationCount * 2 &&
        (nextIndex < uniqueLocationCount ||
          nextIndex >= renderedLocations.length - uniqueLocationCount)
      ) {
        const sourceIndex = renderedLocations[nextIndex]?.sourceIndex ?? 0;
        const targetIndex = centeredStartIndex + sourceIndex;
        if (targetIndex !== nextIndex) {
          pendingDirectionRef.current = rawDirection;
          isRecenteringRef.current = true;
          emblaApi.scrollTo(targetIndex, true);
          return;
        }
      }
      pendingDirectionRef.current = rawDirection;
      previousSelectedIndexRef.current = nextIndex;
      setSelectedIndex(nextIndex);
      setBackgroundDirection(rawDirection);
      setCanScrollPrev(uniqueLocationCount > 1);
      setCanScrollNext(uniqueLocationCount > 1);
    };
    emblaApi.on('select', onSelect);
    emblaApi.on('reInit', onSelect);
    onSelect();
    return () => {
      emblaApi.off('select', onSelect);
      emblaApi.off('reInit', onSelect);
    };
  }, [centeredStartIndex, emblaApi, renderedLocations, uniqueLocationCount]);

  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.reInit({ startIndex: centeredStartIndex });
    isRecenteringRef.current = false;
    pendingDirectionRef.current = 1;
    emblaApi.scrollTo(centeredStartIndex, true);
    previousSelectedIndexRef.current = centeredStartIndex;
    setSelectedIndex(centeredStartIndex);
    setBackgroundDirection(1);
    setCanScrollPrev(uniqueLocationCount > 1);
    setCanScrollNext(uniqueLocationCount > 1);
  }, [
    centeredStartIndex,
    emblaApi,
    renderedIdsSignature,
    renderedLocations.length,
    uniqueLocationCount,
  ]);

  const scrollPrev = useCallback(() => {
    if (emblaApi?.canScrollPrev()) emblaApi.scrollPrev();
  }, [emblaApi]);
  const scrollNext = useCallback(() => {
    if (emblaApi?.canScrollNext()) emblaApi.scrollNext();
  }, [emblaApi]);

  const openLocationStory = useCallback((locationId: IndiaLocation['id']) => {
    const story = LOCATION_STORIES.find((item) => item.locationId === locationId);
    if (story) {
      setActiveLocationStoryId(story.id);
    }
  }, []);

  const closeLocationStory = useCallback(() => {
    setActiveLocationStoryId(null);
  }, []);

  const openNextLocationStory = useCallback(() => {
    if (!activeLocationStory) return;
    const nextLocationIndex = INDIA_LOCATIONS.findIndex(
      (location) => location.id === activeLocationStory.nextLocationId
    );
    if (nextLocationIndex >= 0) {
      emblaApi?.scrollTo(centeredStartIndex + nextLocationIndex, true);
    }
    const nextStory = LOCATION_STORIES.find(
      (story) => story.locationId === activeLocationStory.nextLocationId
    );
    setActiveLocationStoryId(nextStory?.id ?? null);
  }, [activeLocationStory, centeredStartIndex, emblaApi]);

  const cycleMobileMenu = useCallback((direction: 1 | -1) => {
    setMobileMenuIndex((current) => {
      const nextIndex =
        (current + direction + MOBILE_MENU_OPTIONS.length) % MOBILE_MENU_OPTIONS.length;
      return nextIndex;
    });
  }, []);

  const runMobileMenuAction = useCallback(() => {
    if (!activeMobileMenuOption || activeMobileMenuOption.disabled) {
      return;
    }

    if (activeMobileMenuOption.value === 'back') {
      router.back();
      return;
    }

    if (activeMobileMenuOption.value === 'locations') {
      if (activeLocationStory) {
        closeLocationStory();
      }
    }
  }, [activeLocationStory, activeMobileMenuOption, closeLocationStory, router]);

  useEffect(() => {
    if (!emblaApi) return;
    const handleWindowKeyDown = (event: KeyboardEvent) => {
      if (safeLength < 2) return;
      if (event.key === 'ArrowRight') {
        event.preventDefault();
        scrollNext();
      } else if (event.key === 'ArrowLeft') {
        event.preventDefault();
        scrollPrev();
      }
    };
    window.addEventListener('keydown', handleWindowKeyDown);
    return () => window.removeEventListener('keydown', handleWindowKeyDown);
  }, [emblaApi, safeLength, scrollNext, scrollPrev]);

  useEffect(() => {
    const node = rootRef.current;
    if (!node || !emblaApi) return;
    let wheelAccumulator = 0;
    const handleWheel = (event: WheelEvent) => {
      if (safeLength < 2) return;
      const primaryDelta =
        Math.abs(event.deltaY) > Math.abs(event.deltaX) ? event.deltaY : event.deltaX;
      if (!primaryDelta) return;
      event.preventDefault();
      wheelAccumulator += primaryDelta;
      if (Math.abs(wheelAccumulator) < 30) return;
      wheelAccumulator > 0 ? scrollNext() : scrollPrev();
      wheelAccumulator = 0;
    };
    node.addEventListener('wheel', handleWheel, { passive: false });
    return () => node.removeEventListener('wheel', handleWheel);
  }, [emblaApi, safeLength, scrollNext, scrollPrev]);

  useEffect(() => {
    if (!activeLocationStory || !currentLocation) return;
    if (activeLocationStory.locationId !== currentLocation.id) {
      setActiveLocationStoryId(null);
    }
  }, [activeLocationStory, currentLocation]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    let cleanup: (() => void) | undefined;

    try {
      const rawState = window.sessionStorage.getItem(VIDEO_CONTINUITY_STORAGE_KEY);
      if (!rawState) return;

      const state = JSON.parse(rawState) as {
        slug?: string;
        src?: string;
        currentTime?: number;
        capturedAt?: number;
      };

      if (state.slug !== journey.slug || state.src !== INDIA_BACKGROUND_VIDEO) {
        return;
      }

      const applyContinuity = () => {
        const video = backgroundVideoRef.current;
        if (!video) return;

        const elapsedSeconds =
          typeof state.capturedAt === 'number'
            ? Math.max(0, (Date.now() - state.capturedAt) / 1000)
            : 0;
        let nextTime = Math.max(0, (state.currentTime ?? 0) + elapsedSeconds);

        if (Number.isFinite(video.duration) && video.duration > 0) {
          nextTime %= video.duration;
        }

        try {
          video.currentTime = nextTime;
        } catch {
          // Ignore seek failures and keep normal playback.
        }

        void video.play().catch(() => undefined);
        window.sessionStorage.removeItem(VIDEO_CONTINUITY_STORAGE_KEY);
      };

      const video = backgroundVideoRef.current;
      if (video?.readyState && video.readyState >= 1) {
        applyContinuity();
      } else if (video) {
        const handleLoadedMetadata = () => applyContinuity();
        video.addEventListener('loadedmetadata', handleLoadedMetadata, { once: true });
        cleanup = () => video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      }
    } catch {
      // Ignore malformed continuity state and keep default playback.
    }

    return () => cleanup?.();
  }, [journey.slug]);

  return (
    <section
      ref={rootRef}
      className="relative flex min-h-[100svh] flex-col overflow-hidden bg-black text-white"
      tabIndex={0}
      aria-label="India locations carousel"
    >
      <LocationBackground
        activeKey={currentLocation?.id ?? journey.slug}
        poster={currentLocation?.image ?? journey.hero.src}
        videoSrc={currentLocation?.backgroundVideo ?? INDIA_BACKGROUND_VIDEO}
        videoRef={backgroundVideoRef}
        direction={backgroundDirection}
        prefersReducedMotion={prefersReducedMotion}
        useLiteEffects={useLiteEffects}
      />
      <div className="relative z-20 flex min-h-[100svh] flex-col">
        <div className="pointer-events-none absolute left-4 top-5 z-30 sm:left-6 sm:top-7 lg:left-10 lg:top-8">
          <div className="pointer-events-auto">
            <BackToJourneysButton onClick={() => router.push('/journeys')} />
          </div>
        </div>
        <div className="relative flex flex-1 items-center justify-end">
          <div className="w-full px-2 pb-2 pt-20 sm:px-6 sm:pb-4 sm:pt-24 md:ml-auto md:w-[75%] md:pb-0 md:pl-10 md:pr-6 md:pt-0 lg:py-10 lg:pl-16 lg:pr-10 xl:pl-20">
            <AnimatePresence mode="wait" initial={false}>
              {activeLocationStory ? (
                <motion.div
                  key={`story-${activeLocationStory.id}`}
                  initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={prefersReducedMotion ? { opacity: 1 } : { opacity: 0 }}
                  transition={{
                    duration: prefersReducedMotion ? 0.2 : 0.65,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  className="py-4 md:py-0"
                >
                  <LocationStoryBand
                    story={activeLocationStory}
                    compact={isMobileViewport}
                    onClose={closeLocationStory}
                    onNext={openNextLocationStory}
                  />
                </motion.div>
              ) : (
                <motion.div
                  key="location-carousel"
                  initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={prefersReducedMotion ? { opacity: 1 } : { opacity: 0 }}
                  transition={{
                    duration: prefersReducedMotion ? 0.2 : 0.65,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                >
                  <div
                    className="overflow-visible pb-8 sm:pb-10 md:overflow-hidden md:pb-0"
                    ref={emblaRef}
                  >
                    <motion.div
                      key={renderedIdsSignature}
                      className="embla__container flex touch-pan-x items-center gap-3 sm:gap-4 md:gap-[var(--journey-gap)] md:[--journey-gap:clamp(14px,1.7vw,28px)]"
                      initial={prefersReducedMotion ? undefined : { opacity: 0 }}
                      animate={prefersReducedMotion ? undefined : { opacity: 1 }}
                      transition={{ duration: 1.08, ease: [0.22, 1, 0.36, 1] }}
                    >
                      {renderedLocations.map((slide, index) => {
                        const forwardOffset = getForwardOffset(
                          index,
                          displayIndex,
                          renderedLocations.length
                        );
                        return (
                          <motion.div
                            key={slide.renderKey}
                            layout
                            className={clsx(
                              'embla__slide flex flex-[0_0_74%] items-center sm:flex-[0_0_60%]',
                              getDesktopSlideBasisClass(forwardOffset)
                            )}
                          >
                            <LocationCard
                              location={slide.location}
                              isActive={activeRenderedLocation?.renderKey === slide.renderKey}
                              forwardOffset={forwardOffset}
                              onAction={() => {
                                if (index !== emblaApi?.selectedScrollSnap()) {
                                  emblaApi?.scrollTo(index);
                                  return;
                                }
                                openLocationStory(slide.location.id);
                              }}
                              prefersReducedMotion={prefersReducedMotion}
                              isMobileViewport={isMobileViewport}
                            />
                          </motion.div>
                        );
                      })}
                    </motion.div>
                  </div>
                  <div className="pointer-events-none relative z-40 mt-8 flex flex-col items-center gap-3 pb-5 md:hidden">
                    <LocationHeadline
                      currentLocation={currentLocation}
                      journey={journey}
                      compact
                      centered
                    />
                    <MobileMenuCycler
                      option={activeMobileMenuOption}
                      onPrev={() => cycleMobileMenu(-1)}
                      onNext={() => cycleMobileMenu(1)}
                      onSelect={runMobileMenuAction}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
        <div className="pointer-events-none absolute left-6 top-1/2 z-40 hidden -translate-y-1/2 md:block lg:left-10 xl:left-14">
          <LocationHeadline currentLocation={currentLocation} journey={journey} sideAligned />
        </div>
        <div className="pointer-events-none absolute bottom-5 right-4 z-30 hidden sm:bottom-7 sm:right-6 md:right-10 md:block lg:bottom-10 lg:right-16 xl:right-20">
          <div className="pointer-events-auto">
            <LocationSectionMenu value={activeSection} />
          </div>
        </div>
      </div>
    </section>
  );
}

function LocationSectionMenu({
  value,
  compact = false,
}: {
  value: LocationSectionValue;
  compact?: boolean;
}) {
  return (
    <div
      className={clsx(
        'inline-flex items-center text-white drop-shadow-[0_12px_28px_rgba(0,0,0,0.38)]',
        compact ? 'gap-2.5' : 'gap-4'
      )}
    >
      {SECTION_OPTIONS.map((option) => {
        const isActive = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            disabled={option.disabled}
            aria-pressed={isActive}
            className={clsx(
              'group relative inline-flex items-center gap-2.5 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/45',
              compact ? 'gap-2' : 'gap-2.5',
              option.disabled ? 'cursor-not-allowed opacity-35' : 'opacity-85 hover:opacity-100',
              isActive && !option.disabled && 'opacity-100'
            )}
          >
            <div className={clsx('relative shrink-0', compact ? 'h-7 w-7' : 'h-8 w-8')}>
              <Image
                src={option.icon}
                alt=""
                fill
                className={clsx(
                  'object-contain transition-opacity duration-300',
                  option.disabled
                    ? 'opacity-100'
                    : isActive
                      ? 'opacity-0 group-hover:opacity-0'
                      : 'opacity-100 group-hover:opacity-0'
                )}
              />
              {!option.disabled ? (
                <Image
                  src={option.hoverIcon}
                  alt=""
                  fill
                  className={clsx(
                    'object-contain transition-opacity duration-300',
                    isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                  )}
                />
              ) : null}
            </div>
            <span
              className={clsx(
                'font-display uppercase transition-colors duration-300',
                compact ? 'text-[0.7rem] tracking-[0.16em]' : 'text-[1rem] tracking-[0.14em]',
                option.disabled
                  ? 'text-white/65'
                  : isActive
                    ? 'text-[#f6c452]'
                    : 'text-white group-hover:text-[#f6c452]'
              )}
            >
              {option.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}

function LocationHeadline({
  currentLocation,
  journey,
  compact = false,
  centered = false,
  sideAligned = false,
}: {
  currentLocation: IndiaLocation | null;
  journey: JourneyShowcase;
  compact?: boolean;
  centered?: boolean;
  sideAligned?: boolean;
}) {
  return (
    <AnimatePresence mode="wait">
      {currentLocation ? (
        <motion.div
          key={currentLocation.id}
          initial={{ y: 10 }}
          animate={{ y: 0 }}
          exit={{ y: -12 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className={clsx(
            'relative z-10',
            compact ? 'max-w-[80vw]' : 'max-w-[62vw]',
            sideAligned && !compact && 'max-w-[28vw] xl:max-w-[24vw]',
            centered && 'text-center'
          )}
        >
          <h1
            className={clsx(
              'font-title uppercase tracking-normal text-white [text-shadow:0_24px_52px_rgba(0,0,0,0.35)]',
              compact
                ? 'text-[clamp(2.15rem,12vw,4.4rem)] leading-[0.82]'
                : sideAligned
                  ? 'text-[clamp(3.2rem,7vw,7.4rem)] leading-[0.82]'
                  : 'text-[clamp(3.4rem,11vw,10.2rem)] leading-[0.8]'
            )}
          >
            {currentLocation.title}
          </h1>
          <p
            className={clsx(
              'mt-1 uppercase text-white [text-shadow:0_0_18px_rgba(255,255,255,0.48)]',
              compact
                ? 'text-[0.5rem] tracking-[0.32em]'
                : 'text-[0.62rem] tracking-[0.34em] sm:text-[0.72rem]'
            )}
          >
            {journey.timeframe}
          </p>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

function BackToJourneysButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group inline-flex items-center gap-2 text-white drop-shadow-[0_12px_28px_rgba(0,0,0,0.38)] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/45"
      aria-label="Back to all journeys"
    >
      <ArrowLeft className="h-5 w-5 text-white/55 transition-all duration-300 group-hover:-translate-x-0.5 group-hover:text-[#f6c452]" />
      <div className="relative h-8 w-8 shrink-0">
        <Image
          src="/assets/icones/Ico White BEE-12.svg"
          alt=""
          fill
          className="object-contain transition-opacity duration-300 group-hover:opacity-0"
        />
        <Image
          src="/assets/icones/Ico Gold BEE-12.svg"
          alt=""
          fill
          className="object-contain opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        />
      </div>
      <span className="font-display text-[0.72rem] uppercase tracking-[0.16em] text-white transition-colors duration-300 group-hover:text-[#f6c452] sm:text-[0.8rem]">
        All Journeys
      </span>
    </button>
  );
}

function LocationNavigation({
  canScrollPrev,
  canScrollNext,
  onPrev,
  onNext,
  compact = false,
  centered = false,
}: {
  canScrollPrev: boolean;
  canScrollNext: boolean;
  onPrev: () => void;
  onNext: () => void;
  compact?: boolean;
  centered?: boolean;
}) {
  return (
    <div
      className={clsx(
        'pointer-events-auto flex items-center text-white',
        compact ? 'gap-2' : 'gap-3 sm:gap-4',
        centered && 'justify-center'
      )}
    >
      <button
        type="button"
        onClick={onPrev}
        disabled={!canScrollPrev}
        className={clsx(
          'group flex items-center justify-center transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/45',
          compact ? 'h-6 w-6' : 'h-7 w-7',
          !canScrollPrev ? 'cursor-not-allowed text-white/20' : 'text-white/45 hover:text-white/80'
        )}
        aria-label="Previous location"
      >
        <ArrowLeft
          className={clsx(
            'transition-transform duration-300 group-hover:-translate-x-1',
            compact ? 'h-3.5 w-3.5' : 'h-4 w-4'
          )}
        />
      </button>
      <div
        className={clsx(
          'relative flex min-w-0 items-center overflow-hidden',
          compact ? 'gap-1.5' : 'gap-3'
        )}
      >
        <Image
          src="/assets/icones/Ico White BEE-14.svg"
          alt=""
          width={42}
          height={42}
          className={clsx(
            'shrink-0 drop-shadow-[0_0_20px_rgba(255,255,255,0.42)]',
            compact ? 'h-7 w-7' : 'h-10 w-10 sm:h-11 sm:w-11'
          )}
          priority
        />
        <span
          className={clsx(
            'truncate font-display uppercase tracking-[0.14em] text-white [text-shadow:0_0_18px_rgba(255,255,255,0.35)]',
            compact ? 'text-[0.7rem]' : 'text-[1.1rem] sm:text-[1.55rem]'
          )}
        >
          Next Location
        </span>
      </div>
      <button
        type="button"
        onClick={onNext}
        disabled={!canScrollNext}
        className={clsx(
          'group flex items-center justify-center transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/45',
          compact ? 'h-6 w-6' : 'h-7 w-7',
          !canScrollNext ? 'cursor-not-allowed text-white/20' : 'text-white/45 hover:text-white/80'
        )}
        aria-label="Next location"
      >
        <ArrowRight
          className={clsx(
            'transition-transform duration-300 group-hover:translate-x-1',
            compact ? 'h-3.5 w-3.5' : 'h-4 w-4'
          )}
        />
      </button>
    </div>
  );
}

function MobileMenuCycler({
  option,
  onPrev,
  onNext,
  onSelect,
}: {
  option: (typeof MOBILE_MENU_OPTIONS)[number];
  onPrev: () => void;
  onNext: () => void;
  onSelect: () => void;
}) {
  return (
    <div className="pointer-events-auto flex items-center justify-center gap-2 text-white">
      <button
        type="button"
        onClick={onPrev}
        className="group flex h-6 w-6 items-center justify-center text-white/45 transition hover:text-white/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/45"
        aria-label="Previous menu item"
      >
        <ArrowLeft className="h-3.5 w-3.5 transition-transform duration-300 group-hover:-translate-x-1" />
      </button>

      <button
        type="button"
        onClick={onSelect}
        disabled={option.disabled}
        className={clsx(
          'group relative flex min-w-[11.5rem] items-center justify-center gap-2 overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/45',
          option.disabled ? 'cursor-not-allowed opacity-55' : 'opacity-100'
        )}
      >
        <div className="relative h-7 w-7 shrink-0">
          <Image
            src={option.icon}
            alt=""
            fill
            className={clsx(
              'object-contain transition-opacity duration-300',
              option.disabled ? 'opacity-100' : 'opacity-100 group-hover:opacity-0'
            )}
          />
          {!option.disabled ? (
            <Image
              src={option.hoverIcon}
              alt=""
              fill
              className="object-contain opacity-0 transition-opacity duration-300 group-hover:opacity-100"
            />
          ) : null}
        </div>
        <span
          className={clsx(
            'font-display text-[0.78rem] uppercase tracking-[0.16em] transition-colors duration-300',
            option.disabled ? 'text-white/72' : 'text-white group-hover:text-[#f6c452]'
          )}
        >
          {option.label}
        </span>
      </button>

      <button
        type="button"
        onClick={onNext}
        className="group flex h-6 w-6 items-center justify-center text-white/45 transition hover:text-white/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/45"
        aria-label="Next menu item"
      >
        <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" />
      </button>
    </div>
  );
}

function LocationCard({
  location,
  isActive,
  forwardOffset,
  onAction,
  prefersReducedMotion,
  isMobileViewport,
}: {
  location: IndiaLocation;
  isActive: boolean;
  forwardOffset: number;
  onAction: () => void;
  prefersReducedMotion: boolean;
  isMobileViewport: boolean;
}) {
  const fadeProfile = getCardFadeProfile(forwardOffset, isMobileViewport);

  return (
    <motion.button
      type="button"
      onClick={onAction}
      layout
      className={clsx(
        'group relative w-full overflow-visible focus:outline-none focus-visible:ring-2 focus-visible:ring-[#f5d49b] focus-visible:ring-offset-0',
        prefersReducedMotion
          ? 'transition-none'
          : 'ease-[cubic-bezier(0.22,1,0.36,1)] transition-transform duration-700'
      )}
      animate={
        prefersReducedMotion
          ? undefined
          : { opacity: fadeProfile.opacity, scale: fadeProfile.scale, y: fadeProfile.y }
      }
      whileHover={
        prefersReducedMotion
          ? undefined
          : {
              opacity: Math.min(fadeProfile.opacity + 0.08, 1),
              scale: fadeProfile.scale + 0.01,
              y: Math.max(fadeProfile.y - 4, -4),
            }
      }
      transition={
        prefersReducedMotion
          ? undefined
          : {
              duration: 0.7,
              ease: [0.22, 1, 0.36, 1],
              layout: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
            }
      }
      aria-label={`Location: ${location.title}`}
      style={{ transformOrigin: isMobileViewport ? 'center center' : 'left center' }}
    >
      <div className="relative aspect-[3/4] w-full overflow-hidden shadow-[0_30px_75px_-24px_rgba(0,0,0,0.78)]">
        <motion.div
          className="absolute inset-0"
          animate={
            prefersReducedMotion
              ? undefined
              : { scale: fadeProfile.imageScale, filter: fadeProfile.imageFilter }
          }
          whileHover={
            prefersReducedMotion
              ? undefined
              : { scale: fadeProfile.imageScale + 0.025, filter: 'saturate(1.02) brightness(1.01)' }
          }
          transition={
            prefersReducedMotion ? undefined : { duration: 0.8, ease: [0.22, 1, 0.36, 1] }
          }
        >
          <Image
            src={location.image}
            alt={location.title}
            fill
            sizes="(min-width: 1536px) 27vw, (min-width: 1280px) 32vw, (min-width: 1024px) 34vw, (min-width: 640px) 52vw, 78vw"
            className="object-cover"
            priority={isActive}
          />
        </motion.div>
        <motion.div
          className="from-black/62 absolute inset-0 bg-gradient-to-t via-transparent to-black/10"
          animate={prefersReducedMotion ? undefined : { opacity: fadeProfile.overlayOpacity }}
          transition={
            prefersReducedMotion ? undefined : { duration: 0.62, ease: [0.22, 1, 0.36, 1] }
          }
        />
        <div className="pointer-events-none absolute inset-x-0 bottom-4 flex justify-center">
          <SeasonIconRow seasons={location.seasons} compact={isMobileViewport} />
        </div>
      </div>
    </motion.button>
  );
}

function SeasonIconRow({
  seasons,
  compact = false,
}: {
  seasons: JourneySeason[];
  compact?: boolean;
}) {
  return (
    <div className={clsx('flex items-center justify-center', compact ? 'gap-2.5' : 'gap-3')}>
      {seasons.map((season) => {
        const iconSet = JOURNEY_SEASON_ICONS[season];
        return (
          <div
            key={season}
            className={clsx('relative shrink-0', compact ? 'h-6 w-6' : 'h-7 w-7')}
            aria-label={iconSet.label}
          >
            <Image
              src={iconSet.icon}
              alt=""
              fill
              className="object-contain transition-all duration-300 group-hover:-translate-y-0.5 group-hover:scale-105 group-hover:opacity-0"
            />
            <Image
              src={iconSet.hoverIcon}
              alt=""
              fill
              className="object-contain opacity-0 transition-all duration-300 group-hover:-translate-y-0.5 group-hover:scale-105 group-hover:opacity-100"
            />
          </div>
        );
      })}
    </div>
  );
}

function LocationBackground({
  activeKey,
  poster,
  videoSrc,
  videoRef,
  direction,
  prefersReducedMotion,
  useLiteEffects,
}: {
  activeKey: string;
  poster: string;
  videoSrc: string;
  videoRef: { current: HTMLVideoElement | null };
  direction: 1 | -1;
  prefersReducedMotion: boolean;
  useLiteEffects: boolean;
}) {
  const backgroundDuration = prefersReducedMotion ? 0.2 : useLiteEffects ? 0.72 : 0.98;
  const seamPeakOpacity = useLiteEffects ? 0.34 : 0.5;
  const seamShift = direction > 0 ? 42 : -42;

  return (
    <div className="pointer-events-none absolute inset-0" aria-hidden>
      <div className="absolute inset-0">
        <AnimatePresence initial={false} mode="sync">
          <motion.div
            key={activeKey}
            className="absolute inset-0 overflow-hidden"
            initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={prefersReducedMotion ? { opacity: 1 } : { opacity: 0 }}
            transition={{ duration: backgroundDuration, ease: [0.22, 1, 0.36, 1] }}
          >
            <video
              ref={videoRef}
              src={videoSrc}
              poster={poster}
              className="absolute inset-0 h-full w-full object-cover object-center"
              autoPlay
              muted
              loop
              playsInline
              preload="auto"
            />
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="absolute inset-0 overflow-hidden">
        <AnimatePresence initial={false} mode="sync">
          {!prefersReducedMotion ? (
            <motion.div
              key={`seam-${activeKey}`}
              className="absolute inset-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: backgroundDuration, ease: [0.22, 1, 0.36, 1] }}
            >
              <motion.div
                className="absolute inset-y-[-8%] left-1/2 z-10 w-[46vw] -translate-x-1/2 bg-[linear-gradient(90deg,rgba(255,255,255,0)_0%,rgba(255,255,255,0.05)_18%,rgba(255,255,255,0.2)_50%,rgba(255,255,255,0.05)_82%,rgba(255,255,255,0)_100%)] mix-blend-screen blur-[28px]"
                initial={{ opacity: 0, x: seamShift }}
                animate={{ opacity: [0, seamPeakOpacity, 0], x: [seamShift, 0, -seamShift * 0.4] }}
                exit={{ opacity: 0 }}
                transition={{
                  duration: backgroundDuration,
                  ease: [0.22, 1, 0.36, 1],
                  times: [0, 0.45, 1],
                }}
              />
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(236,191,126,0.2)_0%,rgba(236,191,126,0)_42%),radial-gradient(circle_at_82%_84%,rgba(255,234,196,0.14)_0%,rgba(255,234,196,0)_38%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(110deg,rgba(15,8,4,0.62)_0%,rgba(19,10,5,0.3)_36%,rgba(15,8,4,0.66)_100%)]" />
    </div>
  );
}

function LocationStoryBand({
  story,
  compact = false,
  onClose,
  onNext,
}: {
  story: IndiaLocationStory;
  compact?: boolean;
  onClose: () => void;
  onNext: () => void;
}) {
  return (
    <div className={clsx('mx-auto w-full', compact ? 'max-w-[94vw]' : 'max-w-[1280px]')}>
      <div className="mb-4 flex items-center justify-between">
        <button
          type="button"
          onClick={onClose}
          className="group inline-flex items-center gap-2 px-1 py-1.5 font-display text-[10px] uppercase tracking-[0.18em] text-white/85 transition hover:text-[#d9a24b] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/55"
        >
          <ArrowLeft className="h-5 w-5 transition-transform group-hover:-translate-x-0.5 group-hover:text-[#d9a24b]" />
          Back
        </button>

        <button
          type="button"
          onClick={onNext}
          className="inline-flex items-center gap-2 border border-[#f3dfc4]/55 px-4 py-2 font-display text-[9px] uppercase tracking-[0.2em] text-[#fff4e3] transition hover:border-[#fff2de] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/55"
        >
          Discover {story.nextLocation}
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>

      <div
        className={clsx(
          'relative overflow-hidden',
          compact ? 'min-h-[68svh]' : 'min-h-[min(72vh,680px)]'
        )}
      >
        <div
          className="relative h-full overflow-x-auto overflow-y-hidden scroll-smooth [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          onWheel={(event) => {
            if (Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return;
            event.currentTarget.scrollLeft += event.deltaY;
          }}
        >
          <div
            className={clsx(
              'relative z-10 flex h-full items-center',
              compact
                ? 'min-w-[2100px] gap-8 px-5 py-8'
                : 'min-w-[3200px] gap-12 px-10 py-10 lg:px-14'
            )}
          >
            <div className={clsx('shrink-0', compact ? 'w-[240px]' : 'w-[320px]')}>
              <span
                aria-hidden
                className="pointer-events-none absolute -z-10 rounded-full bg-[radial-gradient(circle,rgba(255,241,218,0.28)_0%,rgba(255,241,218,0)_74%)] blur-xl"
              />
              <p
                className={clsx(
                  'font-menu normal-case tracking-[-0.01em] text-[#fff9ef] [text-shadow:0_0_22px_rgba(255,238,214,0.62),0_0_46px_rgba(255,238,214,0.32)]',
                  compact
                    ? 'text-[clamp(2.2rem,11vw,3.8rem)] leading-[0.88]'
                    : 'text-[clamp(3rem,5.8vw,5.4rem)] leading-[0.84]'
                )}
              >
                {story.leftTitle.map((line, index) => (
                  <span key={`${story.id}-title-${index}`} className="block">
                    {line}
                  </span>
                ))}
              </p>
            </div>

            <div
              className={clsx(
                'relative aspect-[4/1] shrink-0 overflow-hidden bg-black/10',
                compact ? 'h-[52svh] min-h-[360px]' : 'h-[min(60vh,560px)]'
              )}
              style={{
                WebkitMaskImage:
                  'linear-gradient(to right, transparent 0%, black 12%, black 88%, transparent 100%)',
                maskImage:
                  'linear-gradient(to right, transparent 0%, black 12%, black 88%, transparent 100%)',
              }}
            >
              <Image
                src={story.image}
                alt={story.nextLocation}
                fill
                className="object-contain"
                sizes="(min-width: 1024px) 2240px, 1440px"
                quality={100}
              />
              <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(0,0,0,0.24)_0%,rgba(0,0,0,0.06)_16%,rgba(0,0,0,0.06)_84%,rgba(0,0,0,0.24)_100%)]" />
            </div>

            <article
              className={clsx(
                'relative shrink-0 text-left text-[#fffef8]',
                compact ? 'w-[320px]' : 'w-[360px]'
              )}
            >
              <span
                aria-hidden
                className="pointer-events-none absolute -inset-x-4 -inset-y-3 -z-10 rounded-[32px] bg-[radial-gradient(circle,rgba(255,240,216,0.24)_0%,rgba(255,240,216,0)_76%)] blur-xl"
              />
              <p className="font-sans text-[13px] italic leading-[1.86] text-[#fffef8] [text-shadow:0_0_16px_rgba(255,237,210,0.48),0_1px_12px_rgba(59,36,18,0.45)] sm:text-[14px]">
                {story.narrative}
              </p>
            </article>
          </div>
        </div>
      </div>
    </div>
  );
}
