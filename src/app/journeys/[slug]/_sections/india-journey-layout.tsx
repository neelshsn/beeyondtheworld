'use client';

import clsx from 'clsx';
import useEmblaCarousel from 'embla-carousel-react';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import Image from 'next/image';
import { useEffect, useMemo, useState } from 'react';

import { useBodyScrollLock } from '@/app/concept/_hooks/use-body-scroll-lock';
import type { JourneyShowcase } from '@/data/showcases';

type ContentSectionId = 'community' | 'locations' | 'csr-impact';

type SectionTab = {
  id: ContentSectionId;
  label: string;
  icon: string;
};

type IndiaCard = {
  id: string;
  title: string;
  image: string;
};

type GlowParticle = {
  left: string;
  top: string;
  size: number;
  delay: number;
  duration: number;
};

const GLOW_PARTICLES: GlowParticle[] = [
  { left: '8%', top: '14%', size: 3.4, delay: 0, duration: 8.2 },
  { left: '16%', top: '24%', size: 2.8, delay: 0.6, duration: 9.4 },
  { left: '24%', top: '9%', size: 2.4, delay: 1.1, duration: 7.8 },
  { left: '34%', top: '18%', size: 3.1, delay: 0.9, duration: 8.9 },
  { left: '45%', top: '12%', size: 2.6, delay: 1.8, duration: 9.1 },
  { left: '58%', top: '20%', size: 2.3, delay: 0.4, duration: 8.5 },
  { left: '68%', top: '10%', size: 3.2, delay: 1.4, duration: 10.2 },
  { left: '78%', top: '22%', size: 2.5, delay: 2.1, duration: 9.6 },
  { left: '88%', top: '14%', size: 3, delay: 0.8, duration: 8.8 },
  { left: '10%', top: '64%', size: 2.7, delay: 1.6, duration: 9.8 },
  { left: '22%', top: '76%', size: 3.3, delay: 0.5, duration: 8.7 },
  { left: '38%', top: '84%', size: 2.2, delay: 1.2, duration: 10.5 },
  { left: '52%', top: '72%', size: 2.9, delay: 2, duration: 9.2 },
  { left: '66%', top: '82%', size: 2.4, delay: 0.7, duration: 8.3 },
  { left: '80%', top: '74%', size: 3.1, delay: 1.5, duration: 9.7 },
  { left: '92%', top: '86%', size: 2.6, delay: 2.2, duration: 8.9 },
];

const SECTION_TABS: SectionTab[] = [
  {
    id: 'community',
    label: 'Community',
    icon: '/assets/icones/Ico White BEE-13.svg',
  },
  {
    id: 'locations',
    label: 'Locations',
    icon: '/assets/icones/Ico White BEE-14.svg',
  },
  {
    id: 'csr-impact',
    label: 'Csr Impact',
    icon: '/assets/icones/Ico White BEE-06.svg',
  },
];

const SECTION_CONTENT: Record<ContentSectionId, IndiaCard[]> = {
  locations: [
    {
      id: 'india-locations-09',
      title: 'Rajahstan',
      image: '/assets/journeys/india-january-2026/india-january-2026-gallery-09.png',
    },
    {
      id: 'india-locations-16',
      title: 'Kerala',
      image: '/assets/journeys/india-january-2026/india-january-2026-gallery-16.png',
    },
    {
      id: 'india-locations-17',
      title: 'Goa',
      image: '/assets/journeys/india-january-2026/india-january-2026-gallery-17.png',
    },
  ],
  community: [
    {
      id: 'india-community-11',
      title: 'Artisan workshop',
      image: '/assets/journeys/india-january-2026/india-january-2026-gallery-11.png',
    },
    {
      id: 'india-community-05',
      title: 'Craft market',
      image: '/assets/journeys/india-january-2026/india-january-2026-gallery-05.png',
    },
    {
      id: 'india-community-13',
      title: 'Living traditions',
      image: '/assets/journeys/india-january-2026/india-january-2026-gallery-13.png',
    },
  ],
  'csr-impact': [
    {
      id: 'india-csr-04',
      title: 'Local ecosystem',
      image: '/assets/journeys/india-january-2026/india-january-2026-gallery-04.png',
    },
    {
      id: 'india-csr-08',
      title: 'Regenerative route',
      image: '/assets/journeys/india-january-2026/india-january-2026-gallery-08.png',
    },
    {
      id: 'india-csr-12',
      title: 'Impact partners',
      image: '/assets/journeys/india-january-2026/india-january-2026-gallery-12.png',
    },
  ],
};

type IndiaJourneyLayoutProps = {
  journey: JourneyShowcase;
};

export function IndiaJourneyLayout({ journey }: IndiaJourneyLayoutProps) {
  useBodyScrollLock();
  const reduceMotion = useReducedMotion();

  const [activeSection, setActiveSection] = useState<ContentSectionId>('locations');
  const [hoveredCardIndex, setHoveredCardIndex] = useState<number | null>(null);
  const [mobileSelectedIndex, setMobileSelectedIndex] = useState(0);
  const [mobileCanScrollPrev, setMobileCanScrollPrev] = useState(false);
  const [mobileCanScrollNext, setMobileCanScrollNext] = useState(false);
  const [mobileEmblaRef, mobileEmblaApi] = useEmblaCarousel({
    align: 'center',
    loop: false,
    dragFree: false,
    containScroll: 'trimSnaps',
  });

  const cards = useMemo(() => SECTION_CONTENT[activeSection], [activeSection]);

  useEffect(() => {
    if (!mobileEmblaApi) return;
    const onSelect = () => {
      setMobileSelectedIndex(mobileEmblaApi.selectedScrollSnap());
      setMobileCanScrollPrev(mobileEmblaApi.canScrollPrev());
      setMobileCanScrollNext(mobileEmblaApi.canScrollNext());
    };

    mobileEmblaApi.on('select', onSelect);
    mobileEmblaApi.on('reInit', onSelect);
    onSelect();

    return () => {
      mobileEmblaApi.off('select', onSelect);
      mobileEmblaApi.off('reInit', onSelect);
    };
  }, [mobileEmblaApi]);

  useEffect(() => {
    setHoveredCardIndex(null);
    if (!mobileEmblaApi) return;
    mobileEmblaApi.reInit();
    mobileEmblaApi.scrollTo(0, true);
    setMobileSelectedIndex(0);
  }, [activeSection, mobileEmblaApi]);

  return (
    <main className="relative h-[100dvh] w-full overflow-hidden text-white">
      <Image
        src="/assets/journeys/india-january-2026/india-january-2026-gallery-03.png"
        alt={`${journey.title} background`}
        fill
        priority
        className="object-cover object-center"
        sizes="100vw"
      />
      <div className="absolute inset-0 bg-[linear-gradient(110deg,rgba(41,22,9,0.58)_0%,rgba(99,62,33,0.44)_38%,rgba(56,34,21,0.5)_100%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_70%,rgba(222,166,112,0.36)_0%,rgba(222,166,112,0)_44%),radial-gradient(circle_at_86%_24%,rgba(255,232,181,0.14)_0%,rgba(255,232,181,0)_42%)]" />
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        {GLOW_PARTICLES.map((particle, index) => (
          <motion.span
            key={`india-glow-${index}`}
            className="absolute rounded-full bg-[radial-gradient(circle,rgba(255,239,205,0.98)_0%,rgba(255,214,145,0.76)_46%,rgba(255,214,145,0)_100%)] shadow-[0_0_22px_rgba(255,225,170,0.68)]"
            style={{
              left: particle.left,
              top: particle.top,
              width: `${particle.size}px`,
              height: `${particle.size}px`,
            }}
            animate={
              reduceMotion
                ? { opacity: 0.34 }
                : {
                    opacity: [0.25, 0.88, 0.38, 0.7, 0.25],
                    scale: [0.85, 1.55, 0.92, 1.3, 0.85],
                    y: [0, -8, 2, -6, 0],
                  }
            }
            transition={
              reduceMotion
                ? undefined
                : {
                    duration: particle.duration,
                    delay: particle.delay,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }
            }
          />
        ))}
      </div>

      <div className="relative z-10 flex h-full flex-col md:hidden">
        <div className="px-4 pt-[max(4.5rem,env(safe-area-inset-top))]">
          <nav
            className="grid grid-cols-3 gap-2 rounded-[18px] border border-white/20 bg-black/15 p-2 backdrop-blur-sm"
            aria-label="Journey sections mobile"
          >
            {SECTION_TABS.map((item) => {
              const isActive = item.id === activeSection;
              return (
                <button
                  key={`${item.id}-mobile`}
                  type="button"
                  onClick={() => setActiveSection(item.id)}
                  className={clsx(
                    'group flex flex-col items-center justify-center gap-1 rounded-[12px] px-2 py-2.5 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/55',
                    isActive ? 'bg-white/18 opacity-100' : 'opacity-80 hover:opacity-100'
                  )}
                  aria-pressed={isActive}
                >
                  <Image
                    src={item.icon}
                    alt=""
                    width={20}
                    height={20}
                    className={clsx(
                      'h-5 w-5 shrink-0 transition',
                      isActive ? 'drop-shadow-[0_0_8px_rgba(255,255,255,0.56)]' : 'opacity-90'
                    )}
                  />
                  <span className="truncate font-display text-[10px] uppercase tracking-[0.17em] text-white">
                    {item.label}
                  </span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="relative flex flex-1 items-center">
          <div className="w-full overflow-visible pb-5 pt-4" ref={mobileEmblaRef}>
            <div className="embla__container -mx-2 flex touch-pan-x items-end">
              {cards.map((card, index) => (
                <div key={`${card.id}-mobile`} className="embla__slide flex flex-[0_0_78%] px-2">
                  <article
                    className={clsx(
                      'group relative aspect-[3/4] w-full overflow-hidden bg-black/20 transition-opacity duration-300',
                      mobileSelectedIndex !== index ? 'opacity-55' : 'opacity-100'
                    )}
                  >
                    <Image
                      src={card.image}
                      alt={card.title}
                      fill
                      className="object-cover"
                      sizes="78vw"
                      priority={index === 0 && activeSection === 'locations'}
                    />
                    <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.05)_18%,rgba(0,0,0,0.5)_100%)]" />
                    <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between gap-2">
                      <button
                        type="button"
                        className="bg-black/20 px-4 py-1.5 font-display text-[8px] uppercase tracking-[0.28em] text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
                      >
                        Discover
                      </button>
                      <span className="truncate font-display text-[9px] uppercase tracking-[0.22em] text-white/85">
                        {card.title}
                      </span>
                    </div>
                  </article>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="pointer-events-none relative z-20 flex flex-col items-center gap-2 pb-[max(0.9rem,env(safe-area-inset-bottom))]">
          <h1 className="font-title text-[clamp(3.6rem,20vw,6.2rem)] leading-[0.8] text-white [text-shadow:0_0_20px_rgba(255,255,255,0.35)]">
            INDIA
          </h1>
          <p className="whitespace-nowrap font-display text-[9px] uppercase tracking-[0.18em] text-white/90">
            EDITION - JANUARY - FROM 27TH JANUARY
          </p>
          <div className="pointer-events-auto mt-1 flex items-center gap-3 text-white">
            <button
              type="button"
              onClick={() => mobileEmblaApi?.scrollPrev()}
              disabled={!mobileCanScrollPrev}
              className={clsx(
                'flex h-7 w-7 items-center justify-center transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/55',
                mobileCanScrollPrev
                  ? 'text-white/75 hover:text-white'
                  : 'cursor-not-allowed text-white/30'
              )}
              aria-label="Previous location"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <span className="font-display text-[10px] uppercase tracking-[0.2em] text-white/90">
              {String(mobileSelectedIndex + 1).padStart(2, '0')} /{' '}
              {String(cards.length).padStart(2, '0')}
            </span>
            <button
              type="button"
              onClick={() => mobileEmblaApi?.scrollNext()}
              disabled={!mobileCanScrollNext}
              className={clsx(
                'flex h-7 w-7 items-center justify-center transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/55',
                mobileCanScrollNext
                  ? 'text-white/75 hover:text-white'
                  : 'cursor-not-allowed text-white/30'
              )}
              aria-label="Next location"
            >
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="relative z-10 hidden h-full w-full grid-cols-[clamp(250px,32vw,460px)_1fr] md:grid">
        <aside className="flex min-h-0 flex-col justify-between px-6 py-8 sm:px-10 sm:py-10">
          <nav className="flex flex-col gap-10 pt-[15dvh]" aria-label="Journey sections">
            {SECTION_TABS.map((item) => {
              const isActive = item.id === activeSection;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveSection(item.id)}
                  className={clsx(
                    'group flex items-center gap-2.5 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50',
                    isActive ? 'opacity-100' : 'opacity-75 hover:opacity-100'
                  )}
                  aria-pressed={isActive}
                >
                  <Image
                    src={item.icon}
                    alt=""
                    width={32}
                    height={32}
                    className={clsx(
                      'h-8 w-8 shrink-0 transition',
                      isActive ? 'drop-shadow-[0_0_9px_rgba(255,255,255,0.6)]' : 'opacity-90'
                    )}
                  />
                  <span className="relative flex flex-col">
                    <span className="font-display text-[17px] font-bold uppercase tracking-[0.22em] text-white sm:text-[20px]">
                      {item.label}
                    </span>
                    <span
                      aria-hidden
                      className={clsx(
                        'mt-1.5 h-px w-full origin-left scale-x-0 rounded-full bg-gradient-to-r from-white/20 via-white/80 to-white/95 transition-transform duration-300 ease-out group-hover:scale-x-100',
                        isActive && 'scale-x-100'
                      )}
                    />
                  </span>
                </button>
              );
            })}
          </nav>

          <div className="space-y-3">
            <h1 className="font-title text-[clamp(4.8rem,14vw,10.8rem)] leading-[0.8] text-white [text-shadow:0_0_20px_rgba(255,255,255,0.35)]">
              INDIA
            </h1>
            <p className="whitespace-nowrap font-display text-[10px] uppercase tracking-[0.22em] text-white/90 sm:text-[11px]">
              EDITION - JANUARY - FROM 27TH JANUARY
            </p>
          </div>
        </aside>

        <section className="flex min-w-0 items-center pb-10 pl-1 pr-3 sm:pb-14 sm:pl-4 sm:pr-7 lg:pl-6 lg:pr-12">
          <div className="mx-auto w-full max-w-[1300px]">
            <div
              className="overflow-x-auto overflow-y-hidden [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
              onWheel={(event) => {
                if (Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return;
                event.currentTarget.scrollLeft += event.deltaY;
              }}
            >
              <div
                className="flex min-w-[980px] items-end"
                onMouseLeave={() => setHoveredCardIndex(null)}
              >
                {cards.map((card, index) => (
                  <article
                    key={card.id}
                    onMouseEnter={() => setHoveredCardIndex(index)}
                    onFocusCapture={() => setHoveredCardIndex(index)}
                    onBlurCapture={(event) => {
                      if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
                        setHoveredCardIndex(null);
                      }
                    }}
                    className={clsx(
                      'duration-400 ease-[cubic-bezier(0.22,1,0.36,1)] group relative aspect-[3/4] shrink-0 grow-0 overflow-hidden bg-black/20 transition-[flex-basis,opacity]',
                      hoveredCardIndex !== null && hoveredCardIndex !== index
                        ? 'opacity-45'
                        : 'opacity-100'
                    )}
                    style={{
                      flexBasis:
                        hoveredCardIndex === null
                          ? '33.3333%'
                          : hoveredCardIndex === index
                            ? '40%'
                            : '30%',
                    }}
                  >
                    <Image
                      src={card.image}
                      alt={card.title}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                      sizes="(min-width: 1280px) 33vw, (min-width: 768px) 34vw, 66vw"
                      priority={index === 0 && activeSection === 'locations'}
                    />
                    <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.03)_18%,rgba(0,0,0,0.48)_100%)]" />
                    <div className="absolute bottom-4 left-4 right-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <button
                        type="button"
                        className="bg-black/20 px-5 py-1.5 font-display text-[9px] uppercase tracking-[0.32em] text-white transition hover:bg-black/35 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
                      >
                        Discover
                      </button>
                      <span className="truncate font-display text-[9px] uppercase tracking-[0.28em] text-white/85">
                        {card.title}
                      </span>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
