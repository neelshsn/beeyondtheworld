'use client';

import clsx from 'clsx';
import useEmblaCarousel from 'embla-carousel-react';
import { AnimatePresence, motion } from 'framer-motion';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';

import { useBodyScrollLock } from '@/app/concept/_hooks/use-body-scroll-lock';
import { usePrefersReducedMotion } from '@/app/concept/_hooks/use-prefers-reduced-motion';
import { SiteArrowIcon } from '@/components/icons/site-arrow-icon';
import type { JourneyShowcase } from '@/data/showcases';
import type { JourneySeason } from '@/types/journey';

type IndiaLocation = {
  id: string;
  title: string;
  region: string;
  image: string;
  backgroundVideo?: string;
  seasons: JourneySeason[];
};
type RenderedLocationSlide = { location: IndiaLocation; sourceIndex: number; renderKey: string };
type LoopingMobileSelectorItem = {
  id: string;
  icon: string;
  label: string;
};
type RenderedLoopingMobileSelectorItem = {
  item: LoopingMobileSelectorItem;
  sourceIndex: number;
  renderKey: string;
};
type LocationSectionValue = 'locations' | 'csr-impact';
type SectionMenuValue = LocationSectionValue | 'interested';
type MobileMenuValue = SectionMenuValue;
type IndiaLocationStory = {
  id: string;
  locationId: IndiaLocation['id'];
  image: string;
  leftTitle: string[];
  narrative: string;
  nextLocationId: IndiaLocation['id'];
  nextLocation: string;
};
type VideoContinuityState = {
  slug?: string;
  src?: string;
  currentTime?: number;
  capturedAt?: number;
  season?: JourneySeason;
};
type CsrImpactCategory = 'environment' | 'social' | 'societal';
type CsrImpactCard = {
  id: string;
  category: CsrImpactCategory;
  title: string;
  image: string;
  ctaLabel: string;
  overlayText?: string;
  titleSuffix?: string;
  suffixSubscript?: string;
  detailSubtitle?: string;
  detailBody?: string[];
  detailItems?: {
    icon: string;
    label: string;
    handle?: string;
    href?: string;
  }[];
};
type RenderedCsrImpactSlide = { card: CsrImpactCard; sourceIndex: number; renderKey: string };

const INDIA_BACKGROUND_VIDEO = '/assets/journeys/balearic-2026/balearic-all-journeys-thumbnail.png';
const VIDEO_CONTINUITY_STORAGE_KEY = 'journey-background-video-state';
const JOURNEY_SEASON_ICONS: Record<
  JourneySeason,
  { icon: string; hoverIcon: string; label: string }
> = {
  'spring-summer': {
    icon: '/assets/icones/Ico White BEE-14.svg',
    hoverIcon: '/assets/icones/Ico Gold BEE-14.svg',
    label: 'Spring Summer',
  },
  'fall-winter': {
    icon: '/assets/icones/Ico White BEE-01.svg',
    hoverIcon: '/assets/icones/Ico Gold BEE-01.svg',
    label: 'Fall Winter',
  },
};

const INDIA_LOCATIONS: IndiaLocation[] = [
  {
    id: 'balearic-location-mallorca',
    title: 'Mallorca',
    region: 'Golden Calas',
    image: '/assets/journeys/balearic-2026/balearic-location-mallorca-thumbnail.png',
    backgroundVideo: '/assets/journeys/balearic-2026/balearic-location-mallorca-background.png',
    seasons: ['spring-summer', 'fall-winter'],
  },
  {
    id: 'balearic-location-ibiza',
    title: 'Ibiza',
    region: 'White Cliffs',
    image: '/assets/journeys/balearic-2026/balearic-location-ibiza-thumbnail.png',
    backgroundVideo: '/assets/journeys/balearic-2026/balearic-location-ibiza-background.png',
    seasons: ['spring-summer'],
  },
  {
    id: 'balearic-location-menorca',
    title: 'Menorca',
    region: 'Quiet Turquoise',
    image: '/assets/journeys/balearic-2026/balearic-location-menorca-thumbnail.png',
    backgroundVideo: '/assets/journeys/balearic-2026/balearic-location-menorca-background.png',
    seasons: ['spring-summer'],
  },
];

const SECTION_OPTIONS = [
  {
    label: 'Community',
    value: 'interested' as const,
    icon: '/assets/icones/Ico White BEE-13.svg',
    hoverIcon: '/assets/icones/Ico Gold BEE-13.svg',
    disabled: false,
  },
  {
    label: 'Locations',
    value: 'locations' as const,
    icon: '/assets/icones/Ico White BEE-14.svg',
    hoverIcon: '/assets/icones/Ico Gold BEE-14.svg',
    disabled: false,
  },
  {
    label: 'CSR Impact',
    value: 'csr-impact' as const,
    icon: '/assets/icones/Ico White BEE-06.svg',
    hoverIcon: '/assets/icones/Ico Gold BEE-06.svg',
    disabled: false,
  },
];

const MOBILE_MENU_OPTIONS = [
  {
    label: 'Community',
    value: 'interested' as const,
    icon: '/assets/icones/Ico White BEE-13.svg',
    hoverIcon: '/assets/icones/Ico Gold BEE-13.svg',
    disabled: false,
  },
  {
    label: 'Locations',
    value: 'locations' as const,
    icon: '/assets/icones/Ico White BEE-14.svg',
    hoverIcon: '/assets/icones/Ico Gold BEE-14.svg',
    disabled: false,
  },
  {
    label: 'CSR Impact',
    value: 'csr-impact' as const,
    icon: '/assets/icones/Ico White BEE-06.svg',
    hoverIcon: '/assets/icones/Ico Gold BEE-06.svg',
    disabled: false,
  },
];
const heroJourneyButtonClass =
  'group relative inline-flex items-center justify-center overflow-hidden rounded-none border border-white/25 bg-white/10 text-white transition-colors duration-300 [transition-timing-function:var(--bee-ease)] hover:border-white/60 hover:bg-white/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f6c452]/35';
const CSR_CATEGORY_OPTIONS: {
  value: CsrImpactCategory;
  label: string;
  icon: string;
}[] = [
  {
    value: 'environment',
    label: 'Environment',
    icon: '/assets/icones/Ico Gold BEE-12.svg',
  },
  {
    value: 'social',
    label: 'Social',
    icon: '/assets/icones/Ico Gold BEE-13.svg',
  },
  {
    value: 'societal',
    label: 'Societal',
    icon: '/assets/icones/Ico Gold BEE-06.svg',
  },
];
const CSR_CATEGORY_ARC_CONFIG: Record<
  CsrImpactCategory,
  {
    desktopTopClass: string;
    compactTopClass: string;
    desktopPath: string;
    compactPath: string;
    desktopTextClass: string;
    compactTextClass: string;
  }
> = {
  environment: {
    desktopTopClass: '-top-[3.65rem]',
    compactTopClass: '-top-[2.65rem]',
    desktopPath: 'M 8 126 A 112 112 0 0 1 232 126',
    compactPath: 'M 14 124 A 108 108 0 0 1 226 124',
    desktopTextClass: 'text-[44px] tracking-[0.05em]',
    compactTextClass: 'text-[22px] tracking-[0.05em]',
  },
  social: {
    desktopTopClass: '-top-[3.15rem]',
    compactTopClass: '-top-[2.3rem]',
    desktopPath: 'M 22 118 A 98 98 0 0 1 218 118',
    compactPath: 'M 28 118 A 92 92 0 0 1 212 118',
    desktopTextClass: 'text-[44px] tracking-[0.12em]',
    compactTextClass: 'text-[22px] tracking-[0.12em]',
  },
  societal: {
    desktopTopClass: '-top-[3.45rem]',
    compactTopClass: '-top-[2.5rem]',
    desktopPath: 'M 10 124 A 110 110 0 0 1 230 124',
    compactPath: 'M 18 122 A 102 102 0 0 1 222 122',
    desktopTextClass: 'text-[44px] tracking-[0.05em]',
    compactTextClass: 'text-[22px] tracking-[0.05em]',
  },
};

const LOCATION_STORIES: IndiaLocationStory[] = [
  {
    id: 'balearic-story-mallorca',
    locationId: 'balearic-location-mallorca',
    image: '/assets/journeys/balearic-2026/balearic-location-mallorca-story.jpg',
    leftTitle: ['Golden', 'Stone &', 'Sea Air'],
    narrative:
      'In Mallorca, warm stone villages and hidden calas seem carved by the same soft Mediterranean light. Terraces of olive trees and dry-stone walls descend toward the sea, while cliffs and coves hold water in endless shades of blue. The island feels balanced between mineral stillness and marine openness, between inland calm and coastal brilliance. Mallorca is an art of living shaped by sun, salt, and silence, where every landscape seems composed with effortless grace.',
    nextLocationId: 'balearic-location-ibiza',
    nextLocation: 'Ibiza',
  },
  {
    id: 'balearic-story-ibiza',
    locationId: 'balearic-location-ibiza',
    image: '/assets/journeys/balearic-2026/balearic-location-ibiza-story.jpg',
    leftTitle: ['White', 'Horizons', 'After Light'],
    narrative:
      'Ibiza reveals a quieter majesty beyond its myths: whitewashed houses against the sky, cliffs descending into clear water, and evenings that dissolve slowly into rose and amber. The island carries a sense of freedom that feels both luminous and grounded. Pine trees scent the air, hidden coves open suddenly between rocky paths, and the sea remains the constant horizon. Ibiza is a space of release and clarity, where light strips everything back to essentials.',
    nextLocationId: 'balearic-location-menorca',
    nextLocation: 'Menorca',
  },
  {
    id: 'balearic-story-menorca',
    locationId: 'balearic-location-menorca',
    image: '/assets/journeys/balearic-2026/balearic-location-menorca-story.jpg',
    leftTitle: ['Where', 'Silence', 'Meets', 'Turquoise'],
    narrative:
      'Menorca unfolds with a more hushed beauty. The coves are smaller, the waters impossibly clear, and the landscapes feel almost untouched. Paths run through low stone walls and pale vegetation before opening onto quiet beaches where turquoise water seems suspended in still air. Everything here invites slowness. Menorca is a Mediterranean retreat in its purest form, discreet, luminous, and deeply peaceful.',
    nextLocationId: 'balearic-location-mallorca',
    nextLocation: 'Mallorca',
  },
];
const CSR_IMPACT_CARDS: CsrImpactCard[] = [
  {
    id: 'csr-impact-carbon-pool',
    category: 'environment',
    title: '8,9t',
    titleSuffix: 'CO2',
    image: '/assets/journeys/india-january-2026/csr-impact-leaf.svg',
    ctaLabel: 'Discover',
    detailBody: [
      'CO2 avoided on this journey comes from pooling inter-island logistics, accommodation windows, and local crews between Mallorca, Ibiza, and Menorca instead of multiplying separate productions.',
      'By organizing the Balearic route as one coherent journey, the production footprint becomes lighter and more intentional.',
      'Impact is reduced upstream through planning, mutualization, and local anchoring rather than corrected after the fact.',
    ],
  },
  {
    id: 'csr-impact-island-heritage-alliance',
    category: 'environment',
    title: 'Island Heritage Alliance',
    image: '/assets/journeys/india-january-2026/csr-impact-navdama.svg',
    ctaLabel: 'Discover',
    detailBody: [
      'Island Heritage Alliance reflects the kind of local ecological network we align with when working across fragile coves, coastal cliffs, pine landscapes, and marine territories in the Balearics.',
      'Its role is to protect access, preserve biodiversity, and guide productions toward low-impact interactions with sensitive natural and cultural sites.',
      'This keeps the visual narrative connected to the territory instead of extracting from it.',
    ],
  },
  {
    id: 'csr-impact-shared-island-rate',
    category: 'environment',
    title: 'Shared Island Rate',
    image: '/assets/journeys/india-january-2026/csr-impact-ring.svg',
    overlayText: '85%',
    ctaLabel: 'Discover',
    detailBody: [
      'A high shared island rate means field production, transport, and hospitality resources were pooled across the Balearic journey instead of duplicated island by island.',
      'We measure how many activities were avoided because Mallorca, Ibiza, and Menorca were organized as one shared ecosystem rather than isolated productions.',
    ],
  },
  {
    id: 'csr-impact-balearic-craft-circle',
    category: 'social',
    title: 'Balearic Craft Circle',
    image: '/assets/journeys/india-january-2026/csr-impact-artisans-collective.svg',
    ctaLabel: 'Discover',
    detailItems: [
      {
        icon: '/assets/icones/Ico Gold BEE-08.svg',
        label: 'SET DESIGN ARTISAN',
        handle: 'STONE & FIBER',
      },
      {
        icon: '/assets/journeys/india-january-2026/csr-impact-sound-design.svg',
        label: 'SOUND CURATION',
        handle: 'SEA BREEZE RECORDING',
      },
      {
        icon: '/assets/icones/Ico Gold BEE-15.svg',
        label: 'MAKE-UP ARTIST',
        handle: 'SUNLIT SKIN',
      },
    ],
  },
  {
    id: 'csr-impact-blue-horizon-foundation',
    category: 'social',
    title: 'Blue Horizon Foundation',
    image: '/assets/journeys/india-january-2026/csr-impact-smile-foundation.svg',
    ctaLabel: 'Discover',
    detailBody: [
      'Blue Horizon Foundation reflects the kind of local initiative we support where education, social inclusion, and responsible hospitality intersect across island territories.',
      'Its work strengthens access to training, local employment, and cultural continuity in places shaped by tourism, craft, and environmental fragility.',
      'The goal is to keep value, skills, and future opportunities rooted in the communities that host the journey.',
    ],
  },
  {
    id: 'csr-impact-location-nature',
    category: 'societal',
    title: 'Local Nature',
    image: '/assets/journeys/india-january-2026/csr-impact-ring.svg',
    overlayText: '92%',
    ctaLabel: 'Discover',
    detailItems: [
      {
        icon: '/assets/journeys/india-january-2026/csr-impact-family-sustain.svg',
        label: 'ISLAND HOSTS',
      },
      {
        icon: '/assets/journeys/india-january-2026/csr-impact-local-catering.svg',
        label: 'LOCAL CATERING',
      },
      {
        icon: '/assets/icones/Ico Gold BEE-16.svg',
        label: 'LOCAL TEAM',
      },
    ],
  },
  {
    id: 'csr-impact-cultural-ethic',
    category: 'societal',
    title: 'Cultural Ethic',
    image: '/assets/journeys/india-january-2026/csr-impact-ring.svg',
    overlayText: '94%',
    ctaLabel: 'Discover',
    detailItems: [
      {
        icon: '/assets/icones/Ico Gold BEE-04.svg',
        label: 'LOCAL MODEL',
      },
      {
        icon: '/assets/icones/Ico Gold BEE-10.svg',
        label: 'BALEARIC LESSONS',
      },
      {
        icon: '/assets/icones/Ico Gold BEE-16.svg',
        label: 'SCOUTING GUIDE',
      },
    ],
  },
  {
    id: 'csr-impact-local-sponsoring',
    category: 'societal',
    title: 'Local Sponsoring',
    image: '/assets/journeys/india-january-2026/csr-impact-local-sponsoring.svg',
    ctaLabel: 'Discover',
    detailBody: [
      "In co-creation with the brand's team, we identify Balearic actors to highlight for their craft, cultural role, ecological relevance, or social value within the journey.",
      'Boutique fincas, family kitchens, cove partners, artisans, and local makers become visible through a shared activation strategy that benefits both the production and the territory.',
    ],
  },
  {
    id: 'csr-impact-the-new-heiress',
    category: 'societal',
    title: 'The New Heiress',
    image: '/assets/journeys/india-january-2026/csr-impact-smile-foundation.svg',
    ctaLabel: 'Discover',
    detailBody: [
      'A fully local artvertising publication rooted in the Balearics and produced with local talents, makers, and voices rather than outside interpretation.',
      'At its heart is the place of women in the islands, not as subjects framed from afar, but as authors of the visual and cultural narrative.',
      'By producing locally, value returns to its origin and representation belongs to those who inhabit the territory every day.',
    ],
  },
];
const CSR_CATEGORY_START_INDEX: Record<CsrImpactCategory, number> = {
  environment: CSR_IMPACT_CARDS.findIndex((card) => card.category === 'environment'),
  social: CSR_IMPACT_CARDS.findIndex((card) => card.category === 'social'),
  societal: CSR_IMPACT_CARDS.findIndex((card) => card.category === 'societal'),
};

function isVideoAsset(src?: string) {
  return Boolean(src && /\.(mp4|webm|mov|ogg)$/i.test(src));
}

function getLocationBackgroundSource(location: IndiaLocation) {
  return location.backgroundVideo ?? INDIA_BACKGROUND_VIDEO;
}

function resolvePreferredEntryLocationId(state: VideoContinuityState | null) {
  if (!state?.src) return null;

  const exactBackgroundMatch = INDIA_LOCATIONS.find(
    (location) => getLocationBackgroundSource(location) === state.src
  );
  if (exactBackgroundMatch) {
    return exactBackgroundMatch.id;
  }

  if (state.season) {
    const season = state.season;
    const seasonFallback = INDIA_LOCATIONS.find((location) => location.seasons.includes(season));
    if (seasonFallback) {
      return seasonFallback.id;
    }
  }

  return null;
}

function readPreferredEntryLocationId(journeySlug: string) {
  if (typeof window === 'undefined') return null;

  try {
    const rawState = window.sessionStorage.getItem(VIDEO_CONTINUITY_STORAGE_KEY);
    if (!rawState) return null;
    const state = JSON.parse(rawState) as VideoContinuityState;
    if (state.slug !== journeySlug) return null;
    return resolvePreferredEntryLocationId(state);
  } catch {
    return null;
  }
}

function buildRenderedLocationSlides(data: IndiaLocation[]): RenderedLocationSlide[] {
  if (!data.length) return [];
  const repeatCycles = Math.max(7, Math.ceil(18 / data.length));
  return Array.from({ length: data.length * repeatCycles }, (_, index) => {
    const sourceIndex = index % data.length;
    return {
      location: data[sourceIndex],
      sourceIndex,
      renderKey: `${data[sourceIndex].id}-${index}`,
    };
  });
}

function buildRenderedCsrImpactSlides(data: CsrImpactCard[]): RenderedCsrImpactSlide[] {
  if (!data.length) return [];
  const repeatCycles = Math.max(7, Math.ceil(18 / data.length));
  return Array.from({ length: data.length * repeatCycles }, (_, index) => {
    const sourceIndex = index % data.length;
    return {
      card: data[sourceIndex],
      sourceIndex,
      renderKey: `${data[sourceIndex].id}-${index}`,
    };
  });
}

function buildRenderedLoopingMobileSelectorItems(
  data: LoopingMobileSelectorItem[]
): RenderedLoopingMobileSelectorItem[] {
  if (!data.length) return [];
  const repeatCycles = Math.max(7, Math.ceil(18 / data.length));
  return Array.from({ length: data.length * repeatCycles }, (_, index) => {
    const sourceIndex = index % data.length;
    return {
      item: data[sourceIndex],
      sourceIndex,
      renderKey: `${data[sourceIndex].id}-${index}`,
    };
  });
}

type SeasonIconScale = 'hero' | 'lead' | 'trail';

function getSeasonIconSizing(compact: boolean, scale: SeasonIconScale) {
  if (compact) {
    if (scale === 'hero') {
      return {
        gapClass: 'gap-[clamp(0.45rem,1.8vw,0.7rem)]',
        itemClass: 'h-[clamp(1.45rem,6.9vw,2rem)] w-[clamp(1.45rem,6.9vw,2rem)]',
      };
    }
    if (scale === 'lead') {
      return {
        gapClass: 'gap-[clamp(0.4rem,1.55vw,0.62rem)]',
        itemClass: 'h-[clamp(1.28rem,6vw,1.78rem)] w-[clamp(1.28rem,6vw,1.78rem)]',
      };
    }
    return {
      gapClass: 'gap-[clamp(0.34rem,1.35vw,0.54rem)]',
      itemClass: 'h-[clamp(1.1rem,5.2vw,1.52rem)] w-[clamp(1.1rem,5.2vw,1.52rem)]',
    };
  }

  if (scale === 'hero') {
    return {
      gapClass: 'gap-[clamp(0.5rem,0.85vw,0.82rem)]',
      itemClass: 'h-[clamp(1.85rem,2.75vw,2.8rem)] w-[clamp(1.85rem,2.75vw,2.8rem)]',
    };
  }
  if (scale === 'lead') {
    return {
      gapClass: 'gap-[clamp(0.42rem,0.7vw,0.68rem)]',
      itemClass: 'h-[clamp(1.58rem,2.2vw,2.28rem)] w-[clamp(1.58rem,2.2vw,2.28rem)]',
    };
  }
  return {
    gapClass: 'gap-[clamp(0.34rem,0.58vw,0.54rem)]',
    itemClass: 'h-[clamp(1.32rem,1.7vw,1.88rem)] w-[clamp(1.32rem,1.7vw,1.88rem)]',
  };
}

function getForwardOffset(index: number, activeIndex: number, total: number) {
  if (!total) return 0;
  return (index - activeIndex + total) % total;
}

function getDesktopSlideBasisClass(forwardOffset: number) {
  if (forwardOffset === 0) return 'md:flex-[0_0_calc((100%-(var(--journey-gap)*3))*0.4)]';
  if (forwardOffset === 1) return 'md:flex-[0_0_calc((100%-(var(--journey-gap)*3))*0.27)]';
  if (forwardOffset === 2) return 'md:flex-[0_0_calc((100%-(var(--journey-gap)*3))*0.23)]';
  return 'md:flex-[0_0_calc((100%-(var(--journey-gap)*3))*0.18)]';
}

function getCardFadeProfile(forwardOffset: number, isMobileViewport: boolean) {
  if (isMobileViewport) {
    return {
      opacity: forwardOffset === 0 ? 1 : 0.86,
      y: 0,
      scale: forwardOffset === 0 ? 1 : 0.985,
      imageScale: forwardOffset === 0 ? 1.02 : 1.05,
      imageFilter:
        forwardOffset === 0 ? 'saturate(1) brightness(1)' : 'saturate(0.92) brightness(0.92)',
      overlayOpacity: forwardOffset === 0 ? 0.16 : 0.28,
    };
  }
  if (forwardOffset === 0) {
    return {
      opacity: 1,
      y: 0,
      scale: 1,
      imageScale: 1.015,
      imageFilter: 'saturate(1) brightness(1)',
      overlayOpacity: 0.14,
    };
  }
  if (forwardOffset === 1) {
    return {
      opacity: 0.76,
      y: 0,
      scale: 0.9,
      imageScale: 1.03,
      imageFilter: 'saturate(0.95) brightness(0.98)',
      overlayOpacity: 0.18,
    };
  }
  if (forwardOffset === 2) {
    return {
      opacity: 0.56,
      y: 0,
      scale: 0.8,
      imageScale: 1.045,
      imageFilter: 'saturate(0.92) brightness(0.96)',
      overlayOpacity: 0.22,
    };
  }
  return {
    opacity: 0.38,
    y: 0,
    scale: 0.7,
    imageScale: 1.055,
    imageFilter: 'saturate(0.88) brightness(0.92)',
    overlayOpacity: 0.26,
  };
}

export function BalearicJourneyLayout({ journey }: { journey: JourneyShowcase }) {
  useBodyScrollLock();

  const router = useRouter();
  const prefersReducedMotion = usePrefersReducedMotion();
  const [isMobileViewport, setIsMobileViewport] = useState(false);
  const [useLiteEffects, setUseLiteEffects] = useState(false);
  const [activeSection, setActiveSection] = useState<LocationSectionValue>('locations');
  const [mobileMenuIndex, setMobileMenuIndex] = useState(() => {
    const locationIndex = MOBILE_MENU_OPTIONS.findIndex((option) => option.value === 'locations');
    return locationIndex >= 0 ? locationIndex : 0;
  });
  const [activeCsrCategory, setActiveCsrCategory] = useState<CsrImpactCategory>('environment');

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mobileQuery = window.matchMedia('(max-width: 767px)');
    const liteQuery = window.matchMedia('(max-width: 1200px)');
    const nav = window.navigator as Navigator & { deviceMemory?: number };
    const lowCpu = typeof nav.hardwareConcurrency === 'number' && nav.hardwareConcurrency <= 4;
    const lowMemory = typeof nav.deviceMemory === 'number' && nav.deviceMemory <= 4;
    const onChange = () => {
      setIsMobileViewport(mobileQuery.matches);
      setUseLiteEffects(liteQuery.matches || lowCpu || lowMemory);
    };
    onChange();
    mobileQuery.addEventListener('change', onChange);
    liteQuery.addEventListener('change', onChange);
    return () => {
      mobileQuery.removeEventListener('change', onChange);
      liteQuery.removeEventListener('change', onChange);
    };
  }, []);

  const renderedLocations = useMemo(() => buildRenderedLocationSlides(INDIA_LOCATIONS), []);
  const renderedIdsSignature = useMemo(
    () => renderedLocations.map((location) => location.renderKey).join('|'),
    [renderedLocations]
  );
  const renderedCsrCards = useMemo(() => buildRenderedCsrImpactSlides(CSR_IMPACT_CARDS), []);
  const renderedCsrIdsSignature = useMemo(
    () => renderedCsrCards.map((card) => card.renderKey).join('|'),
    [renderedCsrCards]
  );
  const uniqueLocationCount = INDIA_LOCATIONS.length;
  const uniqueCsrCardCount = CSR_IMPACT_CARDS.length;
  const centeredStartIndex = useMemo(() => {
    if (!uniqueLocationCount || !renderedLocations.length) return 0;
    return Math.floor(renderedLocations.length / uniqueLocationCount / 2) * uniqueLocationCount;
  }, [renderedLocations.length, uniqueLocationCount]);
  const centeredCsrStartIndex = useMemo(() => {
    if (!uniqueCsrCardCount || !renderedCsrCards.length) return 0;
    return Math.floor(renderedCsrCards.length / uniqueCsrCardCount / 2) * uniqueCsrCardCount;
  }, [renderedCsrCards.length, uniqueCsrCardCount]);
  const centeredCsrEnvironmentStartIndex =
    centeredCsrStartIndex + CSR_CATEGORY_START_INDEX.environment;
  const [preferredEntryLocationId, setPreferredEntryLocationId] = useState<
    IndiaLocation['id'] | null
  >(() => readPreferredEntryLocationId(journey.slug));
  const preferredEntrySourceIndex = useMemo(() => {
    if (!preferredEntryLocationId) return 0;
    const matchIndex = INDIA_LOCATIONS.findIndex(
      (location) => location.id === preferredEntryLocationId
    );
    return matchIndex >= 0 ? matchIndex : 0;
  }, [preferredEntryLocationId]);
  const targetStartIndex = centeredStartIndex + preferredEntrySourceIndex;

  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: 'center',
    loop: false,
    containScroll: false,
    duration: 30,
    skipSnaps: false,
    dragFree: false,
    breakpoints: { '(min-width: 768px)': { align: 'start' } },
  });
  const [csrEmblaRef, csrEmblaApi] = useEmblaCarousel({
    align: 'center',
    loop: false,
    containScroll: false,
    duration: 30,
    skipSnaps: false,
    dragFree: false,
    breakpoints: { '(min-width: 768px)': { align: 'start' } },
  });

  const rootRef = useRef<HTMLDivElement | null>(null);
  const previousSelectedIndexRef = useRef(targetStartIndex);
  const isRecenteringRef = useRef(false);
  const pendingDirectionRef = useRef<1 | -1>(1);
  const previousCsrSelectedIndexRef = useRef(0);
  const isCsrRecenteringRef = useRef(false);
  const pendingCsrDirectionRef = useRef<1 | -1>(1);
  const pendingStoryLocationIdRef = useRef<IndiaLocation['id'] | null>(null);
  const [selectedIndex, setSelectedIndex] = useState(targetStartIndex);
  const [csrSelectedIndex, setCsrSelectedIndex] = useState(0);
  const [activeCsrDetailId, setActiveCsrDetailId] = useState<string | null>(null);
  const [isDesktopClosingDetail, setIsDesktopClosingDetail] = useState(false);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);
  const [backgroundDirection, setBackgroundDirection] = useState<1 | -1>(1);
  const [activeLocationStoryId, setActiveLocationStoryId] = useState<string | null>(null);
  const backgroundVideoRef = useRef<HTMLVideoElement | null>(null);
  const desktopDetailCloseTimeoutRef = useRef<number | null>(null);

  const safeLength = renderedLocations.length;
  const displayIndex = safeLength ? Math.min(selectedIndex, safeLength - 1) : 0;
  const activeRenderedLocation = safeLength ? renderedLocations[displayIndex] : null;
  const currentLocation = activeRenderedLocation?.location ?? null;
  const csrSafeLength = renderedCsrCards.length;
  const csrDisplayIndex = csrSafeLength ? Math.min(csrSelectedIndex, csrSafeLength - 1) : 0;
  const activeRenderedCsrCard = csrSafeLength ? renderedCsrCards[csrDisplayIndex] : null;
  const activeCsrCard = activeRenderedCsrCard?.card ?? null;
  const activeLocationStory = useMemo(
    () => LOCATION_STORIES.find((story) => story.id === activeLocationStoryId) ?? null,
    [activeLocationStoryId]
  );
  const activeMobileMenuOption = MOBILE_MENU_OPTIONS[mobileMenuIndex] ?? MOBILE_MENU_OPTIONS[0];
  const isLocationsSection = activeSection === 'locations';
  const hasActiveCsrDetail = activeCsrDetailId != null && activeCsrCard?.id === activeCsrDetailId;
  const isCsrDetailOpen = hasActiveCsrDetail || isDesktopClosingDetail;

  useEffect(() => {
    if (!activeCsrCard) return;
    if (activeCsrCard.category !== activeCsrCategory) {
      setActiveCsrCategory(activeCsrCard.category);
    }
  }, [activeCsrCard, activeCsrCategory]);

  useEffect(() => {
    const optionIndex = MOBILE_MENU_OPTIONS.findIndex((option) => option.value === activeSection);
    if (optionIndex >= 0) {
      setMobileMenuIndex(optionIndex);
    }
  }, [activeSection]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const rawState = window.sessionStorage.getItem(VIDEO_CONTINUITY_STORAGE_KEY);
      if (!rawState) return;

      const state = JSON.parse(rawState) as VideoContinuityState;
      if (state.slug !== journey.slug) return;

      setPreferredEntryLocationId(resolvePreferredEntryLocationId(state));
    } catch {
      // Ignore malformed continuity state and keep the default entry location.
    }
  }, [journey.slug]);

  useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => {
      const nextIndex = emblaApi.selectedScrollSnap();
      const previousIndex = previousSelectedIndexRef.current;
      if (isRecenteringRef.current) {
        isRecenteringRef.current = false;
        previousSelectedIndexRef.current = nextIndex;
        setSelectedIndex(nextIndex);
        setBackgroundDirection(pendingDirectionRef.current);
        setCanScrollPrev(uniqueLocationCount > 1);
        setCanScrollNext(uniqueLocationCount > 1);
        return;
      }
      const rawDirection =
        nextIndex === previousIndex
          ? pendingDirectionRef.current
          : nextIndex > previousIndex
            ? 1
            : -1;
      if (
        uniqueLocationCount > 1 &&
        renderedLocations.length > uniqueLocationCount * 2 &&
        (nextIndex < uniqueLocationCount ||
          nextIndex >= renderedLocations.length - uniqueLocationCount)
      ) {
        const sourceIndex = renderedLocations[nextIndex]?.sourceIndex ?? 0;
        const targetIndex = centeredStartIndex + sourceIndex;
        if (targetIndex !== nextIndex) {
          pendingDirectionRef.current = rawDirection;
          isRecenteringRef.current = true;
          emblaApi.scrollTo(targetIndex, true);
          return;
        }
      }
      pendingDirectionRef.current = rawDirection;
      previousSelectedIndexRef.current = nextIndex;
      setSelectedIndex(nextIndex);
      setBackgroundDirection(rawDirection);
      setCanScrollPrev(uniqueLocationCount > 1);
      setCanScrollNext(uniqueLocationCount > 1);
    };
    emblaApi.on('select', onSelect);
    emblaApi.on('reInit', onSelect);
    onSelect();
    return () => {
      emblaApi.off('select', onSelect);
      emblaApi.off('reInit', onSelect);
    };
  }, [centeredStartIndex, emblaApi, renderedLocations, uniqueLocationCount]);

  useEffect(() => {
    if (!csrEmblaApi) return;
    const onSelect = () => {
      const nextIndex = csrEmblaApi.selectedScrollSnap();
      const previousIndex = previousCsrSelectedIndexRef.current;
      if (isCsrRecenteringRef.current) {
        isCsrRecenteringRef.current = false;
        previousCsrSelectedIndexRef.current = nextIndex;
        setCsrSelectedIndex(nextIndex);
        return;
      }
      const rawDirection =
        nextIndex === previousIndex
          ? pendingCsrDirectionRef.current
          : nextIndex > previousIndex
            ? 1
            : -1;
      if (
        uniqueCsrCardCount > 1 &&
        renderedCsrCards.length > uniqueCsrCardCount * 2 &&
        (nextIndex < uniqueCsrCardCount ||
          nextIndex >= renderedCsrCards.length - uniqueCsrCardCount)
      ) {
        const sourceIndex = renderedCsrCards[nextIndex]?.sourceIndex ?? 0;
        const targetIndex = centeredCsrStartIndex + sourceIndex;
        if (targetIndex !== nextIndex) {
          pendingCsrDirectionRef.current = rawDirection;
          isCsrRecenteringRef.current = true;
          csrEmblaApi.scrollTo(targetIndex, true);
          return;
        }
      }
      pendingCsrDirectionRef.current = rawDirection;
      previousCsrSelectedIndexRef.current = nextIndex;
      setCsrSelectedIndex(nextIndex);
    };
    csrEmblaApi.on('select', onSelect);
    csrEmblaApi.on('reInit', onSelect);
    onSelect();
    return () => {
      csrEmblaApi.off('select', onSelect);
      csrEmblaApi.off('reInit', onSelect);
    };
  }, [centeredCsrStartIndex, csrEmblaApi, renderedCsrCards, uniqueCsrCardCount]);

  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.reInit({ startIndex: targetStartIndex });
    isRecenteringRef.current = false;
    pendingDirectionRef.current = 1;
    emblaApi.scrollTo(targetStartIndex, true);
    previousSelectedIndexRef.current = targetStartIndex;
    setSelectedIndex(targetStartIndex);
    setBackgroundDirection(1);
    setCanScrollPrev(uniqueLocationCount > 1);
    setCanScrollNext(uniqueLocationCount > 1);
  }, [
    emblaApi,
    targetStartIndex,
    renderedIdsSignature,
    renderedLocations.length,
    uniqueLocationCount,
  ]);

  useEffect(() => {
    if (!csrEmblaApi) return;
    csrEmblaApi.reInit({ startIndex: centeredCsrEnvironmentStartIndex });
    isCsrRecenteringRef.current = false;
    pendingCsrDirectionRef.current = 1;
    csrEmblaApi.scrollTo(centeredCsrEnvironmentStartIndex, true);
    previousCsrSelectedIndexRef.current = centeredCsrEnvironmentStartIndex;
    setCsrSelectedIndex(centeredCsrEnvironmentStartIndex);
  }, [
    centeredCsrEnvironmentStartIndex,
    csrEmblaApi,
    renderedCsrIdsSignature,
    renderedCsrCards.length,
    uniqueCsrCardCount,
  ]);

  const scrollPrev = useCallback(() => {
    if (emblaApi?.canScrollPrev()) emblaApi.scrollPrev();
  }, [emblaApi]);
  const scrollNext = useCallback(() => {
    if (emblaApi?.canScrollNext()) emblaApi.scrollNext();
  }, [emblaApi]);
  const scrollCsrPrev = useCallback(() => {
    if (csrEmblaApi?.canScrollPrev()) csrEmblaApi.scrollPrev();
  }, [csrEmblaApi]);
  const scrollCsrNext = useCallback(() => {
    if (csrEmblaApi?.canScrollNext()) csrEmblaApi.scrollNext();
  }, [csrEmblaApi]);
  const toggleActiveCsrDetail = useCallback(() => {
    if (!activeCsrCard) return;
    if (desktopDetailCloseTimeoutRef.current != null) {
      window.clearTimeout(desktopDetailCloseTimeoutRef.current);
      desktopDetailCloseTimeoutRef.current = null;
    }
    setActiveCsrDetailId((current) => {
      if (current === activeCsrCard.id) {
        if (isMobileViewport) {
          return null;
        }
        setIsDesktopClosingDetail(true);
        desktopDetailCloseTimeoutRef.current = window.setTimeout(() => {
          setActiveCsrDetailId(null);
          setIsDesktopClosingDetail(false);
          desktopDetailCloseTimeoutRef.current = null;
        }, 520);
        return current;
      }
      setIsDesktopClosingDetail(false);
      return activeCsrCard.id;
    });
  }, [activeCsrCard, isMobileViewport]);
  const handleSelectCsrCategory = useCallback(
    (category: CsrImpactCategory) => {
      const targetSourceIndex = CSR_CATEGORY_START_INDEX[category];
      if (targetSourceIndex < 0) return;
      setActiveCsrDetailId(null);
      setActiveCsrCategory(category);
      csrEmblaApi?.scrollTo(centeredCsrStartIndex + targetSourceIndex);
    },
    [centeredCsrStartIndex, csrEmblaApi]
  );

  const openLocationStory = useCallback((locationId: IndiaLocation['id']) => {
    const story = LOCATION_STORIES.find((item) => item.locationId === locationId);
    if (story) {
      setActiveLocationStoryId(story.id);
    }
  }, []);

  const closeLocationStory = useCallback(() => {
    setActiveLocationStoryId(null);
  }, []);

  const openNextLocationStory = useCallback(() => {
    if (!activeLocationStory) return;
    pendingStoryLocationIdRef.current = activeLocationStory.nextLocationId;
    const nextLocationIndex = INDIA_LOCATIONS.findIndex(
      (location) => location.id === activeLocationStory.nextLocationId
    );
    if (nextLocationIndex >= 0) {
      emblaApi?.scrollTo(centeredStartIndex + nextLocationIndex, true);
    }
    const nextStory = LOCATION_STORIES.find(
      (story) => story.locationId === activeLocationStory.nextLocationId
    );
    setActiveLocationStoryId(nextStory?.id ?? null);
  }, [activeLocationStory, centeredStartIndex, emblaApi]);

  const cycleMobileMenu = useCallback((direction: 1 | -1) => {
    setMobileMenuIndex((current) => {
      const nextIndex =
        (current + direction + MOBILE_MENU_OPTIONS.length) % MOBILE_MENU_OPTIONS.length;
      return nextIndex;
    });
  }, []);

  const runMobileMenuAction = useCallback(() => {
    if (!activeMobileMenuOption || activeMobileMenuOption.disabled) {
      return;
    }

    if (activeMobileMenuOption.value === 'interested') {
      router.push('/contact');
      return;
    }

    if (activeMobileMenuOption.value === 'locations') {
      setActiveSection('locations');
      setActiveCsrDetailId(null);
      if (activeLocationStory) {
        closeLocationStory();
      }
      return;
    }

    if (activeMobileMenuOption.value === 'csr-impact') {
      setActiveSection('csr-impact');
    }
  }, [activeLocationStory, activeMobileMenuOption, closeLocationStory, router]);

  useEffect(() => {
    if (activeSection !== 'csr-impact' && activeCsrDetailId) {
      setActiveCsrDetailId(null);
      setIsDesktopClosingDetail(false);
    }
  }, [activeCsrDetailId, activeSection]);

  useEffect(() => {
    return () => {
      if (desktopDetailCloseTimeoutRef.current != null) {
        window.clearTimeout(desktopDetailCloseTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!emblaApi) return;
    const handleWindowKeyDown = (event: KeyboardEvent) => {
      const canNavigate =
        (isLocationsSection && safeLength >= 2) ||
        (!isLocationsSection && !isCsrDetailOpen && csrSafeLength >= 2);
      if (!canNavigate) return;
      if (event.key === 'ArrowRight') {
        event.preventDefault();
        if (isLocationsSection) {
          scrollNext();
        } else {
          scrollCsrNext();
        }
      } else if (event.key === 'ArrowLeft') {
        event.preventDefault();
        if (isLocationsSection) {
          scrollPrev();
        } else {
          scrollCsrPrev();
        }
      }
    };
    window.addEventListener('keydown', handleWindowKeyDown);
    return () => window.removeEventListener('keydown', handleWindowKeyDown);
  }, [
    emblaApi,
    isLocationsSection,
    isCsrDetailOpen,
    safeLength,
    csrSafeLength,
    scrollNext,
    scrollPrev,
    scrollCsrNext,
    scrollCsrPrev,
  ]);

  useEffect(() => {
    const node = rootRef.current;
    const activeEmblaApi = isLocationsSection ? emblaApi : csrEmblaApi;
    if (!node || !activeEmblaApi) return;
    let wheelAccumulator = 0;
    const handleWheel = (event: WheelEvent) => {
      const canNavigate =
        (isLocationsSection && safeLength >= 2) ||
        (!isLocationsSection && !isCsrDetailOpen && csrSafeLength >= 2);
      if (!canNavigate) return;
      const primaryDelta =
        Math.abs(event.deltaY) > Math.abs(event.deltaX) ? event.deltaY : event.deltaX;
      if (!primaryDelta) return;
      event.preventDefault();
      wheelAccumulator += primaryDelta;
      if (Math.abs(wheelAccumulator) < 30) return;
      if (wheelAccumulator > 0) {
        if (isLocationsSection) {
          scrollNext();
        } else {
          scrollCsrNext();
        }
      } else if (isLocationsSection) {
        scrollPrev();
      } else {
        scrollCsrPrev();
      }
      wheelAccumulator = 0;
    };
    node.addEventListener('wheel', handleWheel, { passive: false });
    return () => node.removeEventListener('wheel', handleWheel);
  }, [
    emblaApi,
    csrEmblaApi,
    isLocationsSection,
    isCsrDetailOpen,
    safeLength,
    csrSafeLength,
    scrollNext,
    scrollPrev,
    scrollCsrNext,
    scrollCsrPrev,
  ]);

  useEffect(() => {
    if (pendingStoryLocationIdRef.current && currentLocation) {
      if (pendingStoryLocationIdRef.current === currentLocation.id) {
        const pendingStory = LOCATION_STORIES.find(
          (story) => story.locationId === pendingStoryLocationIdRef.current
        );
        setActiveLocationStoryId(pendingStory?.id ?? null);
        pendingStoryLocationIdRef.current = null;
      }
      return;
    }
    if (!activeLocationStory || !currentLocation) return;
    if (activeLocationStory.locationId !== currentLocation.id) {
      setActiveLocationStoryId(null);
    }
  }, [activeLocationStory, currentLocation]);

  useEffect(() => {
    if (!activeCsrDetailId || !activeCsrCard) return;
    if (activeCsrDetailId !== activeCsrCard.id) {
      setActiveCsrDetailId(null);
    }
  }, [activeCsrCard, activeCsrDetailId]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    let cleanup: (() => void) | undefined;

    try {
      const rawState = window.sessionStorage.getItem(VIDEO_CONTINUITY_STORAGE_KEY);
      if (!rawState) return;

      const state = JSON.parse(rawState) as VideoContinuityState;

      const expectedSrc = currentLocation?.backgroundVideo ?? INDIA_BACKGROUND_VIDEO;

      if (!isVideoAsset(expectedSrc)) {
        return;
      }

      if (state.slug !== journey.slug || state.src !== expectedSrc) {
        return;
      }

      const applyContinuity = () => {
        const video = backgroundVideoRef.current;
        if (!video) return;

        const elapsedSeconds =
          typeof state.capturedAt === 'number'
            ? Math.max(0, (Date.now() - state.capturedAt) / 1000)
            : 0;
        let nextTime = Math.max(0, (state.currentTime ?? 0) + elapsedSeconds);

        if (Number.isFinite(video.duration) && video.duration > 0) {
          nextTime %= video.duration;
        }

        try {
          video.currentTime = nextTime;
        } catch {
          // Ignore seek failures and keep normal playback.
        }

        void video.play().catch(() => undefined);
        window.sessionStorage.removeItem(VIDEO_CONTINUITY_STORAGE_KEY);
      };

      const video = backgroundVideoRef.current;
      if (video?.readyState && video.readyState >= 1) {
        applyContinuity();
      } else if (video) {
        const handleLoadedMetadata = () => applyContinuity();
        video.addEventListener('loadedmetadata', handleLoadedMetadata, { once: true });
        cleanup = () => video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      }
    } catch {
      // Ignore malformed continuity state and keep default playback.
    }

    return () => cleanup?.();
  }, [currentLocation?.backgroundVideo, journey.slug]);

  return (
    <section
      ref={rootRef}
      className="relative flex min-h-[100svh] flex-col overflow-hidden bg-black text-white"
      tabIndex={0}
      aria-label="India locations carousel"
    >
      <LocationBackground
        activeKey={currentLocation?.id ?? journey.slug}
        poster={currentLocation?.image ?? journey.hero.src}
        videoSrc={currentLocation?.backgroundVideo ?? INDIA_BACKGROUND_VIDEO}
        videoRef={backgroundVideoRef}
        direction={backgroundDirection}
        prefersReducedMotion={prefersReducedMotion}
        useLiteEffects={useLiteEffects}
      />
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={`section-${activeSection}`}
          initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={prefersReducedMotion ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: prefersReducedMotion ? 0.2 : 0.48, ease: [0.22, 1, 0.36, 1] }}
          className="relative z-20 flex min-h-[100svh] flex-col"
        >
          <div className="pointer-events-none absolute left-4 top-5 z-30 sm:left-6 sm:top-7 lg:left-10 lg:top-8">
            <div className="pointer-events-auto">
              <BackToJourneysButton onClick={() => router.push('/journeys')} />
            </div>
          </div>
          <div className="relative flex flex-1 items-center justify-end">
            <div className="w-full px-2 pb-2 pt-20 sm:px-6 sm:pb-4 sm:pt-24 md:ml-auto md:w-[75%] md:pb-0 md:pl-10 md:pr-6 md:pt-0 lg:py-10 lg:pl-16 lg:pr-10 xl:pl-20">
              {isLocationsSection ? (
                <AnimatePresence mode="wait" initial={false}>
                  {activeLocationStory ? (
                    <motion.div
                      key={`story-${activeLocationStory.id}`}
                      initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={prefersReducedMotion ? { opacity: 1 } : { opacity: 0 }}
                      transition={{
                        duration: prefersReducedMotion ? 0.2 : 0.65,
                        ease: [0.22, 1, 0.36, 1],
                      }}
                      className="py-4 md:py-0"
                    >
                      <LocationStoryBand
                        story={activeLocationStory}
                        compact={isMobileViewport}
                        onClose={closeLocationStory}
                        onNext={openNextLocationStory}
                      />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="location-carousel"
                      initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={prefersReducedMotion ? { opacity: 1 } : { opacity: 0 }}
                      transition={{
                        duration: prefersReducedMotion ? 0.2 : 0.65,
                        ease: [0.22, 1, 0.36, 1],
                      }}
                    >
                      <div
                        className="overflow-visible pb-8 sm:pb-10 md:overflow-hidden md:pb-0"
                        ref={emblaRef}
                      >
                        <motion.div
                          key={renderedIdsSignature}
                          className="embla__container flex touch-pan-x items-center gap-3 sm:gap-4 md:gap-[var(--journey-gap)] md:[--journey-gap:clamp(14px,1.7vw,28px)]"
                          initial={prefersReducedMotion ? undefined : { opacity: 0 }}
                          animate={prefersReducedMotion ? undefined : { opacity: 1 }}
                          transition={{ duration: 1.08, ease: [0.22, 1, 0.36, 1] }}
                        >
                          {renderedLocations.map((slide, index) => {
                            const forwardOffset = getForwardOffset(
                              index,
                              displayIndex,
                              renderedLocations.length
                            );
                            return (
                              <motion.div
                                key={slide.renderKey}
                                layout
                                className={clsx(
                                  'embla__slide flex flex-[0_0_74%] items-center sm:flex-[0_0_60%]',
                                  getDesktopSlideBasisClass(forwardOffset)
                                )}
                              >
                                <LocationCard
                                  location={slide.location}
                                  isActive={activeRenderedLocation?.renderKey === slide.renderKey}
                                  forwardOffset={forwardOffset}
                                  onAction={() => {
                                    if (index !== emblaApi?.selectedScrollSnap()) {
                                      emblaApi?.scrollTo(index);
                                      return;
                                    }
                                    openLocationStory(slide.location.id);
                                  }}
                                  prefersReducedMotion={prefersReducedMotion}
                                  isMobileViewport={isMobileViewport}
                                />
                              </motion.div>
                            );
                          })}
                        </motion.div>
                      </div>
                      <div className="pointer-events-none relative z-40 mt-8 flex flex-col items-center gap-3 pb-5 md:hidden">
                        <LocationHeadline
                          currentLocation={currentLocation}
                          journey={journey}
                          compact
                          centered
                        />
                        <MobileMenuCycler
                          option={activeMobileMenuOption}
                          onPrev={() => cycleMobileMenu(-1)}
                          onNext={() => cycleMobileMenu(1)}
                          onSelect={runMobileMenuAction}
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              ) : (
                <motion.div
                  key="csr-impact-panel"
                  initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={prefersReducedMotion ? { opacity: 1 } : { opacity: 0 }}
                  transition={{
                    duration: prefersReducedMotion ? 0.2 : 0.6,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  className="min-h-[74svh] py-4 md:min-h-0 md:translate-y-8 md:py-0"
                >
                  <motion.div
                    layout
                    transition={{ duration: 0.58, ease: [0.22, 1, 0.36, 1] }}
                    className="flex w-full flex-col items-center justify-start gap-5"
                  >
                    <motion.div
                      layout="position"
                      transition={{ duration: 0.52, ease: [0.22, 1, 0.36, 1] }}
                      className="relative z-40 w-full pt-1 md:hidden"
                    >
                      <CsrImpactCategoryRow
                        activeCategory={activeCsrCategory}
                        onSelect={handleSelectCsrCategory}
                      />
                    </motion.div>
                    <CsrImpactCarousel
                      compact={isMobileViewport}
                      emblaRef={csrEmblaRef}
                      renderedCards={renderedCsrCards}
                      activeIndex={csrDisplayIndex}
                      detailOpen={isCsrDetailOpen}
                      isDesktopClosingDetail={isDesktopClosingDetail}
                      activeCard={activeCsrCard}
                      onSelect={(index) => csrEmblaApi?.scrollTo(index)}
                      onToggleDetail={toggleActiveCsrDetail}
                    />
                    <motion.div
                      layout="position"
                      transition={{ duration: 0.52, ease: [0.22, 1, 0.36, 1] }}
                      className="pointer-events-none relative z-40 flex flex-col items-center gap-3 pb-5 md:hidden"
                    >
                      <MobileMenuCycler
                        option={activeMobileMenuOption}
                        onPrev={() => cycleMobileMenu(-1)}
                        onNext={() => cycleMobileMenu(1)}
                        onSelect={runMobileMenuAction}
                      />
                    </motion.div>
                  </motion.div>
                </motion.div>
              )}
            </div>
          </div>
          <div className="pointer-events-none absolute left-6 top-1/2 z-40 hidden -translate-y-1/2 md:block lg:left-10 xl:left-14">
            {isLocationsSection ? (
              <LocationHeadline currentLocation={currentLocation} journey={journey} sideAligned />
            ) : (
              <CsrImpactCategoryCarousel
                sideAligned
                activeCategory={activeCsrCategory}
                onSelect={handleSelectCsrCategory}
              />
            )}
          </div>
          <div className="pointer-events-none absolute bottom-5 right-4 z-50 hidden sm:bottom-7 sm:right-6 md:right-10 md:block lg:bottom-10 lg:right-16 xl:right-20">
            <div className="pointer-events-auto">
              <LocationSectionMenu
                value={activeSection}
                onSelect={(nextValue) => {
                  if (nextValue === 'interested') {
                    router.push('/contact');
                    return;
                  }

                  setActiveSection(nextValue);
                }}
              />
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </section>
  );
}

function LocationSectionMenu({
  value,
  compact = false,
  onSelect,
}: {
  value: LocationSectionValue;
  compact?: boolean;
  onSelect?: (value: SectionMenuValue) => void;
}) {
  return (
    <div
      className={clsx(
        'pointer-events-auto relative inline-flex items-center text-white drop-shadow-[0_12px_28px_rgba(0,0,0,0.38)]',
        compact ? 'gap-2.5' : 'gap-4'
      )}
    >
      {SECTION_OPTIONS.map((option) => {
        const isActive = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            disabled={option.disabled}
            aria-pressed={isActive}
            onClick={onSelect ? () => onSelect(option.value) : undefined}
            className={clsx(
              'group relative inline-flex items-center gap-2.5 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/45',
              compact ? 'gap-2' : 'gap-2.5',
              option.disabled ? 'cursor-not-allowed opacity-35' : 'opacity-85 hover:opacity-100',
              isActive && !option.disabled && 'opacity-100'
            )}
          >
            <div className={clsx('relative shrink-0', compact ? 'h-7 w-7' : 'h-8 w-8')}>
              <Image
                src={option.icon}
                alt=""
                fill
                className={clsx(
                  'object-contain transition-opacity duration-300',
                  option.disabled
                    ? 'opacity-100'
                    : isActive
                      ? 'opacity-0 group-hover:opacity-0'
                      : 'opacity-100 group-hover:opacity-0'
                )}
              />
              {!option.disabled ? (
                <Image
                  src={option.hoverIcon}
                  alt=""
                  fill
                  className={clsx(
                    'object-contain transition-opacity duration-300',
                    isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                  )}
                />
              ) : null}
            </div>
            <span
              className={clsx(
                'font-display uppercase transition-colors duration-300 [text-shadow:0_2px_0_rgba(0,0,0,0.3),0_8px_14px_rgba(0,0,0,0.24),0_16px_34px_rgba(0,0,0,0.24)]',
                compact ? 'text-[0.7rem] tracking-[0.16em]' : 'text-[1rem] tracking-[0.14em]',
                option.disabled
                  ? 'text-white/65'
                  : isActive
                    ? 'text-[#f6c452]'
                    : 'text-white group-hover:text-[#f6c452]'
              )}
            >
              {option.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}

function SectionHeadline({
  title,
  subtitle,
  compact = false,
  centered = false,
  sideAligned = false,
}: {
  title: string;
  subtitle?: string;
  compact?: boolean;
  centered?: boolean;
  sideAligned?: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className={clsx(
        'relative z-10',
        compact ? 'max-w-[80vw]' : 'max-w-[62vw]',
        sideAligned && !compact && 'max-w-[28vw] xl:max-w-[24vw]',
        centered && 'text-center'
      )}
    >
      <h1
        className={clsx(
          'font-title uppercase tracking-normal text-white [text-shadow:0_4px_0_rgba(0,0,0,0.36),0_12px_20px_rgba(0,0,0,0.28),0_24px_52px_rgba(0,0,0,0.38),0_40px_88px_rgba(0,0,0,0.3)]',
          compact
            ? 'text-[clamp(2.15rem,12vw,4.4rem)] leading-[0.82]'
            : sideAligned
              ? 'text-[clamp(3.2rem,7vw,7.4rem)] leading-[0.82]'
              : 'text-[clamp(3.4rem,11vw,10.2rem)] leading-[0.8]'
        )}
      >
        {title}
      </h1>
      {subtitle ? (
        <p
          className={clsx(
            'mt-1 uppercase text-white [text-shadow:0_2px_0_rgba(0,0,0,0.3),0_8px_14px_rgba(0,0,0,0.24),0_16px_34px_rgba(0,0,0,0.24)]',
            compact
              ? 'text-[0.5rem] tracking-[0.32em]'
              : 'text-[0.62rem] tracking-[0.34em] sm:text-[0.72rem]'
          )}
        >
          {subtitle}
        </p>
      ) : null}
    </motion.div>
  );
}

function CsrImpactCategoryCarousel({
  activeCategory,
  onSelect,
  compact = false,
  centered = false,
  sideAligned = false,
}: {
  activeCategory: CsrImpactCategory;
  onSelect: (category: CsrImpactCategory) => void;
  compact?: boolean;
  centered?: boolean;
  sideAligned?: boolean;
}) {
  const arcPathId = useId();
  const arcGradientId = `${arcPathId}-gradient`;
  const activeIndex = CSR_CATEGORY_OPTIONS.findIndex((option) => option.value === activeCategory);
  const step = compact ? 114 : 214;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className={clsx(
        'pointer-events-auto relative z-10 flex',
        centered && 'justify-center',
        sideAligned && 'justify-start pl-12 lg:pl-14 xl:pl-[5.25rem]'
      )}
    >
      <div className={clsx('relative', compact ? 'h-[18rem] w-[10rem]' : 'h-[34rem] w-[18rem]')}>
        {CSR_CATEGORY_OPTIONS.map((option, index) => {
          const rawOffset =
            (index - activeIndex + CSR_CATEGORY_OPTIONS.length) % CSR_CATEGORY_OPTIONS.length;
          const verticalOffset = rawOffset === CSR_CATEGORY_OPTIONS.length - 1 ? -1 : rawOffset;
          const isActive = verticalOffset === 0;
          const arcConfig = CSR_CATEGORY_ARC_CONFIG[option.value];
          return (
            <div
              key={option.value}
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
            >
              <motion.button
                type="button"
                onClick={() => onSelect(option.value)}
                aria-pressed={isActive}
                className="group relative flex items-center justify-center focus-visible:outline-none"
                animate={{
                  y: verticalOffset * step,
                  scale: isActive ? 1 : compact ? 0.82 : 0.78,
                  opacity: isActive ? 1 : 0.6,
                }}
                transition={{ duration: 0.72, ease: [0.22, 1, 0.36, 1] }}
                style={{ zIndex: 10 - Math.abs(verticalOffset) }}
              >
                <div
                  className={clsx(
                    'bg-white/12 relative flex items-center justify-center rounded-full transition-colors duration-300',
                    isActive
                      ? 'shadow-[0_0_52px_rgba(246,196,82,0.45)]'
                      : 'shadow-[0_0_28px_rgba(246,196,82,0.16)] group-hover:bg-white/15'
                  )}
                >
                  {isActive ? (
                    <span
                      aria-hidden
                      className={clsx(
                        'pointer-events-none absolute left-1/2 top-1/2 -z-10 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(247,214,133,0.52)_0%,rgba(247,214,133,0.22)_34%,rgba(247,214,133,0)_74%)] blur-2xl',
                        compact ? 'h-32 w-32' : 'h-56 w-56'
                      )}
                    />
                  ) : null}
                  {isActive ? (
                    <svg
                      viewBox="0 0 240 140"
                      className={clsx(
                        'pointer-events-none absolute left-1/2 -translate-x-1/2 overflow-visible',
                        compact
                          ? `${arcConfig.compactTopClass} h-16 w-28`
                          : `${arcConfig.desktopTopClass} h-28 w-48`
                      )}
                      aria-hidden
                    >
                      <defs>
                        <linearGradient
                          id={arcGradientId}
                          x1="24"
                          y1="20"
                          x2="200"
                          y2="118"
                          gradientUnits="userSpaceOnUse"
                        >
                          <stop offset="0%" stopColor="#f3bc58" />
                          <stop offset="52%" stopColor="#f7d57d" />
                          <stop offset="100%" stopColor="#f3bc58" />
                        </linearGradient>
                      </defs>
                      <path
                        id={arcPathId}
                        d={compact ? arcConfig.compactPath : arcConfig.desktopPath}
                        fill="none"
                      />
                      <text
                        fill={`url(#${arcGradientId})`}
                        className={clsx(
                          '[font-family:var(--font-cannia)]',
                          compact ? arcConfig.compactTextClass : arcConfig.desktopTextClass
                        )}
                        style={{
                          filter:
                            'drop-shadow(0 3px 0 rgba(0,0,0,0.28)) drop-shadow(0 10px 18px rgba(0,0,0,0.26)) drop-shadow(0 18px 32px rgba(0,0,0,0.18))',
                        }}
                      >
                        <textPath href={`#${arcPathId}`} startOffset="50%" textAnchor="middle">
                          {option.label}
                        </textPath>
                      </text>
                    </svg>
                  ) : null}
                  <span
                    className={clsx(
                      'relative inline-flex items-center justify-center rounded-full',
                      isActive
                        ? compact
                          ? 'h-28 w-28'
                          : 'h-48 w-48'
                        : compact
                          ? 'h-24 w-24'
                          : 'h-32 w-32'
                    )}
                  >
                    <Image
                      src={option.icon}
                      alt={isActive ? option.label : ''}
                      width={68}
                      height={68}
                      className={clsx(
                        'object-contain drop-shadow-[0_0_24px_rgba(247,213,125,0.82)] [filter:drop-shadow(0_14px_26px_rgba(52,29,8,0.26))]',
                        isActive
                          ? compact
                            ? 'h-[4.5rem] w-[4.5rem]'
                            : 'h-28 w-28'
                          : compact
                            ? 'h-[3.3rem] w-[3.3rem]'
                            : 'h-[4.2rem] w-[4.2rem]'
                      )}
                      aria-hidden={!isActive}
                    />
                  </span>
                </div>
              </motion.button>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}

function CsrImpactCategoryRow({
  activeCategory,
  onSelect,
}: {
  activeCategory: CsrImpactCategory;
  onSelect: (category: CsrImpactCategory) => void;
}) {
  const items = useMemo<LoopingMobileSelectorItem[]>(
    () =>
      CSR_CATEGORY_OPTIONS.map((option) => ({
        id: option.value,
        icon: option.icon,
        label: option.label,
      })),
    []
  );
  const activeIndex = Math.max(
    0,
    items.findIndex((item) => item.id === activeCategory)
  );

  return (
    <LoopingMobileIconSelector
      items={items}
      activeIndex={activeIndex}
      onChange={(index) => {
        const nextCategory = CSR_CATEGORY_OPTIONS[index]?.value;
        if (nextCategory) onSelect(nextCategory);
      }}
    />
  );
}

function LocationHeadline({
  currentLocation,
  journey,
  compact = false,
  centered = false,
  sideAligned = false,
}: {
  currentLocation: IndiaLocation | null;
  journey: JourneyShowcase;
  compact?: boolean;
  centered?: boolean;
  sideAligned?: boolean;
}) {
  return (
    <AnimatePresence mode="wait">
      {currentLocation ? (
        <motion.div
          key={currentLocation.id}
          initial={{ y: 10 }}
          animate={{ y: 0 }}
          exit={{ y: -12 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className={clsx(
            'relative z-10',
            compact ? 'max-w-[80vw]' : 'max-w-[62vw]',
            sideAligned && !compact && 'max-w-[28vw] xl:max-w-[24vw]',
            centered && 'text-center'
          )}
        >
          <h1
            className={clsx(
              'font-title uppercase tracking-normal text-white [filter:drop-shadow(0_0_22px_rgba(255,244,224,0.34))_drop-shadow(0_0_42px_rgba(255,240,214,0.2))] [text-shadow:0_0_24px_rgba(255,248,232,0.44),0_0_54px_rgba(255,244,220,0.28),0_4px_0_rgba(0,0,0,0.38),0_10px_18px_rgba(0,0,0,0.28),0_24px_52px_rgba(0,0,0,0.4),0_40px_88px_rgba(0,0,0,0.34)]',
              compact
                ? 'text-[clamp(2.15rem,12vw,4.4rem)] leading-[0.82]'
                : sideAligned
                  ? 'text-[clamp(3.2rem,7vw,7.4rem)] leading-[0.82]'
                  : 'text-[clamp(3.4rem,11vw,10.2rem)] leading-[0.8]'
            )}
          >
            {currentLocation.title}
          </h1>
          <p
            className={clsx(
              'mt-1 uppercase text-white [filter:drop-shadow(0_0_12px_rgba(255,245,226,0.22))] [text-shadow:0_0_16px_rgba(255,250,238,0.42),0_0_30px_rgba(255,245,224,0.22),0_3px_0_rgba(0,0,0,0.34),0_10px_18px_rgba(0,0,0,0.24),0_14px_28px_rgba(0,0,0,0.3),0_22px_42px_rgba(0,0,0,0.22)]',
              compact
                ? 'text-[0.5rem] tracking-[0.32em]'
                : 'text-[0.62rem] tracking-[0.34em] sm:text-[0.72rem]'
            )}
          >
            {journey.timeframe}
          </p>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

function CsrImpactCarousel({
  compact = false,
  emblaRef,
  renderedCards,
  activeIndex,
  detailOpen,
  isDesktopClosingDetail = false,
  activeCard,
  onSelect,
  onToggleDetail,
}: {
  compact?: boolean;
  emblaRef: (node: HTMLElement | null) => void;
  renderedCards: RenderedCsrImpactSlide[];
  activeIndex: number;
  detailOpen: boolean;
  isDesktopClosingDetail?: boolean;
  activeCard: CsrImpactCard | null;
  onSelect: (index: number) => void;
  onToggleDetail: () => void;
}) {
  const showMobileDetail = compact && detailOpen;
  const [showDesktopDetailContent, setShowDesktopDetailContent] = useState(false);

  useEffect(() => {
    if (compact) {
      setShowDesktopDetailContent(false);
      return;
    }
    if (isDesktopClosingDetail) {
      setShowDesktopDetailContent(false);
      return;
    }
    if (!detailOpen) {
      setShowDesktopDetailContent(false);
      return;
    }
    const timeout = window.setTimeout(() => {
      setShowDesktopDetailContent(true);
    }, 680);
    return () => window.clearTimeout(timeout);
  }, [compact, detailOpen, isDesktopClosingDetail]);

  return (
    <motion.div
      layout={compact}
      transition={{ duration: 0.58, ease: [0.22, 1, 0.36, 1] }}
      className={clsx(
        'w-full md:flex md:min-h-[560px]',
        detailOpen ? 'md:items-start md:gap-10 xl:gap-14' : 'md:items-start'
      )}
    >
      <AnimatePresence initial={false}>
        {!showMobileDetail || !compact ? (
          <motion.div
            key="csr-mobile-rail"
            layout={compact ? 'position' : false}
            initial={compact ? { opacity: 1, height: 'auto' } : false}
            animate={compact ? { opacity: 1, height: 'auto' } : undefined}
            exit={compact ? { opacity: 0, height: 0, marginBottom: 0 } : undefined}
            transition={{ duration: 0.52, ease: [0.22, 1, 0.36, 1] }}
            className={clsx(
              'ease-[cubic-bezier(0.22,1,0.36,1)] overflow-hidden transition-[max-width] duration-700 md:self-start',
              detailOpen ? 'md:max-w-[36%] xl:max-w-[32%]' : 'md:max-w-full'
            )}
          >
            <div
              className="overflow-visible pb-8 sm:pb-10 md:overflow-hidden md:pb-0"
              ref={emblaRef}
            >
              <motion.div
                className={clsx(
                  'embla__container flex touch-pan-x items-center gap-3 sm:gap-4 md:gap-[var(--journey-gap)] md:[--journey-gap:clamp(14px,1.7vw,28px)]',
                  'md:items-start'
                )}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1.08, ease: [0.22, 1, 0.36, 1] }}
              >
                {renderedCards.map((slide, index) => {
                  const forwardOffset = getForwardOffset(index, activeIndex, renderedCards.length);
                  const shouldDelayDesktopHide = !compact && detailOpen && index !== activeIndex;
                  return (
                    <motion.div
                      key={slide.renderKey}
                      className={clsx(
                        'embla__slide flex flex-[0_0_74%] items-center sm:flex-[0_0_60%]',
                        'md:items-start',
                        detailOpen && index !== activeIndex && 'pointer-events-none',
                        getDesktopSlideBasisClass(forwardOffset)
                      )}
                      animate={{
                        opacity: detailOpen && index !== activeIndex ? 0 : 1,
                      }}
                      transition={{
                        duration: !compact && detailOpen && index !== activeIndex ? 0.42 : 0.28,
                        delay: shouldDelayDesktopHide ? 0.18 : 0,
                        ease: [0.22, 1, 0.36, 1],
                      }}
                    >
                      <CsrImpactCardPanel
                        card={slide.card}
                        compact={compact}
                        isActive={index === activeIndex}
                        detailOpen={detailOpen}
                        forwardOffset={forwardOffset}
                        onAction={() => onSelect(index)}
                        onToggleDetail={onToggleDetail}
                      />
                    </motion.div>
                  );
                })}
              </motion.div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
      <AnimatePresence initial={false}>
        {showMobileDetail ? (
          <CsrImpactMobileDetailPanel card={activeCard} onClose={onToggleDetail} />
        ) : null}
      </AnimatePresence>
      <AnimatePresence initial={false}>
        {detailOpen ? (
          <motion.div
            key={`csr-detail-${activeCard?.id ?? 'active'}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{
              duration: 0.46,
              delay: compact ? 0 : 0.58,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="hidden min-h-[560px] flex-1 md:flex md:items-center md:self-start"
          >
            {showDesktopDetailContent ? <CsrImpactDetailPanel card={activeCard} /> : null}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </motion.div>
  );
}

function CsrImpactDetailPanel({ card }: { card: CsrImpactCard | null }) {
  if (!card) return null;

  return (
    <div className="flex min-h-[560px] w-full items-center">
      <article className="flex min-h-[320px] max-w-[560px] flex-col justify-center pl-2 pr-8 text-left xl:max-w-[620px]">
        {card.detailItems?.length ? (
          <div className="space-y-7">
            {card.detailItems.map((item) => (
              <div key={`${card.id}-${item.label}`} className="flex items-center gap-4">
                <div className="relative h-12 w-12 shrink-0">
                  <Image
                    src={item.icon}
                    alt=""
                    fill
                    className="object-contain [filter:drop-shadow(0_0_16px_rgba(247,213,125,0.26))_drop-shadow(0_12px_22px_rgba(52,29,8,0.22))]"
                  />
                </div>
                <div className="min-w-0">
                  {item.handle ? (
                    <p className="text-[#f4e7cc]/88 font-display text-[11px] uppercase tracking-[0.22em]">
                      {item.label}
                    </p>
                  ) : null}
                  {item.handle ? (
                    <a
                      href={item.href}
                      target="_blank"
                      rel="noreferrer"
                      className="group/link mt-1 inline-flex items-center text-[1.18rem] text-[#fffef8] transition-colors duration-300 [font-family:var(--font-cannia)] [text-shadow:0_0_14px_rgba(255,237,210,0.42),0_8px_18px_rgba(59,36,18,0.26)] hover:text-[#f6c452]"
                    >
                      <span className="relative after:absolute after:-bottom-1 after:left-0 after:h-px after:w-full after:origin-left after:scale-x-0 after:bg-[linear-gradient(90deg,#f7d57d_0%,rgba(247,213,125,0)_100%)] after:transition-transform after:duration-300 group-hover/link:after:scale-x-100">
                        {item.handle}
                      </span>
                    </a>
                  ) : (
                    <p className="text-[1.18rem] leading-[1.2] text-[#fffef8] [font-family:var(--font-cannia)] [text-shadow:0_0_14px_rgba(255,237,210,0.42),0_8px_18px_rgba(59,36,18,0.26)]">
                      {item.label}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-5">
            {(card.detailBody ?? ['Content coming soon.']).map((paragraph) => (
              <p
                key={paragraph}
                className="max-w-[54ch] font-sans text-[13px] italic leading-[1.86] text-[#fffef8] [text-shadow:0_0_12px_rgba(255,237,210,0.28),0_10px_24px_rgba(0,0,0,0.24),0_18px_38px_rgba(59,36,18,0.24)] sm:text-[14px]"
              >
                {paragraph}
              </p>
            ))}
          </div>
        )}
      </article>
    </div>
  );
}

function LoopingMobileIconSelector({
  items,
  activeIndex,
  onChange,
}: {
  items: LoopingMobileSelectorItem[];
  activeIndex: number;
  onChange: (index: number) => void;
}) {
  const renderedItems = useMemo(() => buildRenderedLoopingMobileSelectorItems(items), [items]);
  const uniqueCount = items.length;
  const centeredStartIndex = useMemo(() => {
    if (!uniqueCount || !renderedItems.length) return 0;
    return Math.floor(renderedItems.length / uniqueCount / 2) * uniqueCount;
  }, [renderedItems.length, uniqueCount]);
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const itemRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const isAutoScrollingRef = useRef(false);
  const [activeRenderIndex, setActiveRenderIndex] = useState(centeredStartIndex + activeIndex);

  const centerRenderIndex = useCallback(
    (renderIndex: number, behavior: ScrollBehavior = 'smooth') => {
      const scroller = scrollerRef.current;
      const node = itemRefs.current[renderIndex];
      if (!scroller || !node) return;
      const nextLeft = node.offsetLeft - (scroller.clientWidth - node.offsetWidth) / 2;
      isAutoScrollingRef.current = true;
      scroller.scrollTo({ left: nextLeft, behavior });
      window.setTimeout(
        () => {
          isAutoScrollingRef.current = false;
        },
        behavior === 'smooth' ? 420 : 0
      );
      setActiveRenderIndex(renderIndex);
    },
    []
  );

  useEffect(() => {
    const nextRenderIndex = centeredStartIndex + activeIndex;
    setActiveRenderIndex(nextRenderIndex);
    centerRenderIndex(nextRenderIndex, 'auto');
  }, [activeIndex, centerRenderIndex, centeredStartIndex]);

  return (
    <div
      ref={scrollerRef}
      className="pointer-events-auto overflow-x-auto overflow-y-visible pt-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      onScroll={(event) => {
        if (isAutoScrollingRef.current || !renderedItems.length || !uniqueCount) return;
        const scroller = event.currentTarget;
        const viewportCenter = scroller.scrollLeft + scroller.clientWidth / 2;
        let closestRenderIndex = activeRenderIndex;
        let closestDistance = Number.POSITIVE_INFINITY;
        itemRefs.current.forEach((node, index) => {
          if (!node) return;
          const itemCenter = node.offsetLeft + node.offsetWidth / 2;
          const distance = Math.abs(itemCenter - viewportCenter);
          if (distance < closestDistance) {
            closestDistance = distance;
            closestRenderIndex = index;
          }
        });
        const nextSourceIndex = renderedItems[closestRenderIndex]?.sourceIndex ?? 0;
        setActiveRenderIndex(closestRenderIndex);
        if (nextSourceIndex !== activeIndex) {
          onChange(nextSourceIndex);
        }
        if (
          closestRenderIndex < uniqueCount ||
          closestRenderIndex >= renderedItems.length - uniqueCount
        ) {
          const recenteredIndex = centeredStartIndex + nextSourceIndex;
          centerRenderIndex(recenteredIndex, 'auto');
        }
      }}
    >
      <div className="flex min-w-max items-start gap-3 px-0 pb-5 pt-1">
        <div style={{ flex: '0 0 calc(50vw - 52px)' }} />
        {renderedItems.map((renderedItem, index) => {
          const isActive = index === activeRenderIndex;
          return (
            <button
              key={renderedItem.renderKey}
              ref={(node) => {
                itemRefs.current[index] = node;
              }}
              type="button"
              onClick={() => {
                onChange(renderedItem.sourceIndex);
                centerRenderIndex(centeredStartIndex + renderedItem.sourceIndex, 'smooth');
              }}
              aria-pressed={isActive}
              className="group relative flex w-[6.5rem] shrink-0 flex-col items-center justify-center focus-visible:outline-none"
            >
              <motion.span
                animate={{ scale: isActive ? 1 : 0.8, opacity: isActive ? 1 : 0.58 }}
                transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                className={clsx(
                  'bg-white/12 relative inline-flex items-center justify-center rounded-full',
                  isActive
                    ? 'h-20 w-20 shadow-[0_0_32px_rgba(246,196,82,0.36)]'
                    : 'h-14 w-14 shadow-[0_0_18px_rgba(246,196,82,0.16)]'
                )}
              >
                {isActive ? (
                  <span
                    aria-hidden
                    className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-24 w-24 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(247,214,133,0.5)_0%,rgba(247,214,133,0.2)_34%,rgba(247,214,133,0)_74%)] blur-xl"
                  />
                ) : null}
                <Image
                  src={renderedItem.item.icon}
                  alt={renderedItem.item.label}
                  width={52}
                  height={52}
                  className={clsx(
                    'object-contain drop-shadow-[0_0_18px_rgba(247,213,125,0.72)] [filter:drop-shadow(0_10px_18px_rgba(52,29,8,0.22))]',
                    isActive ? 'h-12 w-12' : 'h-8 w-8'
                  )}
                />
              </motion.span>
              <AnimatePresence initial={false}>
                {isActive ? (
                  <motion.span
                    key={`${renderedItem.renderKey}-label`}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                    className="mt-2 whitespace-nowrap bg-[linear-gradient(135deg,#f3bc58_0%,#f7d57d_52%,#f3bc58_100%)] bg-clip-text text-[1.15rem] text-transparent [font-family:var(--font-cannia)] [text-shadow:0_0_12px_rgba(247,213,125,0.2)]"
                  >
                    {renderedItem.item.label}
                  </motion.span>
                ) : null}
              </AnimatePresence>
            </button>
          );
        })}
        <div style={{ flex: '0 0 calc(50vw - 52px)' }} />
      </div>
    </div>
  );
}

function CsrImpactMobileDetailHeader({ card }: { card: CsrImpactCard }) {
  return (
    <div className="flex flex-col items-center text-center">
      <div className="relative h-[220px] w-[220px]">
        <Image src={card.image} alt={card.title} fill className="object-contain" sizes="220px" />
        {card.overlayText ? (
          <span className="pointer-events-none absolute inset-0 flex items-center justify-center text-[2.2rem] text-[#f8d784] [font-family:var(--font-cannia)] [text-shadow:0_0_22px_rgba(248,215,132,0.22)]">
            {card.overlayText}
          </span>
        ) : null}
      </div>
      <h3 className="mt-4 bg-[linear-gradient(135deg,#f3bc58_0%,#f7d57d_52%,#f3bc58_100%)] bg-clip-text text-[clamp(1.65rem,7vw,2.2rem)] leading-none text-transparent [filter:drop-shadow(0_0_14px_rgba(247,213,125,0.2))_drop-shadow(0_10px_20px_rgba(52,29,8,0.24))] [font-family:var(--font-cannia)]">
        {card.title}
        {card.titleSuffix ? (
          <span className="ml-1 inline-flex items-baseline">
            <span>{card.titleSuffix}</span>
            {card.suffixSubscript ? (
              <sub className="ml-0.5 text-[0.46em] leading-none">{card.suffixSubscript}</sub>
            ) : null}
          </span>
        ) : null}
      </h3>
      {card.detailSubtitle ? (
        <p className="text-[#f4e7cc]/88 mt-2 font-display text-[0.7rem] uppercase tracking-[0.2em]">
          {card.detailSubtitle}
        </p>
      ) : null}
    </div>
  );
}

function CsrImpactMobileDetailItems({ card }: { card: CsrImpactCard }) {
  const items = card.detailItems ?? [];
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    setSelectedIndex(0);
  }, [card.id]);

  const activeItem = items[selectedIndex] ?? items[0];

  if (!activeItem) return null;

  const selectorItems = items.map((item, index) => ({
    id: `${card.id}-${index}`,
    icon: item.icon,
    label: item.handle ?? item.label,
  }));

  return (
    <div className="space-y-5">
      <LoopingMobileIconSelector
        items={selectorItems}
        activeIndex={selectedIndex}
        onChange={setSelectedIndex}
      />

      <motion.div
        key={`${card.id}-${activeItem.label}-copy`}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -6 }}
        transition={{ duration: 0.34, ease: [0.22, 1, 0.36, 1] }}
        className="text-center"
      >
        {activeItem.handle ? (
          <>
            <p className="text-[#f4e7cc]/88 font-display text-[10px] uppercase tracking-[0.22em]">
              {activeItem.label}
            </p>
            <a
              href={activeItem.href}
              target="_blank"
              rel="noreferrer"
              className="mt-2 inline-flex text-[1.18rem] text-[#fffef8] transition-colors duration-300 [font-family:var(--font-cannia)] [text-shadow:0_0_14px_rgba(255,237,210,0.42),0_8px_18px_rgba(59,36,18,0.26)] hover:text-[#f6c452]"
            >
              {activeItem.handle}
            </a>
          </>
        ) : (
          <p className="text-[#f4e7cc]/88 font-display text-[10px] uppercase tracking-[0.22em]">
            {activeItem.label}
          </p>
        )}
      </motion.div>
    </div>
  );
}

function CsrImpactMobileDetailPanel({
  card,
  onClose,
}: {
  card: CsrImpactCard | null;
  onClose: () => void;
}) {
  if (!card) return null;
  const hasDetailItems = Boolean(card.detailItems?.length);

  return (
    <AnimatePresence initial={false} mode="wait">
      <motion.div
        key={`mobile-detail-${card.id}`}
        layout
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 8 }}
        transition={{ duration: 0.48, ease: [0.22, 1, 0.36, 1] }}
        className="mt-2 w-full px-2"
      >
        <div
          className={clsx(
            'px-4 py-5',
            hasDetailItems
              ? 'bg-transparent'
              : 'rounded-[30px] bg-[radial-gradient(circle_at_top,rgba(255,241,218,0.14)_0%,rgba(255,241,218,0.04)_42%,rgba(255,241,218,0)_100%)]'
          )}
        >
          {!hasDetailItems ? <CsrImpactMobileDetailHeader card={card} /> : null}
          {hasDetailItems ? (
            <CsrImpactMobileDetailItems card={card} />
          ) : (
            <div className="mt-5 space-y-5">
              {(card.detailBody ?? ['Content coming soon.']).map((paragraph) => (
                <p
                  key={`${card.id}-${paragraph}`}
                  className="font-sans text-[13px] italic leading-[1.86] text-[#fffef8] [text-shadow:0_0_16px_rgba(255,237,210,0.48),0_1px_12px_rgba(59,36,18,0.45)]"
                >
                  {paragraph}
                </p>
              ))}
            </div>
          )}
          <div className="flex justify-center pt-6">
            <button
              type="button"
              onClick={onClose}
              className={`${heroJourneyButtonClass} gap-2 px-4 py-2 font-display text-[9px] uppercase tracking-[0.2em]`}
            >
              <span
                aria-hidden
                className="pointer-events-none absolute inset-0 z-0 -translate-x-full bg-gradient-to-r from-transparent via-[#f6c452bf] to-transparent opacity-0 transition-transform duration-500 group-hover:translate-x-full group-hover:opacity-100"
              />
              <span className="relative z-10">Back</span>
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

function CsrImpactCardPanel({
  card,
  compact = false,
  isActive = false,
  detailOpen = false,
  forwardOffset,
  onAction,
  onToggleDetail,
}: {
  card: CsrImpactCard;
  compact?: boolean;
  isActive?: boolean;
  detailOpen?: boolean;
  forwardOffset: number;
  onAction: () => void;
  onToggleDetail: () => void;
}) {
  const fadeProfile = getCardFadeProfile(forwardOffset, compact);
  const effectiveOpacity = detailOpen ? (isActive ? 1 : 0) : fadeProfile.opacity;
  const hasSvgGlow = card.image.endsWith('.svg');
  const cardTransformOrigin = compact ? 'center center' : 'center 248px';
  const isCompactDetailActive = compact && detailOpen && isActive;
  const carouselTransition = { duration: 0.72, ease: [0.22, 1, 0.36, 1] as const };

  return (
    <motion.div
      role="button"
      tabIndex={0}
      onClick={onAction}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onAction();
        }
      }}
      className={clsx(
        'group relative flex w-full flex-col items-center bg-transparent text-center focus:outline-none',
        compact ? 'justify-center px-5 py-6' : 'min-h-[560px] justify-start px-8 pb-8 pt-8'
      )}
      style={{ transformOrigin: cardTransformOrigin }}
      animate={{
        opacity: effectiveOpacity,
        scale: compact ? (isCompactDetailActive ? 0.82 : 1) : fadeProfile.scale,
        y: compact ? 0 : fadeProfile.y,
        minHeight: compact ? (isCompactDetailActive ? 292 : 430) : 560,
      }}
      whileHover={detailOpen ? undefined : { opacity: Math.min(fadeProfile.opacity + 0.08, 1) }}
      transition={{
        duration: detailOpen ? 0.92 : carouselTransition.duration,
        ease: carouselTransition.ease,
      }}
    >
      <div className="absolute inset-0 bg-transparent" />
      <AnimatePresence initial={false}>
        {isActive ? (
          <motion.p
            key={`${card.id}-title`}
            className={clsx(
              'relative z-10 flex max-w-full items-start justify-center gap-2 whitespace-nowrap bg-[linear-gradient(135deg,#f3bc58_0%,#f7d57d_52%,#f3bc58_100%)] bg-clip-text text-transparent [filter:drop-shadow(0_3px_0_rgba(0,0,0,0.3))_drop-shadow(0_10px_20px_rgba(0,0,0,0.24))_drop-shadow(0_20px_34px_rgba(0,0,0,0.16))] [font-family:var(--font-cannia)]',
              compact
                ? 'text-[clamp(1.2rem,5vw,1.9rem)] leading-none'
                : 'text-[clamp(1.7rem,2.5vw,2.65rem)] leading-none'
            )}
            initial={{ opacity: 0 }}
            animate={{
              opacity: isCompactDetailActive ? 0.82 : 1,
              scale: isCompactDetailActive ? 0.9 : 1,
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.42, ease: carouselTransition.ease }}
          >
            {card.title}
            {card.titleSuffix ? (
              <span className="ml-1 inline-flex items-baseline">
                <span>{card.titleSuffix}</span>
                {card.suffixSubscript ? (
                  <sub
                    className={clsx(
                      'ml-0.5 leading-none',
                      compact ? 'text-[0.5em]' : 'text-[0.46em]'
                    )}
                  >
                    {card.suffixSubscript}
                  </sub>
                ) : null}
              </span>
            ) : null}
          </motion.p>
        ) : null}
      </AnimatePresence>
      <motion.div
        className={clsx(
          'relative z-10 mt-6',
          hasSvgGlow ? 'overflow-visible' : 'overflow-hidden',
          compact ? 'h-[220px] w-[220px]' : 'h-[300px] w-[300px]'
        )}
        animate={{
          width: compact ? (isCompactDetailActive ? 150 : 220) : 300,
          height: compact ? (isCompactDetailActive ? 150 : 220) : 300,
          marginTop: isCompactDetailActive ? 10 : 24,
        }}
        transition={{
          duration: detailOpen ? 0.92 : carouselTransition.duration,
          ease: carouselTransition.ease,
        }}
      >
        {hasSvgGlow ? (
          <span
            aria-hidden
            className={clsx(
              'pointer-events-none absolute left-1/2 top-1/2 -z-10 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(247,214,133,0.52)_0%,rgba(247,214,133,0.22)_34%,rgba(247,214,133,0)_74%)] blur-2xl',
              compact ? 'h-[12rem] w-[12rem]' : 'h-[16rem] w-[16rem]'
            )}
          />
        ) : null}
        <motion.div
          className="absolute inset-0 [filter:drop-shadow(0_0_18px_rgba(247,213,125,0.22))_drop-shadow(0_18px_28px_rgba(52,29,8,0.22))]"
          animate={{ opacity: isActive ? 1 : 0.84 }}
          whileHover={{ opacity: 1 }}
          transition={{ duration: carouselTransition.duration, ease: carouselTransition.ease }}
        >
          <Image src={card.image} alt={card.title} fill className="object-contain" sizes="300px" />
        </motion.div>
        {card.overlayText ? (
          <span
            className={clsx(
              'pointer-events-none absolute inset-0 flex items-center justify-center text-[#f8d784] [font-family:var(--font-cannia)] [text-shadow:0_0_26px_rgba(248,215,132,0.28)]',
              compact ? (isCompactDetailActive ? 'text-[1.45rem]' : 'text-[2.2rem]') : 'text-[3rem]'
            )}
          >
            {card.overlayText}
          </span>
        ) : null}
      </motion.div>
      {isActive && !(compact && detailOpen) ? (
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onToggleDetail();
          }}
          className={clsx(
            `${heroJourneyButtonClass} z-10 mt-6 px-4 py-2 font-display uppercase tracking-[0.2em]`,
            compact ? 'text-[0.55rem]' : 'text-[0.62rem]'
          )}
        >
          <span
            aria-hidden
            className="pointer-events-none absolute inset-0 z-0 -translate-x-full bg-gradient-to-r from-transparent via-[#f6c452bf] to-transparent opacity-0 transition-transform duration-500 group-hover:translate-x-full group-hover:opacity-100"
          />
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={detailOpen ? 'back' : 'discover'}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
              className="relative z-10"
            >
              {detailOpen ? 'Back' : card.ctaLabel}
            </motion.span>
          </AnimatePresence>
        </button>
      ) : null}
    </motion.div>
  );
}

function BackToJourneysButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group inline-flex items-center gap-2 text-white drop-shadow-[0_12px_28px_rgba(0,0,0,0.38)] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/45"
      aria-label="Back to all journeys"
    >
      <SiteArrowIcon
        direction="left"
        className="h-5 w-5 text-white/55 transition-all duration-300 group-hover:-translate-x-0.5 group-hover:text-[#f6c452]"
      />
      <div className="relative h-8 w-8 shrink-0">
        <Image
          src="/assets/icones/Ico White BEE-12.svg"
          alt=""
          fill
          className="object-contain transition-opacity duration-300 group-hover:opacity-0"
        />
        <Image
          src="/assets/icones/Ico Gold BEE-12.svg"
          alt=""
          fill
          className="object-contain opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        />
      </div>
      <span className="font-display text-[0.72rem] uppercase tracking-[0.16em] text-white transition-colors duration-300 [text-shadow:0_2px_0_rgba(0,0,0,0.3),0_8px_14px_rgba(0,0,0,0.24),0_16px_34px_rgba(0,0,0,0.24)] group-hover:text-[#f6c452] sm:text-[0.8rem]">
        All Journeys
      </span>
    </button>
  );
}

function LocationNavigation({
  canScrollPrev,
  canScrollNext,
  onPrev,
  onNext,
  compact = false,
  centered = false,
}: {
  canScrollPrev: boolean;
  canScrollNext: boolean;
  onPrev: () => void;
  onNext: () => void;
  compact?: boolean;
  centered?: boolean;
}) {
  return (
    <div
      className={clsx(
        'pointer-events-auto flex items-center text-white',
        compact ? 'gap-2' : 'gap-3 sm:gap-4',
        centered && 'justify-center'
      )}
    >
      <button
        type="button"
        onClick={onPrev}
        disabled={!canScrollPrev}
        className={clsx(
          'group flex items-center justify-center transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/45',
          compact ? 'h-6 w-6' : 'h-7 w-7',
          !canScrollPrev ? 'cursor-not-allowed text-white/20' : 'text-white/45 hover:text-white/80'
        )}
        aria-label="Previous location"
      >
        <SiteArrowIcon
          direction="left"
          className={clsx(
            'transition-transform duration-300 group-hover:-translate-x-1',
            compact ? 'h-3.5 w-3.5' : 'h-4 w-4'
          )}
        />
      </button>
      <div
        className={clsx(
          'relative flex min-w-0 items-center overflow-hidden',
          compact ? 'gap-1.5' : 'gap-3'
        )}
      >
        <Image
          src="/assets/icones/Ico White BEE-14.svg"
          alt=""
          width={42}
          height={42}
          className={clsx(
            'shrink-0 drop-shadow-[0_0_20px_rgba(255,255,255,0.42)]',
            compact ? 'h-7 w-7' : 'h-10 w-10 sm:h-11 sm:w-11'
          )}
          priority
        />
        <span
          className={clsx(
            'truncate font-display uppercase tracking-[0.14em] text-white [text-shadow:0_2px_0_rgba(0,0,0,0.3),0_8px_14px_rgba(0,0,0,0.24),0_16px_34px_rgba(0,0,0,0.24)]',
            compact ? 'text-[0.7rem]' : 'text-[1.1rem] sm:text-[1.55rem]'
          )}
        >
          Next Location
        </span>
      </div>
      <button
        type="button"
        onClick={onNext}
        disabled={!canScrollNext}
        className={clsx(
          'group flex items-center justify-center transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/45',
          compact ? 'h-6 w-6' : 'h-7 w-7',
          !canScrollNext ? 'cursor-not-allowed text-white/20' : 'text-white/45 hover:text-white/80'
        )}
        aria-label="Next location"
      >
        <SiteArrowIcon
          direction="right"
          className={clsx(
            'transition-transform duration-300 group-hover:translate-x-1',
            compact ? 'h-3.5 w-3.5' : 'h-4 w-4'
          )}
        />
      </button>
    </div>
  );
}

function MobileMenuCycler({
  option,
  onPrev,
  onNext,
  onSelect,
}: {
  option: (typeof MOBILE_MENU_OPTIONS)[number];
  onPrev: () => void;
  onNext: () => void;
  onSelect: () => void;
}) {
  return (
    <div className="pointer-events-auto flex items-center justify-center gap-2 text-white">
      <button
        type="button"
        onClick={onPrev}
        className="group flex h-6 w-6 items-center justify-center text-white/45 transition hover:text-white/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/45"
        aria-label="Previous menu item"
      >
        <SiteArrowIcon
          direction="left"
          className="h-3.5 w-3.5 transition-transform duration-300 group-hover:-translate-x-1"
        />
      </button>

      <button
        type="button"
        onClick={onSelect}
        disabled={option.disabled}
        className={clsx(
          'group relative flex min-w-[11.5rem] items-center justify-center gap-2 overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/45',
          option.disabled ? 'cursor-not-allowed opacity-55' : 'opacity-100'
        )}
      >
        <div className="relative h-7 w-7 shrink-0">
          <Image
            src={option.icon}
            alt=""
            fill
            className={clsx(
              'object-contain transition-opacity duration-300',
              option.disabled ? 'opacity-100' : 'opacity-100 group-hover:opacity-0'
            )}
          />
          {!option.disabled ? (
            <Image
              src={option.hoverIcon}
              alt=""
              fill
              className="object-contain opacity-0 transition-opacity duration-300 group-hover:opacity-100"
            />
          ) : null}
        </div>
        <span
          className={clsx(
            'font-display text-[0.78rem] uppercase tracking-[0.16em] transition-colors duration-300',
            option.disabled ? 'text-white/72' : 'text-white group-hover:text-[#f6c452]'
          )}
        >
          {option.label}
        </span>
      </button>

      <button
        type="button"
        onClick={onNext}
        className="group flex h-6 w-6 items-center justify-center text-white/45 transition hover:text-white/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/45"
        aria-label="Next menu item"
      >
        <SiteArrowIcon
          direction="right"
          className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1"
        />
      </button>
    </div>
  );
}

function LocationCard({
  location,
  isActive,
  forwardOffset,
  onAction,
  prefersReducedMotion,
  isMobileViewport,
}: {
  location: IndiaLocation;
  isActive: boolean;
  forwardOffset: number;
  onAction: () => void;
  prefersReducedMotion: boolean;
  isMobileViewport: boolean;
}) {
  const fadeProfile = getCardFadeProfile(forwardOffset, isMobileViewport);
  const seasonIconScale: SeasonIconScale =
    forwardOffset === 0 ? 'hero' : forwardOffset === 1 ? 'lead' : 'trail';

  return (
    <motion.button
      type="button"
      onClick={onAction}
      layout
      className={clsx(
        'group relative w-full overflow-visible focus:outline-none focus-visible:ring-2 focus-visible:ring-[#f5d49b] focus-visible:ring-offset-0',
        prefersReducedMotion
          ? 'transition-none'
          : 'ease-[cubic-bezier(0.22,1,0.36,1)] transition-transform duration-700'
      )}
      animate={
        prefersReducedMotion
          ? undefined
          : { opacity: fadeProfile.opacity, scale: fadeProfile.scale, y: fadeProfile.y }
      }
      whileHover={
        prefersReducedMotion
          ? undefined
          : {
              opacity: Math.min(fadeProfile.opacity + 0.08, 1),
              scale: fadeProfile.scale + 0.01,
              y: Math.max(fadeProfile.y - 4, -4),
            }
      }
      transition={
        prefersReducedMotion
          ? undefined
          : {
              duration: 0.7,
              ease: [0.22, 1, 0.36, 1],
              layout: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
            }
      }
      aria-label={`Location: ${location.title}`}
      style={{ transformOrigin: isMobileViewport ? 'center center' : 'left center' }}
    >
      <div className="relative aspect-[3/4] w-full overflow-hidden shadow-[0_30px_75px_-24px_rgba(0,0,0,0.78)]">
        <motion.div
          className="absolute inset-0"
          animate={
            prefersReducedMotion
              ? undefined
              : { scale: fadeProfile.imageScale, filter: fadeProfile.imageFilter }
          }
          whileHover={
            prefersReducedMotion
              ? undefined
              : { scale: fadeProfile.imageScale + 0.025, filter: 'saturate(1.02) brightness(1.01)' }
          }
          transition={
            prefersReducedMotion ? undefined : { duration: 0.8, ease: [0.22, 1, 0.36, 1] }
          }
        >
          <Image
            src={location.image}
            alt={location.title}
            fill
            sizes="(min-width: 1536px) 27vw, (min-width: 1280px) 32vw, (min-width: 1024px) 34vw, (min-width: 640px) 52vw, 78vw"
            className="object-cover"
            priority={isActive}
          />
        </motion.div>
        <motion.div
          className="from-black/62 absolute inset-0 bg-gradient-to-t via-transparent to-black/10"
          animate={prefersReducedMotion ? undefined : { opacity: fadeProfile.overlayOpacity }}
          transition={
            prefersReducedMotion ? undefined : { duration: 0.62, ease: [0.22, 1, 0.36, 1] }
          }
        />
        <div className="absolute inset-x-0 bottom-4 flex justify-center">
          <SeasonIconRow
            seasons={location.seasons}
            compact={isMobileViewport}
            scale={seasonIconScale}
          />
        </div>
      </div>
    </motion.button>
  );
}

function SeasonIconRow({
  seasons,
  compact = false,
  scale = 'hero',
}: {
  seasons: JourneySeason[];
  compact?: boolean;
  scale?: SeasonIconScale;
}) {
  const sizing = getSeasonIconSizing(compact, scale);

  return (
    <div className={clsx('flex items-center justify-center', sizing.gapClass)}>
      {seasons.map((season) => {
        const iconSet = JOURNEY_SEASON_ICONS[season];
        const seasonIconShadowClass =
          '[filter:drop-shadow(0_0.16em_0.04em_rgba(0,0,0,0.88))_drop-shadow(0_0.05em_0.16em_rgba(0,0,0,0.45))]';
        return (
          <div
            key={season}
            className={clsx('group/season relative shrink-0', sizing.itemClass)}
            aria-label={iconSet.label}
          >
            <Image
              src={iconSet.icon}
              alt=""
              fill
              className={clsx(
                'object-contain transition-all duration-300 group-hover/season:-translate-y-0.5 group-hover/season:scale-105 group-hover/season:opacity-0',
                seasonIconShadowClass
              )}
            />
            <Image
              src={iconSet.hoverIcon}
              alt=""
              fill
              className={clsx(
                'object-contain opacity-0 transition-all duration-300 group-hover/season:-translate-y-0.5 group-hover/season:scale-105 group-hover/season:opacity-100',
                seasonIconShadowClass
              )}
            />
          </div>
        );
      })}
    </div>
  );
}

function LocationBackground({
  activeKey,
  poster,
  videoSrc,
  videoRef,
  direction,
  prefersReducedMotion,
  useLiteEffects,
}: {
  activeKey: string;
  poster: string;
  videoSrc: string;
  videoRef: { current: HTMLVideoElement | null };
  direction: 1 | -1;
  prefersReducedMotion: boolean;
  useLiteEffects: boolean;
}) {
  const backgroundDuration = prefersReducedMotion ? 0.2 : useLiteEffects ? 0.72 : 0.98;
  const seamPeakOpacity = useLiteEffects ? 0.34 : 0.5;
  const seamShift = direction > 0 ? 42 : -42;
  const shouldRenderVideo = isVideoAsset(videoSrc);

  return (
    <div className="pointer-events-none absolute inset-0" aria-hidden>
      <div className="absolute inset-0">
        <AnimatePresence initial={false} mode="sync">
          <motion.div
            key={activeKey}
            className="absolute inset-0 overflow-hidden"
            initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={prefersReducedMotion ? { opacity: 1 } : { opacity: 0 }}
            transition={{ duration: backgroundDuration, ease: [0.22, 1, 0.36, 1] }}
          >
            {shouldRenderVideo ? (
              <video
                ref={videoRef}
                src={videoSrc}
                poster={poster}
                className="absolute inset-0 h-full w-full object-cover object-center"
                autoPlay
                muted
                loop
                playsInline
                preload="auto"
              />
            ) : (
              <Image
                src={videoSrc}
                alt=""
                fill
                priority
                className="object-cover object-center"
                sizes="100vw"
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="absolute inset-0 overflow-hidden">
        <AnimatePresence initial={false} mode="sync">
          {!prefersReducedMotion ? (
            <motion.div
              key={`seam-${activeKey}`}
              className="absolute inset-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: backgroundDuration, ease: [0.22, 1, 0.36, 1] }}
            >
              <motion.div
                className="absolute inset-y-[-8%] left-1/2 z-10 w-[46vw] -translate-x-1/2 bg-[linear-gradient(90deg,rgba(255,255,255,0)_0%,rgba(255,255,255,0.05)_18%,rgba(255,255,255,0.2)_50%,rgba(255,255,255,0.05)_82%,rgba(255,255,255,0)_100%)] mix-blend-screen blur-[28px]"
                initial={{ opacity: 0, x: seamShift }}
                animate={{ opacity: [0, seamPeakOpacity, 0], x: [seamShift, 0, -seamShift * 0.4] }}
                exit={{ opacity: 0 }}
                transition={{
                  duration: backgroundDuration,
                  ease: [0.22, 1, 0.36, 1],
                  times: [0, 0.45, 1],
                }}
              />
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(236,191,126,0.2)_0%,rgba(236,191,126,0)_42%),radial-gradient(circle_at_82%_84%,rgba(255,234,196,0.14)_0%,rgba(255,234,196,0)_38%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(110deg,rgba(15,8,4,0.62)_0%,rgba(19,10,5,0.3)_36%,rgba(15,8,4,0.66)_100%)]" />
    </div>
  );
}

function LocationStoryBand({
  story,
  compact = false,
  onClose,
  onNext,
}: {
  story: IndiaLocationStory;
  compact?: boolean;
  onClose: () => void;
  onNext: () => void;
}) {
  const scrollViewportRef = useRef<HTMLDivElement | null>(null);
  const imageViewportRef = useRef<HTMLDivElement | null>(null);
  const [imageMask, setImageMask] = useState(
    'linear-gradient(to right, transparent 0px, black 120px, black calc(100% - 120px), transparent 100%)'
  );
  const [imageShade, setImageShade] = useState(
    'linear-gradient(90deg, rgba(0,0,0,0.24) 0px, rgba(0,0,0,0.06) 120px, rgba(0,0,0,0.06) calc(100% - 120px), rgba(0,0,0,0.24) 100%)'
  );

  const syncImageFade = useCallback(() => {
    const scrollViewport = scrollViewportRef.current;
    const imageViewport = imageViewportRef.current;
    if (!scrollViewport || !imageViewport) return;

    const fadeWidth = compact ? 88 : 132;
    const scrollLeft = scrollViewport.scrollLeft;
    const viewportWidth = scrollViewport.clientWidth;
    const imageOffsetLeft = imageViewport.offsetLeft;
    const imageWidth = imageViewport.offsetWidth;
    const visibleStart = Math.max(0, Math.min(imageWidth, scrollLeft - imageOffsetLeft));
    const visibleEnd = Math.max(
      0,
      Math.min(imageWidth, scrollLeft + viewportWidth - imageOffsetLeft)
    );
    const leftSolidStart = Math.min(visibleStart + fadeWidth, visibleEnd);
    const rightSolidEnd = Math.max(visibleEnd - fadeWidth, visibleStart);

    setImageMask(
      `linear-gradient(to right, transparent 0px, transparent ${visibleStart}px, black ${leftSolidStart}px, black ${rightSolidEnd}px, transparent ${visibleEnd}px, transparent 100%)`
    );
    setImageShade(
      `linear-gradient(90deg, rgba(0,0,0,0.24) 0px, rgba(0,0,0,0.18) ${visibleStart}px, rgba(0,0,0,0.06) ${leftSolidStart}px, rgba(0,0,0,0.06) ${rightSolidEnd}px, rgba(0,0,0,0.18) ${visibleEnd}px, rgba(0,0,0,0.24) 100%)`
    );
  }, [compact]);

  useEffect(() => {
    syncImageFade();
    const handleResize = () => syncImageFade();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [syncImageFade]);

  return (
    <div className={clsx('mx-auto w-full', compact ? 'max-w-[94vw]' : 'max-w-[1280px]')}>
      <div className="mb-4 flex items-center">
        <button
          type="button"
          onClick={onClose}
          className="group inline-flex items-center gap-2 px-1 py-1.5 font-display text-[10px] uppercase tracking-[0.18em] text-white/85 transition hover:text-[#d9a24b] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/55"
        >
          <SiteArrowIcon
            direction="left"
            className="h-5 w-5 transition-transform group-hover:-translate-x-0.5 group-hover:text-[#d9a24b]"
          />
          Back
        </button>
      </div>

      <div
        className={clsx(
          'relative overflow-hidden',
          compact ? 'min-h-[68svh]' : 'min-h-[min(72vh,680px)]'
        )}
      >
        <div
          ref={scrollViewportRef}
          className="relative h-full overflow-x-auto overflow-y-hidden scroll-smooth [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          onWheel={(event) => {
            if (Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return;
            event.currentTarget.scrollLeft += event.deltaY;
          }}
          onScroll={() => syncImageFade()}
        >
          <div
            className={clsx(
              'relative z-10 flex h-full items-center',
              compact
                ? 'min-w-[2100px] gap-8 px-5 py-8'
                : 'min-w-[3200px] gap-12 px-10 py-10 lg:px-14'
            )}
          >
            <div className={clsx('shrink-0', compact ? 'w-[240px]' : 'w-[320px]')}>
              <span
                aria-hidden
                className="pointer-events-none absolute -z-10 rounded-full bg-[radial-gradient(circle,rgba(255,241,218,0.28)_0%,rgba(255,241,218,0)_74%)] blur-xl"
              />
              <p
                className={clsx(
                  'font-menu normal-case tracking-[-0.01em] text-[#fff9ef] [text-shadow:0_0_18px_rgba(255,238,214,0.42),0_14px_34px_rgba(0,0,0,0.26),0_28px_62px_rgba(0,0,0,0.22)]',
                  compact
                    ? 'text-[clamp(2.2rem,11vw,3.8rem)] leading-[0.88]'
                    : 'text-[clamp(3rem,5.8vw,5.4rem)] leading-[0.84]'
                )}
              >
                {story.leftTitle.map((line, index) => (
                  <span key={`${story.id}-title-${index}`} className="block">
                    {line}
                  </span>
                ))}
              </p>
            </div>

            <div
              ref={imageViewportRef}
              className={clsx(
                'relative aspect-[4/1] shrink-0 overflow-hidden bg-black/10',
                compact ? 'h-[52svh] min-h-[360px]' : 'h-[min(60vh,560px)]'
              )}
              style={{
                WebkitMaskImage: imageMask,
                maskImage: imageMask,
              }}
            >
              <Image
                src={story.image}
                alt={story.nextLocation}
                fill
                className="object-contain"
                sizes="(min-width: 1024px) 2240px, 1440px"
                quality={100}
              />
              <div className="absolute inset-0" style={{ backgroundImage: imageShade }} />
            </div>

            <article
              className={clsx(
                'relative shrink-0 text-left text-[#fffef8]',
                compact ? 'w-[320px]' : 'w-[360px]'
              )}
            >
              <span
                aria-hidden
                className="pointer-events-none absolute -inset-x-4 -inset-y-3 -z-10 rounded-[32px] bg-[radial-gradient(circle,rgba(255,240,216,0.24)_0%,rgba(255,240,216,0)_76%)] blur-xl"
              />
              <p className="font-sans text-[13px] italic leading-[1.86] text-[#fffef8] [text-shadow:0_0_12px_rgba(255,237,210,0.28),0_10px_24px_rgba(0,0,0,0.24),0_18px_38px_rgba(59,36,18,0.24)] sm:text-[14px]">
                {story.narrative}
              </p>
              <div className="flex justify-center pt-8">
                <button
                  type="button"
                  onClick={onNext}
                  className={`${heroJourneyButtonClass} gap-2 px-4 py-2 font-display text-[9px] uppercase tracking-[0.2em]`}
                >
                  <span
                    aria-hidden
                    className="pointer-events-none absolute inset-0 z-0 -translate-x-full bg-gradient-to-r from-transparent via-[#f6c452bf] to-transparent opacity-0 transition-transform duration-500 group-hover:translate-x-full group-hover:opacity-100"
                  />
                  <span className="relative z-10">Discover {story.nextLocation}</span>
                </button>
              </div>
            </article>
          </div>
        </div>
      </div>
    </div>
  );
}
