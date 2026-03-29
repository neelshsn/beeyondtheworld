'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

const LEFT_IMAGE = '/assets/campaigns/craie-maroc/craie-maroc-gallery-05.jpg';
const RIGHT_IMAGE = '/assets/campaigns/craie-suisse/Swiss3.png';

export function HomeJourneysPanel() {
  const [hoveredSide, setHoveredSide] = useState<'left' | 'right' | null>(null);

  return (
    <section className="home-snap-panel relative overflow-hidden">
      <div className="relative grid h-full grid-cols-2">
        {/* Left column — Spring/Summer */}
        <Link
          href="/journeys?season=spring-summer"
          className="group relative flex h-full items-end p-8 sm:p-12 lg:p-20"
          onMouseEnter={() => setHoveredSide('left')}
          onMouseLeave={() => setHoveredSide(null)}
        >
          <Image src={LEFT_IMAGE} alt="Spring Summer" fill sizes="50vw" className="object-cover" />

          {/* Dark gradient overlay */}
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(4,3,1,0.05)_0%,rgba(4,3,1,0.25)_60%,rgba(4,3,1,0.55)_100%)]" />

          {/* Title bottom-left */}
          <h2
            data-animate-text
            className={`relative z-10 font-menu text-[clamp(2rem,5vw,5.5rem)] uppercase leading-[0.9] tracking-[0.02em] transition-colors duration-500 ${
              hoveredSide === 'left' ? 'text-[#edb450]' : 'text-white'
            }`}
          >
            Spring
            <br />
            Summer
          </h2>
        </Link>

        {/* Right column — Fall/Winter */}
        <Link
          href="/journeys?season=fall-winter"
          className="group relative flex h-full items-end justify-end p-8 sm:p-12 lg:p-20"
          onMouseEnter={() => setHoveredSide('right')}
          onMouseLeave={() => setHoveredSide(null)}
        >
          <Image src={RIGHT_IMAGE} alt="Fall Winter" fill sizes="50vw" className="object-cover" />

          {/* Dark gradient overlay */}
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(4,3,1,0.05)_0%,rgba(4,3,1,0.25)_60%,rgba(4,3,1,0.55)_100%)]" />

          {/* Title bottom-right */}
          <h2
            data-animate-text
            className={`relative z-10 text-right font-menu text-[clamp(2rem,5vw,5.5rem)] uppercase leading-[0.9] tracking-[0.02em] transition-colors duration-500 ${
              hoveredSide === 'right' ? 'text-[#edb450]' : 'text-white'
            }`}
          >
            Fall
            <br />
            Winter
          </h2>
        </Link>
      </div>
    </section>
  );
}
