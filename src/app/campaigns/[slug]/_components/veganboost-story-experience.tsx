'use client';

import Image from 'next/image';
import Link from 'next/link';
import type { ReactNode } from 'react';

import { SiteArrowIcon } from '@/components/icons/site-arrow-icon';
import { SmartVideo } from '@/components/primitives';

const STORY =
  'THERE IS AN ISLAND WHERE THE MOON WHISPERS NATURE’S SECRETS. IT IS THROUGH OBSCURITY THAT LIGHT REVEALS ITSELF. AT DAWN, IT LEAVES BEHIND ITS MOST PRECIOUS MEMORIES, WHERE THE SKY MELTS INTO THE SEA UNTIL THE HORIZON FADES AWAY. A LIVING WORK OF ART, SARAKINIKO BECOMES A CANVAS SCULPTED BY THE ELEMENTS. UPON ITS LUNAR LANDSCAPE, EVERY STRAND WEAVES ITS OWN TALE—A TALE OF THE SEASONS, OF JOURNEYS, OF EMOTIONS, AND OF TIME. LIKE THE CLIFFS SHAPED BY THE WIND AND THE SEA, HAIR EMBRACES EVERY ELEMENT THAT TOUCHES IT. NEVER LOSING ITS ESSENCE, ONLY REVEALING ITS TRUE NATURE. BECAUSE THE MOST BEAUTIFUL STORIES ARE NOT WRITTEN. THEY ARE LIVED.';

const CAMPAIGN_ASSET_ROOT = '/assets/campaigns/veganboost-greece';

export function VeganboostStoryExperience() {
  return (
    <main className="h-[100svh] snap-y snap-mandatory overflow-y-auto overscroll-y-contain bg-black text-white [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      <CampaignPanel label="Veganboost campaign introduction">
        <SmartVideo
          wrapperClassName="absolute inset-0"
          className="h-full w-full object-cover"
          src={`${CAMPAIGN_ASSET_ROOT}/veganboost-greece-hero.mp4`}
          poster={`${CAMPAIGN_ASSET_ROOT}/veganboost-greece-cover.webp`}
          fallbackImage={`${CAMPAIGN_ASSET_ROOT}/veganboost-greece-cover.webp`}
          autoPlay
          muted
          loop
          playsInline
          priority
          aria-hidden
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(7,8,6,0.2)_0%,rgba(7,8,6,0.02)_42%,rgba(7,8,6,0.72)_100%)]" />

        <Link
          href="/campaigns"
          className="text-white/78 absolute left-5 top-20 z-20 inline-flex items-center gap-2 py-2 font-display text-[0.58rem] uppercase tracking-[0.32em] transition hover:text-[#f6c452] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f6c452]/55 sm:left-10 sm:top-24"
        >
          <SiteArrowIcon direction="left" className="h-3 w-3" />
          All Campaigns
        </Link>

        <div className="absolute inset-x-0 bottom-0 z-10 px-6 pb-12 sm:px-12 sm:pb-16 lg:px-20 lg:pb-20">
          <h1 className="font-title text-[clamp(3.35rem,10vw,9.4rem)] uppercase leading-[0.76] tracking-[-0.025em] text-white [text-shadow:0_16px_60px_rgba(0,0,0,0.5)]">
            Veganboost
          </h1>
          <p className="text-white/88 mt-5 font-display text-[0.6rem] uppercase tracking-[0.34em] sm:text-[0.72rem]">
            Greece <span className="px-2 text-[#f6c452]">|</span> Fall Winter 23’
          </p>
        </div>
      </CampaignPanel>

      <CampaignImagePanel
        src={`${CAMPAIGN_ASSET_ROOT}/veganboost-greece-gallery-02.webp`}
        alt="Veganboost campaign in the waters of Milos"
        objectPosition="center 42%"
      />

      <CampaignPanel label="Memory of the moon">
        <SmartVideo
          wrapperClassName="absolute inset-0"
          className="h-full w-full object-cover"
          src={`${CAMPAIGN_ASSET_ROOT}/veganboost-greece-story.mp4`}
          poster={`${CAMPAIGN_ASSET_ROOT}/veganboost-greece-editorial-02.webp`}
          fallbackImage={`${CAMPAIGN_ASSET_ROOT}/veganboost-greece-editorial-02.webp`}
          autoPlay
          muted
          loop
          playsInline
          aria-hidden
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(6,7,5,0.72)_0%,rgba(6,7,5,0.54)_46%,rgba(6,7,5,0.16)_100%)] sm:bg-[linear-gradient(90deg,rgba(6,7,5,0.76)_0%,rgba(6,7,5,0.5)_46%,rgba(6,7,5,0.08)_78%)]" />

        <article className="relative z-10 flex h-full max-w-4xl flex-col justify-center px-6 pb-7 pt-20 sm:px-12 lg:px-20">
          <h2 className="max-w-2xl font-title text-[clamp(3.15rem,7vw,7rem)] normal-case leading-[0.82] tracking-[-0.025em] text-white">
            Memory of the moon
          </h2>
          <p className="text-white/86 mt-8 max-w-[46rem] font-sans text-[clamp(0.62rem,0.86vw,0.84rem)] uppercase leading-[1.78] tracking-[0.105em] sm:mt-10">
            {STORY}
          </p>
        </article>
      </CampaignPanel>

      <CampaignImagePanel
        src={`${CAMPAIGN_ASSET_ROOT}/veganboost-greece-editorial-01.webp`}
        alt="Veganboost models and product under the Milos sky"
        objectPosition="center center"
      />

      <CampaignImagePanel
        src={`${CAMPAIGN_ASSET_ROOT}/veganboost-greece-editorial-02.webp`}
        alt="Veganboost hair ritual in the Sarakiniko landscape"
        objectPosition="center center"
      />
    </main>
  );
}

function CampaignPanel({ children, label }: { children: ReactNode; label: string }) {
  return (
    <section
      className="relative h-[100svh] min-h-[100svh] snap-start snap-always overflow-hidden bg-black"
      aria-label={label}
    >
      {children}
    </section>
  );
}

function CampaignImagePanel({
  src,
  alt,
  objectPosition,
}: {
  src: string;
  alt: string;
  objectPosition: string;
}) {
  return (
    <CampaignPanel label={alt}>
      <Image
        src={src}
        alt={alt}
        fill
        quality={100}
        sizes="100vw"
        className="object-cover"
        style={{ objectPosition }}
      />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(5,5,4,0.06)_0%,rgba(5,5,4,0)_65%,rgba(5,5,4,0.18)_100%)]" />
    </CampaignPanel>
  );
}
