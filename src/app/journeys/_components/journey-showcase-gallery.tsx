'use client';

import clsx from 'clsx';
import useEmblaCarousel from 'embla-carousel-react';
import { AnimatePresence, motion } from 'framer-motion';
import Image from 'next/image';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { useBodyScrollLock } from '@/app/concept/_hooks/use-body-scroll-lock';
import { usePrefersReducedMotion } from '@/app/concept/_hooks/use-prefers-reduced-motion';
import { BeeButton } from '@/components/primitives/bee-button';
import { journeys as staticJourneys } from '@/data/journeys-carousel';
import { getSustainableImpactPdf } from '@/data/sustainable-impact';
import type { Journey, JourneySeason } from '@/types/journey';

type SeasonFilterValue = 'all' | 'summer' | 'winter';

type SeasonOption = {
  label: string;
  value: SeasonFilterValue;
  icon: string;
  season?: JourneySeason;
};

type RenderedJourneySlide = {
  journey: Journey;
  sourceIndex: number;
  renderKey: string;
};

const SEASON_OPTIONS: SeasonOption[] = [
  {
    label: 'All Journeys',
    value: 'all',
    icon: '/assets/icones/Ico Gold BEE-02.svg',
  },
  {
    label: 'Spring Summer',
    value: 'summer',
    season: 'spring-summer',
    icon: '/assets/icones/icono/saisons/flowers.svg',
  },
  {
    label: 'Fall Winter',
    value: 'winter',
    season: 'fall-winter',
    icon: '/assets/icones/icono/saisons/winter.svg',
  },
];

const SEASON_MENU_OPTIONS = SEASON_OPTIONS.filter(
  (option): option is SeasonOption & { value: 'summer' | 'winter' } => option.value !== 'all'
);

const MONTH_INDEX: Record<string, number> = {
  january: 1,
  february: 2,
  march: 3,
  april: 4,
  may: 5,
  june: 6,
  july: 7,
  august: 8,
  september: 9,
  october: 10,
  november: 11,
  december: 12,
};

const JOURNEY_SEASON_ICONS: Record<JourneySeason, { icon: string; label: string }> = {
  'spring-summer': {
    icon: '/assets/icones/icono/saisons/flowers.svg',
    label: 'Spring Summer',
  },
  'fall-winter': {
    icon: '/assets/icones/icono/saisons/winter.svg',
    label: 'Fall Winter',
  },
};

const JOURNEY_TRANSITION_FADE_MS = 980;
const VIDEO_CONTINUITY_STORAGE_KEY = 'journey-background-video-state';
const INDIA_BACKGROUND_VIDEO =
  '/assets/journeys/india-january-2026/anime_cette_image__Kling_30__17267.mp4';

function parseSeasonFilter(value: string | null): SeasonFilterValue {
  if (value === 'summer') return 'summer';
  if (value === 'winter') return 'winter';
  return 'all';
}

function getForwardOffset(index: number, activeIndex: number, total: number) {
  if (total <= 0) return 0;
  return (index - activeIndex + total) % total;
}

function getDesktopSlideBasisClass(forwardOffset: number) {
  if (forwardOffset === 0) {
    return 'md:flex-[0_0_calc((100%-(var(--journey-gap)*3))*0.4)]';
  }
  if (forwardOffset === 1) {
    return 'md:flex-[0_0_calc((100%-(var(--journey-gap)*3))*0.27)]';
  }
  if (forwardOffset === 2) {
    return 'md:flex-[0_0_calc((100%-(var(--journey-gap)*3))*0.23)]';
  }
  return 'md:flex-[0_0_calc((100%-(var(--journey-gap)*3))*0.18)]';
}

function getCardFadeProfile(
  forwardOffset: number,
  isMobileViewport: boolean,
  useLiteEffects: boolean
) {
  if (isMobileViewport) {
    return {
      opacity: forwardOffset === 0 ? 1 : 0.86,
      y: 0,
      scale: forwardOffset === 0 ? 1 : 0.92,
      imageScale: forwardOffset === 0 ? 1.02 : 1.05,
      imageFilter:
        forwardOffset === 0 ? 'saturate(1) brightness(1)' : 'saturate(0.9) brightness(0.9)',
      overlayOpacity: forwardOffset === 0 ? 0.14 : 0.26,
      hoverBoost: 0.018,
    };
  }

  if (forwardOffset === 0) {
    return {
      opacity: 1,
      y: 0,
      scale: 1,
      imageScale: 1.015,
      imageFilter: 'saturate(1) brightness(1)',
      overlayOpacity: 0.12,
      hoverBoost: useLiteEffects ? 0.008 : 0.012,
    };
  }

  if (forwardOffset === 1) {
    return {
      opacity: 0.88,
      y: 5,
      scale: 0.996,
      imageScale: 1.03,
      imageFilter: 'saturate(0.94) brightness(0.97)',
      overlayOpacity: 0.16,
      hoverBoost: useLiteEffects ? 0.006 : 0.01,
    };
  }

  if (forwardOffset === 2) {
    return {
      opacity: 0.74,
      y: 9,
      scale: 0.989,
      imageScale: 1.045,
      imageFilter: 'saturate(0.9) brightness(0.95)',
      overlayOpacity: 0.2,
      hoverBoost: useLiteEffects ? 0.004 : 0.008,
    };
  }

  return {
    opacity: 0.6,
    y: 12,
    scale: 0.984,
    imageScale: 1.055,
    imageFilter: 'saturate(0.86) brightness(0.91)',
    overlayOpacity: 0.24,
    hoverBoost: useLiteEffects ? 0.003 : 0.006,
  };
}

function getJourneyChronologyKey(dateValue: string) {
  const normalized = dateValue
    .toLowerCase()
    .replaceAll('â€“', '-')
    .replaceAll('–', '-')
    .replaceAll('—', '-');

  const yearMatches = Array.from(normalized.matchAll(/\b(20\d{2})\b/g)).map((match) =>
    Number(match[1])
  );
  const year = yearMatches.length > 0 ? Math.min(...yearMatches) : 9999;

  const monthMatches = Array.from(
    normalized.matchAll(
      /\b(january|february|march|april|may|june|july|august|september|october|november|december)\b/g
    )
  )
    .map((match) => MONTH_INDEX[match[1]])
    .filter((month): month is number => typeof month === 'number');
  const month = monthMatches.length > 0 ? Math.min(...monthMatches) : 1;

  return year * 100 + month;
}

function getJourneyMediaForSeason(journey: Journey, season: SeasonFilterValue) {
  const seasonKey =
    season === 'summer' ? 'spring-summer' : season === 'winter' ? 'fall-winter' : null;
  const seasonVisual = seasonKey ? journey.seasonVisuals?.[seasonKey] : undefined;

  return {
    image: seasonVisual?.image ?? journey.image,
    backgroundVideo: seasonVisual?.backgroundVideo ?? journey.backgroundVideo,
    variantKey: `${journey.id}-${seasonKey ?? 'all'}-${seasonVisual?.image ?? journey.image}-${seasonVisual?.backgroundVideo ?? journey.backgroundVideo ?? 'none'}`,
  };
}

function filterJourneys(data: Journey[], season: SeasonFilterValue) {
  const filtered = data.filter((journey) => {
    const seasonTags = journey.seasonTags ?? [journey.season];
    if (season === 'summer') return seasonTags.includes('spring-summer');
    if (season === 'winter') return seasonTags.includes('fall-winter');
    return true;
  });

  return filtered.sort((a, b) => {
    const chronologyDiff = getJourneyChronologyKey(a.date) - getJourneyChronologyKey(b.date);
    if (chronologyDiff !== 0) {
      return chronologyDiff;
    }
    return a.title.localeCompare(b.title);
  });
}

function buildRenderedJourneySlides(data: Journey[]): RenderedJourneySlide[] {
  if (!data.length) return [];

  // Build several cycles so we can keep re-centering the viewport and
  // preserve an effectively infinite loop for every filter state.
  const repeatCycles = Math.max(7, Math.ceil(18 / data.length));
  const targetCount = data.length * repeatCycles;

  return Array.from({ length: targetCount }, (_, index) => {
    const sourceIndex = index % data.length;
    const journey = data[sourceIndex];

    return {
      journey,
      sourceIndex,
      renderKey: `${journey.id}-${index}`,
    };
  });
}

function extractCountry(location: string) {
  const parts = location.split(',');
  return parts[parts.length - 1]?.trim() || location;
}

/**
 * T-023 — Découpe la date du voyage en deux lignes « From … » / « To … ».
 * Si la date contient « to », on sépare départ/retour ; sinon on affiche
 * uniquement « From <date> ».
 */
function parseJourneyDateRange(dateValue: string): { from: string; to: string | null } {
  const normalized = dateValue
    .replaceAll('â€“', '-')
    .replaceAll('–', '-')
    .replaceAll('—', '-')
    .replace(/^\s*from\s+/i, '')
    .trim();

  const parts = normalized.split(/\s+to\s+/i);
  if (parts.length >= 2) {
    return {
      from: parts[0].trim(),
      to: parts.slice(1).join(' to ').trim(),
    };
  }

  return { from: normalized, to: null };
}

type JourneyShowcaseGalleryProps = {
  /** T-050 — voyages servis par le CMS (fallback : contenu statique). */
  journeys?: Journey[];
};

export function JourneyShowcaseGallery({
  journeys = staticJourneys,
}: JourneyShowcaseGalleryProps = {}) {
  useBodyScrollLock();

  const prefersReducedMotion = usePrefersReducedMotion();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [season, setSeason] = useState<SeasonFilterValue>(() =>
    parseSeasonFilter(searchParams?.get('season') ?? null)
  );
  const [isMobileViewport, setIsMobileViewport] = useState(false);
  const [useLiteEffects, setUseLiteEffects] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

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

  useEffect(() => {
    const nextSeason = parseSeasonFilter(searchParams?.get('season') ?? null);
    setSeason((previous) => {
      if (previous === nextSeason) {
        return previous;
      }
      setIsSeasonSwitching(true);
      return nextSeason;
    });
  }, [searchParams]);

  const applySeason = useCallback(
    (nextSeason: SeasonFilterValue) => {
      setIsSeasonSwitching(true);
      setSeason(nextSeason);

      const params = new URLSearchParams(searchParams.toString());
      if (nextSeason === 'all') {
        params.delete('season');
      } else {
        params.set('season', nextSeason);
      }

      const query = params.toString();
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    },
    [pathname, router, searchParams]
  );

  const filteredJourneys = useMemo(() => filterJourneys(journeys, season), [journeys, season]);
  const renderedJourneys = useMemo(
    () => buildRenderedJourneySlides(filteredJourneys),
    [filteredJourneys]
  );
  const renderedIdsSignature = useMemo(
    () => renderedJourneys.map((journey) => journey.renderKey).join('|'),
    [renderedJourneys]
  );

  const uniqueJourneyCount = filteredJourneys.length;
  const centeredStartIndex = useMemo(() => {
    if (!uniqueJourneyCount || !renderedJourneys.length) {
      return 0;
    }

    const cycleCount = Math.max(1, Math.floor(renderedJourneys.length / uniqueJourneyCount));
    const centeredCycle = Math.max(0, Math.floor(cycleCount / 2));
    return centeredCycle * uniqueJourneyCount;
  }, [renderedJourneys.length, uniqueJourneyCount]);

  const emblaOptions = useMemo(
    () => ({
      align: 'center' as const,
      loop: false,
      containScroll: false as const,
      duration: 30,
      skipSnaps: false,
      dragFree: false,
      breakpoints: {
        '(min-width: 768px)': {
          align: 'start' as const,
        },
      },
    }),
    [renderedJourneys.length]
  );

  const [emblaRef, emblaApi] = useEmblaCarousel(emblaOptions);

  const rootRef = useRef<HTMLDivElement | null>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [backgroundDirection, setBackgroundDirection] = useState<1 | -1>(1);
  const [isJourneyTransitioning, setIsJourneyTransitioning] = useState(false);
  const [isSeasonSwitching, setIsSeasonSwitching] = useState(false);
  const backgroundVideoRef = useRef<HTMLVideoElement | null>(null);
  const previousSelectedIndexRef = useRef(0);
  const isRecenteringRef = useRef(false);
  const pendingDirectionRef = useRef<1 | -1>(1);
  const journeyTransitionTimeoutRef = useRef<number | null>(null);

  const safeLength = renderedJourneys.length;
  const displayIndex = safeLength ? Math.min(selectedIndex, safeLength - 1) : 0;
  const activeRenderedJourney = safeLength ? renderedJourneys[displayIndex] : null;
  const currentJourney = activeRenderedJourney?.journey ?? null;
  const currentJourneyMedia = currentJourney
    ? getJourneyMediaForSeason(currentJourney, season)
    : null;
  // T-036 — PDF « Sustainable Impact » du voyage actif (null → bouton masqué).
  const sustainableImpactPdf = currentJourney ? getSustainableImpactPdf(currentJourney.slug) : null;

  useEffect(() => {
    if (!isSeasonSwitching) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setIsSeasonSwitching(false);
    }, 320);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [isSeasonSwitching, renderedIdsSignature]);

  useEffect(() => {
    return () => {
      if (journeyTransitionTimeoutRef.current !== null) {
        window.clearTimeout(journeyTransitionTimeoutRef.current);
      }
    };
  }, []);

  const navigateToJourney = useCallback(
    (journey: Journey) => {
      if (isJourneyTransitioning) {
        return;
      }

      const destination = `/journeys/${journey.slug}`;
      setIsJourneyTransitioning(true);
      const journeyMedia =
        currentJourney?.id === journey.id && currentJourneyMedia
          ? currentJourneyMedia
          : getJourneyMediaForSeason(journey, season);

      if (typeof window !== 'undefined') {
        try {
          window.sessionStorage.setItem('journey-transition-target', journey.slug);
          const activeMediaSrc = journeyMedia.backgroundVideo ?? journeyMedia.image;
          if (journeyMedia.backgroundVideo && backgroundVideoRef.current) {
            window.sessionStorage.setItem(
              VIDEO_CONTINUITY_STORAGE_KEY,
              JSON.stringify({
                slug: journey.slug,
                src: activeMediaSrc,
                season:
                  season === 'summer'
                    ? 'spring-summer'
                    : season === 'winter'
                      ? 'fall-winter'
                      : undefined,
                currentTime: backgroundVideoRef.current.currentTime ?? 0,
                capturedAt: Date.now(),
              })
            );
          } else if (activeMediaSrc) {
            window.sessionStorage.setItem(
              VIDEO_CONTINUITY_STORAGE_KEY,
              JSON.stringify({
                slug: journey.slug,
                src: activeMediaSrc,
                season:
                  season === 'summer'
                    ? 'spring-summer'
                    : season === 'winter'
                      ? 'fall-winter'
                      : undefined,
                capturedAt: Date.now(),
              })
            );
          }
        } catch {
          // Ignore storage failures and continue with navigation.
        }
      }

      if (prefersReducedMotion) {
        router.push(destination);
        return;
      }

      if (journeyTransitionTimeoutRef.current !== null) {
        window.clearTimeout(journeyTransitionTimeoutRef.current);
      }

      journeyTransitionTimeoutRef.current = window.setTimeout(() => {
        router.push(destination);
      }, JOURNEY_TRANSITION_FADE_MS);
    },
    [
      currentJourney?.id,
      currentJourneyMedia,
      isJourneyTransitioning,
      prefersReducedMotion,
      router,
      season,
    ]
  );

  useEffect(() => {
    if (!emblaApi) {
      return;
    }

    const onSelect = () => {
      const nextIndex = emblaApi.selectedScrollSnap();
      const previousIndex = previousSelectedIndexRef.current;

      if (isRecenteringRef.current) {
        isRecenteringRef.current = false;
        previousSelectedIndexRef.current = nextIndex;
        setSelectedIndex(nextIndex);
        setBackgroundDirection(pendingDirectionRef.current);
        return;
      }

      const rawDirection =
        nextIndex === previousIndex
          ? pendingDirectionRef.current
          : nextIndex > previousIndex
            ? 1
            : -1;

      if (
        uniqueJourneyCount > 1 &&
        renderedJourneys.length > uniqueJourneyCount * 2 &&
        (nextIndex < uniqueJourneyCount ||
          nextIndex >= renderedJourneys.length - uniqueJourneyCount)
      ) {
        const sourceIndex = renderedJourneys[nextIndex]?.sourceIndex ?? 0;
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
    };

    emblaApi.on('select', onSelect);
    emblaApi.on('reInit', onSelect);
    onSelect();

    return () => {
      emblaApi.off('select', onSelect);
      emblaApi.off('reInit', onSelect);
    };
  }, [centeredStartIndex, emblaApi, renderedJourneys, uniqueJourneyCount]);

  useEffect(() => {
    if (!emblaApi) {
      return;
    }

    emblaApi.reInit({
      ...emblaOptions,
      startIndex: centeredStartIndex,
    });

    isRecenteringRef.current = false;
    pendingDirectionRef.current = 1;
    emblaApi.scrollTo(centeredStartIndex, true);
    previousSelectedIndexRef.current = centeredStartIndex;
    setSelectedIndex(centeredStartIndex);
    setBackgroundDirection(1);
  }, [
    centeredStartIndex,
    emblaApi,
    emblaOptions,
    renderedIdsSignature,
    renderedJourneys.length,
    uniqueJourneyCount,
  ]);

  useEffect(() => {
    const node = rootRef.current;
    if (!node || !emblaApi) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (!renderedJourneys.length || event.key !== 'Enter') {
        return;
      }

      event.preventDefault();
      const current = renderedJourneys[emblaApi.selectedScrollSnap()]?.journey;
      if (current) {
        navigateToJourney(current);
      }
    };

    node.addEventListener('keydown', handleKeyDown);
    return () => {
      node.removeEventListener('keydown', handleKeyDown);
    };
  }, [emblaApi, navigateToJourney, renderedJourneys]);

  useEffect(() => {
    if (!emblaApi) {
      return;
    }

    const handleWindowKeyDown = (event: KeyboardEvent) => {
      if (safeLength < 2) {
        return;
      }

      if (event.key === 'ArrowRight') {
        event.preventDefault();
        if (emblaApi.canScrollNext()) {
          emblaApi.scrollNext();
        }
      } else if (event.key === 'ArrowLeft') {
        event.preventDefault();
        if (emblaApi.canScrollPrev()) {
          emblaApi.scrollPrev();
        }
      }
    };

    window.addEventListener('keydown', handleWindowKeyDown);
    return () => {
      window.removeEventListener('keydown', handleWindowKeyDown);
    };
  }, [emblaApi, safeLength]);

  // T-025 / T-027 — sélection directe du filtre saison. Cliquer le filtre
  // déjà actif le désactive et revient à « All Journeys » (toggle).
  const handleSeasonMenuSelect = useCallback(
    (nextSeason: 'summer' | 'winter') => {
      applySeason(season === nextSeason ? 'all' : nextSeason);
    },
    [applySeason, season]
  );

  const handleJourneySeasonSelect = useCallback(
    (nextJourneySeason: JourneySeason) => {
      const nextSeason = nextJourneySeason === 'spring-summer' ? 'summer' : 'winter';
      if (nextSeason === season) {
        return;
      }
      applySeason(nextSeason);
    },
    [applySeason, season]
  );

  const handleCardAction = useCallback(
    (journey: Journey, index: number) => {
      if (!emblaApi) {
        navigateToJourney(journey);
        return;
      }

      const activeIndex = emblaApi.selectedScrollSnap();
      if (index !== activeIndex) {
        emblaApi.scrollTo(index);
        return;
      }

      navigateToJourney(journey);
    },
    [emblaApi, navigateToJourney]
  );

  const scrollPrev = useCallback(() => {
    if (!emblaApi || safeLength < 2) {
      return;
    }
    if (emblaApi.canScrollPrev()) {
      emblaApi.scrollPrev();
    }
  }, [emblaApi, safeLength]);

  const scrollNext = useCallback(() => {
    if (!emblaApi || safeLength < 2) {
      return;
    }
    if (emblaApi.canScrollNext()) {
      emblaApi.scrollNext();
    }
  }, [emblaApi, safeLength]);

  useEffect(() => {
    const node = rootRef.current;
    if (!node || !emblaApi) {
      return;
    }

    let wheelAccumulator = 0;

    const handleWheel = (event: WheelEvent) => {
      if (safeLength < 2) {
        return;
      }

      const primaryDelta =
        Math.abs(event.deltaY) > Math.abs(event.deltaX) ? event.deltaY : event.deltaX;
      if (!primaryDelta) {
        return;
      }

      event.preventDefault();
      wheelAccumulator += primaryDelta;

      if (Math.abs(wheelAccumulator) < 30) {
        return;
      }

      if (wheelAccumulator > 0) {
        scrollNext();
      } else {
        scrollPrev();
      }

      wheelAccumulator = 0;
    };

    node.addEventListener('wheel', handleWheel, { passive: false });
    return () => {
      node.removeEventListener('wheel', handleWheel);
    };
  }, [emblaApi, safeLength, scrollNext, scrollPrev]);

  return (
    <section
      ref={rootRef}
      className="relative flex min-h-[100svh] flex-col overflow-hidden border-b border-[#f4bb52]/70 bg-black text-white"
      tabIndex={0}
      aria-label="Journey carousel"
    >
      <BackgroundImage
        activeJourney={currentJourney}
        activeJourneyKey={
          currentJourneyMedia?.variantKey ?? currentJourney?.id ?? 'journey-background'
        }
        activeJourneyImage={currentJourneyMedia?.image ?? currentJourney?.image ?? null}
        activeJourneyVideo={currentJourneyMedia?.backgroundVideo ?? currentJourney?.backgroundVideo}
        prefersReducedMotion={prefersReducedMotion}
        direction={backgroundDirection}
        season={season}
        useLiteEffects={useLiteEffects}
        videoRef={backgroundVideoRef}
      />

      <div
        className={clsx(
          'ease-[cubic-bezier(0.22,1,0.36,1)] relative z-20 flex min-h-[100svh] flex-col transition-opacity',
          prefersReducedMotion ? 'duration-150' : 'duration-[980ms]',
          isJourneyTransitioning ? 'pointer-events-none opacity-0' : 'opacity-100'
        )}
      >
        <div className="relative flex flex-1 items-center justify-end">
          <div className="w-full px-2 pb-2 pt-20 sm:px-6 sm:pb-4 sm:pt-24 md:ml-auto md:w-[75%] md:pb-0 md:pl-10 md:pr-6 md:pt-0 lg:py-10 lg:pl-16 lg:pr-10 xl:pl-20">
            {safeLength ? (
              <div
                className="overflow-visible pb-8 sm:pb-10 md:overflow-hidden md:pb-0"
                ref={emblaRef}
              >
                <motion.div
                  key={renderedIdsSignature}
                  className="embla__container flex touch-pan-x items-center gap-3 sm:gap-4 md:ml-0 md:gap-[var(--journey-gap)] md:[--journey-gap:clamp(14px,1.7vw,28px)]"
                  initial={prefersReducedMotion ? undefined : { opacity: 0 }}
                  animate={prefersReducedMotion ? undefined : { opacity: 1 }}
                  transition={{ duration: 1.08, ease: [0.22, 1, 0.36, 1] }}
                >
                  {renderedJourneys.map((slide, index) => {
                    const forwardOffset = getForwardOffset(
                      index,
                      displayIndex,
                      renderedJourneys.length
                    );

                    return (
                      <motion.div
                        key={slide.renderKey}
                        layout={!isSeasonSwitching}
                        className={clsx(
                          'embla__slide flex flex-[0_0_68%] items-center sm:flex-[0_0_58%]',
                          getDesktopSlideBasisClass(forwardOffset)
                        )}
                        initial={prefersReducedMotion ? false : { opacity: 0 }}
                        animate={prefersReducedMotion ? undefined : { opacity: 1 }}
                        transition={{
                          duration: 0.92,
                          ease: [0.22, 1, 0.36, 1],
                          delay: Math.min(index * 0.07, 0.42),
                          layout: isSeasonSwitching
                            ? undefined
                            : {
                                duration: useLiteEffects ? 0.46 : 0.7,
                                ease: [0.22, 1, 0.36, 1],
                              },
                        }}
                      >
                        <JourneyCard
                          journey={slide.journey}
                          season={season}
                          isActive={activeRenderedJourney?.renderKey === slide.renderKey}
                          forwardOffset={forwardOffset}
                          onAction={() => handleCardAction(slide.journey, index)}
                          onSeasonSelect={handleJourneySeasonSelect}
                          prefersReducedMotion={prefersReducedMotion}
                          isMobileViewport={isMobileViewport}
                          useLiteEffects={useLiteEffects}
                          disableLayoutAnimation={isSeasonSwitching}
                        />
                      </motion.div>
                    );
                  })}
                </motion.div>
              </div>
            ) : (
              <div className="flex min-h-[46vh] items-center justify-center border border-white/20 bg-black/20 text-[0.7rem] uppercase tracking-[0.3em] text-white/70">
                No journeys for this season.
              </div>
            )}

            <div className="pointer-events-none relative z-40 mt-8 flex flex-col items-center gap-3 pb-5 md:hidden">
              <JourneyHeadline currentJourney={currentJourney} compact centered />
              <div className="pointer-events-auto flex flex-col items-center gap-3">
                {sustainableImpactPdf ? (
                  <BeeButton
                    href={sustainableImpactPdf}
                    download
                    size="sm"
                    align="center"
                    className="opacity-80"
                  >
                    Sustainable Impacts
                  </BeeButton>
                ) : null}
                <div className="flex items-center justify-center gap-6">
                  {SEASON_MENU_OPTIONS.map((option) => (
                    <BeeButton
                      key={option.value}
                      size="md"
                      align="center"
                      active={season === option.value}
                      onClick={() => handleSeasonMenuSelect(option.value)}
                    >
                      {option.label}
                    </BeeButton>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="pointer-events-none absolute left-6 top-1/2 z-40 hidden -translate-y-1/2 md:block lg:left-10 xl:left-14">
          <JourneyHeadline currentJourney={currentJourney} sideAligned />
        </div>

        {sustainableImpactPdf ? (
          <div className="pointer-events-none absolute bottom-6 left-8 z-30 hidden md:block">
            <div className="pointer-events-auto">
              <BeeButton href={sustainableImpactPdf} download size="md" align="left">
                Sustainable Impacts
              </BeeButton>
            </div>
          </div>
        ) : null}

        <div className="pointer-events-none absolute inset-x-0 bottom-6 z-30 hidden justify-center md:flex">
          <div className="pointer-events-auto flex items-center justify-center gap-10">
            {SEASON_MENU_OPTIONS.map((option) => (
              <BeeButton
                key={option.value}
                size="md"
                align="center"
                active={season === option.value}
                onClick={() => handleSeasonMenuSelect(option.value)}
              >
                {option.label}
              </BeeButton>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

type JourneyHeadlineProps = {
  currentJourney: Journey | null;
  compact?: boolean;
  centered?: boolean;
  sideAligned?: boolean;
};

function JourneyHeadline({
  currentJourney,
  compact = false,
  centered = false,
  sideAligned = false,
}: JourneyHeadlineProps) {
  const country = currentJourney ? extractCountry(currentJourney.location) : '';
  const dateRange = currentJourney ? parseJourneyDateRange(currentJourney.date) : null;

  return (
    <AnimatePresence mode="wait">
      {currentJourney ? (
        <motion.div
          key={currentJourney.id}
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
          <h2
            className={clsx(
              'font-title uppercase tracking-normal text-white [text-shadow:0_4px_0_rgba(0,0,0,0.36),0_12px_20px_rgba(0,0,0,0.28),0_24px_52px_rgba(0,0,0,0.38),0_40px_88px_rgba(0,0,0,0.3)]',
              compact
                ? 'text-[clamp(1.9rem,9vw,3.4rem)] leading-[0.82]'
                : sideAligned
                  ? 'text-[clamp(2.6rem,5.5vw,5.6rem)] leading-[0.82]'
                  : 'text-[clamp(2.8rem,8vw,7.6rem)] leading-[0.8]'
            )}
          >
            {country}
          </h2>
          {dateRange ? (
            <div
              className={clsx(
                'mt-3 flex flex-col uppercase tracking-[0.38em] text-white [text-shadow:0_2px_0_rgba(0,0,0,0.3),0_8px_14px_rgba(0,0,0,0.24),0_16px_34px_rgba(0,0,0,0.24)]',
                compact ? 'gap-1.5 text-[0.54rem]' : 'gap-1 text-[0.68rem] sm:text-[0.78rem]',
                centered ? 'items-center' : 'items-start'
              )}
            >
              <span>From {dateRange.from}</span>
              {dateRange.to ? <span>To {dateRange.to}</span> : null}
            </div>
          ) : null}
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

type JourneyCardProps = {
  journey: Journey;
  season: SeasonFilterValue;
  isActive: boolean;
  forwardOffset: number;
  prefersReducedMotion: boolean;
  isMobileViewport: boolean;
  useLiteEffects: boolean;
  disableLayoutAnimation?: boolean;
  onSeasonSelect?: (season: JourneySeason) => void;
  onAction: () => void;
};

type SeasonIconScale = 'hero' | 'lead' | 'trail';

function getSeasonIconSizing(compact: boolean, scale: SeasonIconScale) {
  // T-026 — tailles réduites d'environ 15 % par rapport à la version précédente.
  if (compact) {
    if (scale === 'hero') {
      return {
        gapClass: 'gap-[clamp(0.45rem,1.8vw,0.7rem)]',
        itemClass: 'h-[clamp(1.23rem,5.9vw,1.7rem)] w-[clamp(1.23rem,5.9vw,1.7rem)]',
      };
    }
    if (scale === 'lead') {
      return {
        gapClass: 'gap-[clamp(0.4rem,1.55vw,0.62rem)]',
        itemClass: 'h-[clamp(1.09rem,5.1vw,1.51rem)] w-[clamp(1.09rem,5.1vw,1.51rem)]',
      };
    }
    return {
      gapClass: 'gap-[clamp(0.34rem,1.35vw,0.54rem)]',
      itemClass: 'h-[clamp(0.94rem,4.4vw,1.29rem)] w-[clamp(0.94rem,4.4vw,1.29rem)]',
    };
  }

  if (scale === 'hero') {
    return {
      gapClass: 'gap-[clamp(0.5rem,0.85vw,0.82rem)]',
      itemClass: 'h-[clamp(1.57rem,2.34vw,2.38rem)] w-[clamp(1.57rem,2.34vw,2.38rem)]',
    };
  }
  if (scale === 'lead') {
    return {
      gapClass: 'gap-[clamp(0.42rem,0.7vw,0.68rem)]',
      itemClass: 'h-[clamp(1.34rem,1.87vw,1.94rem)] w-[clamp(1.34rem,1.87vw,1.94rem)]',
    };
  }
  return {
    gapClass: 'gap-[clamp(0.34rem,0.58vw,0.54rem)]',
    itemClass: 'h-[clamp(1.12rem,1.45vw,1.6rem)] w-[clamp(1.12rem,1.45vw,1.6rem)]',
  };
}

function JourneyCard({
  journey,
  season,
  isActive,
  forwardOffset,
  prefersReducedMotion,
  isMobileViewport,
  useLiteEffects,
  disableLayoutAnimation = false,
  onSeasonSelect,
  onAction,
}: JourneyCardProps) {
  const fadeProfile = getCardFadeProfile(forwardOffset, isMobileViewport, useLiteEffects);
  const seasonTags =
    journey.seasonTags && journey.seasonTags.length > 0 ? journey.seasonTags : [journey.season];
  const displayMedia = getJourneyMediaForSeason(journey, season);
  const seasonIconScale: SeasonIconScale =
    forwardOffset === 0 ? 'hero' : forwardOffset === 1 ? 'lead' : 'trail';

  return (
    <motion.button
      type="button"
      onClick={onAction}
      layout={!disableLayoutAnimation}
      className={clsx(
        'group relative w-full overflow-visible focus:outline-none focus-visible:ring-2 focus-visible:ring-[#f5d49b] focus-visible:ring-offset-0',
        prefersReducedMotion
          ? 'transition-none'
          : 'ease-[cubic-bezier(0.22,1,0.36,1)] transition-transform duration-700'
      )}
      animate={
        prefersReducedMotion
          ? undefined
          : {
              opacity: fadeProfile.opacity,
              scale: fadeProfile.scale,
              y: fadeProfile.y,
            }
      }
      whileHover={
        prefersReducedMotion || useLiteEffects
          ? undefined
          : {
              opacity: Math.min(fadeProfile.opacity + 0.08, 1),
              scale: fadeProfile.scale + fadeProfile.hoverBoost,
              y: Math.max(fadeProfile.y - 4, -4),
            }
      }
      transition={
        prefersReducedMotion
          ? undefined
          : {
              duration: useLiteEffects ? 0.42 : 0.7,
              ease: [0.22, 1, 0.36, 1],
              layout: disableLayoutAnimation
                ? undefined
                : { duration: useLiteEffects ? 0.46 : 0.7, ease: [0.22, 1, 0.36, 1] },
            }
      }
      aria-label={`Journey: ${journey.title}, ${journey.date}`}
      style={{ transformOrigin: isMobileViewport ? 'center center' : 'left center' }}
    >
      <div
        className={clsx(
          'relative aspect-[3/4] w-full overflow-hidden',
          useLiteEffects
            ? 'shadow-[0_18px_42px_-24px_rgba(0,0,0,0.72)]'
            : 'shadow-[0_30px_75px_-24px_rgba(0,0,0,0.78)]'
        )}
      >
        <motion.div
          className="absolute inset-0"
          animate={
            prefersReducedMotion
              ? undefined
              : {
                  scale: fadeProfile.imageScale,
                  filter: fadeProfile.imageFilter,
                }
          }
          whileHover={
            prefersReducedMotion || useLiteEffects
              ? undefined
              : {
                  scale: fadeProfile.imageScale + 0.025,
                  filter: 'saturate(1.02) brightness(1.01)',
                }
          }
          transition={
            prefersReducedMotion
              ? undefined
              : { duration: useLiteEffects ? 0.45 : 0.8, ease: [0.22, 1, 0.36, 1] }
          }
        >
          <AnimatePresence initial={false} mode="wait">
            <motion.div
              key={displayMedia.variantKey}
              className="absolute inset-0"
              initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, rotateY: -90 }}
              animate={{ opacity: 1, rotateY: 0 }}
              exit={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, rotateY: 90 }}
              transition={{ duration: prefersReducedMotion ? 0.2 : 0.52, ease: [0.22, 1, 0.36, 1] }}
              style={{ transformStyle: 'preserve-3d' }}
            >
              <Image
                src={displayMedia.image}
                alt={journey.title}
                fill
                sizes="(min-width: 1536px) 27vw, (min-width: 1280px) 32vw, (min-width: 1024px) 34vw, (min-width: 640px) 52vw, 78vw"
                className="object-cover"
                priority={isActive}
              />
            </motion.div>
          </AnimatePresence>
        </motion.div>
        <motion.div
          className="from-black/58 absolute inset-0 bg-gradient-to-t via-transparent to-black/10"
          animate={prefersReducedMotion ? undefined : { opacity: fadeProfile.overlayOpacity }}
          transition={
            prefersReducedMotion
              ? undefined
              : { duration: useLiteEffects ? 0.38 : 0.62, ease: [0.22, 1, 0.36, 1] }
          }
        />
        {forwardOffset === 0 ? (
          <div className="absolute inset-x-0 bottom-4 flex justify-center">
            <SeasonIconRow
              seasons={seasonTags}
              compact={isMobileViewport}
              scale={seasonIconScale}
              activeFilter={season}
              onSelect={onSeasonSelect}
            />
          </div>
        ) : null}
      </div>
    </motion.button>
  );
}

function SeasonIconRow({
  seasons,
  compact = false,
  scale = 'hero',
  activeFilter,
  onSelect,
}: {
  seasons: JourneySeason[];
  compact?: boolean;
  scale?: SeasonIconScale;
  activeFilter?: SeasonFilterValue;
  onSelect?: (season: JourneySeason) => void;
}) {
  const sizing = getSeasonIconSizing(compact, scale);
  // T-026 — ombre portée plus profonde pour accentuer le relief des icônes.
  const seasonIconShadowClass =
    '[filter:drop-shadow(0_0.2em_0.05em_rgba(0,0,0,0.92))_drop-shadow(0_0.1em_0.24em_rgba(0,0,0,0.6))_drop-shadow(0_0.32em_0.5em_rgba(0,0,0,0.38))]';

  return (
    <div className={clsx('flex items-center justify-center', sizing.gapClass)}>
      {seasons.map((season) => {
        const iconSet = JOURNEY_SEASON_ICONS[season];
        const isSelected =
          activeFilter === 'all'
            ? false
            : activeFilter === 'summer'
              ? season === 'spring-summer'
              : season === 'fall-winter';
        return (
          <span
            key={season}
            className={clsx('group/season relative shrink-0', sizing.itemClass)}
            aria-label={iconSet.label}
            role={onSelect ? 'button' : undefined}
            tabIndex={onSelect ? 0 : undefined}
            onClick={
              onSelect
                ? (event) => {
                    event.stopPropagation();
                    onSelect(season);
                  }
                : undefined
            }
            onKeyDown={
              onSelect
                ? (event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault();
                      event.stopPropagation();
                      onSelect(season);
                    }
                  }
                : undefined
            }
          >
            <Image
              src={iconSet.icon}
              alt=""
              fill
              className={clsx(
                'object-contain transition-all duration-300 group-hover/season:-translate-y-0.5 group-hover/season:scale-105 group-hover/season:opacity-100',
                seasonIconShadowClass,
                isSelected ? 'scale-105 opacity-100' : 'opacity-85'
              )}
            />
          </span>
        );
      })}
    </div>
  );
}

type BackgroundImageProps = {
  activeJourney: Journey | null;
  activeJourneyKey: string;
  activeJourneyImage: string | null;
  activeJourneyVideo?: string;
  prefersReducedMotion: boolean;
  direction: 1 | -1;
  season: SeasonFilterValue;
  useLiteEffects: boolean;
  videoRef: { current: HTMLVideoElement | null };
};

function BackgroundImage({
  activeJourney,
  activeJourneyKey,
  activeJourneyImage,
  activeJourneyVideo,
  prefersReducedMotion,
  direction,
  season,
  useLiteEffects,
  videoRef,
}: BackgroundImageProps) {
  const backgroundDuration = prefersReducedMotion ? 0.2 : useLiteEffects ? 0.72 : 0.98;
  const seamPeakOpacity = useLiteEffects ? 0.34 : 0.5;
  const seamShift = direction > 0 ? 42 : -42;
  const isIndiaBackground = activeJourney?.slug === 'india-january-2026';

  const seasonOverlayClass = clsx(
    'absolute inset-[-18%] blur-[64px]',
    season === 'summer' &&
      'bg-[radial-gradient(60%_48%_at_18%_18%,rgba(176,206,244,0.3),rgba(176,206,244,0)_70%),radial-gradient(56%_46%_at_82%_84%,rgba(152,188,230,0.24),rgba(152,188,230,0)_72%)]',
    season === 'winter' &&
      'bg-[radial-gradient(60%_48%_at_18%_18%,rgba(152,198,255,0.3),rgba(152,198,255,0)_70%),radial-gradient(56%_46%_at_82%_84%,rgba(198,229,255,0.24),rgba(198,229,255,0)_72%)]',
    season === 'all' &&
      'bg-[radial-gradient(58%_46%_at_18%_20%,rgba(205,220,244,0.22),rgba(205,220,244,0)_70%),radial-gradient(56%_44%_at_82%_84%,rgba(222,234,250,0.18),rgba(222,234,250,0)_72%)]'
  );

  const seasonVeilClass = clsx(
    'absolute inset-[-10%] blur-[54px]',
    season === 'summer' &&
      'bg-[radial-gradient(50%_36%_at_50%_50%,rgba(190,214,242,0.18),rgba(190,214,242,0)_78%)]',
    season === 'winter' &&
      'bg-[radial-gradient(50%_36%_at_50%_50%,rgba(191,220,255,0.18),rgba(191,220,255,0)_78%)]',
    season === 'all' &&
      'bg-[radial-gradient(50%_36%_at_50%_50%,rgba(212,224,246,0.15),rgba(212,224,246,0)_78%)]'
  );

  return (
    <div className="pointer-events-none absolute inset-0" aria-hidden>
      {!prefersReducedMotion && !isIndiaBackground ? (
        <AnimatePresence initial={false} mode="wait">
          <motion.div
            key={`season-breath-${season}`}
            className={seasonOverlayClass}
            initial={{ opacity: 0 }}
            animate={
              useLiteEffects
                ? { opacity: [0.2, 0.34, 0.24, 0.3, 0.2] }
                : {
                    opacity: [0.22, 0.44, 0.28, 0.4, 0.22],
                    scale: [0.98, 1.05, 1, 1.04, 0.98],
                  }
            }
            exit={{ opacity: 0 }}
            transition={{
              opacity: {
                duration: useLiteEffects ? 0.45 : 0.7,
                ease: [0.22, 1, 0.36, 1],
                repeat: useLiteEffects ? Infinity : undefined,
              },
              scale: useLiteEffects
                ? undefined
                : { duration: 13.5, repeat: Infinity, ease: 'easeInOut' },
            }}
            style={{ willChange: 'transform, opacity' }}
          />
        </AnimatePresence>
      ) : (
        <div className={seasonOverlayClass} style={{ opacity: 0.32 }} />
      )}

      {!prefersReducedMotion && !isIndiaBackground ? (
        <motion.div
          className={seasonVeilClass}
          animate={
            useLiteEffects
              ? { opacity: [0.14, 0.24, 0.18, 0.22, 0.14] }
              : {
                  opacity: [0.16, 0.3, 0.2, 0.28, 0.16],
                  scale: [0.96, 1.04, 0.99, 1.02, 0.96],
                }
          }
          transition={{
            duration: useLiteEffects ? 8.2 : 10.8,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          style={{ willChange: 'transform, opacity' }}
        />
      ) : (
        <div className={seasonVeilClass} style={{ opacity: 0.2 }} />
      )}

      <div className="absolute inset-0">
        <AnimatePresence initial={false} mode="sync">
          {activeJourney && activeJourneyImage ? (
            <motion.div
              key={activeJourneyKey}
              className="absolute inset-0 overflow-hidden"
              initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={prefersReducedMotion ? { opacity: 1 } : { opacity: 0 }}
              transition={{ duration: backgroundDuration, ease: [0.22, 1, 0.36, 1] }}
            >
              <motion.div
                className={clsx('absolute', isIndiaBackground ? 'inset-0' : 'inset-[-10%]')}
                initial={
                  isIndiaBackground
                    ? { scale: 1, x: 0 }
                    : prefersReducedMotion
                      ? { scale: 1.01, x: 0 }
                      : { scale: 1.05, x: direction > 0 ? 18 : -18 }
                }
                animate={isIndiaBackground ? { scale: 1, x: 0 } : { scale: 1.01, x: 0 }}
                exit={
                  isIndiaBackground
                    ? { scale: 1, x: 0 }
                    : prefersReducedMotion
                      ? { scale: 1.01, x: 0 }
                      : { scale: 1.04, x: direction > 0 ? -12 : 12 }
                }
                transition={{ duration: backgroundDuration, ease: [0.22, 1, 0.36, 1] }}
                style={{ willChange: 'transform, opacity' }}
              >
                <Image
                  src={activeJourneyImage}
                  alt=""
                  fill
                  sizes="100vw"
                  className={clsx(
                    'object-cover',
                    isIndiaBackground && 'object-center',
                    activeJourneyVideo && 'opacity-0'
                  )}
                  priority
                />
                {activeJourneyVideo ? (
                  <video
                    ref={videoRef}
                    key={activeJourneyVideo}
                    src={activeJourneyVideo}
                    poster={activeJourneyImage}
                    className={clsx(
                      'absolute inset-0 h-full w-full object-cover',
                      isIndiaBackground && 'object-center'
                    )}
                    autoPlay
                    muted
                    loop
                    playsInline
                    preload="auto"
                  />
                ) : null}
              </motion.div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>

      <div className="absolute inset-0 overflow-hidden">
        <AnimatePresence initial={false} mode="sync">
          {activeJourney && !prefersReducedMotion && !isIndiaBackground ? (
            <motion.div
              key={`seam-${activeJourneyKey}`}
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

      {isIndiaBackground ? (
        <>
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_70%,rgba(222,166,112,0.36)_0%,rgba(222,166,112,0)_44%),radial-gradient(circle_at_86%_24%,rgba(255,232,181,0.14)_0%,rgba(255,232,181,0)_42%)]" />
          <div className="absolute inset-0 bg-[linear-gradient(110deg,rgba(41,22,9,0.58)_0%,rgba(99,62,33,0.44)_38%,rgba(56,34,21,0.5)_100%)]" />
        </>
      ) : (
        <div className="absolute inset-0 bg-[rgba(2,2,1,0.2)]" />
      )}
    </div>
  );
}
