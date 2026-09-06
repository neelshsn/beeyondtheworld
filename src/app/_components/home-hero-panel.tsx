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
        <div className="flex max-w-4xl flex-col items-start text-left">
          {/* Main title — Cannia uppercase */}
          <h1
            data-animate-text
            className="text-glow max-w-4xl font-menu text-[clamp(1.6rem,4.8vw,4.6rem)] uppercase leading-[0.95] tracking-[0.01em] text-white"
          >
            Beyond Visuals,
            <br />
            Creating Impact
            <br />
            Around the World.
          </h1>
        </div>
      </div>
    </section>
  );
}
