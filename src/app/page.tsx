import { HomeRevealLayout } from '@/app/_components/home-reveal-layout';
import type { WhatWeDoSectionProps } from '@/app/_components/what-we-do-section';
import { campaignShowcases, journeyShowcases } from '@/data/showcases';
import type { JourneyShowcase } from '@/data/showcases';
import { getSupabaseServerClient } from '@/lib/supabase/server-client';

export default async function Home() {
  const supabase = await getSupabaseServerClient();
  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();
  const coCreateHref = !sessionError && session ? '/journeys' : '/login';

  const preferredIds = ['india-january-2026', 'morocco-april-2026', 'dolomites-april-2026'];
  const upcomingJourneys = preferredIds
    .map((id) => journeyShowcases.find((journey) => journey.id === id))
    .filter((journey): journey is JourneyShowcase => Boolean(journey));
  const campaignCtaImage =
    campaignShowcases[0]?.hero.poster ?? campaignShowcases[0]?.hero.src ?? undefined;
  const whatWeDoEntries: WhatWeDoSectionProps['entries'] = [
    {
      id: 'campaign-capsules',
      label: 'Campaign tales',
      icon: 'users',
      title: 'Campaign tales tailored for each brand',
      description:
        'We choreograph dawn-to-midnight rituals so every brand drifts through its own dreamscape. Hero films, lookbooks, and ethereal loops return ready to bloom across every channel.',
      highlights: [
        'Up to three brands float within one crew without crossing storylines',
        'Still and motion squads orbit between mood-soaked sets',
        'Editorial, lookbook, and behind-the-scenes captured within a single journey',
      ],
      media: {
        type: 'image',
        src: '/assets/campaigns/craie-maroc/craie-maroc-gallery-04.jpg',
        alt: 'Nomad tent portrait from the Craie Studio Atlas Mirage campaign',
      },
    },
    {
      id: 'journey-direction',
      label: 'Journey direction',
      icon: 'clapperboard',
      title: 'Journeys directed like cinematic worlds',
      description:
        'We choreograph roaming ateliers where scouting, styling, and story beats move as one tide. Crews share the logistics constellation while each brand guards its own creative cosmos.',
      highlights: [
        'Immersive itineraries mapped for film, editorial, and experiential content',
        'Directors, DOPs, stylists, and sound designers devoted to each brand',
        'Shared production village with lighting, grip, and styling inventories',
      ],
      media: {
        type: 'video',
        src: '/assets/campaigns/almaaz-kenya/almaaz-kenya-story.mp4',
        alt: 'Night ritual for Almaaz Kenya captured in the savannah',
        poster: '/assets/campaigns/almaaz-kenya/almaaz-kenya-cover.jpg',
      },
    },
    {
      id: 'impact-delivery',
      label: 'Impact & delivery',
      icon: 'leaf',
      title: 'Impact lab and delivery suite built in',
      description:
        'Impact storytellers trace footprint reductions and community stardust alongside every frame. The harvest becomes shoppable, press-ready, and investor-sparking toolkits.',
      highlights: [
        'Carbon, community, and hospitality reporting templated for brands',
        'Shared resource ledger keeps budgets transparent in real time',
        'Launch decks, microsites, and asset libraries delivered within 10 days',
      ],
      media: {
        type: 'image',
        src: '/assets/journeys/philippines-lagoon-2025/philippines-lagoon-2025-gallery-07.png',
        alt: 'Jungle cinema installation from the Philippines journey',
      },
    },
  ];

  const trustedBrandLogos = [
    { name: 'Maradji', logo: '/assets/brands/maradji.svg' },
    { name: 'Craie Studio', logo: '/assets/brands/craiestudio.png' },
    { name: 'Almaaz', logo: '/assets/brands/almaaz.png' },
    { name: 'Grace & Mila', logo: '/assets/brands/grace&mila.png' },
    { name: 'Smallable', logo: '/assets/brands/smallable.svg' },
  ];

  return (
    <HomeRevealLayout
      coCreateHref={coCreateHref}
      campaignCtaImage={campaignCtaImage}
      whatWeDoEntries={whatWeDoEntries}
      trustedBrandLogos={trustedBrandLogos}
      upcomingJourneys={upcomingJourneys}
    />
  );
}
