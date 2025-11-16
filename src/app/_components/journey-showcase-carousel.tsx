'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { CalendarDays, ChevronLeft, ChevronRight, MapPin } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useMemo, useState } from 'react';

import SplitText from '@/components/SplitText';
import { Button } from '@/components/ui/button';
import type { JourneyShowcase } from '@/data/showcases';

type JourneyShowcaseCarouselProps = {
  journeys: JourneyShowcase[];
  ctaImage?: string;
};

type CarouselSlide =
  | { type: 'journey'; id: string; journey: JourneyShowcase }
  | { type: 'cta'; id: string; image?: string };

const SLIDE_TRANSITION = { duration: 0.6, ease: [0.33, 1, 0.68, 1] };

export function JourneyShowcaseCarousel({ journeys, ctaImage }: JourneyShowcaseCarouselProps) {
  const slides = useMemo<CarouselSlide[]>(() => {
    const journeySlides = journeys.map((journey) => ({
      type: 'journey' as const,
      id: journey.id,
      journey,
    }));
    return [
      ...journeySlides,
      {
        type: 'cta' as const,
        id: 'explore-more-journeys',
        image: ctaImage,
      },
    ];
  }, [ctaImage, journeys]);

  const [activeIndex, setActiveIndex] = useState(0);
  const activeSlide = slides[activeIndex];

  const canGoPrev = activeIndex > 0;
  const canGoNext = activeIndex < slides.length - 1;

  return (
    <div className="relative w-full">
      <div className="relative min-h-[806px] overflow-hidden bg-[#05070d]">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeSlide.id}
            initial={{ opacity: 0, x: activeIndex === 0 ? 40 : 60 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={SLIDE_TRANSITION}
            className="absolute inset-0"
          >
            {activeSlide.type === 'journey' ? (
              <JourneySlide journey={activeSlide.journey} />
            ) : (
              <ViewMoreSlide image={activeSlide.image} />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="absolute inset-y-0 left-0 flex items-center">
        <CarouselArrow
          direction="prev"
          disabled={!canGoPrev}
          onClick={() => setActiveIndex((index) => Math.max(0, index - 1))}
        />
      </div>
      <div className="absolute inset-y-0 right-0 flex items-center">
        <CarouselArrow
          direction="next"
          disabled={!canGoNext}
          onClick={() => setActiveIndex((index) => Math.min(slides.length - 1, index + 1))}
        />
      </div>

      <div className="absolute inset-x-0 bottom-8 z-30 flex justify-center gap-3">
        {slides.map((slide, index) => (
          <button
            key={slide.id}
            type="button"
            aria-label={`Go to slide ${index + 1}`}
            onClick={() => setActiveIndex(index)}
            className={`size-3 rounded-full border border-foreground/25 transition-all duration-300 ${
              activeIndex === index
                ? 'border-transparent bg-foreground shadow-[0_0_20px_rgba(15,20,30,0.35)]'
                : 'bg-transparent'
            }`}
          />
        ))}
      </div>
    </div>
  );
}

type CarouselArrowProps = {
  direction: 'prev' | 'next';
  disabled: boolean;
  onClick: () => void;
};

function CarouselArrow({ direction, disabled, onClick }: CarouselArrowProps) {
  const Icon = direction === 'prev' ? ChevronLeft : ChevronRight;
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={direction === 'prev' ? 'Previous slide' : 'Next slide'}
      className={`group relative flex h-16 w-16 items-center justify-center text-foreground transition-all duration-300 ${
        disabled
          ? 'pointer-events-none opacity-0'
          : 'opacity-100 hover:scale-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground/40'
      }`}
    >
      <span className="absolute inset-0 rounded-full bg-white/40 opacity-0 blur-[22px] transition-opacity duration-300 group-hover:opacity-100" />
      <Icon className="relative z-10 size-8 transition-transform duration-300 group-hover:translate-x-1" />
    </button>
  );
}

function JourneySlide({ journey }: { journey: JourneyShowcase }) {
  return (
    <article className="group relative isolate flex min-h-[806px] w-full items-center justify-center overflow-hidden">
      <Image
        src={journey.hero.src}
        alt={journey.hero.alt}
        fill
        className="absolute inset-0 size-full object-cover transition-[transform,opacity] duration-700 ease-bee group-hover:scale-[1.025]"
        sizes="(max-width: 768px) 100vw, 80vw"
        priority={journey.id === 'philippines'}
      />
      <div className="pointer-events-none absolute inset-0 bg-black/55 transition-colors duration-500 ease-bee group-hover:bg-black/40" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-36 bg-[linear-gradient(to_bottom,rgba(6,8,12,0.92)_0%,rgba(6,8,12,0.55)_60%,rgba(6,8,12,0)_100%)]" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[52%] bg-[linear-gradient(to_top,rgba(6,8,12,0.9)_0%,rgba(6,8,12,0.48)_58%,rgba(6,8,12,0)_100%)]" />
      <div className="relative z-20 mx-auto flex w-full max-w-4xl flex-col items-center justify-center gap-10 px-6 py-20 text-center text-white transition-transform duration-500 ease-bee sm:px-10">
        <div className="flex flex-wrap items-center justify-center gap-4 text-[11px] uppercase tracking-[0.32em] text-white/75 drop-shadow-[0_8px_18px_rgba(0,0,0,0.55)]">
          <span className="flex items-center gap-2">
            <MapPin className="size-3.5" aria-hidden />
            {journey.locale}
          </span>
          <span className="hidden h-px w-16 bg-white/35 sm:block" aria-hidden />
          <span className="flex items-center gap-2">
            <CalendarDays className="size-3.5" aria-hidden />
            {journey.timeframe}
          </span>
        </div>
        <div className="max-w-3xl space-y-5 text-center">
          <SplitText
            text={journey.title}
            tag="h3"
            splitType="words"
            className="font-title text-4xl uppercase tracking-[0em] text-white drop-shadow-[0_28px_60px_rgba(0,0,0,0.7)] sm:text-[2.9rem]"
            textAlign="center"
          />
          <p className="text-sm leading-relaxed text-white/85 drop-shadow-[0_12px_32px_rgba(0,0,0,0.55)] sm:text-base">
            {journey.summary}
          </p>
        </div>
        <Button
          asChild
          className="group relative inline-flex items-center justify-center gap-4 overflow-hidden rounded-full border border-white/55 bg-white/10 px-16 py-5 font-display text-[11px] uppercase tracking-[0.5em] text-white transition-colors duration-300 [transition-timing-function:var(--bee-ease)] hover:border-white hover:bg-white/15 focus-visible:ring-[#f6c452]/35"
        >
          <Link
            href={`/journeys/${journey.slug}`}
            className="relative inline-flex items-center justify-center gap-4"
          >
            <span
              aria-hidden
              className="pointer-events-none absolute inset-0 z-0 -translate-x-full bg-gradient-to-r from-transparent via-[#f6c452bf] to-transparent opacity-0 transition-transform duration-500 group-hover:translate-x-full group-hover:opacity-100"
            />
            <span className="relative z-10">Open Journey</span>
          </Link>
        </Button>
      </div>
    </article>
  );
}

function ViewMoreSlide({ image }: { image?: string }) {
  return (
    <article className="group relative isolate flex min-h-[806px] flex-col items-center justify-center overflow-hidden px-6 py-16 text-center text-white shadow-[0_50px_140px_rgba(15,20,30,0.45)] sm:px-10">
      {image ? (
        <Image
          src={image}
          alt="Campaign highlight inviting to see more journeys"
          fill
          className="absolute inset-0 size-full object-cover transition-[transform,opacity] duration-700 ease-bee group-hover:scale-[1.02]"
          sizes="(max-width: 768px) 100vw, 80vw"
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-foreground via-foreground/90 to-[#1a1d25]" />
      )}
      <div className="absolute inset-0 bg-black/60" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-36 bg-[linear-gradient(to_bottom,rgba(6,8,12,0.92)_0%,rgba(6,8,12,0.55)_60%,rgba(6,8,12,0)_100%)]" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[52%] bg-[linear-gradient(to_top,rgba(6,8,12,0.9)_0%,rgba(6,8,12,0.48)_58%,rgba(6,8,12,0)_100%)]" />
      <div className="relative z-10 flex max-w-2xl flex-col items-center gap-8">
        <span className="font-display text-xs uppercase tracking-[0.45em] text-white/70">
          Full catalog access
        </span>
        <SplitText
          text="Connect to reveal the tailored journeys for your brands"
          tag="h3"
          splitType="words"
          className="font-title text-4xl uppercase leading-tight text-white sm:text-5xl"
          textAlign="center"
        />
        <p className="text-base leading-relaxed text-white/80">
          Log in to access a living library of journeys curated for specific maisons, objectives,
          and launch calendars.
        </p>
        <Button
          asChild
          className="group relative inline-flex items-center justify-center gap-4 overflow-hidden rounded-full border border-white/55 bg-white/10 px-14 py-4 font-display text-[11px] uppercase tracking-[0.5em] text-white transition-colors duration-300 [transition-timing-function:var(--bee-ease)] hover:border-white hover:bg-white/20 focus-visible:ring-[#f6c452]/35"
        >
          <Link href="/login" className="relative inline-flex items-center justify-center gap-4">
            <span
              aria-hidden
              className="pointer-events-none absolute inset-0 z-0 -translate-x-full bg-gradient-to-r from-transparent via-[#f6c452bf] to-transparent opacity-0 transition-transform duration-500 group-hover:translate-x-full group-hover:opacity-100"
            />
            <span className="relative z-10">Sign in</span>
          </Link>
        </Button>
      </div>
    </article>
  );
}
