'use client';

import { SmartVideo } from '@/components/primitives';

const HERO_VIDEO = '/assets/home/hero-home.mp4';

export function HomeHeroPanel() {
  return (
    <section className="home-snap-panel relative overflow-hidden bg-[#040301] text-white">
      {/* Background Video */}
      <div className="absolute inset-0">
        <SmartVideo
          wrapperClassName="absolute inset-0"
          className="h-full w-full object-cover"
          src={HERO_VIDEO}
          autoPlay
          muted
          loop
          playsInline
          priority
          aria-hidden
        />
      </div>

      {/* Dark overlay gradient */}
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(4,3,1,0.42)_0%,rgba(4,3,1,0.14)_30%,rgba(4,3,1,0.10)_50%,rgba(4,3,1,0.52)_80%,rgba(4,3,1,0.78)_100%)]" />

      {/* Content — bottom left */}
      <div className="relative flex h-full flex-col items-start justify-end px-6 pb-16 sm:px-12 sm:pb-20 lg:px-20 lg:pb-24">
        <div className="flex max-w-3xl flex-col items-start text-left">
          {/* Main title — Cannia uppercase */}
          <h1
            data-animate-text
            className="text-glow font-menu text-[clamp(1.4rem,3.6vw,3.2rem)] uppercase leading-[1.18] tracking-[0.06em] text-white"
          >
            Co-journeys pioneering approach for a sustainable transition in fashion advertising
          </h1>

          {/* Description — Avenir */}
          <p
            data-animate-text
            className="mt-6 max-w-2xl font-sans text-[clamp(0.78rem,1vw,0.95rem)] leading-[1.9] tracking-[0.02em] text-white/65"
          >
            Beeyondtheworld&apos;s mission is to curb the excessive individualization of visual
            productions by optimizing every resource with intelligence and intention. We introduce a
            refined, sustainable model that elevates creative excellence while minimizing impact,
            proving that luxury and responsibility can move forward as one.
          </p>
        </div>
      </div>
    </section>
  );
}
