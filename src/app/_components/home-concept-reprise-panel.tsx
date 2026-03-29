'use client';

import Link from 'next/link';
import { SmartVideo } from '@/components/primitives';

const CONCEPT_VIDEO = '/assets/concept/sustainable.mp4';

export function HomeConceptReprisePanel() {
  return (
    <section className="home-snap-panel relative overflow-hidden">
      <div className="relative grid h-full grid-cols-1 lg:grid-cols-2">
        {/* Left column — Beige text */}
        <div
          data-reprise-left
          className="flex flex-col items-start justify-center bg-[#efe3d1] px-8 py-16 sm:px-12 lg:px-20"
        >
          <h2
            data-animate-text
            className="font-menu text-[clamp(2.4rem,6vw,7rem)] uppercase leading-[0.9] tracking-[0.02em] text-[#1b130e]"
          >
            Concept
          </h2>

          <p
            data-animate-text
            className="mt-8 max-w-md font-script text-[clamp(1rem,1.6vw,1.4rem)] lowercase leading-[1.7] tracking-[0.02em] text-[#1b130e]/70"
          >
            Dream-sustained by design, luminous in delivery.
          </p>

          <Link
            href="/concept"
            data-animate-text
            className="group relative mt-10 inline-flex items-center justify-center overflow-hidden rounded-none border border-[#1b130e]/25 bg-[#1b130e]/5 px-8 py-2.5 font-display text-[9px] uppercase tracking-[0.45em] text-[#1b130e] transition-colors duration-300 [transition-timing-function:var(--bee-ease)] hover:border-[#edb450] hover:text-[#edb450]"
          >
            <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-[#edb45033] to-transparent opacity-0 transition-transform duration-500 group-hover:translate-x-full group-hover:opacity-100" />
            Explore the concept
          </Link>
        </div>

        {/* Right column — Video */}
        <div data-reprise-right className="relative min-h-[50vh] lg:min-h-0">
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
      </div>
    </section>
  );
}
