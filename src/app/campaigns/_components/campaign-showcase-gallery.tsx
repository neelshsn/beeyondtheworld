'use client';

import clsx from 'clsx';
import useEmblaCarousel from 'embla-carousel-react';
import { AnimatePresence, motion } from 'framer-motion';
import Image from 'next/image';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { useBodyScrollLock } from '@/app/concept/_hooks/use-body-scroll-lock';
import { usePrefersReducedMotion } from '@/app/concept/_hooks/use-prefers-reduced-motion';
import { SiteArrowIcon } from '@/components/icons/site-arrow-icon';
import { formatCampaignSeason } from '@/lib/format-campaign-season';
import type { Campaign } from '@/types/campaign';

type SeasonFilterValue = 'all' | 'summer' | 'winter';

type SeasonOption = {
  label: string;
  value: SeasonFilterValue;
  icon: string;
  season?: Campaign['season'];
};

type RenderedCampaignSlide = {
  campaign: Campaign;
  sourceIndex: number;
  renderKey: string;
};

const SEASON_OPTIONS: SeasonOption[] = [
  {
    label: 'All Campaigns',
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

const CAMPAIGN_SEASON_ICONS: Record<Campaign['season'], { icon: string; label: string }> = {
  'spring-summer': {
    icon: '/assets/icones/icono/saisons/flowers.svg',
    label: 'Spring Summer',
  },
  'fall-winter': {
    icon: '/assets/icones/icono/saisons/winter.svg',
    label: 'Fall Winter',
  },
};

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

const CAMPAIGN_TRANSITION_FADE_MS = 980;

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

function getCampaignChronologyKey(dateValue: string) {
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

function getCampaignMediaForSeason(campaign: Campaign) {
  return {
    image: campaign.image,
    backgroundVideo: campaign.backgroundVideo,
    variantKey: `${campaign.id}-${campaign.image}-${campaign.backgroundVideo ?? 'none'}`,
  };
}

function filterCampaigns(data: Campaign[], season: SeasonFilterValue) {
  const filtered = data.filter((campaign) => {
    const seasonTags = campaign.seasonTags ?? [campaign.season];
    if (season === 'summer') return seasonTags.includes('spring-summer');
    if (season === 'winter') return seasonTags.includes('fall-winter');
    return true;
  });

  return filtered.sort((a, b) => {
    const chronologyDiff = getCampaignChronologyKey(a.date) - getCampaignChronologyKey(b.date);
    if (chronologyDiff !== 0) {
      return chronologyDiff;
    }
    return a.title.localeCompare(b.title);
  });
}

function buildRenderedCampaignSlides(data: Campaign[]): RenderedCampaignSlide[] {
  if (!data.length) return [];
  if (data.length === 1) {
    return [{ campaign: data[0], sourceIndex: 0, renderKey: `${data[0].id}-0` }];
  }

  // Three cycles are enough to keep one recentering buffer on each side.
  // Keep roughly 18 slides for smaller filters without multiplying a larger
  // campaign catalogue into dozens of image, logo and season-icon clones.
  const repeatCycles = Math.max(3, Math.ceil(18 / data.length));
  const targetCount = data.length * repeatCycles;

  return Array.from({ length: targetCount }, (_, index) => {
    const sourceIndex = index % data.length;
    const campaign = data[sourceIndex];

    return {
      campaign,
      sourceIndex,
      renderKey: `${campaign.id}-${index}`,
    };
  });
}

function extractCountry(location: string) {
  const parts = location.split(',');
  return parts[parts.length - 1]?.trim() || location;
}

export function CampaignShowcaseGallery({ campaigns }: { campaigns: Campaign[] }) {
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
      setIsSeasonSwitching(true);
      setSeasonDirection(getSeasonDirection(previous, nextSeason));
      return nextSeason;
    });
  }, [searchParams]);

  const applySeason = useCallback(
    (nextSeason: SeasonFilterValue, direction: number) => {
      setSeasonDirection(direction);
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

  const filteredJourneys = useMemo(() => filterCampaigns(campaigns, season), [campaigns, season]);
  const renderedJourneys = useMemo(
    () => buildRenderedCampaignSlides(filteredJourneys),
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
    []
  );

  const [emblaRef, emblaApi] = useEmblaCarousel(emblaOptions);

  const rootRef = useRef<HTMLDivElement | null>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);
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
  const currentJourney = activeRenderedJourney?.campaign ?? null;
  const currentJourneyMedia = currentJourney ? getCampaignMediaForSeason(currentJourney) : null;

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
    (journey: Campaign) => {
      if (isJourneyTransitioning) {
        return;
      }

      const destination = `/campaigns/${journey.slug}`;
      setIsJourneyTransitioning(true);
      if (prefersReducedMotion) {
        router.push(destination);
        return;
      }

      if (journeyTransitionTimeoutRef.current !== null) {
        window.clearTimeout(journeyTransitionTimeoutRef.current);
      }

      journeyTransitionTimeoutRef.current = window.setTimeout(() => {
        router.push(destination);
      }, CAMPAIGN_TRANSITION_FADE_MS);
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
  }, [centeredStartIndex, emblaApi, emblaOptions, renderedIdsSignature, uniqueJourneyCount]);

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
      const current = renderedJourneys[emblaApi.selectedScrollSnap()]?.campaign;
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
    (journey: Campaign, index: number) => {
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
      aria-label="Campaign carousel"
    >
      <BackgroundImage
        activeJourney={currentJourney}
        activeJourneyKey={
          currentJourneyMedia?.variantKey ?? currentJourney?.id ?? 'campaign-background'
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
                        layout={!isSeasonSwitching}
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
                          layout: isSeasonSwitching
                            ? undefined
                            : {
                                duration: useLiteEffects ? 0.46 : 0.7,
                                ease: [0.22, 1, 0.36, 1],
                              },
                        }}
                      >
                        <JourneyCard
                          journey={slide.campaign}
                          isActive={activeRenderedJourney?.renderKey === slide.renderKey}
                          forwardOffset={forwardOffset}
                          onAction={() => handleCardAction(slide.campaign, index)}
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
                No campaigns for this season.
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
  const [hoveredControl, setHoveredControl] = useState<'prev' | 'next' | 'center' | null>(null);
  const highlightCenter =
    hoveredControl === 'prev' || hoveredControl === 'next' || hoveredControl === 'center';

  return (
    <motion.div
      layout
      className="inline-flex items-center gap-2 text-white drop-shadow-[0_12px_28px_rgba(0,0,0,0.38)] sm:gap-3"
      transition={{
        layout: { duration: prefersReducedMotion ? 0.18 : 0.42, ease: [0.22, 1, 0.36, 1] },
      }}
    >
      <motion.button
        layout="position"
        type="button"
        onClick={() => onCycle(-1)}
        onMouseEnter={() => setHoveredControl('prev')}
        onMouseLeave={() => setHoveredControl((current) => (current === 'prev' ? null : current))}
        onFocus={() => setHoveredControl('prev')}
        onBlur={() => setHoveredControl((current) => (current === 'prev' ? null : current))}
        className={clsx(
          'flex h-6 w-6 items-center justify-center transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/45',
          hoveredControl === 'prev'
            ? 'text-[#f6c452] drop-shadow-[0_0_10px_rgba(246,196,82,0.42)]'
            : 'text-white/45'
        )}
        aria-label="Previous season"
      >
        <SiteArrowIcon direction="left" className="h-3.5 w-3.5" />
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
            onMouseEnter={() => setHoveredControl('center')}
            onMouseLeave={() =>
              setHoveredControl((current) => (current === 'center' ? null : current))
            }
            className="group/season relative flex items-center gap-2.5 sm:gap-3"
          >
            <div className="relative h-8 w-8 shrink-0 sm:h-9 sm:w-9">
              <Image
                src={option.icon}
                alt=""
                fill
                className={clsx(
                  'object-contain transition duration-300 ease-out',
                  highlightCenter ? 'scale-105 opacity-100' : 'opacity-[0.85]'
                )}
                priority
              />
            </div>

            <span
              className={clsx(
                'whitespace-nowrap font-display text-[0.92rem] uppercase tracking-[0.12em] transition-colors duration-300 [text-shadow:0_0_12px_rgba(255,255,255,0.34),0_12px_28px_rgba(0,0,0,0.34),0_24px_56px_rgba(0,0,0,0.22)] sm:text-[1.24rem]',
                highlightCenter ? 'text-[#f6c452]' : 'text-white'
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
        onMouseEnter={() => setHoveredControl('next')}
        onMouseLeave={() => setHoveredControl((current) => (current === 'next' ? null : current))}
        onFocus={() => setHoveredControl('next')}
        onBlur={() => setHoveredControl((current) => (current === 'next' ? null : current))}
        className={clsx(
          'flex h-6 w-6 items-center justify-center transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/45',
          hoveredControl === 'next'
            ? 'text-[#f6c452] drop-shadow-[0_0_10px_rgba(246,196,82,0.42)]'
            : 'text-white/45'
        )}
        aria-label="Next season"
      >
        <SiteArrowIcon direction="right" className="h-3.5 w-3.5" />
      </motion.button>
    </motion.div>
  );
}

type JourneyHeadlineProps = {
  currentJourney: Campaign | null;
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
  const country = currentJourney ? currentJourney.client : '';
  const destination = currentJourney
    ? currentJourney.country || extractCountry(currentJourney.location)
    : '';
  const season = currentJourney ? formatCampaignSeason(currentJourney.releaseWindow) : '';
  const splitVeganboostTitle = currentJourney?.slug === 'veganboost-greece';

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
            {splitVeganboostTitle ? (
              <>
                <span className="block">Vegan</span>
                <span className="block">Boost</span>
              </>
            ) : (
              country
            )}
          </h2>
          <p
            className={clsx(
              'mt-2 inline-flex items-center whitespace-nowrap uppercase text-white [text-shadow:0_2px_0_rgba(0,0,0,0.3),0_8px_14px_rgba(0,0,0,0.24),0_16px_34px_rgba(0,0,0,0.24)]',
              compact
                ? 'text-[0.5rem] tracking-[0.28em]'
                : 'text-[0.6rem] tracking-[0.34em] sm:text-[0.68rem]'
            )}
          >
            <span>{destination}</span>
            <span className="px-2 text-[#f6c452]" aria-hidden="true">
              |
            </span>
            <span>{season}</span>
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
            'truncate font-display uppercase tracking-[0.14em] text-white [text-shadow:0_0_10px_rgba(255,255,255,0.32),0_12px_28px_rgba(0,0,0,0.34),0_24px_52px_rgba(0,0,0,0.2)]',
            compact ? 'text-[0.7rem]' : 'text-[1.1rem] sm:text-[1.55rem]'
          )}
        >
          Next Campaign
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
      aria-label={direction === 'prev' ? 'Previous campaign' : 'Next campaign'}
    >
      <SiteArrowIcon
        direction={direction === 'prev' ? 'left' : 'right'}
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
  journey: Campaign;
  isActive: boolean;
  forwardOffset: number;
  prefersReducedMotion: boolean;
  isMobileViewport: boolean;
  useLiteEffects: boolean;
  disableLayoutAnimation?: boolean;
  onAction: () => void;
};

function JourneyCard({
  journey,
  isActive,
  forwardOffset,
  prefersReducedMotion,
  isMobileViewport,
  useLiteEffects,
  disableLayoutAnimation = false,
  onAction,
}: JourneyCardProps) {
  const fadeProfile = getCardFadeProfile(forwardOffset, isMobileViewport, useLiteEffects);
  const displayMedia = getCampaignMediaForSeason(journey);

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
      aria-label={`Campaign: ${journey.title}, ${journey.date}`}
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
                quality={100}
                sizes="(min-width: 1536px) 27vw, (min-width: 1280px) 32vw, (min-width: 1024px) 34vw, (min-width: 640px) 52vw, 78vw"
                className="object-cover"
                priority={isActive}
              />
            </motion.div>
          </AnimatePresence>
        </motion.div>
        <motion.div
          className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/15 to-black/10"
          animate={
            prefersReducedMotion ? undefined : { opacity: fadeProfile.overlayOpacity + 0.08 }
          }
          transition={
            prefersReducedMotion
              ? undefined
              : { duration: useLiteEffects ? 0.38 : 0.62, ease: [0.22, 1, 0.36, 1] }
          }
        />
        <div className="absolute inset-x-0 bottom-0 flex items-center justify-center px-6 pb-7">
          <SeasonIconRow
            seasons={journey.seasonTags ?? [journey.season]}
            compact={isMobileViewport}
          />
        </div>
      </div>
    </motion.button>
  );
}

function SeasonIconRow({
  seasons,
  compact = false,
}: {
  seasons: Campaign['season'][];
  compact?: boolean;
}) {
  return (
    <div className={clsx('flex items-center justify-center gap-3', compact && 'gap-2')}>
      {seasons.map((season) => {
        const iconSet = CAMPAIGN_SEASON_ICONS[season];
        return (
          <span
            key={season}
            className={clsx(
              'relative block shrink-0',
              compact ? 'h-[1.5rem] w-[1.5rem]' : 'h-[1.9rem] w-[1.9rem]'
            )}
            aria-label={iconSet.label}
          >
            <Image
              src={iconSet.icon}
              alt=""
              fill
              className="object-contain [filter:drop-shadow(0_0.16em_0.04em_rgba(0,0,0,0.88))_drop-shadow(0_0.05em_0.16em_rgba(0,0,0,0.45))]"
            />
          </span>
        );
      })}
    </div>
  );
}

type BackgroundImageProps = {
  activeJourney: Campaign | null;
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
  const seasonOverlayClass = clsx(
    'absolute inset-[-18%] blur-[64px]',
    season === 'summer' &&
      'bg-[radial-gradient(60%_48%_at_18%_18%,rgba(214,191,134,0.28),rgba(214,191,134,0)_70%),radial-gradient(56%_46%_at_82%_84%,rgba(196,142,110,0.24),rgba(196,142,110,0)_72%)]',
    season === 'winter' &&
      'bg-[radial-gradient(60%_48%_at_18%_18%,rgba(132,160,178,0.28),rgba(132,160,178,0)_70%),radial-gradient(56%_46%_at_82%_84%,rgba(177,195,206,0.22),rgba(177,195,206,0)_72%)]',
    season === 'all' &&
      'bg-[radial-gradient(58%_46%_at_18%_20%,rgba(203,190,158,0.22),rgba(203,190,158,0)_70%),radial-gradient(56%_44%_at_82%_84%,rgba(171,181,192,0.18),rgba(171,181,192,0)_72%)]'
  );

  const seasonVeilClass = clsx(
    'absolute inset-[-10%] blur-[54px]',
    season === 'summer' &&
      'bg-[radial-gradient(50%_36%_at_50%_50%,rgba(205,175,120,0.16),rgba(205,175,120,0)_78%)]',
    season === 'winter' &&
      'bg-[radial-gradient(50%_36%_at_50%_50%,rgba(166,191,210,0.18),rgba(166,191,210,0)_78%)]',
    season === 'all' &&
      'bg-[radial-gradient(50%_36%_at_50%_50%,rgba(196,202,212,0.14),rgba(196,202,212,0)_78%)]'
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
                  src={activeJourneyImage}
                  alt=""
                  fill
                  quality={100}
                  sizes="100vw"
                  className={clsx('object-cover', activeJourneyVideo && 'opacity-0')}
                  priority
                />
                {activeJourneyVideo ? (
                  <video
                    ref={videoRef}
                    key={activeJourneyVideo}
                    src={activeJourneyVideo}
                    poster={activeJourneyImage}
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

      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_70%,rgba(214,167,112,0.26)_0%,rgba(214,167,112,0)_44%),radial-gradient(circle_at_86%_24%,rgba(214,225,236,0.12)_0%,rgba(214,225,236,0)_42%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(110deg,rgba(18,12,10,0.62)_0%,rgba(25,18,19,0.44)_38%,rgba(8,8,10,0.58)_100%)]" />
    </div>
  );
}
