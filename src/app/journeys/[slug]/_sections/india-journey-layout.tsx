'use client';

import clsx from 'clsx';
import useEmblaCarousel from 'embla-carousel-react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import Image from 'next/image';
import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';

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

type IndiaLocationStory = {
  id: string;
  image: string;
  leftTitle: string[];
  narrative: string;
  nextLocation: string;
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

const DESKTOP_SECTION_TABS = SECTION_TABS.filter((item) => item.id !== 'community');

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

const LOCATION_STORIES: IndiaLocationStory[] = [
  {
    id: 'india-location-1',
    image: '/assets/locations/India1.jpg',
    leftTitle: ['Where', 'Sun teach', 'the', 'world', 'to dream.'],
    narrative:
      'In the golden vastness of Rajasthan, the sun melts into the desert like a secret whispered to the earth, setting the dunes ablaze in hues that exist nowhere else. Ancient cities rise like mirages carved from time itself, their temples breathing centuries of devotion and their palaces catching the last light as if holding it gently in their hands. In this land of kings and legends, evenings unfold like sacred rituals: shadows stretch, bells echo, and the horizon becomes a canvas of fire and tenderness. Rajasthan is not a place you visit - it is a dream you step into, a universe suspended between memory and light, where every sunset feels like the beginning of a story you were always meant to hear.',
    nextLocation: 'Kerala',
  },
  {
    id: 'india-location-2',
    image: '/assets/locations/India2.jpg',
    leftTitle: ['Nature', 'Breathes', 'and the', 'Soul', 'Follows'],
    narrative:
      'Kerala drifts into the heart like a soft exhale, a world where water, forest, and sky speak in a language older than time. Along the tranquil backwaters, life floats at the pace of drifting coconut fronds, and the air is heavy with rain, earth, and the scent of distant spice hills. Mountains rise like whispered promises, tea gardens unfold like emerald waves, and the quiet wisdom of Ayurveda seems to linger in every breath. In Kerala, the boundaries between traveler and nature dissolve; you become part of the slow rhythm, the velvet green, the gentle pulse of life itself. It is a sanctuary where the world pauses, and the soul remembers how to listen.',
    nextLocation: 'Goa',
  },
  {
    id: 'india-location-3',
    image: '/assets/locations/India3.jpg',
    leftTitle: ['Horizons', 'Made of', 'Ocean', 'lights'],
    narrative:
      'In Goa and across the hidden islands of Lakshadweep, the ocean becomes a dream without edges, stretching into shades of blue that feel almost unreal. Goa hums with a free-spirited heartbeat - golden beaches, palm-framed sunsets, and a breeze that carries a hint of music, salt, and stories of distant lands. Farther out, Lakshadweep emerges like a secret whispered by the sea: a constellation of coral islands suspended over crystal lagoons, untouched and impossibly serene. Here, time slips into the rhythm of the tides, and every horizon feels like a doorway into wonder. These shores are not just destinations - they are states of mind, where the world glows brighter, softer, and endlessly alive.',
    nextLocation: 'Rajasthan',
  },
];

const DISCOVER_FADE_DURATION = 1.42;
const INDIA_BACKGROUND_VIDEO =
  '/assets/journeys/india-january-2026/anime_cette_image__Kling_30__17267.mp4';

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
  const [activeLocationStoryId, setActiveLocationStoryId] = useState<string | null>(null);
  const [locationCanScrollPrev, setLocationCanScrollPrev] = useState(false);
  const [locationCanScrollNext, setLocationCanScrollNext] = useState(false);
  const [locationNarrativeVisible, setLocationNarrativeVisible] = useState(false);
  const [isDesktopViewport, setIsDesktopViewport] = useState(false);
  const [locationImageAspectRatio, setLocationImageAspectRatio] = useState(4);
  const [locationImageRightEdgePx, setLocationImageRightEdgePx] = useState<number | null>(null);
  const [locationImageFrameWidthPx, setLocationImageFrameWidthPx] = useState<number | null>(null);
  const [locationImageTopInsetPx, setLocationImageTopInsetPx] = useState<number | null>(null);
  const locationScrollerRef = useRef<HTMLDivElement | null>(null);
  const locationImageFrameRef = useRef<HTMLDivElement | null>(null);
  const [mobileEmblaRef, mobileEmblaApi] = useEmblaCarousel({
    align: 'center',
    loop: false,
    dragFree: false,
    containScroll: 'trimSnaps',
  });

  const cards = useMemo(() => SECTION_CONTENT[activeSection], [activeSection]);
  const activeLocationStory = useMemo(
    () => LOCATION_STORIES.find((story) => story.id === activeLocationStoryId) ?? null,
    [activeLocationStoryId]
  );
  const activeLocationStoryIndex = useMemo(
    () => LOCATION_STORIES.findIndex((story) => story.id === activeLocationStoryId),
    [activeLocationStoryId]
  );
  const syncLocationScrollState = useCallback(() => {
    const scroller = locationScrollerRef.current;
    if (!scroller) return;

    const maxScrollLeft = Math.max(0, scroller.scrollWidth - scroller.clientWidth);
    const currentScrollLeft = Math.max(0, Math.min(maxScrollLeft, scroller.scrollLeft));
    const progress = maxScrollLeft > 0 ? currentScrollLeft / maxScrollLeft : 0;

    setLocationCanScrollPrev(currentScrollLeft > 1);
    setLocationCanScrollNext(currentScrollLeft < maxScrollLeft - 1);
    setLocationNarrativeVisible(progress > 0.12);
  }, []);

  const handleLocationDiscover = useCallback(
    (index: number) => {
      if (activeSection !== 'locations') return;
      const targetStory = LOCATION_STORIES[index];
      if (!targetStory) return;
      setActiveLocationStoryId(targetStory.id);
    },
    [activeSection]
  );

  const closeLocationStory = useCallback(() => {
    setActiveLocationStoryId(null);
  }, []);

  const scrollLocationStory = useCallback(
    (direction: 'prev' | 'next') => {
      const scroller = locationScrollerRef.current;
      if (!scroller) return;

      const maxScrollLeft = Math.max(0, scroller.scrollWidth - scroller.clientWidth);
      if (maxScrollLeft <= 0) {
        syncLocationScrollState();
        return;
      }

      const distance = Math.max(scroller.clientWidth * 0.64, 220);
      const delta = direction === 'next' ? distance : -distance;
      const startLeft = scroller.scrollLeft;
      const nextLeft = Math.max(0, Math.min(maxScrollLeft, startLeft + delta));

      scroller.scrollTo({
        left: nextLeft,
        behavior: 'smooth',
      });

      requestAnimationFrame(() => {
        if (Math.abs(scroller.scrollLeft - startLeft) < 0.5) {
          scroller.scrollLeft = nextLeft;
        }
        syncLocationScrollState();
      });
      window.setTimeout(() => {
        if (Math.abs(scroller.scrollLeft - startLeft) < 0.5) {
          scroller.scrollLeft = nextLeft;
        }
        syncLocationScrollState();
      }, 260);
    },
    [syncLocationScrollState]
  );

  const openNextLocationStory = useCallback(() => {
    if (!activeLocationStoryId) return;

    const currentIndex = LOCATION_STORIES.findIndex((story) => story.id === activeLocationStoryId);
    if (currentIndex < 0) return;

    const nextIndex = (currentIndex + 1) % LOCATION_STORIES.length;
    setActiveLocationStoryId(LOCATION_STORIES[nextIndex].id);
  }, [activeLocationStoryId]);

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

  useEffect(() => {
    if (activeSection !== 'locations' && activeLocationStoryId) {
      setActiveLocationStoryId(null);
    }
  }, [activeLocationStoryId, activeSection]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia('(min-width: 768px)');
    const syncViewport = () => setIsDesktopViewport(mediaQuery.matches);

    syncViewport();
    mediaQuery.addEventListener('change', syncViewport);

    return () => mediaQuery.removeEventListener('change', syncViewport);
  }, []);

  useEffect(() => {
    if (!activeLocationStoryId) return;

    const scroller = locationScrollerRef.current;
    if (!scroller) return;

    const resetPosition = () => {
      scroller.scrollLeft = 0;
      syncLocationScrollState();
    };

    const rafId = requestAnimationFrame(resetPosition);
    return () => cancelAnimationFrame(rafId);
  }, [activeLocationStoryId, syncLocationScrollState]);

  useEffect(() => {
    if (!activeLocationStoryId) return;

    const scroller = locationScrollerRef.current;
    if (!scroller) return;

    const onScroll = () => syncLocationScrollState();
    const resizeObserver = new ResizeObserver(onScroll);
    resizeObserver.observe(scroller);
    if (locationImageFrameRef.current) {
      resizeObserver.observe(locationImageFrameRef.current);
    }
    scroller.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    requestAnimationFrame(onScroll);

    return () => {
      resizeObserver.disconnect();
      scroller.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [activeLocationStoryId, syncLocationScrollState]);

  useEffect(() => {
    if (!activeLocationStoryId) return;

    const frame = locationImageFrameRef.current;
    if (!frame) return;

    const syncImageEdge = () => {
      const { width, height } = frame.getBoundingClientRect();
      if (width <= 0 || height <= 0 || locationImageAspectRatio <= 0) {
        setLocationImageRightEdgePx(null);
        setLocationImageFrameWidthPx(null);
        setLocationImageTopInsetPx(null);
        return;
      }

      const renderedImageWidth = Math.min(width, height * locationImageAspectRatio);
      const renderedImageHeight = Math.min(height, width / locationImageAspectRatio);
      setLocationImageFrameWidthPx(width);
      setLocationImageRightEdgePx(renderedImageWidth);
      setLocationImageTopInsetPx(Math.max(0, (height - renderedImageHeight) / 2));
    };

    const resizeObserver = new ResizeObserver(syncImageEdge);
    resizeObserver.observe(frame);
    syncImageEdge();

    return () => resizeObserver.disconnect();
  }, [activeLocationStoryId, locationImageAspectRatio]);

  const isLocationStoryOpen = activeSection === 'locations' && Boolean(activeLocationStory);
  const desktopCardBaseWidthPercent = cards.length > 0 ? 100 / cards.length : 100;
  const desktopCardHoveredWidthPercent =
    cards.length > 1
      ? Math.min(52, Math.max(40, desktopCardBaseWidthPercent + 10))
      : desktopCardBaseWidthPercent;
  const desktopCardOtherWidthPercent =
    cards.length > 1
      ? (100 - desktopCardHoveredWidthPercent) / (cards.length - 1)
      : desktopCardBaseWidthPercent;
  const locationImageMaskStyle = useMemo<CSSProperties>(() => {
    if (!locationImageRightEdgePx) {
      const fallback =
        'linear-gradient(to right, transparent 0px, black 110px, black calc(100% - 180px), transparent 100%)';
      return {
        maskImage: fallback,
        WebkitMaskImage: fallback,
      };
    }

    const leftOpaqueStartPx = 110;
    const rightFadeStartPx = Math.max(leftOpaqueStartPx + 120, locationImageRightEdgePx - 180);
    const dynamicMask = `linear-gradient(to right, transparent 0px, black ${leftOpaqueStartPx}px, black ${rightFadeStartPx}px, transparent ${locationImageRightEdgePx}px)`;

    return {
      maskImage: dynamicMask,
      WebkitMaskImage: dynamicMask,
    };
  }, [locationImageRightEdgePx]);

  const renderLocationStoryExperience = (compact: boolean) => {
    if (!activeLocationStory) return null;
    const narrativeWidthPx = compact ? 430 : 560;
    const narrativeGapFromImagePx = compact ? 22 : 30;
    const narrativeVisualOffsetPx = 0;
    const maxLeftWithinFramePx = Math.max(
      16,
      (locationImageFrameWidthPx ?? (compact ? 1680 : 1900)) - narrativeWidthPx - 16
    );
    const narrativeLeftPosition = Math.min(
      maxLeftWithinFramePx,
      (locationImageRightEdgePx ?? (compact ? 1450 : 1300)) + narrativeGapFromImagePx
    );
    const narrativeTopPositionPx =
      locationImageTopInsetPx !== null
        ? Math.max(0, locationImageTopInsetPx + narrativeVisualOffsetPx)
        : null;

    return (
      <motion.div
        key={activeLocationStory.id}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{
          duration: reduceMotion ? 0.18 : DISCOVER_FADE_DURATION,
          ease: [0.22, 1, 0.36, 1],
        }}
        className={clsx(
          'flex w-full flex-col',
          compact ? 'h-full px-2 pb-4 pt-2' : 'mx-auto h-[min(80vh,700px)] max-w-[1240px]'
        )}
      >
        <div className={clsx('mb-3 flex items-center justify-between', compact ? 'px-1' : '')}>
          <button
            type="button"
            onClick={closeLocationStory}
            className="group inline-flex items-center gap-2 px-1 py-1.5 font-display text-[10px] uppercase tracking-[0.18em] text-white/85 transition hover:text-[#d9a24b] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/55"
          >
            <ArrowLeft className="h-5 w-5 transition-transform group-hover:-translate-x-0.5 group-hover:text-[#d9a24b]" />
            Back
          </button>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={() => scrollLocationStory('prev')}
              aria-disabled={!locationCanScrollPrev}
              className={clsx(
                'flex h-11 w-11 items-center justify-center transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/55',
                locationCanScrollPrev ? 'text-white/80 hover:text-[#d9a24b]' : 'text-white/35'
              )}
              aria-label="Scroll left"
            >
              <ArrowLeft className="h-7 w-7" />
            </button>
            <button
              type="button"
              onClick={() => scrollLocationStory('next')}
              aria-disabled={!locationCanScrollNext}
              className={clsx(
                'flex h-11 w-11 items-center justify-center transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/55',
                locationCanScrollNext ? 'text-white/80 hover:text-[#d9a24b]' : 'text-white/35'
              )}
              aria-label="Scroll right"
            >
              <ArrowRight className="h-7 w-7" />
            </button>
          </div>
        </div>

        <div className={clsx('relative min-h-0 flex-1 overflow-hidden', compact ? '' : 'px-2')}>
          <div
            ref={locationScrollerRef}
            className={clsx(
              'relative overflow-x-auto overflow-y-hidden scroll-smooth [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden',
              compact ? 'h-full' : 'mx-auto h-[84%] max-h-[640px] min-h-[400px]'
            )}
            onWheel={(event) => {
              if (Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return;
              event.currentTarget.scrollLeft += event.deltaY;
            }}
          >
            <div
              ref={locationImageFrameRef}
              className={clsx(
                'relative h-full overflow-hidden',
                compact
                  ? 'w-[max(320vw,1750px)] min-w-[1600px]'
                  : 'w-[max(190vw,1700px)] min-w-[1500px]'
              )}
            >
              <Image
                src={activeLocationStory.image}
                alt={`Location ${activeLocationStoryIndex + 1}`}
                fill
                priority
                onLoadingComplete={(image) => {
                  if (image.naturalWidth > 0 && image.naturalHeight > 0) {
                    setLocationImageAspectRatio(image.naturalWidth / image.naturalHeight);
                  }
                }}
                style={locationImageMaskStyle}
                className="object-contain object-left"
                sizes="(min-width: 1024px) 140vw, (min-width: 768px) 190vw, 320vw"
              />
              <div className="absolute left-[clamp(1.4rem,3.8vw,3.8rem)] top-1/2 max-w-[20ch] -translate-y-1/2">
                <div className="relative">
                  <span
                    aria-hidden
                    className="pointer-events-none absolute -inset-x-6 -inset-y-5 -z-10 rounded-full bg-[radial-gradient(circle,rgba(255,241,218,0.33)_0%,rgba(255,241,218,0)_74%)] blur-xl"
                  />
                  <p className="font-menu text-[clamp(2.7rem,5.8vw,5.4rem)] normal-case leading-[0.84] tracking-[-0.01em] text-[#fff9ef] [text-shadow:0_0_22px_rgba(255,238,214,0.62),0_0_46px_rgba(255,238,214,0.32)]">
                    {activeLocationStory.leftTitle.map((line, index) => (
                      <span key={`${activeLocationStory.id}-title-${index}`} className="block">
                        {line}
                      </span>
                    ))}
                  </p>
                </div>
              </div>

              <motion.article
                initial={reduceMotion ? undefined : { opacity: 0, x: 18 }}
                animate={
                  reduceMotion
                    ? { opacity: 1, x: 0 }
                    : locationNarrativeVisible
                      ? { opacity: 1, x: 0 }
                      : { opacity: 0.58, x: 10 }
                }
                transition={{
                  duration: reduceMotion ? 0.2 : 0.92,
                  ease: [0.22, 1, 0.36, 1],
                }}
                style={{
                  left: `${narrativeLeftPosition}px`,
                  top: narrativeTopPositionPx !== null ? `${narrativeTopPositionPx}px` : undefined,
                }}
                className={clsx(
                  'absolute text-left text-[#fffef8]',
                  compact ? 'top-0 w-[min(50ch,90vw)]' : 'top-0 w-[min(34ch,44vw)]',
                  'pointer-events-auto'
                )}
              >
                <span
                  aria-hidden
                  className="pointer-events-none absolute -inset-x-4 -inset-y-3 -z-10 rounded-[32px] bg-[radial-gradient(circle,rgba(255,240,216,0.3)_0%,rgba(255,240,216,0)_76%)] blur-xl"
                />
                <p className="font-sans text-[13px] italic leading-[1.86] text-[#fffef8] [text-shadow:0_0_16px_rgba(255,237,210,0.48),0_1px_12px_rgba(59,36,18,0.45)] sm:text-[14px]">
                  {activeLocationStory.narrative}
                </p>
                <button
                  type="button"
                  onClick={openNextLocationStory}
                  className="mt-4 block w-fit border border-[#f3dfc4]/55 px-4 py-2 font-display text-[9px] uppercase tracking-[0.2em] text-[#fff4e3] transition hover:border-[#fff2de] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/55"
                >
                  Discover {activeLocationStory.nextLocation}
                </button>
              </motion.article>
            </div>
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <main className="relative h-[100dvh] w-full overflow-hidden text-white">
      <video
        key={INDIA_BACKGROUND_VIDEO}
        src={INDIA_BACKGROUND_VIDEO}
        poster="/assets/journeys/india-january-2026/india-january-2026-gallery-03.png"
        className="absolute inset-0 h-full w-full object-cover object-center"
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
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
          <AnimatePresence mode="wait" initial={false}>
            {isLocationStoryOpen && !isDesktopViewport ? (
              <motion.div
                key="mobile-discover-story"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{
                  duration: reduceMotion ? 0.18 : DISCOVER_FADE_DURATION,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className="h-full w-full px-2 pb-3 pt-2"
              >
                {renderLocationStoryExperience(true)}
              </motion.div>
            ) : (
              <motion.div
                key="mobile-discover-cards"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{
                  duration: reduceMotion ? 0.18 : DISCOVER_FADE_DURATION,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className="w-full overflow-visible pb-5 pt-4"
                ref={mobileEmblaRef}
              >
                <div className="embla__container -mx-2 flex touch-pan-x items-end">
                  {cards.map((card, index) => (
                    <div
                      key={`${card.id}-mobile`}
                      className="embla__slide flex flex-[0_0_78%] px-2"
                    >
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
                            onClick={() => handleLocationDiscover(index)}
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
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {!isLocationStoryOpen && (
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
        )}
      </div>

      <div className="relative z-10 hidden h-full w-full grid-cols-[clamp(250px,32vw,460px)_1fr] md:grid">
        <aside className="flex min-h-0 flex-col px-6 py-8 sm:px-10 sm:py-10">
          <div className="flex min-h-0 flex-1 items-center">
            <nav className="flex flex-col gap-10" aria-label="Journey sections">
              {DESKTOP_SECTION_TABS.map((item) => {
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
          </div>

          <div className="space-y-3">
            <h1 className="font-title text-[clamp(4.8rem,14vw,10.8rem)] leading-[0.8] text-white [text-shadow:0_0_20px_rgba(255,255,255,0.35)]">
              INDIA
            </h1>
            <p className="whitespace-nowrap font-display text-[10px] uppercase tracking-[0.22em] text-white/90 sm:text-[11px]">
              EDITION - JANUARY - FROM 27TH JANUARY
            </p>
          </div>
        </aside>

        <section className="flex min-w-0 items-center py-8 pl-1 pr-3 sm:py-10 sm:pl-4 sm:pr-7 lg:py-12 lg:pl-6 lg:pr-12">
          <div className="mx-auto flex h-full w-full max-w-[1300px] items-center">
            <AnimatePresence mode="wait" initial={false}>
              {isLocationStoryOpen && isDesktopViewport ? (
                <motion.div
                  key="desktop-discover-story"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{
                    duration: reduceMotion ? 0.2 : DISCOVER_FADE_DURATION,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  className="w-full"
                >
                  {renderLocationStoryExperience(false)}
                </motion.div>
              ) : (
                <motion.div
                  key="desktop-discover-cards"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{
                    duration: reduceMotion ? 0.2 : DISCOVER_FADE_DURATION,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  className="w-full"
                >
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
                            'ease-[cubic-bezier(0.22,1,0.36,1)] group relative aspect-[3/4] shrink-0 grow-0 overflow-hidden bg-black/20 transition-[flex-basis] duration-500'
                          )}
                          style={{
                            flexBasis:
                              hoveredCardIndex === null
                                ? `${desktopCardBaseWidthPercent}%`
                                : hoveredCardIndex === index
                                  ? `${desktopCardHoveredWidthPercent}%`
                                  : `${desktopCardOtherWidthPercent}%`,
                          }}
                        >
                          <Image
                            src={card.image}
                            alt={card.title}
                            fill
                            className="object-cover"
                            sizes="(min-width: 1280px) 33vw, (min-width: 768px) 34vw, 66vw"
                            priority={index === 0 && activeSection === 'locations'}
                          />
                          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.03)_18%,rgba(0,0,0,0.48)_100%)]" />
                          <div className="absolute bottom-4 left-4 right-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                            <button
                              type="button"
                              onClick={() => handleLocationDiscover(index)}
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
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </section>
      </div>
    </main>
  );
}
