'use client';

import { useMemo, useState } from 'react';
import Image from 'next/image';
import { motion, useMotionValue, useSpring } from 'framer-motion';
import { CalendarDays, MapPin } from 'lucide-react';

import type { ClientJourney } from '@/types/client';

interface SeasonCarouselProps {
  journeys: ClientJourney[];
}

const seasonOrder = ['Fall Winter', 'Spring Summer'];

export function SeasonCarousel({ journeys }: SeasonCarouselProps) {
  const seasons = useMemo(() => {
    const unique = new Set(journeys.map((journey) => journey.season));
    return seasonOrder.filter((season) => unique.has(season));
  }, [journeys]);

  const [activeSeason, setActiveSeason] = useState(seasons[0] ?? 'Spring Summer');
  const filtered = journeys.filter((journey) => journey.season === activeSeason);

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <p className="font-display text-xs uppercase tracking-[0.35em] text-foreground/55">
          Seasonal carousel
        </p>
        <div className="flex gap-3">
          {seasons.map((season) => (
            <button
              key={season}
              type="button"
              onClick={() => setActiveSeason(season)}
              className={`rounded-full border px-4 py-2 text-[11px] uppercase tracking-[0.4em] ${
                season === activeSeason
                  ? 'border-foreground bg-foreground text-background'
                  : 'border-foreground/25 bg-white/70 text-foreground/60'
              }`}
            >
              {season}
            </button>
          ))}
        </div>
      </div>

      <div className="relative overflow-hidden rounded-[42px] border border-foreground/15 bg-white/55 p-6">
        <div className="flex gap-6 overflow-x-auto pb-4">
          {filtered.map((journey) => (
            <ParallaxCard key={journey.id} journey={journey} />
          ))}
        </div>
      </div>
    </section>
  );
}

interface ParallaxCardProps {
  journey: ClientJourney;
}

function ParallaxCard({ journey }: ParallaxCardProps) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 120, damping: 20, mass: 0.4 });
  const springY = useSpring(y, { stiffness: 120, damping: 20, mass: 0.4 });

  return (
    <motion.div
      className="group relative flex h-[360px] w-[260px] flex-col justify-between overflow-hidden rounded-2xl border border-foreground/15 bg-white/70 p-6 shadow-[0_30px_80px_-60px_rgba(87,62,38,0.55)]"
      onPointerMove={(event) => {
        const bounds = event.currentTarget.getBoundingClientRect();
        const offsetX = event.clientX - bounds.left;
        const offsetY = event.clientY - bounds.top;
        x.set(((offsetX - bounds.width / 2) / bounds.width) * 20);
        y.set(((offsetY - bounds.height / 2) / bounds.height) * 20);
      }}
      onPointerLeave={() => {
        x.set(0);
        y.set(0);
      }}
    >
      <motion.div
        style={{ x: springX, y: springY }}
        className="relative h-[220px] overflow-hidden rounded-2xl"
      >
        <Image
          src={journey.moodboard[0] ?? journey.heroPoster}
          alt={journey.title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-[1.05]"
          sizes="(max-width: 768px) 60vw, 20vw"
        />
        <div
          className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/60"
          aria-hidden
        />
        <div className="absolute bottom-3 left-3 flex items-center gap-2 rounded-full border border-white/40 bg-black/50 px-3 py-1 text-[10px] uppercase tracking-[0.35em] text-white">
          <MapPin className="size-3" aria-hidden /> {journey.country}
        </div>
      </motion.div>
      <div className="space-y-2 text-[11px] uppercase tracking-[0.35em] text-foreground/60">
        <p className="font-display text-sm uppercase tracking-[0.3em] text-foreground">
          {journey.title}
        </p>
        <p className="flex items-center gap-2">
          <CalendarDays className="size-3.5" aria-hidden />
          {new Date(journey.startDate).toLocaleDateString(undefined, {
            month: 'short',
            day: 'numeric',
          })}
          {' ï¿½ '}
          {new Date(journey.endDate).toLocaleDateString(undefined, {
            month: 'short',
            day: 'numeric',
          })}
        </p>
      </div>
    </motion.div>
  );
}
