'use client';

import Image from 'next/image';
import Link from 'next/link';
const BG_IMAGE = '/assets/home/creative-visual-production.webp';

export function HomeCreativePanel() {
  return (
    <section className="home-snap-panel relative overflow-hidden bg-[#040301] text-white">
      {/* Full background image */}
      <div className="absolute inset-0">
        <Image
          src={BG_IMAGE}
          alt="Creative production"
          fill
          quality={75}
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
            className="text-glow font-menu text-[clamp(1.55rem,4.7vw,5.25rem)] uppercase leading-[0.98] tracking-[0.01em] text-white"
          >
            We produce
            <br />
            Global campaigns
            <br />
            Through our Signature
            <br />
            &amp; Shared Journeys.
          </h2>
        </div>

        {/* Buttons — inline row, underline hover style */}
        <div className="flex w-full flex-wrap items-center gap-x-8 gap-y-5">
          <Link
            href="/concept"
            data-animate-text
            className="group relative inline-flex max-w-full flex-col items-start font-display text-[9px] uppercase leading-relaxed tracking-[0.45em] text-white"
          >
            <span>Discover our production models</span>
            <span className="mt-1.5 h-px w-full origin-left scale-x-0 bg-gradient-to-r from-[rgba(249,215,162,0.18)] via-[rgba(244,199,122,0.75)] to-[rgba(255,240,225,0.95)] transition-transform duration-300 ease-out group-hover:scale-x-100" />
          </Link>
        </div>
      </div>
    </section>
  );
}
