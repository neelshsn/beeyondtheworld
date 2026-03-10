'use client';

import clsx from 'clsx';
import useEmblaCarousel from 'embla-carousel-react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import Image from 'next/image';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { useBodyScrollLock } from '@/app/concept/_hooks/use-body-scroll-lock';
import { usePrefersReducedMotion } from '@/app/concept/_hooks/use-prefers-reduced-motion';
import { journeys } from '@/data/journeys-carousel';
import type { Journey, JourneySeason } from '@/types/journey';

type SeasonFilterValue = 'all' | 'summer' | 'winter';

type SeasonOption = {
  label: string;
  value: SeasonFilterValue;
  icon: string;
  hoverIcon?: string;
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
    icon: '/assets/icones/Ico White BEE-02.svg',
    hoverIcon: '/assets/icones/Ico Gold BEE-02.svg',
  },
  {
    label: 'Spring Summer',
    value: 'summer',
    season: 'spring-summer',
    icon: '/assets/icones/Ico White BEE-14.svg',
    hoverIcon: '/assets/icones/Ico Gold BEE-14.svg',
  },
  {
    label: 'Fall Winter',
    value: 'winter',
    season: 'fall-winter',
    icon: '/assets/icones/Ico White BEE-01.svg',
    hoverIcon: '/assets/icones/Ico Gold BEE-01.svg',
  },
];

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

const JOURNEY_TRANSITION_FADE_MS = 980;

function parseSeasonFilter(value: string | null): SeasonFilterValue {
  if (value === 'summer') return 'summer';
  if (value === 'winter') return 'winter';
  return 'all';
}

function getSeasonOption(value: SeasonFilterValue) {
  return SEASON_OPTIONS.find((option) => option.value === value) ?? SEASON_OPTIONS[0];
}

function getSeasonIndex(value: SeasonFilterValue) {
  return SEASON_OPTIONS.findIndex((option) => option.value === value);
}

function getSeasonDirection(from: SeasonFilterValue, to: SeasonFilterValue) {
  const fromIndex = getSeasonIndex(from);
  const toIndex = getSeasonIndex(to);
  return toIndex > fromIndex ? 1 : -1;
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
      scale: forwardOffset === 0 ? 1 : 0.985,
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

function filterJourneys(data: Journey[], season: SeasonFilterValue) {
  const filtered = data.filter((journey) => {
    const isIndiaDualSeason = journey.slug === 'india-january-2026';
    if (season === 'summer') return journey.season === 'spring-summer' || isIndiaDualSeason;
    if (season === 'winter') return journey.season === 'fall-winter' || isIndiaDualSeason;
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

export function JourneyShowcaseGallery() {
  useBodyScrollLock();

  const prefersReducedMotion = usePrefersReducedMotion();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [season, setSeason] = useState<SeasonFilterValue>(() =>
    parseSeasonFilter(searchParams?.get('season') ?? null)
  );
  const [seasonDirection, setSeasonDirection] = useState(1);
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
      setSeasonDirection(getSeasonDirection(previous, nextSeason));
      return nextSeason;
    });
  }, [searchParams]);

  const applySeason = useCallback(
    (nextSeason: SeasonFilterValue, direction: number) => {
      setSeasonDirection(direction);
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

  const filteredJourneys = useMemo(() => filterJourneys(journeys, season), [season]);
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
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);
  const [backgroundDirection, setBackgroundDirection] = useState<1 | -1>(1);
  const [isJourneyTransitioning, setIsJourneyTransitioning] = useState(false);
  const previousSelectedIndexRef = useRef(0);
  const isRecenteringRef = useRef(false);
  const pendingDirectionRef = useRef<1 | -1>(1);
  const journeyTransitionTimeoutRef = useRef<number | null>(null);

  const safeLength = renderedJourneys.length;
  const displayIndex = safeLength ? Math.min(selectedIndex, safeLength - 1) : 0;
  const activeRenderedJourney = safeLength ? renderedJourneys[displayIndex] : null;
  const currentJourney = activeRenderedJourney?.journey ?? null;

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

      if (typeof window !== 'undefined') {
        try {
          window.sessionStorage.setItem('journey-transition-target', journey.slug);
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
    [isJourneyTransitioning, prefersReducedMotion, router]
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
        setCanScrollPrev(uniqueJourneyCount > 1);
        setCanScrollNext(uniqueJourneyCount > 1);
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
      setCanScrollPrev(uniqueJourneyCount > 1);
      setCanScrollNext(uniqueJourneyCount > 1);
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
    setCanScrollPrev(uniqueJourneyCount > 1);
    setCanScrollNext(uniqueJourneyCount > 1);
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

  const currentSeasonIndex = getSeasonIndex(season);

  const handleSeasonCycle = useCallback(
    (direction: 1 | -1) => {
      const nextIndex =
        (currentSeasonIndex + direction + SEASON_OPTIONS.length) % SEASON_OPTIONS.length;
      const nextSeason = SEASON_OPTIONS[nextIndex]?.value ?? 'all';
      applySeason(nextSeason, direction);
    },
    [applySeason, currentSeasonIndex]
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
      className="relative flex min-h-[100svh] flex-col overflow-hidden bg-black text-white"
      tabIndex={0}
      aria-label="Journey carousel"
    >
      <BackgroundImage
        activeJourney={currentJourney}
        prefersReducedMotion={prefersReducedMotion}
        direction={backgroundDirection}
        season={season}
        useLiteEffects={useLiteEffects}
      />

      <div
        className={clsx(
          'ease-[cubic-bezier(0.22,1,0.36,1)] relative z-20 flex min-h-[100svh] flex-col transition-opacity',
          prefersReducedMotion ? 'duration-150' : 'duration-[980ms]',
          isJourneyTransitioning ? 'pointer-events-none opacity-0' : 'opacity-100'
        )}
      >
        <div className="pointer-events-none absolute left-4 top-5 z-30 sm:left-6 sm:top-7 md:hidden lg:left-10 lg:top-8">
          <div className="pointer-events-auto">
            <SeasonElevator
              value={season}
              direction={seasonDirection}
              prefersReducedMotion={prefersReducedMotion}
              onCycle={handleSeasonCycle}
            />
          </div>
        </div>

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
                        layout
                        className={clsx(
                          'embla__slide flex flex-[0_0_74%] items-center sm:flex-[0_0_60%]',
                          getDesktopSlideBasisClass(forwardOffset)
                        )}
                        initial={prefersReducedMotion ? false : { opacity: 0 }}
                        animate={prefersReducedMotion ? undefined : { opacity: 1 }}
                        transition={{
                          duration: 0.92,
                          ease: [0.22, 1, 0.36, 1],
                          delay: Math.min(index * 0.07, 0.42),
                          layout: {
                            duration: useLiteEffects ? 0.46 : 0.7,
                            ease: [0.22, 1, 0.36, 1],
                          },
                        }}
                      >
                        <JourneyCard
                          journey={slide.journey}
                          isActive={activeRenderedJourney?.renderKey === slide.renderKey}
                          forwardOffset={forwardOffset}
                          onAction={() => handleCardAction(slide.journey, index)}
                          prefersReducedMotion={prefersReducedMotion}
                          isMobileViewport={isMobileViewport}
                          useLiteEffects={useLiteEffects}
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
              <JourneyNavigation
                canScrollPrev={canScrollPrev}
                canScrollNext={canScrollNext}
                onPrev={scrollPrev}
                onNext={scrollNext}
                compact
                centered
              />
            </div>
          </div>
        </div>

        <div className="pointer-events-none absolute left-6 top-1/2 z-40 hidden -translate-y-1/2 md:block lg:left-10 xl:left-14">
          <JourneyHeadline currentJourney={currentJourney} sideAligned />
        </div>

        <div className="pointer-events-none absolute bottom-5 right-4 z-30 hidden sm:bottom-7 sm:right-6 md:right-10 md:block lg:bottom-10 lg:right-16 xl:right-20">
          <JourneyDesktopControls
            season={season}
            seasonDirection={seasonDirection}
            prefersReducedMotion={prefersReducedMotion}
            onSeasonCycle={handleSeasonCycle}
          />
        </div>
      </div>
    </section>
  );
}

type SeasonElevatorProps = {
  value: SeasonFilterValue;
  direction: number;
  prefersReducedMotion: boolean;
  onCycle: (direction: 1 | -1) => void;
};

function SeasonElevator({ value, direction, prefersReducedMotion, onCycle }: SeasonElevatorProps) {
  const option = getSeasonOption(value);
  const hoverIcon = option.hoverIcon ?? option.icon;

  return (
    <motion.div
      layout
      className="group inline-flex items-center gap-2 text-white drop-shadow-[0_12px_28px_rgba(0,0,0,0.38)] sm:gap-3"
      transition={{
        layout: { duration: prefersReducedMotion ? 0.18 : 0.42, ease: [0.22, 1, 0.36, 1] },
      }}
    >
      <motion.button
        layout="position"
        type="button"
        onClick={() => onCycle(-1)}
        className="flex h-7 w-7 items-center justify-center text-white/45 transition hover:text-[#f6c452] hover:drop-shadow-[0_0_10px_rgba(246,196,82,0.42)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/45 group-hover:text-[#f6c452]"
        aria-label="Previous season"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden />
      </motion.button>

      <motion.div layout className="relative flex min-w-0 items-center overflow-hidden">
        <AnimatePresence initial={false} mode="popLayout">
          <motion.div
            key={value}
            layout
            initial={
              prefersReducedMotion ? { opacity: 0 } : { opacity: 0, x: direction > 0 ? 28 : -28 }
            }
            animate={{ opacity: 1, x: 0 }}
            exit={
              prefersReducedMotion ? { opacity: 0 } : { opacity: 0, x: direction > 0 ? -28 : 28 }
            }
            transition={{
              duration: prefersReducedMotion ? 0.2 : 0.42,
              ease: [0.22, 1, 0.36, 1],
              layout: { duration: prefersReducedMotion ? 0.18 : 0.42, ease: [0.22, 1, 0.36, 1] },
            }}
            className="relative flex items-center gap-3 sm:gap-4"
          >
            <div className="relative h-10 w-10 shrink-0 sm:h-11 sm:w-11">
              <Image
                src={option.icon}
                alt=""
                fill
                className={clsx(
                  'object-contain transition-opacity duration-300',
                  option.hoverIcon ? 'opacity-100 group-hover:opacity-0' : 'opacity-100'
                )}
                priority
              />
              {hoverIcon ? (
                <Image
                  src={hoverIcon}
                  alt=""
                  fill
                  className="object-contain opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                />
              ) : null}
            </div>

            <span
              className={clsx(
                'whitespace-nowrap font-display text-[1.1rem] uppercase tracking-[0.14em] text-white transition-colors duration-300 [text-shadow:0_0_18px_rgba(255,255,255,0.35)] sm:text-[1.55rem]',
                'group-hover:text-[#f6c452]'
              )}
            >
              {option.label}
            </span>
          </motion.div>
        </AnimatePresence>
      </motion.div>

      <motion.button
        layout="position"
        type="button"
        onClick={() => onCycle(1)}
        className="flex h-7 w-7 items-center justify-center text-white/45 transition hover:text-[#f6c452] hover:drop-shadow-[0_0_10px_rgba(246,196,82,0.42)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/45 group-hover:text-[#f6c452]"
        aria-label="Next season"
      >
        <ArrowRight className="h-4 w-4" aria-hidden />
      </motion.button>
    </motion.div>
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
              'font-title uppercase tracking-normal text-white [text-shadow:0_24px_52px_rgba(0,0,0,0.35)]',
              compact
                ? 'text-[clamp(2.15rem,12vw,4.4rem)] leading-[0.82]'
                : sideAligned
                  ? 'text-[clamp(3.2rem,7vw,7.4rem)] leading-[0.82]'
                  : 'text-[clamp(3.4rem,11vw,10.2rem)] leading-[0.8]'
            )}
          >
            {country}
          </h2>
          <p
            className={clsx(
              'mt-0 uppercase tracking-[0.38em] text-white [text-shadow:0_0_18px_rgba(255,255,255,0.48)]',
              compact ? 'text-[0.56rem]' : 'text-[0.68rem] sm:text-[0.78rem]'
            )}
          >
            {currentJourney.date}
          </p>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

type JourneyNavigationProps = {
  canScrollPrev: boolean;
  canScrollNext: boolean;
  onPrev: () => void;
  onNext: () => void;
  compact?: boolean;
  centered?: boolean;
};

function JourneyNavigation({
  canScrollPrev,
  canScrollNext,
  onPrev,
  onNext,
  compact = false,
  centered = false,
}: JourneyNavigationProps) {
  return (
    <div
      className={clsx(
        'pointer-events-auto flex items-center text-white',
        compact ? 'gap-2' : 'gap-3 sm:gap-4',
        centered && 'justify-center'
      )}
    >
      <JourneyNavButton
        direction="prev"
        disabled={!canScrollPrev}
        onClick={onPrev}
        compact={compact}
      />
      <div
        className={clsx(
          'relative flex min-w-0 items-center overflow-hidden',
          compact ? 'gap-1.5' : 'gap-3'
        )}
      >
        <Image
          src="/assets/icones/Ico White BEE-12.svg"
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
          Next Journey
        </span>
      </div>
      <JourneyNavButton
        direction="next"
        disabled={!canScrollNext}
        onClick={onNext}
        compact={compact}
      />
    </div>
  );
}

type JourneyDesktopControlsProps = {
  season: SeasonFilterValue;
  seasonDirection: number;
  prefersReducedMotion: boolean;
  onSeasonCycle: (direction: 1 | -1) => void;
};

function JourneyDesktopControls({
  season,
  seasonDirection,
  prefersReducedMotion,
  onSeasonCycle,
}: JourneyDesktopControlsProps) {
  return (
    <div className="pointer-events-auto flex items-center text-white">
      <SeasonElevator
        value={season}
        direction={seasonDirection}
        prefersReducedMotion={prefersReducedMotion}
        onCycle={onSeasonCycle}
      />
    </div>
  );
}

type JourneyNavButtonProps = {
  direction: 'prev' | 'next';
  disabled: boolean;
  onClick: () => void;
  compact?: boolean;
};

function JourneyNavButton({
  direction,
  disabled,
  onClick,
  compact = false,
}: JourneyNavButtonProps) {
  const Icon = direction === 'prev' ? ArrowLeft : ArrowRight;

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={clsx(
        'group flex items-center justify-center transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/45',
        compact ? 'h-6 w-6' : 'h-7 w-7',
        disabled ? 'cursor-not-allowed text-white/20' : 'text-white/45 hover:text-white/80'
      )}
      aria-label={direction === 'prev' ? 'Previous journey' : 'Next journey'}
    >
      <Icon
        className={clsx(
          'transition-transform duration-300',
          direction === 'prev' ? 'group-hover:-translate-x-1' : 'group-hover:translate-x-1',
          compact ? 'h-3.5 w-3.5' : 'h-4 w-4'
        )}
      />
    </button>
  );
}

type JourneyCardProps = {
  journey: Journey;
  isActive: boolean;
  forwardOffset: number;
  prefersReducedMotion: boolean;
  isMobileViewport: boolean;
  useLiteEffects: boolean;
  onAction: () => void;
};

function JourneyCard({
  journey,
  isActive,
  forwardOffset,
  prefersReducedMotion,
  isMobileViewport,
  useLiteEffects,
  onAction,
}: JourneyCardProps) {
  const fadeProfile = getCardFadeProfile(forwardOffset, isMobileViewport, useLiteEffects);

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
              layout: { duration: useLiteEffects ? 0.46 : 0.7, ease: [0.22, 1, 0.36, 1] },
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
          <Image
            src={journey.image}
            alt={journey.title}
            fill
            sizes="(min-width: 1536px) 27vw, (min-width: 1280px) 32vw, (min-width: 1024px) 34vw, (min-width: 640px) 52vw, 78vw"
            className="object-cover"
            priority={isActive}
          />
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
      </div>
    </motion.button>
  );
}

type BackgroundImageProps = {
  activeJourney: Journey | null;
  prefersReducedMotion: boolean;
  direction: 1 | -1;
  season: SeasonFilterValue;
  useLiteEffects: boolean;
};

function BackgroundImage({
  activeJourney,
  prefersReducedMotion,
  direction,
  season,
  useLiteEffects,
}: BackgroundImageProps) {
  const backgroundDuration = prefersReducedMotion ? 0.2 : useLiteEffects ? 0.72 : 0.98;
  const seamPeakOpacity = useLiteEffects ? 0.34 : 0.5;
  const seamShift = direction > 0 ? 42 : -42;

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
      {!prefersReducedMotion ? (
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

      {!prefersReducedMotion ? (
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
          {activeJourney ? (
            <motion.div
              key={activeJourney.id}
              className="absolute inset-0 overflow-hidden"
              initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={prefersReducedMotion ? { opacity: 1 } : { opacity: 0 }}
              transition={{ duration: backgroundDuration, ease: [0.22, 1, 0.36, 1] }}
            >
              <motion.div
                className="absolute inset-[-10%]"
                initial={
                  prefersReducedMotion
                    ? { scale: 1.01, x: 0 }
                    : { scale: 1.05, x: direction > 0 ? 18 : -18 }
                }
                animate={{ scale: 1.01, x: 0 }}
                exit={
                  prefersReducedMotion
                    ? { scale: 1.01, x: 0 }
                    : { scale: 1.04, x: direction > 0 ? -12 : 12 }
                }
                transition={{ duration: backgroundDuration, ease: [0.22, 1, 0.36, 1] }}
                style={{ willChange: 'transform, opacity' }}
              >
                <Image
                  src={activeJourney.image}
                  alt=""
                  fill
                  sizes="100vw"
                  className={clsx('object-cover', activeJourney.backgroundVideo && 'opacity-0')}
                  priority
                />
                {activeJourney.backgroundVideo ? (
                  <video
                    key={activeJourney.backgroundVideo}
                    src={activeJourney.backgroundVideo}
                    poster={activeJourney.image}
                    className="absolute inset-0 h-full w-full object-cover"
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
          {activeJourney && !prefersReducedMotion ? (
            <motion.div
              key={`seam-${activeJourney.id}`}
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

      <div className="absolute inset-0 bg-[rgba(2,2,1,0.2)]" />
    </div>
  );
}
