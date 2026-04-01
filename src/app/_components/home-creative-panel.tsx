'use client';

import Image from 'next/image';
import Link from 'next/link';
const BG_IMAGE = '/assets/campaigns/maradji-ibiza/maradji-ibiza-cover.jpg';

type HomeCreativePanelProps = {
  coCreateHref: string;
};

export function HomeCreativePanel({ coCreateHref }: HomeCreativePanelProps) {
  return (
    <section className="home-snap-panel relative overflow-hidden bg-[#040301] text-white">
      {/* Full background image */}
      <div className="absolute inset-0">
        <Image
          src={BG_IMAGE}
          alt="Creative production"
          fill
          quality={100}
          sizes="100vw"
          className="object-cover"
          priority
        />
      </div>

      {/* Subtle dark overlay for text legibility */}
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(4,3,1,0.28)_0%,rgba(4,3,1,0.12)_40%,rgba(4,3,1,0.48)_75%,rgba(4,3,1,0.72)_100%)]" />

      {/* Bottom content — titles above, smaller buttons inline below */}
      <div className="absolute inset-x-0 bottom-0 flex flex-col items-start gap-8 px-6 pb-16 sm:px-12 sm:pb-20 lg:px-20 lg:pb-24">
        {/* Large text — Cannia uppercase */}
        <div className="text-left">
          <h2
            data-animate-text
            className="text-glow font-menu text-[clamp(2.4rem,7vw,8.5rem)] uppercase leading-[0.88] tracking-[0.02em] text-white"
          >
            Creative
          </h2>
          <h2
            data-animate-text
            className="text-glow font-menu text-[clamp(2.4rem,7vw,8.5rem)] uppercase leading-[0.88] tracking-[0.02em] text-white"
          >
            Visuals
          </h2>
          <h2
            data-animate-text
            className="text-glow font-menu text-[clamp(2.4rem,7vw,8.5rem)] uppercase leading-[0.88] tracking-[0.02em] text-white"
          >
            Production
          </h2>
          <h2
            data-animate-text
            className="text-glow font-menu text-[clamp(2.4rem,7vw,8.5rem)] uppercase leading-[0.88] tracking-[0.02em] text-white"
          >
            Beeyond <span className="font-script lowercase">the</span> world
          </h2>
        </div>

        {/* Buttons — inline row, underline hover style */}
        <div className="flex items-center gap-8">
          <Link
            href={coCreateHref}
            data-animate-text
            className="group relative inline-flex flex-col items-start font-display text-[9px] uppercase tracking-[0.45em] text-white"
          >
            <span>Co-create a journey</span>
            <span className="mt-1.5 h-px w-full origin-left scale-x-0 bg-gradient-to-r from-[rgba(249,215,162,0.18)] via-[rgba(244,199,122,0.75)] to-[rgba(255,240,225,0.95)] transition-transform duration-300 ease-out group-hover:scale-x-100" />
          </Link>
          <Link
            href="/concept"
            data-animate-text
            className="group relative inline-flex flex-col items-start font-display text-[9px] uppercase tracking-[0.45em] text-white"
          >
            <span>Discover the concept</span>
            <span className="mt-1.5 h-px w-full origin-left scale-x-0 bg-gradient-to-r from-[rgba(249,215,162,0.18)] via-[rgba(244,199,122,0.75)] to-[rgba(255,240,225,0.95)] transition-transform duration-300 ease-out group-hover:scale-x-100" />
          </Link>
        </div>
      </div>
    </section>
  );
}
