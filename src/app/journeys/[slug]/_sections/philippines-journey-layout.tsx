'use client';

import { useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowUpRight, CalendarDays, ChevronDown, Compass, MapPin, Waves } from 'lucide-react';

import { SmartVideo } from '@/components/primitives/smart-video';
import { Button } from '@/components/ui/button';
import type { JourneyShowcase } from '@/data/showcases';

type LocationMoment = {
  id: string;
  name: string;
  background: string;
  kicker: string;
  description: string;
  details: string[];
  gallery: { id: string; src: string; alt: string }[];
};

type GradientMosaic = {
  id: string;
  images: { id: string; src: string; alt: string }[];
};

const LOCATION_MOMENTS: LocationMoment[] = [
  {
    id: 'palawan',
    name: 'Palawan blue rooms',
    background: '/assets/journeys/philippines-lagoon-2025/philippines-lagoon-2025-gallery-01.png',
    kicker: 'Base camp catamaran',
    description:
      'Les premiers jours s&apos;ancrent dans la baie turquoise de Palawan. Nous installons le studio flottant et cartographions les lagons en hydravion pour verrouiller les scenes bleues du recit.',
    details: [
      'Brief lumiere au lever du soleil sur les falaises karstiques',
      'Atelier costume avec les tisserandes Tagbanwa',
      'Session cinema sous-marin guidee par nos reef rangers',
    ],
    gallery: [
      {
        id: 'palawan-01',
        src: '/assets/journeys/philippines-lagoon-2025/philippines-lagoon-2025-gallery-03.png',
        alt: 'Catamaran installe dans un lagon secret',
      },
      {
        id: 'palawan-02',
        src: '/assets/journeys/philippines-lagoon-2025/philippines-lagoon-2025-gallery-04.png',
        alt: 'Equipe en reperage lumiere sur les falaises',
      },
      {
        id: 'palawan-03',
        src: '/assets/journeys/philippines-lagoon-2025/philippines-lagoon-2025-gallery-06.png',
        alt: 'Immersion sous-marine avec eclairage cinematographique',
      },
    ],
  },
  {
    id: 'siargao',
    name: 'Siargao culture lab',
    background: '/assets/journeys/philippines-lagoon-2025/philippines-lagoon-2025-gallery-07.png',
    kicker: 'Residences creatives',
    description:
      'Siargao concentre l&apos;experience communautaire. On y tisse les accessoires, on compose les soundscapes et on capture les couchers de soleil qui signent la campagne.',
    details: [
      'Sound design live avec les guardians de la mangrove',
      'Slow fashion sur pilotis avec artisans et luthiers',
      'Golden hour stabilisee depuis les bancas traditionnelles',
    ],
    gallery: [
      {
        id: 'siargao-01',
        src: '/assets/journeys/philippines-lagoon-2025/philippines-lagoon-2025-gallery-08.png',
        alt: 'Collecte de textures sonores au bord de l&apos;ocean',
      },
      {
        id: 'siargao-02',
        src: '/assets/journeys/philippines-lagoon-2025/philippines-lagoon-2025-gallery-05.png',
        alt: 'Artisan tissant des accessoires sur pilotis',
      },
      {
        id: 'siargao-03',
        src: '/assets/journeys/philippines-lagoon-2025/philippines-lagoon-2025-gallery-09.png',
        alt: 'Banca traditionnelle au coucher du soleil',
      },
    ],
  },
];

const GRADIENT_MOSAICS: GradientMosaic[] = [
  {
    id: 'lagoon-chroma',
    images: [
      {
        id: 'mosaic-lagoon-01',
        src: '/assets/journeys/philippines-lagoon-2025/philippines-lagoon-2025-gallery-02.png',
        alt: 'Survol d&apos;un banc de sable turquoise',
      },
      {
        id: 'mosaic-lagoon-02',
        src: '/assets/journeys/philippines-lagoon-2025/philippines-lagoon-2025-gallery-12.png',
        alt: 'Tournage sous-marin avec plongeur et camera',
      },
      {
        id: 'mosaic-lagoon-03',
        src: '/assets/journeys/philippines-lagoon-2025/philippines-lagoon-2025-gallery-10.png',
        alt: 'Diner flottant au coucher du soleil',
      },
    ],
  },
  {
    id: 'culture-spectrum',
    images: [
      {
        id: 'mosaic-culture-01',
        src: '/assets/journeys/philippines-lagoon-2025/philippines-lagoon-2025-gallery-11.png',
        alt: 'Portrait d&apos;artisane et textiles teints',
      },
      {
        id: 'mosaic-culture-02',
        src: '/assets/journeys/philippines-lagoon-2025/philippines-lagoon-2025-gallery-04.png',
        alt: 'Equipe technique sur un banc de sable',
      },
      {
        id: 'mosaic-culture-03',
        src: '/assets/journeys/philippines-lagoon-2025/philippines-lagoon-2025-gallery-06.png',
        alt: 'Sequence macro corail et lumiere cinema',
      },
    ],
  },
];

const HERO_TRANSITION = { duration: 0.7, ease: [0.22, 1, 0.36, 1] } as const;

export function PhilippinesJourneyLayout({ journey }: { journey: JourneyShowcase }) {
  const [isHeroExpanded, setIsHeroExpanded] = useState(false);

  const iconCards = useMemo(
    () => [
      {
        id: 'locales',
        icon: MapPin,
        label: 'Territoires',
        description: journey.locale,
      },
      {
        id: 'timing',
        icon: CalendarDays,
        label: 'Fenetre',
        description: journey.timeframe,
      },
      {
        id: 'impact',
        icon: Waves,
        label: 'Impact',
        description: 'Reef-safe logistics & ateliers communautaires',
      },
    ],
    [journey.locale, journey.timeframe]
  );

  return (
    <main className="flex flex-col gap-0 bg-black text-white">
      <HeroSection
        journey={journey}
        iconCards={iconCards}
        isExpanded={isHeroExpanded}
        onExpand={() => setIsHeroExpanded(true)}
      />

      <section className="relative overflow-hidden bg-[#02141f] px-6 py-20 sm:px-10 lg:px-24">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(255,255,255,0.08),transparent_55%),radial-gradient(circle_at_80%_30%,rgba(4,49,68,0.45),transparent_60%)]" />
        <div className="relative mx-auto grid max-w-5xl gap-6 text-foreground sm:grid-cols-3">
          {iconCards.map((card) => (
            <article
              key={card.id}
              className="group flex flex-col gap-4 rounded-3xl border border-white/15 bg-white/5 p-8 text-left text-white transition duration-500 hover:border-white/35 hover:bg-white/10"
            >
              <card.icon
                className="size-6 text-white/80 transition group-hover:text-white"
                aria-hidden
              />
              <h3 className="text-[11px] uppercase tracking-[0.42em] text-white/60">
                {card.label}
              </h3>
              <p className="text-sm leading-relaxed text-white/85">{card.description}</p>
            </article>
          ))}
        </div>
      </section>

      {LOCATION_MOMENTS.map((moment, index) => (
        <LocationMomentSection key={moment.id} moment={moment} alignRight={index % 2 === 1} />
      ))}

      {GRADIENT_MOSAICS.map((mosaic) => (
        <GradientMosaicSection key={mosaic.id} mosaic={mosaic} />
      ))}

      <VideoCTASection />

      <section className="relative overflow-hidden bg-gradient-to-b from-black via-[#031623] to-black px-6 py-24 text-center sm:px-10">
        <div className="mx-auto max-w-4xl space-y-5">
          <p className="text-[11px] uppercase tracking-[0.42em] text-white/50">
            Philippines journey
          </p>
          <h2 className="font-display text-4xl uppercase leading-tight sm:text-5xl md:text-6xl">
            {journey.title}
          </h2>
          <p className="mx-auto max-w-2xl text-sm leading-relaxed text-white/75">
            {journey.summary}
          </p>
        </div>
      </section>

      <FinalCTASection />
    </main>
  );
}

type HeroSectionProps = {
  journey: JourneyShowcase;
  iconCards: { id: string; icon: typeof MapPin; label: string; description: string }[];
  isExpanded: boolean;
  onExpand: () => void;
};

function HeroSection({ journey, iconCards, isExpanded, onExpand }: HeroSectionProps) {
  return (
    <section className="relative min-h-screen overflow-hidden">
      <Image
        src={journey.hero.src}
        alt={journey.hero.alt}
        fill
        priority
        sizes="100vw"
        className="object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/85 via-black/40 to-black/85" />

      <div className="relative z-10 flex min-h-screen flex-col justify-center px-6 py-16 sm:px-10 lg:px-24">
        <motion.div
          className={`flex w-full flex-col gap-6 transition-all duration-700 ${
            isExpanded ? 'max-w-3xl text-left' : 'items-center text-center'
          }`}
          animate={{
            alignItems: isExpanded ? 'flex-start' : 'center',
            textAlign: isExpanded ? 'left' : 'center',
          }}
          transition={HERO_TRANSITION}
        >
          <motion.span
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...HERO_TRANSITION, delay: 0.2 }}
            className="inline-flex items-center gap-3 text-[11px] uppercase tracking-[0.45em] text-white/60"
          >
            <Compass className="size-4" aria-hidden />
            Journey 01
          </motion.span>

          <motion.h1
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...HERO_TRANSITION, delay: 0.3 }}
            className="font-display text-5xl uppercase leading-[1.02] sm:text-6xl md:text-7xl"
          >
            {journey.title}
          </motion.h1>

          <AnimatePresence>
            {isExpanded ? (
              <motion.p
                key="description"
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 12 }}
                transition={{ ...HERO_TRANSITION, delay: 0.1 }}
                className="max-w-2xl text-sm leading-relaxed text-white/75 sm:text-base"
              >
                {journey.summary}
              </motion.p>
            ) : null}
          </AnimatePresence>
        </motion.div>

        <div className="mt-16 flex flex-col items-center gap-6">
          <motion.button
            type="button"
            onClick={onExpand}
            className="group inline-flex size-16 items-center justify-center rounded-full border border-white/35 bg-white/10 text-white transition hover:border-white/60 hover:bg-white/20"
            whileTap={{ scale: 0.94 }}
            aria-label="Deployer le descriptif"
          >
            <ChevronDown className="size-6 transition group-hover:translate-y-1" aria-hidden />
          </motion.button>
          <p className="hidden text-[11px] uppercase tracking-[0.4em] text-white/60 sm:block">
            Explorer le voyage
          </p>
        </div>

        <div className="mt-16 hidden gap-6 text-white/80 lg:flex">
          {iconCards.map((card) => (
            <div
              key={card.id}
              className="flex items-center gap-3 text-sm uppercase tracking-[0.32em]"
            >
              <card.icon className="size-4" aria-hidden />
              {card.description}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

type LocationMomentSectionProps = {
  moment: LocationMoment;
  alignRight: boolean;
};

function LocationMomentSection({ moment, alignRight }: LocationMomentSectionProps) {
  return (
    <section className="relative overflow-hidden">
      <Image
        src={moment.background}
        alt={moment.name}
        fill
        sizes="100vw"
        className="object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/85 via-black/55 to-black/85" />

      <div
        className={`relative z-10 mx-auto flex w-full flex-col gap-12 px-6 py-24 sm:px-10 lg:px-24 ${
          alignRight ? 'lg:flex-row-reverse' : 'lg:flex-row'
        }`}
      >
        <div className="max-w-xl space-y-6 text-white">
          <p className="text-[11px] uppercase tracking-[0.42em] text-white/55">{moment.kicker}</p>
          <h2 className="font-display text-4xl uppercase leading-tight sm:text-5xl">
            {moment.name}
          </h2>
          <p className="text-sm leading-relaxed text-white/80 sm:text-base">{moment.description}</p>
          <ul className="space-y-3 text-sm text-white/75">
            {moment.details.map((detail) => (
              <li key={detail} className="flex items-start gap-3">
                <span className="mt-1 size-1.5 rounded-full bg-white/40" aria-hidden />
                <span>{detail}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex flex-1 items-end justify-center">
          <div className="flex w-full max-w-sm flex-col gap-6">
            {moment.gallery.map((item, index) => (
              <div
                key={item.id}
                style={{
                  marginLeft: `${(alignRight ? index : moment.gallery.length - 1 - index) * 1.25}rem`,
                }}
                className="relative aspect-[4/5] overflow-hidden rounded-3xl border border-white/20 bg-white/10 shadow-[0_24px_90px_rgba(3,10,16,0.35)]"
              >
                <Image src={item.src} alt={item.alt} fill sizes="320px" className="object-cover" />
                <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/40" />
                <span className="absolute inset-x-0 bottom-0 px-4 py-3 text-[11px] uppercase tracking-[0.34em] text-white/80">
                  {item.alt}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

type GradientMosaicSectionProps = {
  mosaic: GradientMosaic;
};

function GradientMosaicSection({ mosaic }: GradientMosaicSectionProps) {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 bg-[#01090f]" />
      <div className="absolute inset-0 opacity-70" aria-hidden>
        <div className="h-full w-full bg-[radial-gradient(circle_at_33%_50%,rgba(41,170,208,0.25),transparent_58%),radial-gradient(circle_at_66%_50%,rgba(9,63,93,0.35),transparent_62%)]" />
      </div>
      <div className="relative grid min-h-[60vh] grid-cols-1 divide-y divide-white/10 md:grid-cols-3 md:divide-x md:divide-y-0">
        {mosaic.images.map((image) => (
          <div key={image.id} className="relative h-full w-full overflow-hidden">
            <Image
              src={image.src}
              alt={image.alt}
              fill
              sizes="(min-width: 768px) 33vw, 100vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/25 to-black/70" />
            <p className="absolute inset-x-0 bottom-0 px-6 pb-6 text-[11px] uppercase tracking-[0.34em] text-white/80">
              {image.alt}
            </p>
          </div>
        ))}
      </div>
      <div className="pointer-events-none absolute inset-y-0 left-1/3 w-px bg-white/10" />
      <div className="pointer-events-none absolute inset-y-0 right-1/3 w-px bg-white/10" />
    </section>
  );
}

function VideoCTASection() {
  return (
    <section className="relative flex min-h-[70vh] items-center justify-center overflow-hidden">
      <SmartVideo
        wrapperClassName="absolute inset-0"
        className="h-full w-full object-cover"
        sources={[
          { src: '/assets/concept/sustainable.mp4', type: 'video/mp4' },
          { src: '/assets/concept/sustainable.webm', type: 'video/webm' },
        ]}
        poster="/assets/concept/sustainable-poster.png"
        fallbackImage="/assets/concept/sustainable-poster.png"
        autoPlay
        muted
        loop
        playsInline
        aria-hidden
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/40 to-black/80" />

      <div className="relative z-10 mx-auto flex max-w-3xl flex-col items-center gap-8 text-center">
        <p className="text-[11px] uppercase tracking-[0.42em] text-white/55">
          Campagnes Philippines
        </p>
        <h2 className="font-display text-4xl uppercase leading-tight sm:text-5xl">
          Explorer les collaborations deja tournees dans l&apos;archipel
        </h2>
        <p className="max-w-2xl text-sm leading-relaxed text-white/75">
          Immergez-vous dans les films et series photo realises avec nos marques partenaires pour
          capter la richesse des Philippines avant votre propre voyage.
        </p>
        <Button
          asChild
          className="inline-flex items-center gap-3 rounded-full border border-white/35 bg-white/90 px-8 py-3 text-[11px] uppercase tracking-[0.4em] text-foreground hover:bg-white"
        >
          <Link href="/campaigns?country=Philippines">
            Voir les campagnes
            <ArrowUpRight className="size-4" aria-hidden />
          </Link>
        </Button>
      </div>
    </section>
  );
}

function FinalCTASection() {
  return (
    <section className="relative flex min-h-[80vh] items-center overflow-hidden">
      <Image
        src="/assets/journeys/philippines-lagoon-2025/philippines-lagoon-2025-gallery-02.png"
        alt="Lagoon aerien"
        fill
        sizes="100vw"
        className="object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/85 via-black/45 to-black/85" />

      <div className="relative z-10 mx-auto flex max-w-4xl flex-col items-center gap-8 px-6 text-center sm:px-10">
        <p className="text-[11px] uppercase tracking-[0.42em] text-white/55">
          Plug &amp; play journey
        </p>
        <h2 className="font-display text-4xl uppercase leading-tight sm:text-5xl">
          Invitez votre marque a embarquer sur le camp Philippines
        </h2>
        <p className="max-w-2xl text-sm leading-relaxed text-white/75">
          Nous partageons le calendrier, la logistique et les partenaires locaux pour integrer votre
          marque au recit. Quelques creneaux sont encore ouverts sur la saison 2025.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Button
            asChild
            className="rounded-full border border-white/35 bg-white/90 px-8 py-3 text-[11px] uppercase tracking-[0.4em] text-foreground hover:bg-white"
          >
            <Link href="/contact">Se brancher sur le voyage</Link>
          </Button>
          <Button
            asChild
            variant="outline"
            className="rounded-full border border-white/35 bg-white/10 px-8 py-3 text-[11px] uppercase tracking-[0.4em] text-white hover:bg-white/25"
          >
            <Link href="mailto:hello@beeyondtheworld.com?subject=Philippines%20Journey">
              Recevoir le dossier
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
