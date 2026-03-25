'use client';

import { SmartVideo } from '@/components/primitives';

const MANIFESTO_VIDEO = '/assets/campaigns/maradji-ibiza/maradji-ibiza-story-02.mp4';

export function HomeManifestoPanel() {
  return (
    <section className="home-snap-panel relative overflow-hidden text-white">
      <div className="relative grid h-full grid-cols-1 lg:grid-cols-2">
        {/* Left column — Manifesto text centered on cream/beige bg */}
        <div
          data-manifesto-left
          className="flex items-center justify-center bg-[#efe3d1] px-10 py-20 sm:px-16 lg:px-20"
        >
          <p
            data-animate-text
            className="max-w-md text-center font-menu text-[clamp(1.1rem,1.9vw,1.8rem)] lowercase leading-[1.65] tracking-[0.02em] text-[#1b130e]/85"
          >
            we believe in innovation that reveals new horizons where our eyes once perceived only
            boundaries. it&apos;s all about dreams, perceptions and worldwide communities. we shape
            a collaborative ecosystem where each brand maintains its uniqueness while collectively
            contributing to a better world. we dream, we create, we are beeyond the world.
          </p>
        </div>

        {/* Right column — Video */}
        <div data-manifesto-right className="relative min-h-[50vh] lg:min-h-0">
          <SmartVideo
            wrapperClassName="absolute inset-0"
            className="h-full w-full object-cover"
            src={MANIFESTO_VIDEO}
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
