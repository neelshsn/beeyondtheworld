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
          className="max-w-7xl text-center font-display text-[clamp(0.875rem,1.3vw,1.25rem)] leading-[2] tracking-[0.18em] text-white"
        >
          <span className="font-script text-[5em] leading-[0.8] tracking-normal">T</span>urning
          brands’ visual investment into creative capital by connecting local talent, cultural
          knowledge, communities and regenerative action to create lasting value beyond the
          campaign.
        </p>
      </div>
    </section>
  );
}
