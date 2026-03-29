'use client';

import Link from 'next/link';
import { SmartVideo } from '@/components/primitives';

const CONCEPT_VIDEO = '/assets/concept/sustainable.mp4';

export function HomeConceptPanel() {
  return (
    <section className="home-snap-panel relative overflow-hidden bg-[#040301] text-white">
      {/* Background Video */}
      <div className="absolute inset-0">
        <SmartVideo
          wrapperClassName="absolute inset-0"
          className="h-full w-full object-cover"
          src={CONCEPT_VIDEO}
          autoPlay
          muted
          loop
          playsInline
          aria-hidden
        />
      </div>

      {/* Dark overlay for legibility */}
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(4,3,1,0.18)_0%,rgba(4,3,1,0.08)_40%,rgba(4,3,1,0.35)_70%,rgba(4,3,1,0.65)_100%)]" />

      {/* Center text */}
      <div className="relative flex h-full items-center justify-center px-8">
        <p
          data-animate-text
          className="max-w-lg text-center font-script text-[clamp(1.2rem,2.2vw,2rem)] lowercase leading-[1.7] tracking-[0.02em] text-white/90"
        >
          Dream-sustained by design, luminous in delivery
        </p>
      </div>

      {/* Bottom-right: Concept title */}
      <div className="absolute bottom-12 right-8 sm:bottom-16 sm:right-12 lg:bottom-20 lg:right-20">
        <h2
          data-animate-text
          className="font-menu text-[clamp(2.4rem,7vw,8rem)] uppercase leading-[0.9] tracking-[0.02em] text-white"
        >
          Concept
        </h2>
      </div>

      {/* Bottom-left: CTA */}
      <div className="absolute bottom-12 left-8 sm:bottom-16 sm:left-12 lg:bottom-20 lg:left-20">
        <Link
          href="/concept"
          data-animate-text
          className="group relative inline-flex items-center justify-center overflow-hidden rounded-none border border-white/25 bg-white/10 px-8 py-2.5 font-display text-[9px] uppercase tracking-[0.45em] text-white transition-colors duration-300 [transition-timing-function:var(--bee-ease)] hover:border-white/60 hover:bg-white/15"
        >
          <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-[#f6c452bf] to-transparent opacity-0 transition-transform duration-500 group-hover:translate-x-full group-hover:opacity-100" />
          Discover
        </Link>
      </div>
    </section>
  );
}
