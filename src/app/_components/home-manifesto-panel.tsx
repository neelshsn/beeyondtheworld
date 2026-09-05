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
          className="text-white/94 max-w-3xl text-center font-title text-[clamp(2.25rem,5.4vw,5.75rem)] leading-[0.92] tracking-[-0.015em]"
        >
          Our ambition is to connect the campaigns we create with the people, skills and local
          initiatives that give them life.
        </p>
      </div>
    </section>
  );
}
