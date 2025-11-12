'use client';

import clsx from 'clsx';
import useEmblaCarousel from 'embla-carousel-react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Building2,
  Check,
  ChevronDown,
  Filter,
  Flower2,
  Globe2,
  Leaf,
  Mountain,
  Search,
  Sparkles,
  Sun,
  Waves,
  X,
} from 'lucide-react';
import Image from 'next/image';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { useBodyScrollLock } from '@/app/concept/_hooks/use-body-scroll-lock';
import { usePrefersReducedMotion } from '@/app/concept/_hooks/use-prefers-reduced-motion';
import { journeys } from '@/data/journeys-carousel';
import type { Journey, JourneyMood, JourneyRegion, JourneySeason } from '@/types/journey';

const SEASON_OPTIONS = [
  { label: 'All', value: 'all' as const },
  {
    label: 'Spring Summer',
    value: 'summer' as const,
    season: 'spring-summer' as JourneySeason,
    icon: Flower2,
  },
  {
    label: 'Fall Winter',
    value: 'winter' as const,
    season: 'fall-winter' as JourneySeason,
    icon: Leaf,
  },
];

const REGION_OPTIONS: { value: JourneyRegion; label: string }[] = [
  { value: 'europe', label: 'Europe' },
  { value: 'asia', label: 'Asia' },
  { value: 'africa', label: 'Africa' },
  { value: 'americas', label: 'Americas' },
];

const MOOD_OPTIONS: { value: JourneyMood; label: string; icon: typeof Sparkles }[] = [
  { value: 'city', label: 'City', icon: Building2 },
  { value: 'nature', label: 'Nature', icon: Mountain },
  { value: 'beach', label: 'Beach', icon: Waves },
  { value: 'desert', label: 'Desert', icon: Sun },
  { value: 'spiritual', label: 'Spiritual', icon: Sparkles },
];

const REVEAL_TRANSITION = { duration: 0.6, ease: [0.33, 1, 0.68, 1] } as const;

const VIDEO_SOURCES = [
  { src: '/assets/concept/sustainable.mp4', type: 'video/mp4' },
  { src: '/assets/concept/sustainable.webm', type: 'video/webm' },
];

const VIDEO_POSTER = '/assets/concept/sustainable-poster.png';

type SeasonFilterValue = ReturnType<typeof parseSeasonFilter>;

type FiltersState = {
  season: SeasonFilterValue;
  regions: JourneyRegion[];
  moods: JourneyMood[];
  search: string;
};

function parseSeasonFilter(value: string | null) {
  if (value === 'summer') return 'summer' as const;
  if (value === 'winter') return 'winter' as const;
  return 'all' as const;
}

function filterJourneys(data: Journey[], filters: FiltersState) {
  const searchTerm = filters.search.trim().toLowerCase();

  return data.filter((journey) => {
    if (filters.season === 'summer' && journey.season !== 'spring-summer') {
      return false;
    }
    if (filters.season === 'winter' && journey.season !== 'fall-winter') {
      return false;
    }

    if (
      filters.regions.length > 0 &&
      !filters.regions.some((value) => journey.regions.includes(value))
    ) {
      return false;
    }

    if (filters.moods.length > 0 && !filters.moods.some((value) => journey.moods.includes(value))) {
      return false;
    }

    if (searchTerm) {
      const haystack = `${journey.title} ${journey.location}`.toLowerCase();
      if (!haystack.includes(searchTerm)) {
        return false;
      }
    }

    return true;
  });
}

export function JourneyShowcaseGallery() {
  useBodyScrollLock();

  const prefersReducedMotion = usePrefersReducedMotion();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [filters, setFilters] = useState<FiltersState>(() => ({
    season: parseSeasonFilter(searchParams?.get('season') ?? null),
    regions: [],
    moods: [],
    search: '',
  }));
  const [areFiltersOpen, setAreFiltersOpen] = useState(false);

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

    const handleWheel = (event: WheelEvent) => {
      const primaryDelta =
        Math.abs(event.deltaY) > Math.abs(event.deltaX) ? event.deltaY : event.deltaX;
      if (primaryDelta === 0) {
        return;
      }

      event.preventDefault();

      if (primaryDelta > 0) {
        emblaApi.scrollNext();
      } else {
        emblaApi.scrollPrev();
      }
    };

    node.addEventListener('wheel', handleWheel, { passive: false });
    return () => {
      node.removeEventListener('wheel', handleWheel);
    };
  }, [emblaApi]);

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

  const toggleRegion = useCallback((value: JourneyRegion) => {
    setFilters((previous) => {
      const hasValue = previous.regions.includes(value);
      return {
        ...previous,
        regions: hasValue
          ? previous.regions.filter((item) => item !== value)
          : [...previous.regions, value],
      };
    });
  }, []);

  const toggleMood = useCallback((value: JourneyMood) => {
    setFilters((previous) => {
      const hasValue = previous.moods.includes(value);
      return {
        ...previous,
        moods: hasValue
          ? previous.moods.filter((item) => item !== value)
          : [...previous.moods, value],
      };
    });
  }, []);

  const toggleFiltersVisibility = useCallback(() => {
    setAreFiltersOpen((previous) => !previous);
  }, []);

  const handleSearchChange = useCallback((value: string) => {
    setFilters((previous) => ({ ...previous, search: value }));
  }, []);

  const clearAllFilters = useCallback(() => {
    setFilters({
      season: 'all',
      regions: [],
      moods: [],
      search: '',
    });
    const params = new URLSearchParams(searchParams.toString());
    params.delete('season');
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }, [pathname, router, searchParams]);

  const activeTags = useMemo(() => {
    const tags: { key: string; label: string; onRemove: () => void }[] = [];

    if (filters.season === 'summer' || filters.season === 'winter') {
      const label =
        SEASON_OPTIONS.find((option) => option.value === filters.season)?.label ?? filters.season;
      tags.push({
        key: `season-${filters.season}`,
        label,
        onRemove: () => handleSeasonChange('all'),
      });
    }

    filters.regions.forEach((region) => {
      const label = REGION_OPTIONS.find((option) => option.value === region)?.label ?? region;
      tags.push({ key: `region-${region}`, label, onRemove: () => toggleRegion(region) });
    });

    filters.moods.forEach((mood) => {
      const label = MOOD_OPTIONS.find((option) => option.value === mood)?.label ?? mood;
      tags.push({ key: `mood-${mood}`, label, onRemove: () => toggleMood(mood) });
    });

    if (filters.search.trim()) {
      tags.push({
        key: 'search',
        label: `Search: ${filters.search.trim()}`,
        onRemove: () => handleSearchChange(''),
      });
    }

    return tags;
  }, [filters, handleSearchChange, handleSeasonChange, toggleMood, toggleRegion]);

  const activeTagCount = activeTags.length;

  const safeLength = filteredJourneys.length;
  const displayIndex = safeLength ? Math.min(selectedIndex, safeLength - 1) : 0;
  const progressValue = safeLength > 0 ? ((displayIndex + 1) / safeLength) * 100 : 0;
  const progressLabel = safeLength
    ? `${String(displayIndex + 1).padStart(2, '0')} / ${String(safeLength).padStart(2, '0')}`
    : '00 / 00';
  const currentJourney = safeLength ? filteredJourneys[displayIndex] : null;

  return (
    <section
      ref={rootRef}
      className="relative flex min-h-screen flex-col overflow-hidden bg-black text-white"
      tabIndex={0}
      aria-label="Journey carousel section"
    >
      <div
        className="pointer-events-none absolute inset-x-0 top-0 z-30 h-1 overflow-hidden rounded-full bg-white/10"
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
      <BackgroundVideo prefersReducedMotion={prefersReducedMotion} />

      <div className="relative z-10 flex min-h-screen flex-col">
        <div className="sticky top-0 z-20 flex flex-col gap-5 px-6 pb-6 pt-10 backdrop-blur lg:px-12">
          <div className="flex flex-wrap items-center gap-6">
            <div className="flex flex-col gap-2">
              <span className="text-xs uppercase tracking-[0.32em] text-white/60">
                Journey Atlas
              </span>
              <h1 className="font-title text-2xl uppercase tracking-[0.24em] sm:text-3xl">
                All Journeys
              </h1>
            </div>
          </div>

          <AnimatePresence initial={false}>
            {areFiltersOpen ? (
              <motion.div
                key="journey-filters"
                id="journey-filters-panel"
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
              >
                <FilterToolbar
                  filters={filters}
                  onSeasonChange={handleSeasonChange}
                  onRegionToggle={toggleRegion}
                  onMoodToggle={toggleMood}
                  onSearchChange={handleSearchChange}
                />
              </motion.div>
            ) : null}
          </AnimatePresence>

          {activeTagCount > 0 ? (
            <div className="flex flex-wrap gap-2">
              {activeTags.map((tag) => (
                <button
                  key={tag.key}
                  type="button"
                  onClick={tag.onRemove}
                  className="group inline-flex items-center gap-1 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[0.68rem] uppercase tracking-[0.28em] text-white/80 transition hover:border-white/40 hover:bg-white/20"
                >
                  <span>{tag.label}</span>
                  <X className="size-3 transition group-hover:rotate-90" aria-hidden />
                </button>
              ))}
              {activeTagCount > 1 ? (
                <button
                  type="button"
                  onClick={clearAllFilters}
                  className="inline-flex items-center gap-1 rounded-full border border-white/20 px-3 py-1 text-[0.68rem] uppercase tracking-[0.28em] text-white/70 transition hover:border-white/50 hover:text-white"
                >
                  Clear all
                </button>
              ) : null}
            </div>
          ) : null}
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
          </div>

          {safeLength > 0 ? (
            <div className="absolute inset-x-0 bottom-10 flex justify-center">
              <div className="pointer-events-auto flex items-center gap-4 rounded-full border border-white/15 bg-black/50 px-6 py-3 backdrop-blur">
                <span className="text-xs uppercase tracking-[0.32em] text-white/70">
                  {progressLabel}
                </span>
                <button
                  type="button"
                  onClick={toggleFiltersVisibility}
                  aria-expanded={areFiltersOpen}
                  aria-controls="journey-filters-panel"
                  className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-black/40 px-3 py-1 text-xs uppercase tracking-[0.28em] text-white/70 transition hover:border-white/30 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
                >
                  <Filter className="size-4" aria-hidden />
                  <span>{areFiltersOpen ? 'Hide filters' : 'Filters'}</span>
                </button>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}

type FilterToolbarProps = {
  filters: FiltersState;
  onSeasonChange: (value: SeasonFilterValue) => void;
  onRegionToggle: (value: JourneyRegion) => void;
  onMoodToggle: (value: JourneyMood) => void;
  onSearchChange: (value: string) => void;
};

function FilterToolbar({
  filters,
  onSeasonChange,
  onRegionToggle,
  onMoodToggle,
  onSearchChange,
}: FilterToolbarProps) {
  return (
    <div className="flex w-full flex-wrap items-center justify-between gap-3 rounded-xl bg-black/40 px-4 py-2 text-xs uppercase tracking-[0.24em] backdrop-blur-md">
      <div className="flex flex-1 flex-wrap items-center gap-3">
        <SeasonTabs value={filters.season} onChange={onSeasonChange} />
        <FilterDropdown
          label="Region"
          icon={Globe2}
          options={REGION_OPTIONS.map((option) => ({ ...option, icon: Globe2 }))}
          selectedValues={filters.regions}
          onToggle={(value) => onRegionToggle(value as JourneyRegion)}
        />
        <FilterDropdown
          label="Mood"
          icon={Sparkles}
          options={MOOD_OPTIONS}
          selectedValues={filters.moods}
          onToggle={(value) => onMoodToggle(value as JourneyMood)}
        />
      </div>
      <SearchInput value={filters.search} onChange={onSearchChange} />
    </div>
  );
}

type SeasonTabsProps = {
  value: SeasonFilterValue;
  onChange: (value: SeasonFilterValue) => void;
};

function SeasonTabs({ value, onChange }: SeasonTabsProps) {
  return (
    <div className="relative flex items-center gap-1 rounded-xl bg-black/40 px-2 py-1 backdrop-blur">
      {SEASON_OPTIONS.map((option) => {
        const isActive = option.value === value;
        const Icon = option.icon;
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={clsx(
              'relative rounded-full px-4 py-1 text-sm uppercase tracking-[0.28em] transition',
              isActive ? 'text-white' : 'text-white/60 hover:text-white'
            )}
          >
            <div className="flex items-center gap-2">
              {Icon ? <Icon className="size-3.5" aria-hidden /> : null}
              <span>{option.label}</span>
            </div>
            {isActive ? (
              <motion.span
                layoutId="season-underline"
                className="absolute inset-x-3 -bottom-1 h-0.5 bg-white"
                transition={{ type: 'spring', bounce: 0.3, duration: 0.5 }}
              />
            ) : null}
          </button>
        );
      })}
    </div>
  );
}

type FilterDropdownOption = {
  value: string;
  label: string;
  icon?: typeof Sparkles;
};

type FilterDropdownProps = {
  label: string;
  icon: typeof Sparkles;
  options: FilterDropdownOption[];
  selectedValues: string[];
  onToggle: (value: string) => void;
};

function FilterDropdown({
  label,
  icon: Icon,
  options,
  selectedValues,
  onToggle,
}: FilterDropdownProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    const handleClickOutside = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [open]);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((previous) => !previous)}
        className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-black/40 px-3 py-1 text-sm uppercase tracking-[0.28em] text-white/70 transition hover:border-white/30 hover:text-white"
      >
        <Icon className="size-3.5" aria-hidden />
        <span>{label}</span>
        <ChevronDown className={clsx('size-3 transition', open && '-scale-y-100')} aria-hidden />
      </button>

      <AnimatePresence>
        {open ? (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className="absolute left-0 right-auto z-40 mt-2 min-w-[220px] rounded-2xl border border-white/10 bg-black/80 p-3 text-left shadow-[0_20px_60px_rgba(0,0,0,0.45)] backdrop-blur"
          >
            {options.map((option) => {
              const isActive = selectedValues.includes(option.value);
              const OptionIcon = option.icon ?? Icon;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => onToggle(option.value)}
                  className={clsx(
                    'flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2 text-sm uppercase tracking-[0.24em] transition',
                    isActive
                      ? 'bg-white/15 text-white'
                      : 'text-white/70 hover:bg-white/10 hover:text-white'
                  )}
                >
                  <span className="flex items-center gap-3">
                    <OptionIcon className="size-4" aria-hidden />
                    {option.label}
                  </span>
                  {isActive ? <Check className="size-4" aria-hidden /> : null}
                </button>
              );
            })}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

type SearchInputProps = {
  value: string;
  onChange: (value: string) => void;
};

function SearchInput({ value, onChange }: SearchInputProps) {
  return (
    <div className="border-white/12 flex items-center gap-2 rounded-full border bg-black/40 px-3 py-1 backdrop-blur">
      <Search className="size-4 text-white/60" aria-hidden />
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        type="search"
        placeholder="Search journeys"
        className="w-[160px] bg-transparent text-sm uppercase tracking-[0.28em] text-white placeholder:text-white/40 focus:outline-none sm:w-[220px]"
      />
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
  const [isRevealed, setIsRevealed] = useState(false);

  const handleReveal = (state: boolean) => {
    setIsRevealed(state);
  };

  return (
    <motion.button
      type="button"
      className={clsx(
        'group relative w-full focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70',
        prefersReducedMotion
          ? 'transition-none'
          : 'transition-transform [transition-duration:680ms] [transition-timing-function:cubic-bezier(0.33,1,0.68,1)]'
      )}
      onMouseEnter={() => handleReveal(true)}
      onMouseLeave={() => handleReveal(false)}
      onFocus={() => handleReveal(true)}
      onBlur={() => handleReveal(false)}
      onClick={() => onSelect(journey)}
      aria-label={`Journey: ${journey.title}, ${journey.date}`}
      animate={
        prefersReducedMotion
          ? undefined
          : { scale: isActive ? 1 : 0.92, opacity: isActive ? 1 : 0.7 }
      }
      whileHover={prefersReducedMotion ? undefined : { scale: 1.05, y: -12 }}
      transition={prefersReducedMotion ? undefined : { duration: 0.55, ease: [0.33, 1, 0.68, 1] }}
    >
      <div className="relative aspect-[2/3] w-full overflow-hidden border border-white/15 bg-white/5 shadow-[0_32px_90px_rgba(0,0,0,0.55)]">
        <Image
          src={journey.image}
          alt={journey.title}
          fill
          sizes="(min-width: 1280px) 28vw, (min-width: 768px) 45vw, 80vw"
          className="object-cover"
          priority={index < 2}
        />
        <motion.div
          className="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-black/70"
          animate={isRevealed ? { opacity: 1 } : { opacity: 0 }}
          transition={prefersReducedMotion ? undefined : REVEAL_TRANSITION}
        />
        <motion.div
          className="pointer-events-none absolute left-0 right-0 top-0 flex justify-center px-6 pt-6 text-center"
          initial={false}
          animate={isRevealed ? { y: 0, opacity: 1 } : { y: '-45%', opacity: 0 }}
          transition={prefersReducedMotion ? undefined : REVEAL_TRANSITION}
        >
          <span className="max-w-[80%] font-title text-lg uppercase tracking-[0.32em] text-white">
            {journey.title}
          </span>
        </motion.div>
        <motion.div
          className="pointer-events-none absolute inset-x-0 bottom-0 flex flex-col items-center gap-2 px-6 pb-8 text-[0.65rem] uppercase tracking-[0.38em] text-white"
          initial={false}
          animate={isRevealed ? { y: 0, opacity: 1 } : { y: '45%', opacity: 0 }}
          transition={prefersReducedMotion ? undefined : REVEAL_TRANSITION}
        >
          <span>{journey.date}</span>
          <span className="text-white/75">{journey.location}</span>
        </motion.div>
      </div>
    </motion.button>
  );
}

type BackgroundVideoProps = {
  prefersReducedMotion: boolean;
};

function BackgroundVideo({ prefersReducedMotion }: BackgroundVideoProps) {
  return (
    <div className="pointer-events-none absolute inset-0" aria-hidden>
      <div className="relative h-full w-full bg-black">
        {prefersReducedMotion ? (
          <Image src={VIDEO_POSTER} alt="" fill priority sizes="100vw" className="object-cover" />
        ) : (
          <video
            className="absolute inset-0 h-full w-full object-cover"
            autoPlay
            muted
            loop
            playsInline
            poster={VIDEO_POSTER}
          >
            {VIDEO_SOURCES.map((source) => (
              <source key={source.type} src={source.src} type={source.type} />
            ))}
          </video>
        )}
        <div className="absolute inset-0 bg-gradient-to-br from-black/80 via-black/60 to-black/30" />
      </div>
    </div>
  );
}
