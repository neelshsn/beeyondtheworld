'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { GlassCard } from '@/components/primitives/glass-card';
import type { ClientJourney } from '@/types/client';

interface DashboardProps {
  journeys: ClientJourney[];
}

export function ClientJourneyDashboard({ journeys }: DashboardProps) {
  const [countryFilter, setCountryFilter] = useState<string>('All');
  const [budgetFilter, setBudgetFilter] = useState<string>('All');
  const [seasonFilter, setSeasonFilter] = useState<string>('All');

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

  return (
    <div className="space-y-8">
      <div className="grid gap-4 rounded-[36px] border border-white/20 bg-white/50 p-6 backdrop-blur md:grid-cols-3">
        <FilterField
          label="Country"
          value={countryFilter}
          options={countryOptions}
          onChange={setCountryFilter}
        />
        <FilterField
          label="Budget"
          value={budgetFilter}
          options={budgetOptions}
          onChange={setBudgetFilter}
        />
        <FilterField
          label="Season"
          value={seasonFilter}
          options={seasonOptions}
          onChange={setSeasonFilter}
        />
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {filteredJourneys.map((journey) => (
          <GlassCard key={journey.id} accent="honey" className="p-8">
            <p className="font-display text-xs uppercase tracking-[0.35em] text-muted-foreground/70">
              {journey.country} / {new Date(journey.startDate).getFullYear()}
            </p>
            <h2 className="font-display text-2xl uppercase tracking-[0.2em] text-foreground">
              {journey.title}
            </h2>
            <p className="mt-4 text-sm text-muted-foreground/85">{journey.summary}</p>
            <div className="mt-6 flex flex-wrap gap-3 text-xs text-muted-foreground/70">
              <span className="rounded-full border border-foreground/20 bg-white/60 px-3 py-1 font-display tracking-[0.3em]">
                {journey.budgetRange}
              </span>
              <span className="rounded-full border border-foreground/20 bg-white/60 px-3 py-1 font-display tracking-[0.3em]">
                {journey.regionTags.join(' / ')}
              </span>
              <span className="rounded-full border border-foreground/20 bg-white/60 px-3 py-1 font-display tracking-[0.3em]">
                {journey.season}
              </span>
            </div>
            <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
              <div className="text-xs text-muted-foreground/70">
                <p className="font-display text-[10px] uppercase tracking-[0.35em]">Schedule</p>
                <p>
                  {new Date(journey.startDate).toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                  })}{' '}
                  -{' '}
                  {new Date(journey.endDate).toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                  })}
                </p>
              </div>
              <Button
                asChild
                className="rounded-full px-6 py-3 font-display text-xs uppercase tracking-[0.35em]"
              >
                <Link href={`/client/journeys/${journey.slug}`}>Open journey sheet</Link>
              </Button>
            </div>
          </GlassCard>
        ))}

        {filteredJourneys.length === 0 ? (
          <div className="col-span-full rounded-[28px] border border-white/20 bg-white/40 p-8 text-center text-sm text-muted-foreground/80">
            No journeys match the selected filters yet.
          </div>
        ) : null}
      </div>
    </div>
  );
}

interface FilterFieldProps {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}

function FilterField({ label, value, options, onChange }: FilterFieldProps) {
  return (
    <label className="flex flex-col gap-2 text-xs text-muted-foreground/70">
      <span className="font-display text-[10px] uppercase tracking-[0.35em]">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="rounded-2xl border border-white/40 bg-white/70 px-4 py-3 font-display text-xs uppercase tracking-[0.3em] text-foreground focus:border-foreground/60 focus:outline-none"
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
