'use client';

import clsx from 'clsx';
import useEmblaCarousel from 'embla-carousel-react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Brush,
  Calendar,
  Camera,
  Check,
  ChevronDown,
  Clapperboard,
  Filter,
  Gem,
  Globe,
  PenSquare,
  Search,
  Tag,
  UserCircle,
  Users,
  X,
} from 'lucide-react';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import type { ReadonlyURLSearchParams } from 'next/navigation';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { useBodyScrollLock } from '@/app/concept/_hooks/use-body-scroll-lock';
import { usePrefersReducedMotion } from '@/app/concept/_hooks/use-prefers-reduced-motion';
import { campaigns } from '@/data/campaigns-carousel';
import type { Campaign } from '@/types/campaign';

const REVEAL_TRANSITION = { duration: 0.6, ease: [0.33, 1, 0.68, 1] } as const;

const VIDEO_SOURCES = [
  { src: '/assets/concept/sustainable.mp4', type: 'video/mp4' },
  { src: '/assets/concept/sustainable.webm', type: 'video/webm' },
];

const VIDEO_POSTER = '/assets/concept/sustainable-poster.png';

type IconComponent = typeof Brush;

type ArrayFilterKey =
  | 'shootYears'
  | 'countries'
  | 'brands'
  | 'brandTypes'
  | 'artDirectors'
  | 'talents'
  | 'dops'
  | 'productionTeam'
  | 'models'
  | 'makeupArtists';

type FiltersState = {
  shootYears: string[];
  countries: string[];
  brands: string[];
  brandTypes: string[];
  artDirectors: string[];
  talents: string[];
  dops: string[];
  productionTeam: string[];
  models: string[];
  makeupArtists: string[];
  search: string;
};

type FilterDropdownOption = {
  value: string;
  label: string;
  icon?: IconComponent;
};

type FilterDefinition = {
  key: ArrayFilterKey;
  label: string;
  icon: IconComponent;
  options: FilterDropdownOption[];
};

const sortAlpha = (a: string, b: string) => a.localeCompare(b);
const sortNumericDesc = (a: string, b: string) => Number(b) - Number(a);

function createOptions(values: string[], sortFn: (a: string, b: string) => number = sortAlpha) {
  return Array.from(
    new Set(values.map((value) => value.trim()).filter((value) => value.length > 0))
  )
    .sort(sortFn)
    .map((value) => ({ value, label: value }));
}

const SHOOT_YEAR_OPTIONS = createOptions(
  campaigns.map((campaign) => String(campaign.shootYear)),
  sortNumericDesc
);
const COUNTRY_OPTIONS = createOptions(campaigns.map((campaign) => campaign.country));
const BRAND_OPTIONS = createOptions(campaigns.map((campaign) => campaign.client));
const BRAND_TYPE_OPTIONS = createOptions(campaigns.map((campaign) => campaign.brandType));
const ART_DIRECTOR_OPTIONS = createOptions(campaigns.map((campaign) => campaign.artDirector));
const TALENT_OPTIONS = createOptions(campaigns.map((campaign) => campaign.talent));
const DOP_OPTIONS = createOptions(campaigns.map((campaign) => campaign.dop));
const PRODUCTION_TEAM_OPTIONS = createOptions(
  campaigns.flatMap((campaign) => campaign.productionTeam)
);
const MODEL_OPTIONS = createOptions(campaigns.flatMap((campaign) => campaign.models));
const MAKEUP_ARTIST_OPTIONS = createOptions(
  campaigns.flatMap((campaign) => campaign.makeupArtists)
);

const FILTER_DEFINITIONS: FilterDefinition[] = [
  { key: 'shootYears', label: 'Year', icon: Calendar, options: SHOOT_YEAR_OPTIONS },
  { key: 'countries', label: 'Country', icon: Globe, options: COUNTRY_OPTIONS },
  { key: 'brands', label: 'Brand', icon: Gem, options: BRAND_OPTIONS },
  { key: 'brandTypes', label: 'Brand Type', icon: Tag, options: BRAND_TYPE_OPTIONS },
  { key: 'artDirectors', label: 'DA', icon: PenSquare, options: ART_DIRECTOR_OPTIONS },
  { key: 'talents', label: 'Talent', icon: Camera, options: TALENT_OPTIONS },
  { key: 'dops', label: 'DOP', icon: Clapperboard, options: DOP_OPTIONS },
  { key: 'productionTeam', label: 'Production', icon: Users, options: PRODUCTION_TEAM_OPTIONS },
  { key: 'models', label: 'Models', icon: UserCircle, options: MODEL_OPTIONS },
  { key: 'makeupArtists', label: 'MUA', icon: Brush, options: MAKEUP_ARTIST_OPTIONS },
];

function createEmptyFilters(): FiltersState {
  return {
    shootYears: [],
    countries: [],
    brands: [],
    brandTypes: [],
    artDirectors: [],
    talents: [],
    dops: [],
    productionTeam: [],
    models: [],
    makeupArtists: [],
    search: '',
  };
}

const FILTER_KEYS = FILTER_DEFINITIONS.map((definition) => definition.key);

function sanitizeQueryValues(values: string[]) {
  return values.map((value) => value.trim()).filter((value) => value.length > 0);
}

function createFiltersFromSearchParams(searchParams: ReadonlyURLSearchParams | null): FiltersState {
  const base = createEmptyFilters();

  if (!searchParams) {
    return base;
  }

  for (const definition of FILTER_DEFINITIONS) {
    const combined = sanitizeQueryValues(searchParams.getAll(definition.key));

    if (definition.key === 'countries') {
      combined.push(...sanitizeQueryValues(searchParams.getAll('country')));
    }

    if (combined.length > 0) {
      base[definition.key] = Array.from(new Set(combined));
    }
  }

  const searchValue = searchParams.get('search');
  if (typeof searchValue === 'string' && searchValue.trim().length > 0) {
    base.search = searchValue;
  }

  return base;
}

function filtersAreEqual(a: FiltersState, b: FiltersState) {
  if (a.search !== b.search) {
    return false;
  }

  for (const key of FILTER_KEYS) {
    const aValues = [...a[key]].sort();
    const bValues = [...b[key]].sort();

    if (aValues.length !== bValues.length) {
      return false;
    }

    for (let index = 0; index < aValues.length; index += 1) {
      if (aValues[index] !== bValues[index]) {
        return false;
      }
    }
  }

  return true;
}

function filterCampaigns(data: Campaign[], filters: FiltersState) {
  const searchTerm = filters.search.trim().toLowerCase();

  return data.filter((campaign) => {
    if (filters.shootYears.length > 0 && !filters.shootYears.includes(String(campaign.shootYear))) {
      return false;
    }

    if (filters.countries.length > 0 && !filters.countries.includes(campaign.country)) {
      return false;
    }

    if (filters.brands.length > 0 && !filters.brands.includes(campaign.client)) {
      return false;
    }

    if (filters.brandTypes.length > 0 && !filters.brandTypes.includes(campaign.brandType)) {
      return false;
    }

    if (filters.artDirectors.length > 0 && !filters.artDirectors.includes(campaign.artDirector)) {
      return false;
    }

    if (filters.talents.length > 0 && !filters.talents.includes(campaign.talent)) {
      return false;
    }

    if (filters.dops.length > 0 && !filters.dops.includes(campaign.dop)) {
      return false;
    }

    if (
      filters.productionTeam.length > 0 &&
      !filters.productionTeam.some((value) => campaign.productionTeam.includes(value))
    ) {
      return false;
    }

    if (
      filters.models.length > 0 &&
      !filters.models.some((value) => campaign.models.includes(value))
    ) {
      return false;
    }

    if (
      filters.makeupArtists.length > 0 &&
      !filters.makeupArtists.some((value) => campaign.makeupArtists.includes(value))
    ) {
      return false;
    }

    if (searchTerm) {
      const haystack = [
        campaign.title,
        campaign.client,
        campaign.destination,
        campaign.country,
        campaign.brandType,
        campaign.artDirector,
        campaign.talent,
        campaign.dop,
        campaign.productionTeam.join(' '),
        campaign.models.join(' '),
        campaign.makeupArtists.join(' '),
        String(campaign.shootYear),
        campaign.releaseWindow,
      ]
        .join(' ')
        .toLowerCase();

      if (!haystack.includes(searchTerm)) {
        return false;
      }
    }

    return true;
  });
}

export function CampaignShowcaseGallery() {
  useBodyScrollLock();

  const prefersReducedMotion = usePrefersReducedMotion();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [filters, setFilters] = useState<FiltersState>(() =>
    createFiltersFromSearchParams(searchParams)
  );
  const [areFiltersOpen, setAreFiltersOpen] = useState(false);

  useEffect(() => {
    const next = createFiltersFromSearchParams(searchParams);
    setFilters((previous) => (filtersAreEqual(previous, next) ? previous : next));
  }, [searchParams]);

  const filteredCampaigns = useMemo(() => filterCampaigns(campaigns, filters), [filters]);
  const filteredIdsSignature = useMemo(
    () => filteredCampaigns.map((campaign) => campaign.id).join('|'),
    [filteredCampaigns]
  );
  const initialIndex = useMemo(() => {
    if (!filteredCampaigns.length) {
      return 0;
    }
    return Math.floor(filteredCampaigns.length / 2);
  }, [filteredCampaigns.length]);

  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: 'center',
    loop: filteredCampaigns.length > 1,
    skipSnaps: false,
  });

  const rootRef = useRef<HTMLDivElement | null>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const handleCampaignPress = useCallback(
    (campaign: Campaign) => {
      router.push(`/campaigns/${campaign.slug}`);
    },
    [router]
  );

  const handleSearchChange = useCallback((value: string) => {
    setFilters((previous) => ({ ...previous, search: value }));
  }, []);

  const toggleFiltersVisibility = useCallback(() => {
    setAreFiltersOpen((previous) => !previous);
  }, []);

  const toggleFilterValue = useCallback((key: ArrayFilterKey, value: string) => {
    setFilters((previous) => {
      const currentValues = previous[key] as string[];
      const hasValue = currentValues.includes(value);
      const nextValues = hasValue
        ? currentValues.filter((item) => item !== value)
        : [...currentValues, value];
      return { ...previous, [key]: nextValues };
    });
  }, []);

  const clearAllFilters = useCallback(() => {
    setFilters(createEmptyFilters());
  }, []);

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
      filteredCampaigns.length > 0 ? Math.min(initialIndex, filteredCampaigns.length - 1) : 0;

    emblaApi.reInit({
      align: 'center',
      loop: filteredCampaigns.length > 1,
      skipSnaps: false,
      startIndex: targetIndex,
    });

    emblaApi.scrollTo(targetIndex, true);
    setSelectedIndex(targetIndex);
  }, [emblaApi, filteredCampaigns.length, filteredIdsSignature, initialIndex]);

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
      if (!filteredCampaigns.length || event.key !== 'Enter') {
        return;
      }

      event.preventDefault();
      const current = filteredCampaigns[emblaApi.selectedScrollSnap()];
      if (current) {
        handleCampaignPress(current);
      }
    };

    node.addEventListener('keydown', handleKeyDown);
    return () => {
      node.removeEventListener('keydown', handleKeyDown);
    };
  }, [emblaApi, filteredCampaigns, handleCampaignPress]);

  useEffect(() => {
    if (!emblaApi) {
      return;
    }

    const handleWindowKeyDown = (event: KeyboardEvent) => {
      if (!filteredCampaigns.length) {
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
  }, [emblaApi, filteredCampaigns.length]);

  const activeTags = useMemo(() => {
    const tags: { key: string; label: string; onRemove: () => void }[] = [];

    FILTER_DEFINITIONS.forEach((definition) => {
      const selectedValues = filters[definition.key] as string[];
      if (!selectedValues.length) {
        return;
      }

      selectedValues.forEach((value) => {
        const optionLabel =
          definition.options.find((option) => option.value === value)?.label ?? value;
        tags.push({
          key: `${definition.key}-${value}`,
          label: `${definition.label}: ${optionLabel}`,
          onRemove: () => toggleFilterValue(definition.key, value),
        });
      });
    });

    if (filters.search.trim()) {
      tags.push({
        key: 'search',
        label: `Search: ${filters.search.trim()}`,
        onRemove: () => handleSearchChange(''),
      });
    }

    return tags;
  }, [filters, handleSearchChange, toggleFilterValue]);

  const activeTagCount = activeTags.length;

  const safeLength = filteredCampaigns.length;
  const displayIndex = safeLength ? Math.min(selectedIndex, safeLength - 1) : 0;
  const progressValue = safeLength > 0 ? ((displayIndex + 1) / safeLength) * 100 : 0;
  const progressLabel = safeLength
    ? `${String(displayIndex + 1).padStart(2, '0')} / ${String(safeLength).padStart(2, '0')}`
    : '00 / 00';
  const currentCampaign = safeLength ? filteredCampaigns[displayIndex] : null;

  return (
    <section
      ref={rootRef}
      className="relative flex min-h-screen flex-col overflow-hidden bg-black text-white"
      tabIndex={0}
      aria-label="Campaign carousel section"
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
                Campaign Library
              </span>
              <h1 className="font-title text-2xl uppercase tracking-[0em] sm:text-3xl">
                Previous Work
              </h1>
            </div>
          </div>

          <AnimatePresence initial={false}>
            {areFiltersOpen ? (
              <motion.div
                key="campaign-filters"
                id="campaign-filters-panel"
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
              >
                <FilterToolbar
                  filters={filters}
                  definitions={FILTER_DEFINITIONS}
                  onToggle={toggleFilterValue}
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
                  {filteredCampaigns.map((campaign, index) => (
                    <motion.div
                      key={campaign.id}
                      className="embla__slide flex-[0_0_85%] px-4 sm:flex-[0_0_70%] md:flex-[0_0_50%] xl:flex-[0_0_33.333%]"
                      initial={prefersReducedMotion ? false : { opacity: 0, y: 32 }}
                      animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
                      transition={{
                        duration: 0.7,
                        ease: [0.33, 1, 0.68, 1],
                        delay: Math.min(index * 0.05, 0.3),
                      }}
                    >
                      <CampaignCard
                        campaign={campaign}
                        isActive={Boolean(currentCampaign && currentCampaign.id === campaign.id)}
                        prefersReducedMotion={prefersReducedMotion}
                        onSelect={handleCampaignPress}
                        index={index}
                      />
                    </motion.div>
                  ))}
                </motion.div>
              </div>
            ) : (
              <div className="flex flex-1 items-center justify-center text-xs uppercase tracking-[0.32em] text-white/60">
                No campaigns match the selected filters.
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
                  aria-controls="campaign-filters-panel"
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
  definitions: FilterDefinition[];
  onToggle: (key: ArrayFilterKey, value: string) => void;
  onSearchChange: (value: string) => void;
};

function FilterToolbar({ filters, definitions, onToggle, onSearchChange }: FilterToolbarProps) {
  return (
    <div className="flex w-full flex-wrap items-center justify-between gap-3 rounded-xl bg-black/40 px-4 py-2 text-xs uppercase tracking-[0.24em] backdrop-blur-md">
      <div className="flex flex-1 flex-wrap items-center gap-3">
        {definitions
          .filter((definition) => definition.options.length > 0)
          .map((definition) => (
            <FilterDropdown
              key={definition.key}
              label={definition.label}
              icon={definition.icon}
              options={definition.options}
              selectedValues={filters[definition.key] as string[]}
              onToggle={(value) => onToggle(definition.key, value)}
            />
          ))}
      </div>
      <SearchInput value={filters.search} onChange={onSearchChange} />
    </div>
  );
}

type FilterDropdownProps = {
  label: string;
  icon: IconComponent;
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
        placeholder="Search campaigns"
        className="w-[160px] bg-transparent text-sm uppercase tracking-[0.28em] text-white placeholder:text-white/40 focus:outline-none sm:w-[220px]"
      />
    </div>
  );
}

type CampaignCardProps = {
  campaign: Campaign;
  isActive: boolean;
  prefersReducedMotion: boolean;
  onSelect: (campaign: Campaign) => void;
  index: number;
};

function CampaignCard({
  campaign,
  isActive,
  prefersReducedMotion,
  onSelect,
  index,
}: CampaignCardProps) {
  const [isRevealed, setIsRevealed] = useState(false);

  const handleReveal = (state: boolean) => {
    setIsRevealed(state);
  };

  const showVideo = Boolean(campaign.cardVideo && !prefersReducedMotion);
  const poster = campaign.cardPoster ?? campaign.cover;
  const isPriority = index === 0;

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
      onClick={() => onSelect(campaign)}
      aria-label={`Campaign: ${campaign.client}, ${campaign.releaseWindow}`}
      animate={
        prefersReducedMotion
          ? undefined
          : { scale: isActive ? 1 : 0.92, opacity: isActive ? 1 : 0.7 }
      }
      whileHover={prefersReducedMotion ? undefined : { scale: 1.05, y: -12 }}
      transition={prefersReducedMotion ? undefined : { duration: 0.55, ease: [0.33, 1, 0.68, 1] }}
    >
      <div className="relative aspect-[2/3] w-full overflow-hidden border border-white/15 bg-white/5 shadow-[0_32px_90px_rgba(0,0,0,0.55)]">
        {showVideo ? (
          <video
            className="absolute inset-0 h-full w-full object-cover"
            autoPlay
            muted
            loop
            playsInline
            poster={poster}
          >
            <source src={campaign.cardVideo} />
          </video>
        ) : (
          <Image
            src={poster}
            alt={campaign.coverAlt}
            fill
            sizes="(min-width: 1280px) 28vw, (min-width: 768px) 45vw, 80vw"
            className="object-cover"
            priority={isPriority}
          />
        )}
        <motion.div
          className="absolute inset-0 bg-gradient-to-b from-transparent via-black/25 to-black/75"
          animate={isRevealed ? { opacity: 1 } : { opacity: 0 }}
          transition={prefersReducedMotion ? undefined : REVEAL_TRANSITION}
        />
        <motion.div
          className="pointer-events-none absolute inset-x-0 top-0 flex justify-center px-6 pt-6"
          initial={false}
          animate={isRevealed ? { y: 0, opacity: 1 } : { y: '-45%', opacity: 0 }}
          transition={prefersReducedMotion ? undefined : REVEAL_TRANSITION}
        >
          <span className="relative flex h-16 w-full max-w-[220px] items-center justify-center">
            <Image
              src={campaign.logo.src}
              alt={campaign.logo.alt}
              fill
              sizes="220px"
              className="object-contain"
              priority={isPriority}
            />
          </span>
        </motion.div>
        <motion.div
          className="pointer-events-none absolute inset-x-0 bottom-[30%] flex justify-center px-6 text-center"
          initial={false}
          animate={isRevealed ? { y: 0, opacity: 1 } : { y: '45%', opacity: 0 }}
          transition={prefersReducedMotion ? undefined : REVEAL_TRANSITION}
        >
          <p className="max-w-[80%] text-sm leading-relaxed text-white/85">{campaign.highlight}</p>
        </motion.div>
        <motion.div
          className="pointer-events-none absolute inset-x-0 bottom-0 flex flex-col items-center gap-2 px-6 pb-8 text-[0.65rem] uppercase tracking-[0.38em] text-white"
          initial={false}
          animate={isRevealed ? { y: 0, opacity: 1 } : { y: '45%', opacity: 0 }}
          transition={prefersReducedMotion ? undefined : REVEAL_TRANSITION}
        >
          <span>{campaign.releaseWindow}</span>
          <span className="text-white/75">{campaign.destination}</span>
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
