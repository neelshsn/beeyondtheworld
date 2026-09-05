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
          className="max-w-[90vw] text-center font-script text-[clamp(1.6rem,3vw,3rem)] leading-[1.5] tracking-[0.02em] text-white/90"
        >
          What if the way we create mattered as much as what we create?
        </p>
      </div>

      {/* Bottom-left: approach title and model CTA */}
      <div className="absolute bottom-12 left-8 right-8 flex flex-col items-start gap-4 sm:bottom-16 sm:left-12 sm:right-12 lg:bottom-20 lg:left-20 lg:right-20">
        <h2
          data-animate-text
          className="text-glow font-menu text-[clamp(2.4rem,7vw,8rem)] uppercase leading-[0.9] tracking-[0.02em] text-white"
        >
          Our approach
        </h2>
        <Link
          href="/concept"
          data-animate-text
          className="group relative inline-flex flex-col items-start font-display text-[9px] uppercase tracking-[0.45em] text-white"
        >
          <span>Explore our model</span>
          <span className="mt-1.5 h-px w-full origin-left scale-x-0 bg-gradient-to-r from-[rgba(249,215,162,0.18)] via-[rgba(244,199,122,0.75)] to-[rgba(255,240,225,0.95)] transition-transform duration-300 ease-out group-hover:scale-x-100" />
        </Link>
      </div>
    </section>
  );
}
