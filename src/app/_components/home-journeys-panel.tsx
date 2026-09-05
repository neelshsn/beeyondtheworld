'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRef } from 'react';

const LEFT_IMAGE = '/assets/campaigns/craie-maroc/spring-summer-home.jpg';
const RIGHT_IMAGE = '/assets/campaigns/craie-suisse/swiss3.jpg';

const TITLE_SHADOW =
  '[text-shadow:0_4px_0_rgba(0,0,0,0.36),0_12px_20px_rgba(0,0,0,0.28),0_24px_52px_rgba(0,0,0,0.38),0_40px_88px_rgba(0,0,0,0.3)]';

export function HomeJourneysPanel() {
  const sectionRef = useRef<HTMLElement>(null);

  return (
    <section ref={sectionRef} data-dual-sweep className="home-snap-panel relative overflow-hidden">
      {/* Desktop: 2 columns side by side | Mobile: 2 rows stacked */}
      <div className="relative grid h-full grid-cols-1 grid-rows-2 lg:grid-cols-2 lg:grid-rows-1">
        {/* Top row (mobile) / Left column (desktop) — Spring/Summer */}
        <Link
          href="/journeys?season=spring-summer"
          data-col-left
          className="group relative flex h-full flex-col items-start justify-end p-4 sm:p-12 lg:p-20"
        >
          <Image
            src={LEFT_IMAGE}
            alt="Spring Summer"
            fill
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="object-cover object-[center_20%]"
          />

          {/* Dark gradient overlay */}
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(4,3,1,0.05)_0%,rgba(4,3,1,0.25)_60%,rgba(4,3,1,0.55)_100%)]" />

          {/* Title bottom-left */}
          <h2
            data-animate-text
            className={`relative z-10 font-menu text-[clamp(2rem,5vw,5.5rem)] uppercase leading-[0.9] tracking-[0.02em] text-white ${TITLE_SHADOW}`}
          >
            Spring
            <br />
            Summer
          </h2>

          {/* Discover Journeys button */}
          <div
            data-animate-text
            className="relative z-10 mt-3 inline-flex flex-col items-start font-display text-[7px] uppercase tracking-[0.35em] text-white sm:mt-6 sm:text-[9px] sm:tracking-[0.45em]"
          >
            <span>Find your next campaign location</span>
            <span className="mt-1.5 h-px w-full origin-left scale-x-0 bg-gradient-to-r from-[rgba(249,215,162,0.18)] via-[rgba(244,199,122,0.75)] to-[rgba(255,240,225,0.95)] transition-transform duration-300 ease-out group-hover:scale-x-100" />
          </div>
        </Link>

        {/* Bottom row (mobile) / Right column (desktop) — Fall/Winter */}
        <Link
          href="/journeys?season=fall-winter"
          data-col-right
          className="group relative flex h-full flex-col items-end justify-start p-4 sm:p-12 lg:p-20"
        >
          <Image
            src={RIGHT_IMAGE}
            alt="Fall Winter"
            fill
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="object-cover object-[center_20%]"
          />

          {/* Dark gradient overlay */}
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(4,3,1,0.55)_0%,rgba(4,3,1,0.25)_40%,rgba(4,3,1,0.05)_100%)]" />

          {/* Title top-right */}
          <h2
            data-animate-text
            className={`relative z-10 text-right font-menu text-[clamp(2rem,5vw,5.5rem)] uppercase leading-[0.9] tracking-[0.02em] text-white ${TITLE_SHADOW}`}
          >
            Fall
            <br />
            Winter
          </h2>

          {/* Discover Journeys button */}
          <div
            data-animate-text
            className="relative z-10 mt-3 inline-flex flex-col items-end font-display text-[7px] uppercase tracking-[0.35em] text-white sm:mt-6 sm:text-[9px] sm:tracking-[0.45em]"
          >
            <span>Find your next campaign location</span>
            <span className="mt-1.5 h-px w-full origin-right scale-x-0 bg-gradient-to-r from-[rgba(255,240,225,0.95)] via-[rgba(244,199,122,0.75)] to-[rgba(249,215,162,0.18)] transition-transform duration-300 ease-out group-hover:scale-x-100" />
          </div>
        </Link>
      </div>
    </section>
  );
}
