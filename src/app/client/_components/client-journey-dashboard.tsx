'use client';

import { useMemo, useRef, useState, type ComponentType } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  Banknote,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Compass,
  Filter,
  Globe,
  MapPin,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { ClientJourney } from '@/types/client';

interface DashboardProps {
  journeys: ClientJourney[];
}

export function ClientJourneyDashboard({ journeys }: DashboardProps) {
  const router = useRouter();
  const scrollRef = useRef<HTMLDivElement>(null);

  const [countryFilter, setCountryFilter] = useState<string>('All');
  const [budgetFilter, setBudgetFilter] = useState<string>('All');
  const [seasonFilter, setSeasonFilter] = useState<string>('All');
  const [activeJourneyId, setActiveJourneyId] = useState<string | null>(journeys[0]?.id ?? null);
  const [hoveredJourneyId, setHoveredJourneyId] = useState<string | null>(null);

  const countryOptions = useMemo(
    () => ['All', ...new Set(journeys.map((journey) => journey.country))],
    [journeys]
  );
  const budgetOptions = useMemo(
    () => ['All', ...new Set(journeys.map((journey) => journey.budgetRange))],
    [journeys]
  );
  const seasonOptions = useMemo(
    () => ['All', ...new Set(journeys.map((journey) => journey.season))],
    [journeys]
  );

  const filteredJourneys = useMemo(() => {
    return journeys.filter((journey) => {
      const matchesCountry = countryFilter === 'All' || journey.country === countryFilter;
      const matchesBudget = budgetFilter === 'All' || journey.budgetRange === budgetFilter;
      const matchesSeason = seasonFilter === 'All' || journey.season === seasonFilter;
      return matchesCountry && matchesBudget && matchesSeason;
    });
  }, [journeys, countryFilter, budgetFilter, seasonFilter]);

  const activeJourney =
    filteredJourneys.find((journey) => journey.id === activeJourneyId) ??
    filteredJourneys[0] ??
    null;

  const backgroundStyle = activeJourney
    ? {
        backgroundImage: `linear-gradient(135deg, rgba(10,12,20,0.78), rgba(15,18,28,0.55)), url(${activeJourney.heroPoster})`,
      }
    : undefined;

  function handleScroll(direction: number) {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({ left: direction * 320, behavior: 'smooth' });
  }

  function handleCardClick(journey: ClientJourney) {
    if (activeJourneyId === journey.id) {
      router.push(`/client/journeys/${journey.slug}`);
      return;
    }
    setActiveJourneyId(journey.id);
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 rounded-2xl border border-white/25 bg-white/65 p-6 backdrop-blur md:grid-cols-3">
        <FilterField
          icon={Globe}
          label="Country"
          value={countryFilter}
          options={countryOptions}
          onChange={setCountryFilter}
        />
        <FilterField
          icon={Banknote}
          label="Budget"
          value={budgetFilter}
          options={budgetOptions}
          onChange={setBudgetFilter}
        />
        <FilterField
          icon={CalendarDays}
          label="Season"
          value={seasonFilter}
          options={seasonOptions}
          onChange={setSeasonFilter}
        />
      </div>

      <div
        className="relative overflow-hidden rounded-3xl border border-white/30 bg-white/10 p-6 text-white shadow-[0_45px_120px_-80px_rgba(18,22,38,0.85)]"
        style={backgroundStyle}
      >
        <div
          className="absolute inset-0 bg-gradient-to-r from-black/65 via-black/45 to-black/25"
          aria-hidden
        />
        <div className="relative z-10 mb-6 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-xs uppercase tracking-[0.35em] text-white/70">
            <Filter className="size-4" aria-hidden />
            <span>Preview & select a journey</span>
          </div>
          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="ghost"
              onClick={() => handleScroll(-1)}
              className="size-11 rounded-full border border-white/35 bg-white/15 text-white hover:bg-white/30"
            >
              <ChevronLeft className="size-5" aria-hidden />
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() => handleScroll(1)}
              className="size-11 rounded-full border border-white/35 bg-white/15 text-white hover:bg-white/30"
            >
              <ChevronRight className="size-5" aria-hidden />
            </Button>
          </div>
        </div>

        <div ref={scrollRef} className="relative flex gap-4 overflow-x-auto pb-4">
          {filteredJourneys.map((journey) => {
            const isActive = journey.id === activeJourneyId;
            const isHovered = journey.id === hoveredJourneyId;
            const isExpanded = isActive || isHovered;
            return (
              <button
                key={journey.id}
                type="button"
                onClick={() => handleCardClick(journey)}
                onMouseEnter={() => setHoveredJourneyId(journey.id)}
                onMouseLeave={() => setHoveredJourneyId(null)}
                onFocus={() => setHoveredJourneyId(journey.id)}
                onBlur={() => setHoveredJourneyId(null)}
                className={cn(
                  'bg-white/12 group relative flex min-h-[260px] min-w-[190px] flex-col overflow-hidden rounded-2xl border border-white/35 text-left shadow-[0_25px_90px_-70px_rgba(12,14,24,0.85)] transition-all duration-300 hover:-translate-y-1 hover:border-white/60',
                  isExpanded
                    ? 'min-h-[460px] min-w-[300px] opacity-100 lg:min-h-[500px] lg:min-w-[360px] lg:scale-[1.02]'
                    : 'opacity-85'
                )}
              >
                <div
                  className={cn(
                    'relative w-full overflow-hidden transition-all duration-500',
                    isExpanded ? 'h-[260px]' : 'h-[160px]'
                  )}
                >
                  <Image
                    src={journey.heroPoster}
                    alt={journey.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                    sizes="(max-width: 768px) 60vw, 20vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/70" />
                  <div className="absolute bottom-3 left-3 flex items-center gap-2 rounded-full border border-white/35 bg-black/40 px-3 py-1 text-[10px] uppercase tracking-[0.35em]">
                    <MapPin className="size-3" aria-hidden /> {journey.country}
                  </div>
                </div>
                <div className="space-y-3 p-5 text-white">
                  <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.35em] text-white/75">
                    <Compass className="size-3.5" aria-hidden />
                    {journey.regionTags.join(' / ')}
                  </div>
                  <h3 className="font-display text-lg uppercase tracking-[0.24em] text-white">
                    {journey.title}
                  </h3>
                  {isExpanded ? (
                    <>
                      <p className="text-sm text-white/80">{journey.summary}</p>
                      <div className="flex flex-wrap items-center gap-3 text-[11px] uppercase tracking-[0.32em] text-white/70">
                        <span className="flex items-center gap-2 rounded-full border border-white/35 px-4 py-2">
                          <CalendarDays className="size-3.5" aria-hidden />
                          {new Date(journey.startDate).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                          })}
                          {' – '}
                          {new Date(journey.endDate).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                          })}
                        </span>
                        <span className="flex items-center gap-2 rounded-full border border-white/35 px-4 py-2">
                          <Banknote className="size-3.5" aria-hidden /> {journey.budgetRange}
                        </span>
                      </div>
                    </>
                  ) : (
                    <p className="text-xs text-white/70">Hover to preview, click to open.</p>
                  )}
                </div>
              </button>
            );
          })}
          {filteredJourneys.length === 0 ? (
            <div className="flex min-w-full items-center justify-center rounded-2xl border border-white/25 bg-black/30 p-12 text-sm text-white/75">
              No journeys match the selected filters yet.
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

interface FilterFieldProps {
  icon: ComponentType<{ className?: string; 'aria-hidden'?: boolean }>;
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}

function FilterField({ icon: Icon, label, value, options, onChange }: FilterFieldProps) {
  return (
    <label className="flex flex-col gap-2 text-xs text-foreground/65">
      <span className="flex items-center gap-2 font-display text-[10px] uppercase tracking-[0.35em]">
        <Icon className="size-3.5" aria-hidden /> {label}
      </span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="rounded-2xl border border-white/40 bg-white/80 px-4 py-3 font-display text-xs uppercase tracking-[0.3em] text-foreground focus:border-foreground/60 focus:outline-none"
      >
        {options.map((option) => (
          <option key={option} value={option} className="uppercase">
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}
