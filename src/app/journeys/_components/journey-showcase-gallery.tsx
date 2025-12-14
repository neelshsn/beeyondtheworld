'use client';

import clsx from 'clsx';
import useEmblaCarousel from 'embla-carousel-react';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import Image from 'next/image';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { useBodyScrollLock } from '@/app/concept/_hooks/use-body-scroll-lock';
import { usePrefersReducedMotion } from '@/app/concept/_hooks/use-prefers-reduced-motion';
import { SmartVideo } from '@/components/primitives/smart-video';
import { journeys } from '@/data/journeys-carousel';
import type { Journey, JourneySeason } from '@/types/journey';

type VideoSource = {
  src: string;
  type?: string;
};

type SeasonKey = 'all' | 'summer' | 'winter';

type SeasonBackground = {
  sources: VideoSource[];
  poster?: string;
};

const SEASON_OPTIONS = [
  { label: 'Show All', value: 'all' as const, icon: '/assets/icones/Ico White BEE-02.svg' },
  {
    label: 'Spring Summer',
    value: 'summer' as const,
    season: 'spring-summer' as JourneySeason,
    icon: '/assets/icones/Ico White BEE-14.svg',
  },
  {
    label: 'Fall Winter',
    value: 'winter' as const,
    season: 'fall-winter' as JourneySeason,
    icon: '/assets/icones/Ico White BEE-01.svg',
  },
];

const BACKGROUND_VIDEO_SOURCES = {
  all: [
    { src: '/assets/concept/sustainable.mp4', type: 'video/mp4' },
    { src: '/assets/concept/sustainable.webm', type: 'video/webm' },
  ],
  summer: [{ src: '/assets/journeys/unknown/Spring Summer cover filter.mp4', type: 'video/mp4' }],
  winter: [{ src: '/assets/journeys/unknown/Fall winter cover.mp4', type: 'video/mp4' }],
} satisfies Record<SeasonKey, VideoSource[]>;

const SEASON_BACKGROUNDS: Record<SeasonKey, SeasonBackground> = {
  all: {
    sources: BACKGROUND_VIDEO_SOURCES.all,
  },
  summer: {
    sources: BACKGROUND_VIDEO_SOURCES.summer,
  },
  winter: {
    sources: BACKGROUND_VIDEO_SOURCES.winter,
  },
};

type SeasonFilterValue = SeasonKey;

type FiltersState = {
  season: SeasonFilterValue;
};

function parseSeasonFilter(value: string | null) {
  if (value === 'summer') return 'summer' as const;
  if (value === 'winter') return 'winter' as const;
  return 'all' as const;
}

function filterJourneys(data: Journey[], filters: FiltersState) {
  return data.filter((journey) => {
    if (filters.season === 'summer' && journey.season !== 'spring-summer') {
      return false;
    }
    if (filters.season === 'winter' && journey.season !== 'fall-winter') {
      return false;
    }

    return true;
  });
}

function extractCountry(location: string) {
  const parts = location.split(',');
  const country = parts[parts.length - 1]?.trim();
  return country || location;
}

export function JourneyShowcaseGallery() {
  useBodyScrollLock();

  const prefersReducedMotion = usePrefersReducedMotion();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [filters, setFilters] = useState<FiltersState>(() => ({
    season: parseSeasonFilter(searchParams?.get('season') ?? null),
  }));

  useEffect(() => {
    const nextSeason = parseSeasonFilter(searchParams?.get('season') ?? null);
    setFilters((previous) =>
      previous.season === nextSeason ? previous : { ...previous, season: nextSeason }
    );
  }, [searchParams]);

  const filteredJourneys = useMemo(() => filterJourneys(journeys, filters), [filters]);
  const filteredIdsSignature = useMemo(
    () => filteredJourneys.map((journey) => journey.id).join('|'),
    [filteredJourneys]
  );
  const initialIndex = useMemo(() => {
    if (!filteredJourneys.length) {
      return 0;
    }
    return Math.floor(filteredJourneys.length / 2);
  }, [filteredJourneys.length]);

  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: 'center',
    loop: filteredJourneys.length > 1,
    skipSnaps: false,
  });

  const rootRef = useRef<HTMLDivElement | null>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const handleJourneyPress = useCallback(
    (journey: Journey) => {
      router.push(`/journeys/${journey.slug}`);
    },
    [router]
  );

  useEffect(() => {
    if (!emblaApi) {
      return;
    }

    const onSelect = () => {
      setSelectedIndex(emblaApi.selectedScrollSnap());
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

    const targetIndex =
      filteredJourneys.length > 0 ? Math.min(initialIndex, filteredJourneys.length - 1) : 0;

    emblaApi.reInit({
      align: 'center',
      loop: filteredJourneys.length > 1,
      skipSnaps: false,
      startIndex: targetIndex,
    });

    emblaApi.scrollTo(targetIndex, true);
    setSelectedIndex(targetIndex);
  }, [emblaApi, filteredJourneys.length, filteredIdsSignature, initialIndex]);

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
        handleJourneyPress(current);
      }
    };

    node.addEventListener('keydown', handleKeyDown);
    return () => {
      node.removeEventListener('keydown', handleKeyDown);
    };
  }, [emblaApi, filteredJourneys, handleJourneyPress]);

  useEffect(() => {
    if (!emblaApi) {
      return;
    }

    const handleWindowKeyDown = (event: KeyboardEvent) => {
      if (!filteredJourneys.length) {
        return;
      }

      const target = event.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)
      ) {
        return;
      }

      if (event.key === 'ArrowRight') {
        event.preventDefault();
        emblaApi.scrollNext();
      } else if (event.key === 'ArrowLeft') {
        event.preventDefault();
        emblaApi.scrollPrev();
      }
    };

    window.addEventListener('keydown', handleWindowKeyDown);
    return () => {
      window.removeEventListener('keydown', handleWindowKeyDown);
    };
  }, [emblaApi, filteredJourneys.length]);

  const handleSeasonChange = useCallback(
    (value: SeasonFilterValue) => {
      setFilters((previous) => ({ ...previous, season: value }));
      const params = new URLSearchParams(searchParams.toString());
      if (value === 'all') {
        params.delete('season');
      } else {
        params.set('season', value);
      }
      const query = params.toString();
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    },
    [pathname, router, searchParams]
  );

  const safeLength = filteredJourneys.length;
  const displayIndex = safeLength ? Math.min(selectedIndex, safeLength - 1) : 0;
  const progressValue = safeLength > 0 ? ((displayIndex + 1) / safeLength) * 100 : 0;
  const currentJourney = safeLength ? filteredJourneys[displayIndex] : null;

  const scrollPrev = useCallback(() => {
    emblaApi?.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    emblaApi?.scrollNext();
  }, [emblaApi]);

  return (
    <section
      ref={rootRef}
      className="relative flex min-h-screen flex-col overflow-hidden bg-black text-white"
      tabIndex={0}
      aria-label="Journey carousel section"
    >
      <div
        className="pointer-events-none absolute inset-x-0 top-0 z-30 h-0.5 overflow-hidden rounded-full bg-white/10"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={Math.max(1, safeLength)}
        aria-valuenow={safeLength ? displayIndex + 1 : 0}
        aria-valuetext={safeLength ? `${displayIndex + 1} of ${safeLength}` : '0 of 0'}
      >
        <div
          aria-hidden
          className="h-full w-full origin-left bg-gradient-to-r from-[#f6c452] via-[#f0a87a] to-[#f7d799]"
          style={{
            transform: `scaleX(${Math.max(0, Math.min(100, progressValue)) / 100})`,
            transformOrigin: 'left center',
            transition: 'transform 600ms var(--bee-ease)',
          }}
        />
      </div>
      <BackgroundVideo prefersReducedMotion={prefersReducedMotion} season={filters.season} />

      <div className="relative z-10 flex min-h-screen flex-col">
        <div className="sticky top-0 z-20 flex flex-col gap-4 px-6 pb-4 pt-6 backdrop-blur lg:px-12">
          <div className="flex flex-col gap-1 text-left">
            <span className="text-xs uppercase tracking-[0.32em] text-white/60">Upcoming</span>
            <h1 className="font-title text-2xl uppercase tracking-[0em] sm:text-3xl">
              Worldwide Journeys
            </h1>
          </div>
          <div className="flex justify-center">
            <SeasonTabs value={filters.season} onChange={handleSeasonChange} />
          </div>
        </div>

        <div className="relative flex flex-1 flex-col">
          <div className="relative mx-auto flex w-full max-w-[1400px] flex-1 flex-col px-4 pb-24 pt-16 sm:px-6 lg:px-12">
            {safeLength ? (
              <div className="embla" ref={emblaRef}>
                <motion.div
                  key={filteredIdsSignature}
                  className="embla__container -mx-4 flex touch-pan-x"
                  initial={prefersReducedMotion ? undefined : { opacity: 0.6, scale: 0.98 }}
                  animate={prefersReducedMotion ? undefined : { opacity: 1, scale: 1 }}
                  transition={{ duration: 0.45, ease: [0.33, 1, 0.68, 1] }}
                >
                  {filteredJourneys.map((journey, index) => (
                    <motion.div
                      key={journey.id}
                      className="embla__slide flex-[0_0_85%] px-4 sm:flex-[0_0_70%] md:flex-[0_0_50%] xl:flex-[0_0_33.333%]"
                      initial={prefersReducedMotion ? false : { opacity: 0, y: 32 }}
                      animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
                      transition={{
                        duration: 0.7,
                        ease: [0.33, 1, 0.68, 1],
                        delay: Math.min(index * 0.05, 0.3),
                      }}
                    >
                      <JourneyCard
                        journey={journey}
                        isActive={Boolean(currentJourney && currentJourney.id === journey.id)}
                        prefersReducedMotion={prefersReducedMotion}
                        onSelect={handleJourneyPress}
                        index={index}
                      />
                    </motion.div>
                  ))}
                </motion.div>
              </div>
            ) : (
              <div className="flex flex-1 items-center justify-center text-xs uppercase tracking-[0.32em] text-white/60">
                No journeys match the selected filters.
              </div>
            )}
            {safeLength ? (
              <div className="mt-6 flex justify-center">
                <div className="flex items-center gap-3 rounded-full bg-black/40 px-3 py-2 backdrop-blur">
                  <button
                    type="button"
                    onClick={scrollPrev}
                    className="flex h-12 w-12 items-center justify-center rounded-full text-white shadow-[0_15px_40px_rgba(0,0,0,0.45)] transition hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
                    aria-label="Previous journey"
                  >
                    <ArrowLeft className="h-5 w-5" aria-hidden />
                  </button>
                  <button
                    type="button"
                    onClick={scrollNext}
                    className="flex h-12 w-12 items-center justify-center rounded-full text-white shadow-[0_15px_40px_rgba(0,0,0,0.45)] transition hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
                    aria-label="Next journey"
                  >
                    <ArrowRight className="h-5 w-5" aria-hidden />
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}

type SeasonTabsProps = {
  value: SeasonFilterValue;
  onChange: (value: SeasonFilterValue) => void;
};

function SeasonTabs({ value, onChange }: SeasonTabsProps) {
  return (
    <div className="relative inline-flex items-center gap-3 bg-transparent px-4 py-3">
      {SEASON_OPTIONS.map((option) => {
        const isActive = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={clsx(
              'relative overflow-hidden rounded-full px-3 py-1.5 text-xs uppercase tracking-[0.26em] transition-colors sm:px-4 sm:py-2',
              isActive ? 'text-white' : 'text-white/65 hover:text-white'
            )}
          >
            <div className="flex items-center gap-2">
              <Image
                src={option.icon}
                alt=""
                width={32}
                height={32}
                className="h-7 w-7 sm:h-8 sm:w-8"
                priority
              />
              <span className="whitespace-nowrap">{option.label}</span>
            </div>
            {isActive ? (
              <motion.span
                layoutId="season-underline"
                className="pointer-events-none absolute bottom-[2px] left-0 right-0 mx-auto h-[2px] w-[92%] bg-gradient-to-r from-[#f6c452] via-[#f0a87a] to-[#f7d799]"
                transition={{ type: 'spring', bounce: 0.35, duration: 0.5 }}
              />
            ) : null}
          </button>
        );
      })}
    </div>
  );
}

type JourneyCardProps = {
  journey: Journey;
  isActive: boolean;
  prefersReducedMotion: boolean;
  onSelect: (journey: Journey) => void;
  index: number;
};

function JourneyCard({
  journey,
  isActive,
  prefersReducedMotion,
  onSelect,
  index,
}: JourneyCardProps) {
  return (
    <motion.button
      type="button"
      className={clsx(
        'group relative w-full focus:outline-none focus-visible:ring-2 focus-visible:ring-[#f6c452]/60 focus-visible:ring-offset-0',
        prefersReducedMotion
          ? 'transition-none'
          : 'transition-transform [transition-duration:680ms] [transition-timing-function:cubic-bezier(0.33,1,0.68,1)]'
      )}
      onClick={() => onSelect(journey)}
      aria-label={`Journey: ${journey.title}, ${journey.date}`}
      animate={prefersReducedMotion ? undefined : { scale: isActive ? 1 : 0.92, opacity: 1 }}
      whileHover={prefersReducedMotion ? undefined : { scale: 1.05, y: -12 }}
      transition={prefersReducedMotion ? undefined : { duration: 0.55, ease: [0.33, 1, 0.68, 1] }}
    >
      <div
        className="relative isolate flex min-h-[320px] w-full overflow-hidden rounded-none bg-white/5 shadow-[0_32px_90px_rgba(0,0,0,0.55)]"
        style={{ aspectRatio: '2 / 3' }}
      >
        <div className="absolute inset-0">
          <div
            className="absolute inset-0 scale-105 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
            style={{ backgroundImage: `url(${journey.image})` }}
          />
          <div
            className={clsx(
              'absolute inset-0 bg-gradient-to-t from-[rgba(9,6,4,0.9)] via-black/35 to-transparent',
              prefersReducedMotion
                ? 'opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100'
                : 'opacity-0 transition duration-500 group-hover:opacity-100 group-focus-visible:opacity-100'
            )}
          />
          <div
            className={clsx(
              'absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent',
              prefersReducedMotion
                ? 'opacity-0 group-hover:opacity-40 group-focus-visible:opacity-40'
                : 'opacity-0 transition duration-500 group-hover:opacity-40 group-focus-visible:opacity-40'
            )}
          />
        </div>

        <div className="pointer-events-none absolute inset-0 flex items-end justify-center">
          <div
            className={clsx(
              'mb-7 flex flex-col items-center gap-2 text-center text-white',
              prefersReducedMotion
                ? 'opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100'
                : 'translate-y-3 opacity-0 transition duration-500 group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100'
            )}
          >
            <h3 className="w-full font-title text-xl uppercase tracking-[0em] sm:text-2xl lg:text-[26px]">
              {extractCountry(journey.location)}
            </h3>
            <div className="text-[0.68rem] uppercase tracking-[0.38em] text-white/85">
              {journey.date}
            </div>
          </div>
        </div>
      </div>
    </motion.button>
  );
}

type BackgroundVideoProps = {
  prefersReducedMotion: boolean;
  season: SeasonFilterValue;
};

function BackgroundVideo({ prefersReducedMotion, season }: BackgroundVideoProps) {
  const background = SEASON_BACKGROUNDS[season] ?? SEASON_BACKGROUNDS.all;

  return (
    <div className="pointer-events-none absolute inset-0" aria-hidden>
      <div className="relative h-full w-full bg-black">
        <SmartVideo
          key={`${season}-background`}
          wrapperClassName="absolute inset-0"
          className="h-full w-full object-cover"
          sources={background.sources}
          autoPlay
          muted
          loop
          playsInline
          priority
          aria-hidden
        />
      </div>
    </div>
  );
}
