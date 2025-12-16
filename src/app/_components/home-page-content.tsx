'use client';

import { useGSAP } from '@gsap/react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Image from 'next/image';
import Link from 'next/link';
import { Instagram, Linkedin } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';

import { JourneyShowcaseCarousel } from '@/app/_components/journey-showcase-carousel';
import SplitText from '@/components/SplitText';
import { GlowTitle, SmartVideo } from '@/components/primitives';
import { Button } from '@/components/ui/button';
import type { JourneyShowcase } from '@/data/showcases';

gsap.registerPlugin(ScrollTrigger, useGSAP);

type HomePageContentProps = {
  coCreateHref: string;
  heroVideoSrc: string;
  upcomingJourneys: JourneyShowcase[];
  campaignCtaImage?: string;
};

type TriptychTileId = 'bees' | 'flowers' | 'honey';

export default function HomePageContent({
  coCreateHref,
  heroVideoSrc,
  upcomingJourneys,
  campaignCtaImage,
}: HomePageContentProps) {
  const heroSectionRef = useRef<HTMLElement | null>(null);
  const heroContentRef = useRef<HTMLDivElement | null>(null);
  const overlapStackRef = useRef<HTMLDivElement | null>(null);
  const triptychRef = useRef<HTMLDivElement | null>(null);
  const movingLineRef = useRef<HTMLDivElement | null>(null);
  const lineStartRef = useRef<number>(0);
  const [movingLineShift, setMovingLineShift] = useState(0);
  const [lineOverlapFraction, setLineOverlapFraction] = useState(0);
  const [activeTile, setActiveTile] = useState<TriptychTileId | null>(null);
  const [displayTile, setDisplayTile] = useState<TriptychTileId | null>(null);
  const [scrollProgress, setScrollProgress] = useState(0);

  useGSAP(
    () => {
      const heroEl = heroSectionRef.current;
      const stackEl = overlapStackRef.current;
      if (!heroEl || !stackEl) return;

      const endDistance = () => {
        const stackHeight = stackEl.getBoundingClientRect().height;
        const viewport = window.innerHeight || heroEl.getBoundingClientRect().height || 1;
        const minimum = viewport * 1.15;
        if (!stackHeight) return `+=${minimum}`;
        return `+=${Math.max(minimum, stackHeight - viewport * 0.35)}`;
      };

      const timeline = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: heroEl,
          start: 'top top',
          end: endDistance,
          scrub: true,
          pin: true,
          pinSpacing: false,
          anticipatePin: 1,
          onUpdate: (self) => setScrollProgress(self.progress),
        },
      });

      timeline.fromTo(
        stackEl,
        { yPercent: 14 },
        { yPercent: 0, duration: 1, ease: 'none', immediateRender: true }
      );

      return () => {
        timeline.scrollTrigger?.kill();
        timeline.kill();
      };
    },
    { dependencies: [] }
  );

  useEffect(() => {
    const handlePosition = () => {
      const lineEl = movingLineRef.current;
      const tripEl = triptychRef.current;
      if (!lineEl || !tripEl) return;

      const rect = lineEl.getBoundingClientRect();
      const absoluteTop = rect.top + window.scrollY;
      if (!lineStartRef.current) {
        lineStartRef.current = absoluteTop;
      }
      const startY = lineStartRef.current;
      const tripTop = tripEl.offsetTop;

      const rawShift = window.scrollY - startY + rect.height * 0.1;
      const maxShift = Math.max(tripTop - startY + rect.height * 0.5, 0);
      const clamped = Math.min(Math.max(rawShift, 0), maxShift);
      const overlapStart = Math.max(tripTop - startY - rect.height * 0.2, 0);
      const overlapProgress =
        clamped <= overlapStart || maxShift <= overlapStart
          ? 0
          : Math.min((clamped - overlapStart) / (maxShift - overlapStart), 1);

      setMovingLineShift(clamped);
      setLineOverlapFraction(overlapProgress);
    };

    const handleResize = () => {
      lineStartRef.current = 0;
      handlePosition();
    };

    handlePosition();
    window.addEventListener('scroll', handlePosition, { passive: true });
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('scroll', handlePosition);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  useEffect(() => {
    if (activeTile) {
      setDisplayTile(activeTile);
      return;
    }

    const timeout = window.setTimeout(() => setDisplayTile(null), 900);
    return () => window.clearTimeout(timeout);
  }, [activeTile]);

  const triptychCards = useMemo(
    () => [
      {
        id: 'bees' as TriptychTileId,
        image: '/assets/campaigns/almaaz-kenya/almaaz-kenya-carousel-01.jpg',
        icon: '/assets/icones/Ico White BEE-13.svg',
        label: "BEE'S",
      },
      {
        id: 'flowers' as TriptychTileId,
        image: '/assets/journeys/bolivia-september-2026/bolivia-september-2026-gallery-10.png',
        icon: '/assets/icones/Ico White BEE-14.svg',
        label: 'FLOWERS',
      },
      {
        id: 'honey' as TriptychTileId,
        image: '/assets/campaigns/almaaz-kenya/almaaz-kenya-gallery-01.jpg',
        icon: '/assets/icones/Ico White BEE-06.svg',
        label: 'HONEY',
      },
    ],
    []
  );

  return (
    <main className="flex flex-col bg-[#fdf9ee]">
      <section
        ref={heroSectionRef}
        className="relative isolate z-0 flex min-h-screen flex-col justify-end overflow-hidden text-white"
      >
        <SmartVideo
          wrapperClassName="absolute inset-0 z-0"
          className="h-full w-full object-cover"
          src={heroVideoSrc}
          autoPlay
          muted
          loop
          playsInline
          aria-hidden
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/35 via-black/30 to-[#0d0b08]/70" />

        <div
          ref={heroContentRef}
          className="relative z-20 flex h-full flex-col justify-end gap-12 px-6 pb-20 pt-32 sm:px-10 sm:pb-24 sm:pt-36 lg:px-20"
          style={{
            transform: `translateY(${scrollProgress * -14}px) scale(${1 - scrollProgress * 0.04})`,
            opacity: 1 - scrollProgress * 0.12,
            transition: 'transform 90ms linear, opacity 90ms linear',
          }}
        >
          <div className="max-w-4xl space-y-6 drop-shadow-[0_12px_32px_rgba(0,0,0,0.55)]">
            <div className="flex items-center">
              <Image
                src="/assets/icones/Ico Gold BEE-13.svg"
                alt="Beeyondtheworld Atelier"
                width={180}
                height={180}
                className="h-16 w-auto"
                style={{
                  filter:
                    'drop-shadow(0 0 26px rgba(246,196,82,0.75)) drop-shadow(0 12px 32px rgba(0,0,0,0.45))',
                }}
                priority
              />
            </div>
            <SplitText
              text="Co-journeys pioneering approach for a sustainable transition in fashion advertising"
              tag="h1"
              splitType="words, chars"
              className="font-title text-5xl uppercase leading-tight tracking-[0em] text-white sm:text-6xl"
              style={{
                textShadow:
                  '0 0 22px rgba(255,255,255,0.95), 0 0 48px rgba(255,255,255,0.65), 0 12px 32px rgba(0,0,0,0.55)',
              }}
              textAlign="left"
            />
            <p className="max-w-2xl text-sm leading-relaxed text-white/85">
              Beeyondtheworld&rsquo;s mission is to curb the excessive individualization of visual
              productions by optimizing every resource with intelligence and intention. We introduce
              a refined, sustainable model that elevates creative excellence while minimizing
              impact, proving that luxury and responsibility can move forward as one.
            </p>
          </div>

          <div className="pointer-events-auto flex w-full justify-center pb-10 sm:pb-12">
            <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-5">
              <Button
                asChild
                className="group relative inline-flex items-center justify-center gap-4 overflow-hidden rounded-full border border-white/25 bg-white/10 px-12 py-4 font-display text-[11px] uppercase tracking-[0.5em] text-white transition-colors duration-300 [transition-timing-function:var(--bee-ease)] hover:border-white/60 hover:bg-white/15 focus-visible:ring-[#f6c452]/35"
              >
                <Link
                  href={coCreateHref}
                  className="relative inline-flex items-center justify-center gap-4"
                >
                  <span
                    aria-hidden
                    className="pointer-events-none absolute inset-0 z-0 -translate-x-full bg-gradient-to-r from-transparent via-[#f6c452bf] to-transparent opacity-0 transition-transform duration-500 group-hover:translate-x-full group-hover:opacity-100"
                  />
                  <span className="relative z-10">Co-Create a journey</span>
                </Link>
              </Button>

              <Button
                asChild
                className="group relative inline-flex items-center justify-center gap-4 overflow-hidden rounded-full border border-white/25 bg-white/10 px-12 py-4 font-display text-[11px] uppercase tracking-[0.5em] text-white transition-colors duration-300 [transition-timing-function:var(--bee-ease)] hover:border-white/60 hover:bg-white/15 focus-visible:ring-[#f6c452]/35"
              >
                <Link
                  href="/concept"
                  className="relative inline-flex items-center justify-center gap-4"
                >
                  <span
                    aria-hidden
                    className="pointer-events-none absolute inset-0 z-0 -translate-x-full bg-gradient-to-r from-transparent via-[#f6c452bf] to-transparent opacity-0 transition-transform duration-500 group-hover:translate-x-full group-hover:opacity-100"
                  />
                  <span className="relative z-10">Discover the concept</span>
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <div ref={overlapStackRef} className="relative z-10 flex flex-col">
        <section className="bg-[#fdf9ee] px-6 pb-52 pt-24 sm:px-10 lg:px-24">
          <div
            className="mx-auto max-w-4xl text-center text-[22px] leading-[1.4] text-foreground/90 sm:text-3xl md:text-4xl"
            style={{ fontFamily: 'var(--font-love)' }}
          >
            we believe in innovation that reveals new horizons where our eyes once perceived only
            boundaries. we believe that less you talk, more you are. it’s all about dreams,
            perceptions and worldwide communities. we shape a collaborative ecosystem where each
            brand maintains its uniqueness while collectively contributing to a better world. we
            dream, we create, we are beeyond the world.
          </div>

          <div className="relative mx-auto mt-16 flex w-full justify-center px-1 sm:px-6">
            <div className="relative w-full max-w-6xl">
              <div className="relative aspect-[16/9] overflow-visible shadow-[0_32px_100px_-60px_rgba(10,6,2,0.45)]">
                <Image
                  src="/assets/campaigns/maradji-ibiza/maradji-ibiza-cover.jpg"
                  alt="Maradji Ibiza cove at dusk"
                  fill
                  className="object-cover"
                  sizes="(min-width: 1280px) 70vw, 92vw"
                  priority
                />
                <span
                  className="absolute left-1/2 top-4 -translate-x-1/2 text-[11px] uppercase tracking-[0.32em] text-white/85 sm:top-6 sm:text-xs"
                  style={{ fontFamily: 'var(--font-adam)', fontStyle: 'italic' }}
                >
                  WE DREAM WE CREATE
                </span>
              </div>

              <div
                className="absolute uppercase text-black"
                style={{
                  fontFamily: 'var(--font-love)',
                  fontSize: 'clamp(3.8rem, 8vw, 10rem)',
                  lineHeight: 0.9,
                  left: 'clamp(-14%, -8vw, -6%)',
                  bottom: 'clamp(-32%, -22vw, -18%)',
                  transform: `translateY(${movingLineShift}px)`,
                  color: lineOverlapFraction > 0 ? '#ffffff' : '#000000',
                  transition: 'color 180ms ease',
                  zIndex: 40,
                  pointerEvents: 'none',
                }}
              >
                <div>CREATIVE</div>
                <div>VISUALS</div>
                <div>PRODUCTION</div>
                <div ref={movingLineRef}>BEYOND THE WORLD</div>
              </div>
            </div>
          </div>
        </section>

        <section
          ref={triptychRef}
          className="relative bg-[#fdf9ee] px-4 pb-32 pt-20 sm:px-6 lg:px-12"
        >
          <div className="flex flex-col md:flex-row md:gap-0">
            {triptychCards.map((card) => {
              const isActive = activeTile === card.id;
              const basisClass =
                activeTile === null ? 'md:flex-1' : isActive ? 'md:flex-[2.35]' : 'md:flex-[0.65]';
              return (
                <button
                  key={card.id}
                  type="button"
                  onClick={() => setActiveTile(isActive ? null : card.id)}
                  className={`group relative min-h-[420px] overflow-hidden bg-black md:min-h-[620px] ${basisClass} transition-[flex-grow,flex-basis] duration-500 ease-bee`}
                >
                  <Image
                    src={card.image}
                    alt={card.label}
                    fill
                    className={`object-cover transition duration-500 ease-bee ${
                      isActive ? 'scale-[1.03]' : 'scale-100'
                    }`}
                    sizes="(min-width:1280px) 34vw, (min-width:768px) 33vw, 100vw"
                    priority={card.id === 'bees'}
                  />
                  <div className="absolute inset-0 flex items-end justify-center pb-6 opacity-0 transition duration-300 group-hover:opacity-100">
                    <div className="flex items-center gap-3 text-white">
                      <Image
                        src={card.icon}
                        alt={card.label}
                        width={38}
                        height={38}
                        className="h-9 w-9"
                      />
                      <span
                        className="text-sm uppercase tracking-[0.32em]"
                        style={{ fontFamily: 'var(--font-adam)' }}
                      >
                        {card.label}
                      </span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          <div
            className={`duration-[900ms] pointer-events-none absolute inset-0 z-10 flex items-stretch transition-opacity [transition-timing-function:cubic-bezier(0.22,1,0.36,1)] ${
              activeTile ? 'opacity-100' : 'opacity-0'
            }`}
            style={{
              textShadow: '0 14px 32px rgba(0,0,0,0.55), 0 0 18px rgba(0,0,0,0.25)',
            }}
            aria-hidden
          >
            {displayTile === 'bees' ? (
              <div className="flex h-full w-full items-end justify-between gap-6 px-4 pb-12 text-white sm:px-8 lg:px-16">
                <div className="flex max-w-[44vw] flex-col gap-9 text-left sm:max-w-md md:max-w-xl">
                  <div className="flex items-start gap-4 md:-translate-y-3">
                    <span
                      className="text-xs tracking-[0.4em]"
                      style={{
                        writingMode: 'vertical-rl',
                        textOrientation: 'mixed',
                        letterSpacing: '0.35em',
                        fontFamily: 'var(--font-adam)',
                        transform: 'rotate(180deg)',
                      }}
                    >
                      PHYLOSOPHIE
                    </span>
                    <p
                      className="text-sm leading-relaxed sm:text-base lg:text-lg"
                      style={{
                        fontFamily: 'var(--font-avenir)',
                        fontStyle: 'italic',
                        textShadow: '0 12px 28px rgba(0,0,0,0.48)',
                      }}
                    >
                      Beeyondtheworld&apos;s community reveals new horizons where our eyes once
                      perceived only boundaries. community reveals new horizons where our eyes once
                      perceived only boundaries.
                    </p>
                  </div>
                  <div className="flex items-start gap-4 md:translate-y-2">
                    <span
                      className="text-xs tracking-[0.4em]"
                      style={{
                        writingMode: 'vertical-rl',
                        textOrientation: 'mixed',
                        letterSpacing: '0.35em',
                        fontFamily: 'var(--font-adam)',
                        transform: 'rotate(180deg)',
                      }}
                    >
                      PIONEER APPROACH
                    </span>
                    <p
                      className="text-sm leading-relaxed sm:text-base lg:text-lg"
                      style={{
                        fontFamily: 'var(--font-avenir)',
                        fontStyle: 'italic',
                        textShadow: '0 12px 28px rgba(0,0,0,0.48)',
                      }}
                    >
                      We whispers dreamlike production tales. while pooling non-competing brands
                      into shared journeys, letting them share the logistic while their stories stay
                      singular and unique.
                    </p>
                  </div>
                  <div className="flex items-start gap-4 md:-translate-y-1">
                    <span
                      className="text-xs tracking-[0.4em]"
                      style={{
                        writingMode: 'vertical-rl',
                        textOrientation: 'mixed',
                        letterSpacing: '0.35em',
                        fontFamily: 'var(--font-adam)',
                        transform: 'rotate(180deg)',
                      }}
                    >
                      VISION
                    </span>
                    <p
                      className="text-sm leading-relaxed sm:text-base lg:text-lg"
                      style={{
                        fontFamily: 'var(--font-avenir)',
                        fontStyle: 'italic',
                        textShadow: '0 12px 28px rgba(0,0,0,0.48)',
                      }}
                    >
                      Time becomes profitability: we deliver a fully integrated outsourcing model,
                      co-creating each step of the visual production journey. Casting, direction,
                      scouting, styling, and narrative design merge seamlessly ensuring an elevated,
                      impeccably orchestrated outcome.
                    </p>
                  </div>
                </div>
                <h3
                  className="text-right text-5xl uppercase leading-[0.95] sm:text-6xl md:text-7xl"
                  style={{
                    fontFamily: 'var(--font-love)',
                    textShadow:
                      '0 14px 32px rgba(0,0,0,0.6), 0 0 42px rgba(255,255,255,0.18), 0 0 68px rgba(0,0,0,0.55)',
                  }}
                >
                  WE ARE BEE&apos;S
                </h3>
              </div>
            ) : null}

            {displayTile === 'flowers' ? (
              <div className="flex h-full w-full flex-col items-center justify-end gap-10 px-4 pb-12 text-white sm:px-8 lg:px-16">
                <div className="flex w-full max-w-4xl flex-col items-center gap-7">
                  <div className="flex items-start gap-4 md:-translate-y-3">
                    <span
                      className="text-xs tracking-[0.4em]"
                      style={{
                        writingMode: 'vertical-rl',
                        textOrientation: 'mixed',
                        letterSpacing: '0.35em',
                        fontFamily: 'var(--font-adam)',
                        transform: 'rotate(180deg)',
                      }}
                    >
                      IMMERSION
                    </span>
                    <p
                      className="max-w-2xl text-center text-sm leading-relaxed sm:text-base lg:text-lg"
                      style={{
                        fontFamily: 'var(--font-avenir)',
                        fontStyle: 'italic',
                        textShadow: '0 12px 28px rgba(0,0,0,0.48)',
                      }}
                    >
                      The world is a living work of art, painted by nature&apos;s lights and offered
                      to us like a precious, untouchable flower. Luminous and intricately woven, it
                      opens in soft, silent layers as we move through the unfolding tapestry of our
                      lives.
                    </p>
                  </div>
                  <div className="flex items-start gap-4 md:translate-y-2">
                    <span
                      className="text-xs tracking-[0.4em]"
                      style={{
                        writingMode: 'vertical-rl',
                        textOrientation: 'mixed',
                        letterSpacing: '0.35em',
                        fontFamily: 'var(--font-adam)',
                        transform: 'rotate(180deg)',
                      }}
                    >
                      RESPONSIBILITY
                    </span>
                    <p
                      className="max-w-2xl text-center text-sm leading-relaxed sm:text-base lg:text-lg"
                      style={{
                        fontFamily: 'var(--font-avenir)',
                        fontStyle: 'italic',
                        textShadow: '0 12px 28px rgba(0,0,0,0.48)',
                      }}
                    >
                      We design immersive itineraries across the world to produce cinematic and
                      editorial content while honoring and optimizing every resource. Each
                      destination is curated to generate multiple unique campaigns within a single
                      journey, ensuring elevated creativity, refined efficiency, and a responsible
                      approach to production.
                    </p>
                  </div>
                </div>
                <h3
                  className="flex flex-wrap items-baseline justify-center gap-2 text-4xl leading-[0.95] sm:text-5xl md:text-6xl"
                  style={{
                    textShadow:
                      '0 14px 32px rgba(0,0,0,0.6), 0 0 42px rgba(255,255,255,0.18), 0 0 68px rgba(0,0,0,0.55)',
                  }}
                >
                  <span style={{ fontFamily: 'var(--font-saint)', textTransform: 'none' }}>
                    the
                  </span>
                  <span className="uppercase" style={{ fontFamily: 'var(--font-love)' }}>
                    WORLD
                  </span>
                  <span style={{ fontFamily: 'var(--font-saint)', textTransform: 'none' }}>as</span>
                  <span className="uppercase" style={{ fontFamily: 'var(--font-love)' }}>
                    FLOWERS
                  </span>
                </h3>
              </div>
            ) : null}

            {displayTile === 'honey' ? (
              <div className="flex h-full w-full items-end justify-between gap-6 px-4 pb-12 text-white sm:px-8 lg:px-16">
                <h3
                  className="text-left text-4xl leading-[0.95] sm:text-5xl md:text-6xl lg:text-7xl"
                  style={{
                    fontFamily: 'var(--font-love)',
                    textShadow:
                      '0 14px 32px rgba(0,0,0,0.6), 0 0 42px rgba(255,255,255,0.18), 0 0 68px rgba(0,0,0,0.55)',
                  }}
                >
                  <span style={{ fontFamily: 'var(--font-saint)', textTransform: 'none' }}>
                    the{' '}
                  </span>
                  <span className="uppercase">HONEY</span>
                  <span style={{ fontFamily: 'var(--font-saint)', textTransform: 'none' }}>
                    {' '}
                    of{' '}
                  </span>
                  <span className="uppercase">ADVERTISING</span>
                </h3>
                <div className="flex max-w-[44vw] flex-col gap-9 text-right sm:max-w-md md:max-w-xl">
                  <div className="flex items-start gap-4 md:-translate-y-4">
                    <span
                      className="text-xs tracking-[0.4em]"
                      style={{
                        writingMode: 'vertical-rl',
                        textOrientation: 'mixed',
                        letterSpacing: '0.35em',
                        fontFamily: 'var(--font-adam)',
                        transform: 'rotate(180deg)',
                      }}
                    >
                      PROOF
                    </span>
                    <p
                      className="text-sm leading-relaxed sm:text-base lg:text-lg"
                      style={{
                        fontFamily: 'var(--font-avenir)',
                        fontStyle: 'italic',
                        textShadow: '0 12px 28px rgba(0,0,0,0.48)',
                      }}
                    >
                      Our campaigns are the tangible proof that another model is possible: one where
                      beauty aligns with the world instead of taking from it, and where intention
                      leaves a softness that uplifts, sustains, and endures.
                    </p>
                  </div>
                  <div className="flex items-start gap-4 md:translate-y-3">
                    <span
                      className="text-xs tracking-[0.4em]"
                      style={{
                        writingMode: 'vertical-rl',
                        textOrientation: 'mixed',
                        letterSpacing: '0.35em',
                        fontFamily: 'var(--font-adam)',
                        transform: 'rotate(180deg)',
                      }}
                    >
                      ESSENCE
                    </span>
                    <p
                      className="text-sm leading-relaxed sm:text-base lg:text-lg"
                      style={{
                        fontFamily: 'var(--font-avenir)',
                        fontStyle: 'italic',
                        textShadow: '0 12px 28px rgba(0,0,0,0.48)',
                      }}
                    >
                      Honey is the luminous trace of an ecosystem in harmony, where every action,
                      choice, and collaboration generates positive impact. It embodies the value
                      created when brands embrace a conscious path: producing less, but better;
                      reducing excess, honoring places, creating through connection rather than
                      isolation.
                    </p>
                  </div>
                </div>
              </div>
            ) : null}
          </div>

          {activeTile ? (
            <button
              type="button"
              onClick={() => setActiveTile(null)}
              className="absolute right-4 top-4 z-20 inline-flex h-10 w-10 items-center justify-center border border-white/70 bg-black/35 text-2xl text-white transition hover:bg-black/55"
              aria-label="Close"
            >
              ×
            </button>
          ) : null}
        </section>

        <section className="relative flex flex-col gap-14 overflow-hidden bg-gradient-to-b from-white via-white to-stone-100 pb-6 pt-24">
          <div className="px-6 text-center sm:px-10 lg:px-20">
            <GlowTitle
              eyebrow="Journeys & campaigns"
              title="Explore the journeys and films awaiting brands"
              description="Glissez entre les trois prochaines journeys puis ouvrez l&rsquo;atlas complet &mdash; chaque slide r&eacute;v&egrave;le une sc&egrave;ne pr&ecirc;te &agrave; produire."
              align="center"
              glowTone="dawn"
            />
          </div>
          <div className="w-full">
            <JourneyShowcaseCarousel journeys={upcomingJourneys} ctaImage={campaignCtaImage} />
          </div>
        </section>

        <section className="relative -mt-10 flex min-h-[70vh] flex-col justify-center overflow-hidden px-6 pb-28 pt-4 text-white sm:px-10 lg:px-20">
          <SmartVideo
            wrapperClassName="absolute inset-0"
            className="size-full object-cover"
            sources={[{ src: '/assets/concept/sustainable.mp4', type: 'video/mp4' }]}
            poster="/assets/concept/sustainable-poster.png"
            fallbackImage="/assets/concept/sustainable-poster.png"
            autoPlay
            muted
            loop
            playsInline
            aria-hidden
          />
          <div className="pointer-events-none absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-[#101b24]/85 via-[#101b24]/45 to-transparent sm:h-28 lg:h-36" />
          <div className="absolute inset-0 bg-black/65 backdrop-blur-sm" />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-b from-transparent via-[#fdf9ee]/25 to-[#fdf9ee] backdrop-blur-[3px] sm:h-32 lg:h-36" />
          <div className="relative z-10 mx-auto flex max-w-3xl flex-col items-center gap-8 text-center">
            <span className="font-display text-xs uppercase tracking-[0.4em] text-white/65">
              Concept teaser
            </span>
            <SplitText
              text="Dream-sustained by design, luminous in delivery"
              tag="h2"
              splitType="words"
              className="font-title text-4xl uppercase leading-[1.1] text-white sm:text-5xl"
              textAlign="center"
            />
            <p className="text-center text-base leading-relaxed text-white/75">
              Journeys follow a three-part spell that softens footprint, heals destinations, and
              leaves every brand with transparent, heart-lit proof.
            </p>
            <Button
              asChild
              className="group relative inline-flex items-center justify-center gap-4 overflow-hidden rounded-full border border-white/55 bg-white/10 px-16 py-5 font-display text-[11px] uppercase tracking-[0.5em] text-white transition-colors duration-300 [transition-timing-function:var(--bee-ease)] hover:border-white hover:bg-white/15 focus-visible:ring-[#f6c452]/35"
            >
              <Link href="/concept">Explore the concept</Link>
            </Button>
          </div>
        </section>

        <footer className="bg-[#fdf9ee] px-6 py-16 sm:px-10 lg:px-20">
          <div className="mx-auto flex max-w-6xl flex-col gap-8 border-t border-[#efc070]/30 pt-10">
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <p className="font-display text-xs uppercase tracking-[0.4em] text-foreground/60">
                Beeyondtheworld
              </p>
              <nav className="flex flex-wrap gap-6 text-xs uppercase tracking-[0.35em] text-foreground/70">
                <Link href="/" className="transition hover:text-foreground">
                  Home
                </Link>
                <Link href="/concept" className="transition hover:text-foreground">
                  Concept
                </Link>
                <Link href="/journeys" className="transition hover:text-foreground">
                  Journeys
                </Link>
                <Link href="/campaigns" className="transition hover:text-foreground">
                  Campaigns
                </Link>
                <Link href="/contact" className="transition hover:text-foreground">
                  Contact
                </Link>
              </nav>
            </div>
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <span className="text-xs uppercase tracking-[0.35em] text-foreground/45">
                Follow the journey
              </span>
              <div className="flex items-center gap-4">
                <Link
                  href="https://instagram.com/beeyondtheworld.co"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex size-10 items-center justify-center rounded-full border border-[#efc070]/40 bg-white/70 text-foreground/70 transition hover:bg-white hover:text-foreground"
                >
                  <Instagram className="size-5" aria-hidden />
                  <span className="sr-only">Instagram</span>
                </Link>
                <Link
                  href="https://www.linkedin.com/company/beeyondtheworld"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex size-10 items-center justify-center rounded-full border border-[#efc070]/40 bg-white/70 text-foreground/70 transition hover:bg-white hover:text-foreground"
                >
                  <Linkedin className="size-5" aria-hidden />
                  <span className="sr-only">LinkedIn</span>
                </Link>
              </div>
            </div>
            <div className="flex flex-col gap-2 text-xs uppercase tracking-[0.35em] text-foreground/35 md:flex-row md:items-center md:justify-between">
              <span>Copyright {new Date().getFullYear()} Beeyondtheworld</span>
              <span>Co-travel dreamcraft for brands</span>
            </div>
          </div>
        </footer>
      </div>
    </main>
  );
}
