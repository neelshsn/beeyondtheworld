'use client';

import { SmartVideo } from '@/components/primitives';

const MANIFESTO_VIDEO = '/assets/home/innovation-back.mp4';

export function HomeManifestoPanel() {
  return (
    <section className="home-snap-panel relative overflow-hidden text-white">
      {/* Full-screen video background */}
      <div className="absolute inset-0">
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

      {/* Dark overlay for legibility */}
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(4,3,1,0.15)_0%,rgba(4,3,1,0.35)_50%,rgba(4,3,1,0.55)_100%)]" />

      {/* Centered manifesto text */}
      <div className="relative flex h-full items-center justify-center px-8 sm:px-16 lg:px-20">
        <p
          data-animate-text
          className="max-w-2xl text-center font-menu text-[clamp(1.1rem,1.9vw,1.8rem)] lowercase leading-[1.65] tracking-[0.02em] text-white/90"
        >
          we believe in innovation that reveals new horizons where our eyes once perceived only
          boundaries. it&apos;s all about dreams, perceptions and worldwide communities. we shape a
          collaborative ecosystem where each brand maintains its uniqueness while collectively
          contributing to a better world. we dream, we create, we are beeyond the world.
        </p>
      </div>
    </section>
  );
}
