'use client';

import clsx from 'clsx';
import useEmblaCarousel from 'embla-carousel-react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, ChevronDown, ChevronUp } from 'lucide-react';
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
  season?: JourneySeason;
};

const SEASON_OPTIONS: SeasonOption[] = [
  {
    label: 'All Journeys',
    value: 'all',
    icon: '/assets/icones/Ico White BEE-02.svg',
  },
  {
    label: 'Spring Summer',
    value: 'summer',
    season: 'spring-summer',
    icon: '/assets/icones/Ico White BEE-14.svg',
  },
  {
    label: 'Fall Winter',
    value: 'winter',
    season: 'fall-winter',
    icon: '/assets/icones/Ico White BEE-01.svg',
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

const DUST_PARTICLES = [
  { left: '6%', top: '14%', delay: 0, duration: 9, size: 3 },
  { left: '18%', top: '28%', delay: 1.2, duration: 12, size: 2 },
  { left: '28%', top: '10%', delay: 2.3, duration: 10, size: 2.5 },
  { left: '72%', top: '16%', delay: 0.7, duration: 11, size: 2.5 },
  { left: '84%', top: '32%', delay: 1.8, duration: 9, size: 3 },
  { left: '92%', top: '20%', delay: 2.7, duration: 13, size: 2 },
  { left: '12%', top: '72%', delay: 1.4, duration: 10, size: 2 },
  { left: '24%', top: '86%', delay: 0.5, duration: 12, size: 2.5 },
  { left: '78%', top: '78%', delay: 1.9, duration: 8, size: 3 },
  { left: '88%', top: '66%', delay: 2.9, duration: 10, size: 2 },
  { left: '52%', top: '8%', delay: 0.9, duration: 11, size: 1.8 },
  { left: '58%', top: '92%', delay: 2.2, duration: 14, size: 2.3 },
] as const;

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
    if (season === 'summer') return journey.season === 'spring-summer';
    if (season === 'winter') return journey.season === 'fall-winter';
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

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const mediaQuery = window.matchMedia('(max-width: 767px)');
    const onChange = () => setIsMobileViewport(mediaQuery.matches);

    onChange();
    mediaQuery.addEventListener('change', onChange);
    return () => mediaQuery.removeEventListener('change', onChange);
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
  const filteredIdsSignature = useMemo(
    () => filteredJourneys.map((journey) => journey.id).join('|'),
    [filteredJourneys]
  );

  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: 'center',
    loop: false,
    containScroll: false,
    duration: 30,
    skipSnaps: false,
    dragFree: false,
    breakpoints: {
      '(min-width: 768px)': {
        align: 'start',
      },
    },
  });

  const rootRef = useRef<HTMLDivElement | null>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);
  const [backgroundDirection, setBackgroundDirection] = useState<1 | -1>(1);
  const previousSelectedIndexRef = useRef(0);

  const safeLength = filteredJourneys.length;
  const displayIndex = safeLength ? Math.min(selectedIndex, safeLength - 1) : 0;
  const currentJourney = safeLength ? filteredJourneys[displayIndex] : null;

  useEffect(() => {
    if (!emblaApi) {
      return;
    }

    const onSelect = () => {
      const nextIndex = emblaApi.selectedScrollSnap();
      const previousIndex = previousSelectedIndexRef.current;
      if (nextIndex !== previousIndex) {
        setBackgroundDirection(nextIndex > previousIndex ? 1 : -1);
      }
      previousSelectedIndexRef.current = nextIndex;
      setSelectedIndex(nextIndex);
      setCanScrollPrev(emblaApi.canScrollPrev());
      setCanScrollNext(emblaApi.canScrollNext());
    };

    emblaApi.on('select', onSelect);
    emblaApi.on('reInit', onSelect);
    onSelect();

    return () => {
      emblaApi.off('select', onSelect);
      emblaApi.off('reInit', onSelect);
    };
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) {
      return;
    }

    emblaApi.reInit({
      align: 'center',
      loop: false,
      containScroll: false,
      duration: 30,
      skipSnaps: false,
      dragFree: false,
      startIndex: 0,
      breakpoints: {
        '(min-width: 768px)': {
          align: 'start',
        },
      },
    });

    emblaApi.scrollTo(0, true);
    previousSelectedIndexRef.current = 0;
    setSelectedIndex(0);
    setBackgroundDirection(1);
  }, [emblaApi, filteredJourneys.length, filteredIdsSignature]);

  useEffect(() => {
    const node = rootRef.current;
    if (!node || !emblaApi) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (!filteredJourneys.length || event.key !== 'Enter') {
        return;
      }

      event.preventDefault();
      const current = filteredJourneys[emblaApi.selectedScrollSnap()];
      if (current) {
        router.push(`/journeys/${current.slug}`);
      }
    };

    node.addEventListener('keydown', handleKeyDown);
    return () => {
      node.removeEventListener('keydown', handleKeyDown);
    };
  }, [emblaApi, filteredJourneys, router]);

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
        router.push(`/journeys/${journey.slug}`);
        return;
      }

      const activeIndex = emblaApi.selectedScrollSnap();
      if (index !== activeIndex) {
        emblaApi.scrollTo(index);
        return;
      }

      router.push(`/journeys/${journey.slug}`);
    },
    [emblaApi, router]
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
        currentJourney={currentJourney}
        prefersReducedMotion={prefersReducedMotion}
        direction={backgroundDirection}
      />
      <CornerFogGlows prefersReducedMotion={prefersReducedMotion} />

      <div className="relative z-20 flex min-h-[100svh] flex-col">
        <div className="pointer-events-none absolute left-4 top-5 z-30 sm:left-6 sm:top-7 lg:left-10 lg:top-8">
          <div className="pointer-events-auto">
            <SeasonElevator
              value={season}
              direction={seasonDirection}
              prefersReducedMotion={prefersReducedMotion}
              onCycle={handleSeasonCycle}
            />
          </div>
        </div>

        <div className="relative flex flex-1 items-center justify-end md:-translate-y-3 lg:-translate-y-5">
          <div className="w-full px-2 pb-2 pt-20 sm:px-6 sm:pb-4 sm:pt-24 md:w-[75%] md:pb-0 md:pr-6 md:pt-0 lg:py-10 lg:pr-10">
            {safeLength ? (
              <div className="overflow-visible pb-8 sm:pb-10 md:pb-0" ref={emblaRef}>
                <motion.div
                  key={filteredIdsSignature}
                  className="embla__container -mx-2 flex touch-pan-x items-center sm:-mx-3"
                  initial={prefersReducedMotion ? undefined : { opacity: 0.5, x: 18 }}
                  animate={prefersReducedMotion ? undefined : { opacity: 1, x: 0 }}
                  transition={{ duration: 0.62, ease: [0.22, 1, 0.36, 1] }}
                >
                  {filteredJourneys.map((journey, index) => (
                    <motion.div
                      key={journey.id}
                      className="embla__slide flex flex-[0_0_74%] items-center px-2 sm:flex-[0_0_60%] sm:px-3 md:flex-[0_0_48%] lg:flex-[0_0_34%] xl:flex-[0_0_30%]"
                      initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
                      animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
                      transition={{
                        duration: 0.55,
                        ease: [0.22, 1, 0.36, 1],
                        delay: Math.min(index * 0.035, 0.24),
                      }}
                    >
                      <JourneyCard
                        journey={journey}
                        isActive={Boolean(currentJourney && currentJourney.id === journey.id)}
                        onAction={() => handleCardAction(journey, index)}
                        prefersReducedMotion={prefersReducedMotion}
                        isMobileViewport={isMobileViewport}
                      />
                    </motion.div>
                  ))}
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

        <div className="pointer-events-none absolute bottom-5 left-4 z-40 hidden sm:bottom-7 sm:left-6 md:block lg:bottom-10 lg:left-10">
          <JourneyHeadline currentJourney={currentJourney} />
        </div>

        <div className="pointer-events-none absolute bottom-5 right-4 z-30 hidden sm:bottom-7 sm:right-6 md:block lg:bottom-10 lg:right-10">
          <JourneyNavigation
            canScrollPrev={canScrollPrev}
            canScrollNext={canScrollNext}
            onPrev={scrollPrev}
            onNext={scrollNext}
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

  return (
    <div className="flex items-center gap-3 text-white sm:gap-4">
      <div className="flex flex-col gap-1.5">
        <button
          type="button"
          onClick={() => onCycle(-1)}
          className="flex h-7 w-7 items-center justify-center text-white/45 transition hover:text-white/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/45"
          aria-label="Previous season"
        >
          <ChevronUp className="h-4 w-4" aria-hidden />
        </button>
        <button
          type="button"
          onClick={() => onCycle(1)}
          className="flex h-7 w-7 items-center justify-center text-white/45 transition hover:text-white/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/45"
          aria-label="Next season"
        >
          <ChevronDown className="h-4 w-4" aria-hidden />
        </button>
      </div>

      <div className="relative flex min-w-0 items-center gap-3 overflow-hidden">
        <Image
          src={option.icon}
          alt=""
          width={42}
          height={42}
          className="h-10 w-10 shrink-0 sm:h-11 sm:w-11"
          priority
        />
        <div className="relative h-12 min-w-0 min-[420px]:w-[260px] sm:w-[320px]">
          <AnimatePresence initial={false} mode="wait">
            <motion.div
              key={value}
              initial={
                prefersReducedMotion ? { opacity: 0 } : { opacity: 0, x: direction > 0 ? 36 : -36 }
              }
              animate={{ opacity: 1, x: 0 }}
              exit={
                prefersReducedMotion ? { opacity: 0 } : { opacity: 0, x: direction > 0 ? -36 : 36 }
              }
              transition={{ duration: prefersReducedMotion ? 0.2 : 0.42, ease: [0.22, 1, 0.36, 1] }}
              className="absolute inset-0 flex items-center"
            >
              <span className="truncate font-display text-[1.1rem] uppercase tracking-[0.14em] text-white [text-shadow:0_0_18px_rgba(255,255,255,0.35)] sm:text-[1.55rem]">
                {option.label}
              </span>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

type JourneyHeadlineProps = {
  currentJourney: Journey | null;
  compact?: boolean;
  centered?: boolean;
};

function JourneyHeadline({
  currentJourney,
  compact = false,
  centered = false,
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
            centered && 'text-center'
          )}
        >
          <h2
            className={clsx(
              'font-title uppercase tracking-normal text-white [text-shadow:0_24px_52px_rgba(0,0,0,0.35)]',
              compact
                ? 'text-[clamp(2.15rem,12vw,4.4rem)] leading-[0.82]'
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
      <button
        type="button"
        onClick={onPrev}
        disabled={!canScrollPrev}
        className={clsx(
          'group flex items-center justify-center transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/45',
          compact ? 'h-6 w-6' : 'h-7 w-7',
          canScrollPrev ? 'text-white/45 hover:text-white/80' : 'cursor-not-allowed text-white/20'
        )}
        aria-label="Previous journey"
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
      <button
        type="button"
        onClick={onNext}
        disabled={!canScrollNext}
        className={clsx(
          'group flex items-center justify-center transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/45',
          compact ? 'h-6 w-6' : 'h-7 w-7',
          canScrollNext ? 'text-white/45 hover:text-white/80' : 'cursor-not-allowed text-white/20'
        )}
        aria-label="Next journey"
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

type JourneyCardProps = {
  journey: Journey;
  isActive: boolean;
  prefersReducedMotion: boolean;
  isMobileViewport: boolean;
  onAction: () => void;
};

function JourneyCard({
  journey,
  isActive,
  prefersReducedMotion,
  isMobileViewport,
  onAction,
}: JourneyCardProps) {
  const activeScaleX = isMobileViewport ? 1.02 : 1.08;
  const inactiveScaleX = isMobileViewport ? 0.98 : 0.94;
  const activeScaleY = isMobileViewport ? 1.08 : 1.22;
  const inactiveScaleY = isMobileViewport ? 0.98 : 0.94;

  return (
    <motion.button
      type="button"
      onClick={onAction}
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
              scaleX: isActive ? activeScaleX : inactiveScaleX,
              scaleY: isActive ? activeScaleY : inactiveScaleY,
              y: 0,
            }
      }
      whileHover={
        prefersReducedMotion
          ? undefined
          : {
              scaleX: isActive ? activeScaleX + 0.02 : inactiveScaleX + 0.02,
              scaleY: isActive ? activeScaleY + 0.02 : inactiveScaleY + 0.02,
              y: -6,
            }
      }
      transition={prefersReducedMotion ? undefined : { duration: 0.62, ease: [0.22, 1, 0.36, 1] }}
      aria-label={`Journey: ${journey.title}, ${journey.date}`}
      style={{ transformOrigin: 'center center' }}
    >
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-black/30 shadow-[0_30px_75px_-24px_rgba(0,0,0,0.78)]">
        <Image
          src={journey.image}
          alt={journey.title}
          fill
          sizes="(min-width: 1536px) 27vw, (min-width: 1280px) 32vw, (min-width: 1024px) 34vw, (min-width: 640px) 52vw, 78vw"
          className={clsx(
            'duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)] object-cover transition-transform',
            isActive ? 'scale-[1.02]' : 'scale-[1.06]',
            'group-hover:scale-[1.1]'
          )}
          priority={isActive}
        />
        <div className="from-black/58 absolute inset-0 bg-gradient-to-t via-transparent to-black/10" />
      </div>
    </motion.button>
  );
}

type BackgroundImageProps = {
  currentJourney: Journey | null;
  prefersReducedMotion: boolean;
  direction: 1 | -1;
};

function BackgroundImage({
  currentJourney,
  prefersReducedMotion,
  direction,
}: BackgroundImageProps) {
  return (
    <div className="pointer-events-none absolute inset-0" aria-hidden>
      <AnimatePresence initial={false}>
        {currentJourney ? (
          <motion.div
            key={currentJourney.id}
            initial={
              prefersReducedMotion
                ? { opacity: 0 }
                : {
                    opacity: 0.25,
                    scale: 1.045,
                    x: direction > 0 ? 44 : -44,
                    filter: 'blur(2px)',
                  }
            }
            animate={{ opacity: 1, scale: 1, x: 0, filter: 'blur(0px)' }}
            exit={
              prefersReducedMotion
                ? { opacity: 0 }
                : {
                    opacity: 0.22,
                    scale: 1.02,
                    x: direction > 0 ? -34 : 34,
                    filter: 'blur(2px)',
                  }
            }
            transition={{
              duration: prefersReducedMotion ? 0.2 : 0.9,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="absolute inset-0"
          >
            <Image
              src={currentJourney.image}
              alt=""
              fill
              sizes="100vw"
              className="object-cover"
              priority
            />
          </motion.div>
        ) : null}
      </AnimatePresence>

      {!prefersReducedMotion ? (
        <AnimatePresence initial={false}>
          {currentJourney ? (
            <motion.div
              key={`${currentJourney.id}-directional-pan-morph`}
              className="absolute inset-0 overflow-hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35 }}
            >
              <motion.div
                className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,220,158,0.16)_0%,rgba(255,220,158,0)_30%,rgba(255,220,158,0)_70%,rgba(255,220,158,0.16)_100%)]"
                initial={{ x: direction > 0 ? '10%' : '-10%', opacity: 0.3 }}
                animate={{ x: '0%', opacity: [0.3, 0.2, 0.1] }}
                transition={{
                  duration: 0.95,
                  ease: [0.16, 1, 0.3, 1],
                  times: [0, 0.5, 1],
                }}
                style={{ willChange: 'transform, opacity' }}
              />
              <motion.div
                className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.08)_0%,rgba(255,255,255,0)_45%,rgba(0,0,0,0.12)_100%)]"
                initial={{ x: direction > 0 ? '-6%' : '6%', opacity: 0.24, filter: 'blur(2px)' }}
                animate={{ x: '0%', opacity: [0.24, 0.16, 0.08], filter: 'blur(0px)' }}
                transition={{
                  duration: 1.05,
                  delay: 0.02,
                  ease: [0.16, 1, 0.3, 1],
                  times: [0, 0.52, 1],
                }}
                style={{ willChange: 'transform, opacity' }}
              />
            </motion.div>
          ) : null}
        </AnimatePresence>
      ) : null}
    </div>
  );
}

function CornerFogGlows({ prefersReducedMotion }: { prefersReducedMotion: boolean }) {
  return (
    <div className="pointer-events-none absolute inset-0 z-10 overflow-hidden" aria-hidden>
      <motion.div
        className="absolute inset-[-30%] bg-[radial-gradient(55%_45%_at_18%_24%,rgba(255,214,145,0.24),rgba(255,214,145,0)_66%),radial-gradient(52%_42%_at_84%_74%,rgba(240,176,77,0.2),rgba(240,176,77,0)_68%)] blur-[88px]"
        animate={
          prefersReducedMotion
            ? { opacity: 0.5 }
            : {
                x: [0, 30, -26, 18, 0],
                y: [0, -24, 20, -12, 0],
                opacity: [0.36, 0.62, 0.42, 0.58, 0.36],
                scale: [1, 1.05, 0.98, 1.03, 1],
              }
        }
        transition={
          prefersReducedMotion ? undefined : { duration: 13, repeat: Infinity, ease: 'easeInOut' }
        }
        style={{ willChange: 'transform, opacity' }}
      />
      <motion.div
        className="absolute -left-[26vw] -top-[22vh] h-[72vw] w-[72vw] rounded-full bg-[radial-gradient(circle,rgba(251,205,120,0.64)_0%,rgba(251,205,120,0.32)_34%,rgba(251,205,120,0)_76%)] blur-[72px]"
        animate={
          prefersReducedMotion
            ? { opacity: 0.82 }
            : {
                x: [0, 52, -28, 34, 0],
                y: [0, 42, -30, 18, 0],
                scale: [1, 1.2, 0.92, 1.12, 1],
                rotate: [0, 4, -3, 2, 0],
                opacity: [0.64, 1, 0.72, 0.92, 0.64],
              }
        }
        transition={
          prefersReducedMotion ? undefined : { duration: 10.5, repeat: Infinity, ease: 'easeInOut' }
        }
        style={{ willChange: 'transform, opacity' }}
      />
      <motion.div
        className="absolute -bottom-[24vh] -right-[24vw] h-[76vw] w-[76vw] rounded-full bg-[radial-gradient(circle,rgba(243,185,88,0.6)_0%,rgba(243,185,88,0.3)_36%,rgba(243,185,88,0)_76%)] blur-[76px]"
        animate={
          prefersReducedMotion
            ? { opacity: 0.8 }
            : {
                x: [0, -56, 20, -26, 0],
                y: [0, -44, 24, -14, 0],
                scale: [1, 1.22, 0.94, 1.1, 1],
                rotate: [0, -5, 3, -2, 0],
                opacity: [0.62, 0.98, 0.76, 0.9, 0.62],
              }
        }
        transition={
          prefersReducedMotion ? undefined : { duration: 11.2, repeat: Infinity, ease: 'easeInOut' }
        }
        style={{ willChange: 'transform, opacity' }}
      />
      <motion.div
        className="absolute -right-[10vw] -top-[12vh] hidden h-[36vw] w-[36vw] rounded-full bg-[radial-gradient(circle,rgba(255,236,196,0.48)_0%,rgba(255,236,196,0.22)_40%,rgba(255,236,196,0)_76%)] blur-[62px] sm:block"
        animate={
          prefersReducedMotion
            ? { opacity: 0.68 }
            : {
                x: [0, -34, 14, -18, 0],
                y: [0, 28, -18, 8, 0],
                scale: [1, 1.18, 0.9, 1.08, 1],
                rotate: [0, -3, 2, -1, 0],
                opacity: [0.46, 0.8, 0.54, 0.72, 0.46],
              }
        }
        transition={
          prefersReducedMotion ? undefined : { duration: 8.8, repeat: Infinity, ease: 'easeInOut' }
        }
        style={{ willChange: 'transform, opacity' }}
      />
      <motion.div
        className="absolute -left-[12vw] bottom-[8%] hidden h-[32vw] w-[32vw] rounded-full bg-[radial-gradient(circle,rgba(255,220,155,0.42)_0%,rgba(255,220,155,0.18)_42%,rgba(255,220,155,0)_76%)] blur-[58px] sm:block"
        animate={
          prefersReducedMotion
            ? { opacity: 0.62 }
            : {
                x: [0, 28, -14, 10, 0],
                y: [0, -24, 16, -10, 0],
                scale: [1, 1.16, 0.92, 1.06, 1],
                rotate: [0, 3, -2, 1, 0],
                opacity: [0.42, 0.74, 0.5, 0.66, 0.42],
              }
        }
        transition={
          prefersReducedMotion ? undefined : { duration: 9.4, repeat: Infinity, ease: 'easeInOut' }
        }
        style={{ willChange: 'transform, opacity' }}
      />
      {DUST_PARTICLES.map((particle, index) => (
        <motion.span
          key={`dust-${index}`}
          className={clsx('absolute rounded-full bg-[#ffe5b0]', index > 7 && 'hidden sm:block')}
          style={{
            left: particle.left,
            top: particle.top,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            boxShadow: '0 0 14px rgba(255, 219, 154, 0.75)',
            willChange: 'transform, opacity',
          }}
          animate={
            prefersReducedMotion
              ? { opacity: 0.55 }
              : {
                  y: [0, -20, 6, -12, 0],
                  x: [0, 8, -5, 3, 0],
                  opacity: [0.16, 0.92, 0.32, 0.78, 0.16],
                  scale: [0.78, 1.24, 0.9, 1.08, 0.78],
                }
          }
          transition={
            prefersReducedMotion
              ? undefined
              : {
                  duration: particle.duration * 0.72,
                  delay: particle.delay,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }
          }
        />
      ))}
    </div>
  );
}
