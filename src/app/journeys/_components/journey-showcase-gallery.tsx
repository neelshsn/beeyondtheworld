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
  { left: '4%', top: '10%', delay: 0, duration: 8.5, size: 2.8 },
  { left: '9%', top: '22%', delay: 0.7, duration: 10.2, size: 2.1 },
  { left: '14%', top: '34%', delay: 1.3, duration: 9.7, size: 2.4 },
  { left: '22%', top: '12%', delay: 2.1, duration: 11, size: 2.2 },
  { left: '28%', top: '25%', delay: 2.8, duration: 9.1, size: 1.9 },
  { left: '34%', top: '8%', delay: 3.2, duration: 12.3, size: 2.6 },
  { left: '42%', top: '18%', delay: 0.5, duration: 8.8, size: 2.2 },
  { left: '48%', top: '6%', delay: 1.8, duration: 10.8, size: 1.8 },
  { left: '54%', top: '24%', delay: 2.6, duration: 11.6, size: 2.1 },
  { left: '62%', top: '9%', delay: 0.3, duration: 9.4, size: 2.4 },
  { left: '68%', top: '16%', delay: 1.4, duration: 10.5, size: 2 },
  { left: '74%', top: '30%', delay: 2.7, duration: 8.9, size: 2.7 },
  { left: '82%', top: '12%', delay: 3.1, duration: 11.2, size: 2.3 },
  { left: '90%', top: '24%', delay: 0.9, duration: 9.8, size: 2.1 },
  { left: '95%', top: '36%', delay: 1.7, duration: 10.1, size: 1.9 },
  { left: '8%', top: '64%', delay: 2.4, duration: 12.1, size: 2.2 },
  { left: '16%', top: '78%', delay: 0.6, duration: 9.3, size: 2.7 },
  { left: '24%', top: '88%', delay: 1.5, duration: 10.4, size: 2.2 },
  { left: '33%', top: '72%', delay: 2.2, duration: 8.7, size: 2.5 },
  { left: '46%', top: '84%', delay: 3, duration: 11.5, size: 2 },
  { left: '57%', top: '92%', delay: 0.2, duration: 10.9, size: 2.4 },
  { left: '66%', top: '76%', delay: 1.1, duration: 9.2, size: 2.6 },
  { left: '76%', top: '86%', delay: 1.9, duration: 12.4, size: 2.1 },
  { left: '86%', top: '72%', delay: 2.5, duration: 10.7, size: 2.3 },
  { left: '94%', top: '82%', delay: 3.3, duration: 8.6, size: 1.8 },
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
        season={season}
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
  season: SeasonFilterValue;
};

function BackgroundImage({
  currentJourney,
  prefersReducedMotion,
  direction,
  season,
}: BackgroundImageProps) {
  const seasonOverlayClass = clsx(
    'absolute inset-[-18%] blur-[64px]',
    season === 'summer' &&
      'bg-[radial-gradient(60%_48%_at_18%_18%,rgba(255,193,96,0.34),rgba(255,193,96,0)_70%),radial-gradient(56%_46%_at_82%_84%,rgba(255,155,62,0.28),rgba(255,155,62,0)_72%)]',
    season === 'winter' &&
      'bg-[radial-gradient(60%_48%_at_18%_18%,rgba(152,198,255,0.3),rgba(152,198,255,0)_70%),radial-gradient(56%_46%_at_82%_84%,rgba(198,229,255,0.24),rgba(198,229,255,0)_72%)]',
    season === 'all' &&
      'bg-[radial-gradient(58%_46%_at_18%_20%,rgba(255,213,139,0.24),rgba(255,213,139,0)_70%),radial-gradient(56%_44%_at_82%_84%,rgba(255,232,186,0.2),rgba(255,232,186,0)_72%)]'
  );

  const seasonVeilClass = clsx(
    'absolute inset-[-10%] blur-[54px]',
    season === 'summer' &&
      'bg-[radial-gradient(50%_36%_at_50%_50%,rgba(255,207,128,0.2),rgba(255,207,128,0)_78%)]',
    season === 'winter' &&
      'bg-[radial-gradient(50%_36%_at_50%_50%,rgba(191,220,255,0.18),rgba(191,220,255,0)_78%)]',
    season === 'all' &&
      'bg-[radial-gradient(50%_36%_at_50%_50%,rgba(255,226,165,0.16),rgba(255,226,165,0)_78%)]'
  );

  return (
    <div className="pointer-events-none absolute inset-0" aria-hidden>
      {!prefersReducedMotion ? (
        <AnimatePresence initial={false} mode="wait">
          <motion.div
            key={`season-breath-${season}`}
            className={seasonOverlayClass}
            initial={{ opacity: 0 }}
            animate={{
              opacity: [0.22, 0.44, 0.28, 0.4, 0.22],
              scale: [0.98, 1.05, 1, 1.04, 0.98],
            }}
            exit={{ opacity: 0 }}
            transition={{
              opacity: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
              scale: { duration: 13.5, repeat: Infinity, ease: 'easeInOut' },
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
          animate={{
            opacity: [0.16, 0.3, 0.2, 0.28, 0.16],
            scale: [0.96, 1.04, 0.99, 1.02, 0.96],
          }}
          transition={{ duration: 10.8, repeat: Infinity, ease: 'easeInOut' }}
          style={{ willChange: 'transform, opacity' }}
        />
      ) : (
        <div className={seasonVeilClass} style={{ opacity: 0.2 }} />
      )}

      <AnimatePresence initial={false}>
        {currentJourney ? (
          <motion.div
            key={currentJourney.id}
            initial={
              prefersReducedMotion
                ? { opacity: 0 }
                : {
                    opacity: 0.12,
                    scale: 1.1,
                    x: direction > 0 ? 92 : -92,
                    filter: 'blur(7px)',
                  }
            }
            animate={{ opacity: 1, scale: 1, x: 0, filter: 'blur(0px)' }}
            exit={
              prefersReducedMotion
                ? { opacity: 0 }
                : {
                    opacity: 0.08,
                    scale: 1.05,
                    x: direction > 0 ? -70 : 70,
                    filter: 'blur(5px)',
                  }
            }
            transition={{
              duration: prefersReducedMotion ? 0.2 : 1.1,
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
        <AnimatePresence initial={false} mode="wait">
          {currentJourney ? (
            <motion.div
              key={`${currentJourney.id}-focus-halo`}
              className="absolute inset-0 overflow-hidden"
              initial={{ opacity: 0, x: direction > 0 ? 34 : -34, scale: 0.92 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: direction > 0 ? -26 : 26, scale: 0.94 }}
              transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
            >
              <motion.div
                className="absolute left-1/2 top-[46%] h-[86vw] w-[62vw] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(255,228,171,0.34)_0%,rgba(255,228,171,0.16)_32%,rgba(255,228,171,0)_74%)] blur-[62px] md:left-[41%] md:h-[58vw] md:w-[42vw]"
                animate={{
                  opacity: [0.38, 0.76, 0.5, 0.68, 0.38],
                  scale: [0.95, 1.08, 0.98, 1.05, 0.95],
                }}
                transition={{ duration: 6.8, repeat: Infinity, ease: 'easeInOut' }}
                style={{ willChange: 'transform, opacity' }}
              />
              <motion.div
                className="absolute left-1/2 top-[46%] h-[54vw] w-[40vw] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(255,245,214,0.2)_0%,rgba(255,245,214,0.08)_34%,rgba(255,245,214,0)_76%)] blur-[52px] md:left-[41%] md:h-[36vw] md:w-[26vw]"
                animate={{
                  opacity: [0.24, 0.52, 0.3, 0.44, 0.24],
                  scale: [0.94, 1.12, 0.98, 1.08, 0.94],
                }}
                transition={{ duration: 5.7, repeat: Infinity, ease: 'easeInOut' }}
                style={{ willChange: 'transform, opacity' }}
              />
            </motion.div>
          ) : null}
        </AnimatePresence>
      ) : null}

      {!prefersReducedMotion ? (
        <AnimatePresence initial={false}>
          {currentJourney ? (
            <motion.div
              key={`${currentJourney.id}-directional-pan-morph`}
              className="absolute inset-0 overflow-hidden"
              initial={{ opacity: 0.1 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.48 }}
            >
              <motion.div
                className="absolute inset-[-8%] bg-[linear-gradient(90deg,rgba(255,222,165,0)_0%,rgba(255,222,165,0.45)_36%,rgba(255,222,165,0.18)_50%,rgba(255,222,165,0.45)_64%,rgba(255,222,165,0)_100%)] blur-[6px]"
                initial={{ x: direction > 0 ? '22%' : '-22%', opacity: 0 }}
                animate={{
                  x: direction > 0 ? ['22%', '-20%'] : ['-22%', '20%'],
                  opacity: [0, 0.72, 0.24, 0],
                }}
                transition={{
                  duration: 1.12,
                  ease: [0.16, 1, 0.3, 1],
                  times: [0, 0.32, 0.7, 1],
                }}
                style={{ willChange: 'transform, opacity' }}
              />
              <motion.div
                className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.16)_0%,rgba(255,255,255,0)_38%,rgba(0,0,0,0.2)_100%)]"
                initial={{ x: direction > 0 ? '-10%' : '10%', opacity: 0.4, filter: 'blur(4px)' }}
                animate={{ x: '0%', opacity: [0.4, 0.22, 0.1], filter: 'blur(0px)' }}
                transition={{
                  duration: 1.18,
                  delay: 0.03,
                  ease: [0.16, 1, 0.3, 1],
                  times: [0, 0.52, 1],
                }}
                style={{ willChange: 'transform, opacity' }}
              />
              <motion.div
                className="absolute inset-0 bg-black"
                initial={{ opacity: 0.28 }}
                animate={{ opacity: [0.28, 0.08, 0] }}
                transition={{ duration: 0.82, ease: [0.22, 1, 0.36, 1] }}
                style={{ willChange: 'opacity' }}
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
        className="absolute inset-[-34%] bg-[radial-gradient(58%_48%_at_14%_16%,rgba(255,211,132,0.3),rgba(255,211,132,0)_62%),radial-gradient(56%_44%_at_86%_18%,rgba(255,199,111,0.24),rgba(255,199,111,0)_66%),radial-gradient(56%_44%_at_16%_84%,rgba(251,182,80,0.24),rgba(251,182,80,0)_66%),radial-gradient(58%_46%_at_88%_86%,rgba(246,176,74,0.28),rgba(246,176,74,0)_64%)] blur-[96px]"
        animate={
          prefersReducedMotion
            ? { opacity: 0.56 }
            : {
                x: [0, 26, -22, 14, 0],
                y: [0, -20, 18, -12, 0],
                opacity: [0.42, 0.72, 0.5, 0.66, 0.42],
                scale: [1, 1.06, 0.97, 1.03, 1],
              }
        }
        transition={
          prefersReducedMotion ? undefined : { duration: 12.6, repeat: Infinity, ease: 'easeInOut' }
        }
        style={{ willChange: 'transform, opacity' }}
      />
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
        className="absolute inset-[-20%] bg-[radial-gradient(45%_38%_at_46%_52%,rgba(247,188,92,0.2),rgba(247,188,92,0)_70%),radial-gradient(34%_30%_at_72%_42%,rgba(255,231,186,0.16),rgba(255,231,186,0)_72%)] blur-[76px]"
        animate={
          prefersReducedMotion
            ? { opacity: 0.42 }
            : {
                x: [0, -24, 18, -12, 0],
                y: [0, 18, -14, 10, 0],
                opacity: [0.3, 0.52, 0.38, 0.5, 0.3],
                scale: [1, 1.06, 0.97, 1.04, 1],
              }
        }
        transition={
          prefersReducedMotion ? undefined : { duration: 11.5, repeat: Infinity, ease: 'easeInOut' }
        }
        style={{ willChange: 'transform, opacity' }}
      />
      <motion.div
        className="absolute -left-[28vw] -top-[24vh] h-[70vw] w-[70vw] rounded-full bg-[radial-gradient(circle,rgba(255,204,108,0.8)_0%,rgba(255,204,108,0.4)_30%,rgba(255,204,108,0)_72%)] blur-[74px]"
        animate={
          prefersReducedMotion
            ? { opacity: 0.92 }
            : {
                x: [0, 42, -26, 20, 0],
                y: [0, 34, -24, 16, 0],
                scale: [1, 1.2, 0.9, 1.1, 1],
                opacity: [0.76, 1, 0.82, 0.96, 0.76],
              }
        }
        transition={
          prefersReducedMotion ? undefined : { duration: 9.2, repeat: Infinity, ease: 'easeInOut' }
        }
        style={{ willChange: 'transform, opacity' }}
      />
      <motion.div
        className="absolute -right-[25vw] -top-[22vh] h-[66vw] w-[66vw] rounded-full bg-[radial-gradient(circle,rgba(255,232,186,0.68)_0%,rgba(255,232,186,0.32)_34%,rgba(255,232,186,0)_74%)] blur-[72px]"
        animate={
          prefersReducedMotion
            ? { opacity: 0.82 }
            : {
                x: [0, -36, 22, -16, 0],
                y: [0, 30, -20, 12, 0],
                scale: [1, 1.18, 0.92, 1.08, 1],
                opacity: [0.62, 0.94, 0.7, 0.88, 0.62],
              }
        }
        transition={
          prefersReducedMotion ? undefined : { duration: 9.8, repeat: Infinity, ease: 'easeInOut' }
        }
        style={{ willChange: 'transform, opacity' }}
      />
      <motion.div
        className="absolute -bottom-[24vh] -left-[22vw] h-[64vw] w-[64vw] rounded-full bg-[radial-gradient(circle,rgba(255,191,84,0.72)_0%,rgba(255,191,84,0.34)_32%,rgba(255,191,84,0)_74%)] blur-[72px]"
        animate={
          prefersReducedMotion
            ? { opacity: 0.78 }
            : {
                x: [0, 32, -22, 12, 0],
                y: [0, -34, 20, -14, 0],
                scale: [1, 1.16, 0.9, 1.06, 1],
                opacity: [0.6, 0.92, 0.68, 0.84, 0.6],
              }
        }
        transition={
          prefersReducedMotion ? undefined : { duration: 9.1, repeat: Infinity, ease: 'easeInOut' }
        }
        style={{ willChange: 'transform, opacity' }}
      />
      <motion.div
        className="absolute -bottom-[24vh] -right-[24vw] h-[68vw] w-[68vw] rounded-full bg-[radial-gradient(circle,rgba(244,177,72,0.78)_0%,rgba(244,177,72,0.36)_33%,rgba(244,177,72,0)_74%)] blur-[76px]"
        animate={
          prefersReducedMotion
            ? { opacity: 0.86 }
            : {
                x: [0, -40, 24, -18, 0],
                y: [0, -36, 24, -14, 0],
                scale: [1, 1.2, 0.9, 1.1, 1],
                opacity: [0.68, 1, 0.78, 0.92, 0.68],
              }
        }
        transition={
          prefersReducedMotion ? undefined : { duration: 9.4, repeat: Infinity, ease: 'easeInOut' }
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
        className="absolute -right-[10vw] -top-[12vh] h-[36vw] w-[36vw] rounded-full bg-[radial-gradient(circle,rgba(255,236,196,0.48)_0%,rgba(255,236,196,0.22)_40%,rgba(255,236,196,0)_76%)] blur-[62px]"
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
        className="absolute -left-[12vw] bottom-[8%] h-[32vw] w-[32vw] rounded-full bg-[radial-gradient(circle,rgba(255,220,155,0.42)_0%,rgba(255,220,155,0.18)_42%,rgba(255,220,155,0)_76%)] blur-[58px]"
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
      <motion.div
        className="absolute left-[34%] top-[44%] h-[28vw] w-[28vw] rounded-full bg-[radial-gradient(circle,rgba(255,224,162,0.28)_0%,rgba(255,224,162,0.12)_38%,rgba(255,224,162,0)_76%)] blur-[54px]"
        animate={
          prefersReducedMotion
            ? { opacity: 0.42 }
            : {
                x: [0, 22, -18, 12, 0],
                y: [0, -18, 16, -10, 0],
                opacity: [0.26, 0.54, 0.34, 0.5, 0.26],
                scale: [0.95, 1.14, 0.92, 1.08, 0.95],
              }
        }
        transition={
          prefersReducedMotion ? undefined : { duration: 10.2, repeat: Infinity, ease: 'easeInOut' }
        }
        style={{ willChange: 'transform, opacity' }}
      />
      <motion.div
        className="absolute inset-[-6%] bg-[radial-gradient(60%_40%_at_50%_50%,rgba(255,231,186,0.14),rgba(255,231,186,0)_76%)] blur-[44px]"
        animate={
          prefersReducedMotion
            ? { opacity: 0.42 }
            : {
                opacity: [0.24, 0.5, 0.32, 0.44, 0.24],
                scale: [0.98, 1.03, 0.99, 1.02, 0.98],
              }
        }
        transition={
          prefersReducedMotion ? undefined : { duration: 8.4, repeat: Infinity, ease: 'easeInOut' }
        }
        style={{ willChange: 'transform, opacity' }}
      />
      {DUST_PARTICLES.map((particle, index) => (
        <motion.span
          key={`dust-${index}`}
          className="absolute rounded-full bg-[#ffe5b0]"
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
