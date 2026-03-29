'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { RippleCursor } from '@/components/primitives/ripple-cursor';

const JOURNEYS = [
  {
    slug: 'india-january-2026',
    title: 'INDIA',
    image: '/assets/journeys/india-january-2026/india-january-2026-hero.png',
  },
  {
    slug: 'morocco',
    title: 'MOROCCO',
    image: '/assets/journeys/morocco-2026/morocco-all-journeys-thumbnail.png',
  },
  {
    slug: 'philippines',
    title: 'PHILIPPINES',
    image: '/assets/journeys/philippines-2026/philippines-all-journeys-thumbnail.png',
  },
];

const ICON_WHITE = '/assets/icones/Ico White BEE-13.svg';
const ICON_GOLD = '/assets/icones/Ico Gold BEE-13.svg';
const TOTAL_SCREENS = 5; // intro + 3 journeys + see-all

export function HomeJourneysPanel() {
  const trackRef = useRef<HTMLDivElement>(null);
  const screenIndexRef = useRef(0);
  const isScrollingRef = useRef(false);
  const [hoveredJourney, setHoveredJourney] = useState<string | null>(null);

  const scrollToScreen = useCallback((index: number) => {
    const track = trackRef.current;
    if (!track || isScrollingRef.current) return;

    const clamped = Math.max(0, Math.min(index, TOTAL_SCREENS - 1));
    isScrollingRef.current = true;

    gsap.to(track, {
      x: -clamped * window.innerWidth,
      duration: 1,
      ease: 'power2.inOut',
      onComplete: () => {
        screenIndexRef.current = clamped;
        isScrollingRef.current = false;
      },
    });
  }, []);

  /** Called by parent orchestrator to handle internal horizontal scrolling.
   * Returns true if the scroll was consumed internally, false if it should bubble to parent. */
  const handleInternalWheel = useCallback(
    (deltaY: number): boolean => {
      if (isScrollingRef.current) return true; // consumed

      const current = screenIndexRef.current;

      if (deltaY > 0) {
        if (current < TOTAL_SCREENS - 1) {
          scrollToScreen(current + 1);
          return true;
        }
        return false; // at end, bubble to parent
      } else {
        if (current > 0) {
          scrollToScreen(current - 1);
          return true;
        }
        return false; // at start, bubble to parent
      }
    },
    [scrollToScreen]
  );

  // Expose handleInternalWheel via data attribute so parent can call it
  useEffect(() => {
    const panel = trackRef.current?.closest('[data-panel]');
    if (panel) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (panel as any).__journeyWheel = handleInternalWheel;
    }
  }, [handleInternalWheel]);

  // Reset horizontal position when component mounts
  useEffect(() => {
    const track = trackRef.current;
    if (track) {
      gsap.set(track, { x: 0 });
      screenIndexRef.current = 0;
    }
  }, []);

  return (
    <section className="home-snap-panel relative overflow-hidden bg-[#efe3d1]">
      {/* Horizontal scroll track */}
      <div ref={trackRef} className="flex h-full" style={{ width: `${TOTAL_SCREENS * 100}vw` }}>
        {/* Screen 1: Intro */}
        <div className="relative flex h-full w-screen flex-shrink-0 items-start justify-between px-8 py-16 sm:px-12 lg:px-20">
          {/* Title top-left */}
          <h2
            data-animate-text
            className="font-menu text-[clamp(2.4rem,6vw,7rem)] uppercase leading-[0.9] tracking-[0.02em] text-[#1b130e]"
          >
            Our
            <br />
            Journeys
          </h2>

          {/* Large decorative icon — right side, overflows */}
          <div className="pointer-events-none absolute right-[-10%] top-1/2 -translate-y-1/2">
            <Image
              src={ICON_GOLD}
              alt=""
              width={1200}
              height={1200}
              className="h-[120vh] w-auto opacity-[0.08]"
              aria-hidden="true"
            />
          </div>
        </div>

        {/* Screen 2-4: Journey cards */}
        {JOURNEYS.map((journey) => {
          const isHovered = hoveredJourney === journey.slug;

          return (
            <Link
              key={journey.slug}
              href={`/journeys/${journey.slug}`}
              className="relative flex h-full w-screen flex-shrink-0 items-end justify-end p-8 sm:p-12 lg:p-20"
              onMouseEnter={() => setHoveredJourney(journey.slug)}
              onMouseLeave={() => setHoveredJourney(null)}
            >
              {/* Background image */}
              <Image
                src={journey.image}
                alt={journey.title}
                fill
                sizes="100vw"
                className="object-cover"
              />

              {/* Ripple overlay */}
              <RippleCursor className="z-10" />

              {/* Dark gradient overlay */}
              <div className="absolute inset-0 z-10 bg-[linear-gradient(180deg,rgba(4,3,1,0.05)_0%,rgba(4,3,1,0.35)_70%,rgba(4,3,1,0.6)_100%)]" />

              {/* Title + icon bottom-right */}
              <div
                className={`relative z-20 flex items-center gap-4 transition-colors duration-500 ${
                  isHovered ? 'text-[#edb450]' : 'text-white'
                }`}
              >
                <h3 className="font-menu text-[clamp(2rem,5vw,5rem)] uppercase leading-[0.9] tracking-[0.02em]">
                  {journey.title}
                </h3>
                <Image
                  src={isHovered ? ICON_GOLD : ICON_WHITE}
                  alt=""
                  width={48}
                  height={48}
                  className="h-10 w-10 lg:h-12 lg:w-12"
                />
              </div>
            </Link>
          );
        })}

        {/* Screen 5: See all */}
        <div className="relative flex h-full w-screen flex-shrink-0 items-end justify-end p-8 sm:p-12 lg:p-20">
          {/* Decorative icon — left side */}
          <div className="pointer-events-none absolute left-[5%] top-1/2 -translate-y-1/2">
            <Image
              src={ICON_GOLD}
              alt=""
              width={800}
              height={800}
              className="h-[90vh] w-auto opacity-[0.08]"
              aria-hidden="true"
            />
          </div>

          {/* CTA bottom-right */}
          <Link
            href="/journeys"
            className="group relative z-10 flex items-center gap-4 text-[#1b130e] transition-colors duration-500 hover:text-[#edb450]"
          >
            <h3 className="font-menu text-[clamp(1.4rem,3.5vw,3.2rem)] uppercase leading-[0.95] tracking-[0.02em]">
              See all of
              <br />
              our journeys
            </h3>
            <Image
              src={ICON_GOLD}
              alt=""
              width={48}
              height={48}
              className="h-10 w-10 lg:h-12 lg:w-12"
            />
          </Link>
        </div>
      </div>
    </section>
  );
}
