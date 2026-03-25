'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

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

      {/* Top center tagline — Adam italic uppercase */}
      <div className="absolute inset-x-0 top-0 flex justify-center pt-28 sm:pt-32">
        <p
          data-animate-text
          className="font-display text-[clamp(0.58rem,0.8vw,0.72rem)] uppercase italic tracking-[0.52em] text-white/80"
        >
          We dream we create
        </p>
      </div>

      {/* Bottom content — titles above, smaller buttons inline below */}
      <div className="absolute inset-x-0 bottom-0 flex flex-col items-start gap-8 px-6 pb-16 sm:px-12 sm:pb-20 lg:px-20 lg:pb-24">
        {/* Large text — Cannia uppercase */}
        <div className="text-left">
          <h2
            data-animate-text
            className="font-menu text-[clamp(2.4rem,7vw,8.5rem)] uppercase leading-[0.88] tracking-[0.02em] text-white"
          >
            Creative
          </h2>
          <h2
            data-animate-text
            className="font-menu text-[clamp(2.4rem,7vw,8.5rem)] uppercase leading-[0.88] tracking-[0.02em] text-white"
          >
            Visuals
          </h2>
          <h2
            data-animate-text
            className="font-menu text-[clamp(2.4rem,7vw,8.5rem)] uppercase leading-[0.88] tracking-[0.02em] text-white"
          >
            Production
          </h2>
          <h2
            data-animate-text
            className="font-menu text-[clamp(2.4rem,7vw,8.5rem)] uppercase leading-[0.88] tracking-[0.02em] text-white"
          >
            Beeyond the world
          </h2>
        </div>

        {/* Buttons — inline row, smaller, below titles */}
        <div className="flex items-center gap-4">
          <Link
            href={coCreateHref}
            data-animate-text
            className="group relative inline-flex items-center justify-center overflow-hidden rounded-none border border-white/25 bg-white/10 px-8 py-2.5 font-display text-[9px] uppercase tracking-[0.45em] text-white transition-colors duration-300 [transition-timing-function:var(--bee-ease)] hover:border-white/60 hover:bg-white/15"
          >
            <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-[#f6c452bf] to-transparent opacity-0 transition-transform duration-500 group-hover:translate-x-full group-hover:opacity-100" />
            Co-create a journey
          </Link>
          <Link
            href="/concept"
            data-animate-text
            className="group relative inline-flex items-center justify-center overflow-hidden rounded-none border border-white/25 bg-white/10 px-8 py-2.5 font-display text-[9px] uppercase tracking-[0.45em] text-white transition-colors duration-300 [transition-timing-function:var(--bee-ease)] hover:border-white/60 hover:bg-white/15"
          >
            <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-[#f6c452bf] to-transparent opacity-0 transition-transform duration-500 group-hover:translate-x-full group-hover:opacity-100" />
            Discover the concept
          </Link>
        </div>
      </div>
    </section>
  );
}
