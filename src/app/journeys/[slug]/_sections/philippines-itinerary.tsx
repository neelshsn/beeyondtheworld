'use client';

import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ChevronRight, MapPin, Navigation2, Waves } from 'lucide-react';
import Image from 'next/image';
import { useMemo, useState } from 'react';

export type PhilippinesItinerarySegment = {
  id: string;
  days: string;
  title: string;
  description: string;
  image: string;
  anchors: string[];
  mood: string;
};

type PhilippinesItineraryProps = {
  segments: PhilippinesItinerarySegment[];
};

const CARD_TRANSITION = { duration: 0.6, ease: [0.33, 1, 0.68, 1] } as const;

export function PhilippinesItinerary({ segments }: PhilippinesItineraryProps) {
  const shouldReduceMotion = useReducedMotion();
  const [activeId, setActiveId] = useState(() => segments[0]?.id ?? '');

  const activeSegment = useMemo(
    () => segments.find((segment) => segment.id === activeId) ?? segments[0],
    [activeId, segments]
  );

  if (!activeSegment) {
    return null;
  }

  return (
    <div className="flex flex-col gap-10">
      <div className="flex flex-wrap gap-3">
        {segments.map((segment) => {
          const isActive = segment.id === activeSegment.id;
          return (
            <button
              key={segment.id}
              type="button"
              onClick={() => setActiveId(segment.id)}
              className="group relative flex min-w-[220px] flex-1 items-center justify-between gap-3 rounded-full border border-white/20 bg-white/5 px-6 py-3 text-left text-xs uppercase tracking-[0.36em] text-white/70 transition hover:border-white/45 hover:bg-white/10"
            >
              <span className="flex items-center gap-3">
                <MapPin
                  className="size-4 text-white/60 transition group-hover:text-white"
                  aria-hidden
                />
                {segment.days}
              </span>
              <ChevronRight
                className="size-4 text-white/50 transition-transform group-hover:translate-x-1 group-hover:text-white"
                aria-hidden
              />
              {isActive ? (
                <motion.span
                  layoutId="philippines-itinerary-pill"
                  transition={shouldReduceMotion ? undefined : CARD_TRANSITION}
                  className="absolute inset-0 rounded-full bg-white/15"
                />
              ) : null}
            </button>
          );
        })}
      </div>

      <div className="relative overflow-hidden rounded-[36px] border border-white/10 bg-white/5 shadow-[0_40px_140px_rgba(3,12,18,0.28)]">
        <div className="relative h-[520px] w-full">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={activeSegment.id}
              className="absolute inset-0"
              initial={shouldReduceMotion ? undefined : { opacity: 0.2, scale: 1.05 }}
              animate={shouldReduceMotion ? undefined : { opacity: 1, scale: 1 }}
              exit={shouldReduceMotion ? undefined : { opacity: 0, scale: 0.96 }}
              transition={shouldReduceMotion ? undefined : CARD_TRANSITION}
            >
              <Image
                src={activeSegment.image}
                alt={activeSegment.title}
                fill
                sizes="(min-width: 1280px) 60vw, 90vw"
                priority
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-br from-[#020912]/80 via-[#020912]/40 to-[#001c2e]/80" />
            </motion.div>
          </AnimatePresence>

          <div className="relative z-10 flex h-full flex-col justify-between p-10 sm:p-12">
            <div className="space-y-4 text-white">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 py-2 text-[11px] uppercase tracking-[0.38em] text-white/75">
                <Navigation2 className="size-4" aria-hidden />
                {activeSegment.mood}
              </span>
              <div className="space-y-2">
                <p className="text-xs uppercase tracking-[0.42em] text-white/60">
                  {activeSegment.days}
                </p>
                <h3 className="font-display text-3xl uppercase leading-[1.08] text-white sm:text-4xl">
                  {activeSegment.title}
                </h3>
              </div>
              <p className="max-w-2xl text-sm leading-relaxed text-white/80 sm:text-base">
                {activeSegment.description}
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {activeSegment.anchors.map((anchor) => (
                <div
                  key={anchor}
                  className="flex items-center gap-3 rounded-2xl border border-white/20 bg-white/10 px-5 py-3 text-left text-[11px] uppercase tracking-[0.36em] text-white/80"
                >
                  <Waves className="size-4 text-white/70" aria-hidden />
                  <span>{anchor}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
