'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Instagram, Linkedin } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';

import { JourneyShowcaseCarousel } from '@/app/_components/journey-showcase-carousel';
import { WhatWeDoSection, type WhatWeDoSectionProps } from '@/app/_components/what-we-do-section';
import SplitText from '@/components/SplitText';
import { GlowTitle, SmartVideo } from '@/components/primitives';
import { Button } from '@/components/ui/button';
import type { JourneyShowcase } from '@/data/showcases';
import { cn } from '@/lib/utils';

type HomePageContentProps = {
  coCreateHref: string;
  heroVideoSrc: string;
  whatWeDoEntries: WhatWeDoSectionProps['entries'];
  trustedBrandLogos: { name: string; logo: string }[];
  upcomingJourneys: JourneyShowcase[];
  campaignCtaImage?: string;
};

export default function HomePageContent({
  coCreateHref,
  heroVideoSrc,
  whatWeDoEntries,
  trustedBrandLogos,
  upcomingJourneys,
  campaignCtaImage,
}: HomePageContentProps) {
  const [heroStage, setHeroStage] = useState<'visible' | 'exiting' | 'hidden'>('visible');
  const [isCinematicScrolling, setIsCinematicScrolling] = useState(false);
  const [heroProgress, setHeroProgress] = useState(0);
  const [whatWeDoPrimed, setWhatWeDoPrimed] = useState(false);
  const scrollAnimationRef = useRef<number | null>(null);
  const heroHideTimeoutRef = useRef<number | null>(null);
  const whatWeDoAnchorRef = useRef<HTMLDivElement | null>(null);
  const heroIsMounted = heroStage !== 'hidden';

  useEffect(() => {
    if (heroStage === 'visible') {
      document.body.classList.add('overflow-hidden');
    } else {
      document.body.classList.remove('overflow-hidden');
    }

    return () => {
      document.body.classList.remove('overflow-hidden');
    };
  }, [heroStage]);

  useEffect(
    () => () => {
      if (scrollAnimationRef.current) {
        window.cancelAnimationFrame(scrollAnimationRef.current);
      }
      if (heroHideTimeoutRef.current) {
        window.clearTimeout(heroHideTimeoutRef.current);
      }
    },
    []
  );

  const startCinematicScroll = useCallback(() => {
    if (heroStage !== 'visible' || isCinematicScrolling) return;
    setHeroStage('exiting');
    setIsCinematicScrolling(true);
    setHeroProgress(0);

    const targetTop = whatWeDoAnchorRef.current?.offsetTop ?? 0;
    const startY = window.scrollY;
    const distance = targetTop - startY;
    const duration = 1200;
    const easeInOutQuint = (t: number) =>
      t < 0.5 ? 16 * t * t * t * t * t : 1 - Math.pow(-2 * t + 2, 5) / 2;
    const startTime = performance.now();

    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = easeInOutQuint(progress);

      window.scrollTo({ top: startY + distance * eased, behavior: 'auto' });
      setHeroProgress(eased);

      if (!whatWeDoPrimed && eased >= 0.12) {
        setWhatWeDoPrimed(true);
      }

      if (progress < 1) {
        scrollAnimationRef.current = window.requestAnimationFrame(animate);
      } else {
        heroHideTimeoutRef.current = window.setTimeout(() => {
          setHeroStage('hidden');
        }, 120);
        setIsCinematicScrolling(false);
      }
    };

    scrollAnimationRef.current = window.requestAnimationFrame(animate);
  }, [heroStage, isCinematicScrolling, whatWeDoPrimed]);

  return (
    <main
      className={cn(
        'flex flex-col bg-[#fdf9ee]',
        heroStage !== 'hidden' && 'max-h-screen overflow-hidden'
      )}
    >
      {heroIsMounted ? (
        <section
          className={cn(
            'fixed inset-0 isolate z-30 flex min-h-screen flex-col justify-end overflow-hidden text-white will-change-transform',
            heroStage !== 'visible' && 'pointer-events-none'
          )}
          style={{
            transform: `translateY(${-heroProgress * 12}%) scale(${1 - heroProgress * 0.03})`,
            opacity: 1 - heroProgress * 0.12,
          }}
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

          <div className="relative z-20 flex h-full flex-col justify-end gap-12 px-6 pb-20 pt-32 sm:px-10 sm:pb-24 sm:pt-36 lg:px-20">
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
                productions by optimizing every resource with intelligence and intention. We
                introduce a refined, sustainable model that elevates creative excellence while
                minimizing impact, proving that luxury and responsibility can move forward as one.
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
                  type="button"
                  onClick={startCinematicScroll}
                  disabled={isCinematicScrolling}
                  className="group relative inline-flex items-center justify-center gap-4 overflow-hidden rounded-full border border-white/25 bg-white/10 px-12 py-4 font-display text-[11px] uppercase tracking-[0.5em] text-white transition-colors duration-300 [transition-timing-function:var(--bee-ease)] hover:border-white/60 hover:bg-white/15 focus-visible:ring-[#f6c452]/35"
                >
                  <span
                    aria-hidden
                    className="pointer-events-none absolute inset-0 z-0 -translate-x-full bg-gradient-to-r from-transparent via-[#f6c452bf] to-transparent opacity-0 transition-transform duration-500 group-hover:translate-x-full group-hover:opacity-100"
                  />
                  <span className="relative z-10">Click to scroll</span>
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
      ) : null}

      <div
        ref={whatWeDoAnchorRef}
        className={cn(
          'duration-900 ease-[cubic-bezier(0.22,1,0.36,1)] transition-[opacity,transform] will-change-transform',
          heroStage === 'hidden' || whatWeDoPrimed
            ? 'translate-y-0 opacity-100'
            : 'pointer-events-none translate-y-8 opacity-0'
        )}
      >
        <WhatWeDoSection
          eyebrow="What we do"
          title={
            <SplitText
              text="Creative productions shared across co-travels"
              tag="h2"
              splitType="words"
              className="font-title text-4xl uppercase leading-[1.1] text-foreground sm:text-5xl md:text-6xl"
              textAlign="center"
            />
          }
          description="Journeys breathe like roaming ateliers: brands co-create cinematic tales, share resources, and sail home with launch-ready magic."
          entries={whatWeDoEntries}
          trustedBrands={trustedBrandLogos}
        />
      </div>

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
    </main>
  );
}
