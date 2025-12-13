'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Compass, Instagram, Linkedin, MousePointerClick, Sparkles } from 'lucide-react';

import { GlowTitle, SmartVideo } from '@/components/primitives';
import SplitText from '@/components/SplitText';
import { Button } from '@/components/ui/button';
import { JourneyShowcaseCarousel } from '@/app/_components/journey-showcase-carousel';
import { WhatWeDoSection, type WhatWeDoSectionProps } from '@/app/_components/what-we-do-section';
import type { JourneyShowcase } from '@/data/showcases';

type TrustedBrand = { name: string; logo: string };

type HomeRevealLayoutProps = {
  coCreateHref: string;
  campaignCtaImage?: string;
  whatWeDoEntries: WhatWeDoSectionProps['entries'];
  trustedBrandLogos: TrustedBrand[];
  upcomingJourneys: JourneyShowcase[];
};

const heroVideoSrc = '/assets/home/main-background-hero-home.mp4';

export function HomeRevealLayout({
  coCreateHref,
  campaignCtaImage,
  whatWeDoEntries,
  trustedBrandLogos,
  upcomingJourneys,
}: HomeRevealLayoutProps) {
  const [revealed, setRevealed] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();
  const initialOverflow = useRef<{ html: string; body: string } | null>(null);

  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;

    if (!initialOverflow.current) {
      initialOverflow.current = { html: html.style.overflow, body: body.style.overflow };
    }

    if (!revealed) {
      html.style.overflow = 'hidden';
      body.style.overflow = 'hidden';
    } else {
      html.style.overflow = initialOverflow.current.html;
      body.style.overflow = initialOverflow.current.body;
    }

    return () => {
      html.style.overflow = initialOverflow.current?.html ?? '';
      body.style.overflow = initialOverflow.current?.body ?? '';
    };
  }, [revealed]);

  useEffect(() => {
    if (!revealed || !contentRef.current) return;

    const timer = window.setTimeout(() => {
      contentRef.current?.scrollIntoView({
        behavior: shouldReduceMotion ? 'auto' : 'smooth',
        block: 'start',
      });
    }, shouldReduceMotion ? 80 : 650);

    return () => window.clearTimeout(timer);
  }, [revealed, shouldReduceMotion]);

  const easing = [0.76, 0, 0.24, 1] as const;

  return (
    <main className="relative isolate min-h-screen bg-[#fdf9ee] text-foreground">
      <AnimatePresence>
        {!revealed && (
          <motion.section
            key="hero-gate"
            initial={{ opacity: 0, y: 32, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1, transition: { duration: 0.9, ease: easing } }}
            exit={{
              y: '-100vh',
              opacity: 1,
              transition: {
                duration: shouldReduceMotion ? 0.9 : 1.35,
                ease: [0.22, 1, 0.32, 1],
              },
            }}
            className="fixed inset-0 z-50 overflow-hidden bg-[#05080f]"
          >
            <SmartVideo
              wrapperClassName="absolute inset-0"
              className="size-full object-cover"
              src={heroVideoSrc}
              autoPlay
              muted
              loop
              playsInline
              aria-hidden
            />
            <motion.div
              initial={{ opacity: 0.2 }}
              animate={{ opacity: 1, transition: { duration: 1.2, ease: easing } }}
              className="absolute inset-0 bg-gradient-to-b from-[#04070c]/45 via-[#060b12]/55 to-[#0b0d14]/80"
            />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(246,196,82,0.18),transparent_30%),radial-gradient(circle_at_80%_10%,rgba(255,255,255,0.14),transparent_25%)]" />
            <div className="relative z-10 flex h-full flex-col px-6 pb-16 pt-10 sm:px-10 lg:px-20">
              <div className="flex items-center text-white/70">
                <span className="font-display text-[10px] uppercase tracking-[0.45em]">
                  Beeyondtheworld
                </span>
              </div>
              <div className="flex flex-1 items-center">
                <div className="flex w-full flex-col gap-8 sm:max-w-4xl">
                  <div className="flex items-center drop-shadow-[0_3px_12px_rgba(0,0,0,0.65)]">
                    <Image
                      src="/assets/icones/Ico Gold BEE-13.svg"
                      alt="Beeyondtheworld Atelier"
                      width={210}
                      height={210}
                      className="h-16 w-auto sm:h-20"
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
                    className="font-title text-4xl uppercase leading-tight tracking-[0.01em] text-white drop-shadow-[0_12px_28px_rgba(0,0,0,0.38)] sm:text-5xl md:text-6xl"
                    style={{
                      textShadow:
                        '0 0 26px rgba(246,196,82,0.6), 0 0 58px rgba(255,255,255,0.5), 0 14px 28px rgba(0,0,0,0.48)',
                    }}
                    textAlign="left"
                  />
                  <p className="max-w-2xl text-sm leading-relaxed text-white/80 drop-shadow-[0_6px_20px_rgba(0,0,0,0.55)] sm:text-base">
                    Beeyondtheworld's mission is to curb the excessive individualization of visual
                    productions by optimizing every resource with intelligence and intention. We
                    introduce a refined, sustainable model that elevates creative excellence while
                    minimizing impact, proving that luxury and responsibility can move forward as one.
                  </p>
                </div>
              </div>
              <div className="flex flex-col items-center gap-3 pb-4 sm:gap-4 sm:pb-6">
                <div className="flex flex-col items-center gap-3 sm:flex-row sm:items-center sm:justify-center sm:gap-4 lg:gap-6">
                  <Button
                    asChild
                    className="group relative inline-flex min-w-[220px] items-center justify-center gap-3 overflow-hidden rounded-full border border-white/20 bg-white/10 px-10 py-4 font-display text-[11px] uppercase tracking-[0.5em] text-white transition-colors duration-300 [transition-timing-function:var(--bee-ease)] hover:border-white/60 hover:bg-white/15 focus-visible:ring-[#f6c452]/35 sm:min-w-[240px]"
                  >
                    <Link
                      href={coCreateHref}
                      className="relative inline-flex items-center justify-center gap-3"
                    >
                      <span
                        aria-hidden
                        className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-[#f6c452bf] to-transparent opacity-0 transition-transform duration-500 group-hover:translate-x-full group-hover:opacity-100"
                      />
                      <span className="relative z-10 flex items-center gap-3">
                        <Compass className="size-4" aria-hidden />
                        Co-create a journey
                      </span>
                    </Link>
                  </Button>
                  <Button
                    onClick={() => setRevealed(true)}
                    className="group relative inline-flex min-w-[220px] items-center justify-center gap-3 overflow-hidden rounded-full border border-white/20 bg-white/10 px-10 py-4 font-display text-[11px] uppercase tracking-[0.5em] text-white transition-colors duration-300 [transition-timing-function:var(--bee-ease)] hover:border-white/60 hover:bg-white/15 focus-visible:ring-[#f6c452]/35 sm:min-w-[240px]"
                  >
                    <span
                      aria-hidden
                      className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-[#f6c452bf] to-transparent opacity-0 transition duration-500 group-hover:translate-x-full group-hover:opacity-100"
                    />
                    <span className="relative z-10 flex items-center gap-3">
                      <MousePointerClick className="size-4" aria-hidden />
                      Click to discover
                    </span>
                  </Button>
                  <Button
                    asChild
                    className="group relative inline-flex min-w-[220px] items-center justify-center gap-3 overflow-hidden rounded-full border border-white/20 bg-white/10 px-10 py-4 font-display text-[11px] uppercase tracking-[0.5em] text-white transition-colors duration-300 [transition-timing-function:var(--bee-ease)] hover:border-white/60 hover:bg-white/15 focus-visible:ring-[#f6c452]/35 sm:min-w-[240px]"
                  >
                    <Link
                      href="/concept"
                      className="relative inline-flex items-center justify-center gap-3"
                    >
                      <span
                        aria-hidden
                        className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-[#f6c452bf] to-transparent opacity-0 transition-transform duration-500 group-hover:translate-x-full group-hover:opacity-100"
                      />
                      <span className="relative z-10 flex items-center gap-3">
                        <Sparkles className="size-4" aria-hidden />
                        Discover the concept
                      </span>
                    </Link>
                  </Button>
                </div>
              </div>
              <div
                aria-hidden
                className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-[linear-gradient(to_bottom,rgba(6,9,15,0)_0%,rgba(6,9,15,0.45)_45%,rgba(6,9,15,0.85)_100%)]"
              />
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      <motion.div
        ref={contentRef}
        aria-hidden={!revealed}
        initial={{ opacity: 0, y: 90, filter: 'blur(8px)' }}
        animate={
          revealed
            ? { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 1.05, ease: easing } }
            : { opacity: 0, y: 60, filter: 'blur(8px)' }
        }
        className={`relative flex flex-col ${
          revealed ? 'pointer-events-auto' : 'pointer-events-none select-none'
        }`}
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

        <section className="relative flex flex-col gap-14 overflow-hidden bg-gradient-to-b from-white via-white to-stone-100 pb-6 pt-24">
          <div className="px-6 text-center sm:px-10 lg:px-20">
            <GlowTitle
              eyebrow="Journeys & campaigns"
              title="Explore the journeys and films awaiting brands"
              description="Glide through the next journeys then open the full atlas - each slide reveals a scene ready to produce."
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
      </motion.div>
    </main>
  );
}
