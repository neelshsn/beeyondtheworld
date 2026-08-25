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
            className="text-glow max-w-3xl font-menu text-[clamp(1.45rem,3.35vw,3rem)] uppercase leading-[1.08] tracking-[0.045em] text-white"
          >
            Beeyond the World,
            <br />
            Creation as an Impact.
          </h1>

          <p
            data-animate-text
            className="text-white/92 mt-5 max-w-3xl font-menu text-[clamp(0.78rem,1.35vw,1.25rem)] uppercase leading-[1.28] tracking-[0.065em]"
          >
            PIONEERING CREATIVE MODEL FOR
            <br />A SUSTAINABLE WORLDWIDE DEVELOPMENT
          </p>

          {/* Description — Avenir */}
          <p
            data-animate-text
            className="text-white/72 mt-5 max-w-3xl font-sans text-[clamp(0.66rem,0.82vw,0.82rem)] leading-[1.72] tracking-[0.015em]"
          >
            Beeyondtheworld is pioneering a new model of visual production where creativity becomes
            an investment in people, places and the future. Every campaign is designed as a living
            ecosystem that brings together brands, creators, artisans, local communities and
            environmental initiatives around one shared ambition: creating enchanted visual tales
            while generating measurable cultural, environmental and economic impact. Whether through
            an exclusive production or collaborative Co-Journeys, every project contributes to the
            same vision: transforming creative investment into a regenerative force that gives back
            to the territories that make it possible. More than a production model, Creation as an
            Impact is a Creative &amp; Impact Capital where financial resources, creative excellence
            and human collaboration circulate with intention, reducing excess, nurturing every
            resource with intention, and allowing lasting value to blossom across the entire
            ecosystem.
          </p>
        </div>
      </div>
    </section>
  );
}
