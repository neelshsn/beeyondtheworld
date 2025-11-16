import type { CampaignDetail, JourneySummary } from '@/types/content';
import { SLOT_COLLAPSED, SLOT_EXPANDED, SLOT_LAYOUT } from '@/app/client/_lib/dashboard-layout';

import type {
  DashboardAction,
  DashboardCardData,
  DashboardCardSize,
  DashboardGridSlot,
} from '../_components/client-dashboard.types';

const JOURNEY_SIZE_CYCLE: DashboardCardSize[] = ['lg', 'md', 'md', 'md', 'lg', 'md'];
const CAMPAIGN_SIZE_CYCLE: DashboardCardSize[] = ['md', 'md', 'md', 'md'];

const JOURNEY_PLACEHOLDER_IMAGES = [
  '/assets/journeys/dolomites-april-2026/dolomites-april-2026-gallery-05.png',
  '/assets/journeys/azores-summer-editions/azores-summer-editions-gallery-02.png',
  '/assets/journeys/morocco-april-2026/morocco-april-2026-gallery-08.png',
  '/assets/journeys/namibia-feb-2025/namibia-feb-2025-gallery-15.png',
  '/assets/journeys/philippines-lagoon-2025/philippines-lagoon-2025-gallery-07.png',
  '/assets/journeys/mallorca-balearic-reverie/mallorca-balearic-reverie-gallery-12.png',
  '/assets/journeys/greece-mineral-dreams/greece-mineral-dreams-gallery-05.png',
  '/assets/journeys/thailand-bangkok-2026/thailand-bangkok-2026-gallery-10.png',
];

const CAMPAIGN_PLACEHOLDER_IMAGES = [
  '/assets/campaigns/almaaz-kenya/almaaz-kenya-carousel-01.jpg',
  '/assets/campaigns/almaaz-kenya/almaaz-kenya-gallery-03.jpg',
  '/assets/campaigns/craie-maroc/craie-maroc-carousel-04.jpg',
  '/assets/campaigns/craie-maroc/craie-maroc-gallery-02.jpg',
  '/assets/campaigns/maradji-ibiza/maradji-ibiza-carousel-02.jpg',
  '/assets/campaigns/maradji-ibiza/maradji-ibiza-gallery-01.jpg',
];

const VIDEO_PLACEHOLDERS = [
  {
    src: '/assets/campaigns/maradji-ibiza/maradji-ibiza-story-01.mp4',
    poster: '/assets/campaigns/maradji-ibiza/maradji-ibiza-cover.jpg',
  },
  {
    src: '/assets/campaigns/almaaz-kenya/almaaz-kenya-story.mp4',
    poster: '/assets/campaigns/almaaz-kenya/almaaz-kenya-cover.jpg',
  },
  {
    src: '/assets/campaigns/craie-maroc/craie-maroc-story-01.mp4',
    poster: '/assets/campaigns/craie-maroc/craie-maroc-carousel-01.jpg',
  },
  {
    src: '/assets/concept/sustainable.mp4',
    poster: '/assets/concept/sustainable-poster.png',
  },
];

const CONCEPT_PLACEHOLDER_IMAGE = '/assets/concept/sustainable-poster.png';
const CONCIERGE_PLACEHOLDER_IMAGE = '/assets/campaigns/craie-maroc/craie-maroc-carousel-05.jpg';
const HOME_PLACEHOLDER_IMAGE =
  '/assets/journeys/dolomites-april-2026/dolomites-april-2026-gallery-03.png';
const CONTACT_PLACEHOLDER_IMAGE =
  '/assets/journeys/philippines-lagoon-2025/philippines-lagoon-2025-gallery-05.png';
const LOGOUT_PLACEHOLDER_IMAGE =
  '/assets/journeys/lanzarote-seasons/lanzarote-seasons-gallery-02.svg';

function mapAccent(accent?: JourneySummary['accent']): DashboardCardData['accent'] {
  switch (accent) {
    case 'rose':
      return 'orchid';
    case 'peach':
      return 'honey';
    case 'lilac':
      return 'iris';
    default:
      return 'onyx';
  }
}

function formatLaunchDate(value?: string): string | undefined {
  if (!value) {
    return undefined;
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return undefined;
  }
  return new Intl.DateTimeFormat('en', { month: 'short', year: 'numeric' }).format(date);
}

function shuffle<T>(source: T[]): T[] {
  const array = [...source];
  for (let index = array.length - 1; index > 0; index -= 1) {
    const rand = Math.floor(Math.random() * (index + 1));
    [array[index], array[rand]] = [array[rand], array[index]];
  }
  return array;
}

function buildCampaignActions(campaign: CampaignDetail): DashboardAction[] {
  const actions: DashboardAction[] = [
    {
      label: 'View campaign case',
      href: `/campaigns/${campaign.slug}`,
      intent: 'navigate',
      tone: 'primary',
    },
  ];

  if (campaign.callToAction?.href) {
    actions.push({
      label: campaign.callToAction.label,
      href: campaign.callToAction.href,
      intent: campaign.callToAction.href.startsWith('mailto:') ? 'contact' : 'navigate',
      tone: 'ghost',
    });
  }

  return actions;
}

const journeyImagePool = shuffle([...JOURNEY_PLACEHOLDER_IMAGES]);
const campaignImagePool = shuffle([...CAMPAIGN_PLACEHOLDER_IMAGES]);
const videoPool = shuffle([...VIDEO_PLACEHOLDERS]);

let journeyImageIndex = 0;
let campaignImageIndex = 0;
let videoIndex = 0;

const nextJourneyImage = () => {
  const asset = journeyImagePool[journeyImageIndex % journeyImagePool.length];
  journeyImageIndex += 1;
  return asset;
};

const nextCampaignImage = () => {
  const asset = campaignImagePool[campaignImageIndex % campaignImagePool.length];
  campaignImageIndex += 1;
  return asset;
};

const nextVideo = () => {
  const asset = videoPool[videoIndex % videoPool.length];
  videoIndex += 1;
  return asset;
};

const createJourneyGallery = (label: string, count = 3) =>
  Array.from({ length: count }, () => ({
    kind: 'image' as const,
    src: nextJourneyImage(),
    alt: `${label} moodboard`,
  }));

const createCampaignGallery = (label: string, count = 3) =>
  Array.from({ length: count }, () => ({
    kind: 'image' as const,
    src: nextCampaignImage(),
    alt: `${label} gallery`,
  }));

export interface BuildDashboardCardsOptions {
  journeys: JourneySummary[];
  campaigns: CampaignDetail[];
}

export function buildClientDashboardCards({
  journeys,
  campaigns,
}: BuildDashboardCardsOptions): DashboardGridSlot[] {
  const shuffledJourneys = shuffle(journeys);
  const shuffledCampaigns = shuffle(campaigns);

  const journeyCards: DashboardCardData[] = shuffledJourneys.map((journey, index) => {
    const size = JOURNEY_SIZE_CYCLE[index % JOURNEY_SIZE_CYCLE.length];
    const launch = formatLaunchDate(journey.launchDate);
    const meta = [
      { label: 'Location', value: journey.location },
      launch ? { label: 'Launch', value: launch } : null,
    ].filter((item): item is { label: string; value: string } => Boolean(item));

    return {
      id: `journey-${journey.id}`,
      kind: 'journey',
      title: journey.title,
      subtitle: 'brand journey',
      description: journey.excerpt,
      eyebrow: 'Journey Preview',
      size,
      accent: mapAccent(journey.accent),
      media: journey.teaserVideo
        ? {
            kind: 'video',
            src: journey.teaserVideo,
            alt: journey.title,
            poster: journey.coverImage?.url,
          }
        : journey.coverImage
          ? {
              kind: 'image',
              src: journey.coverImage.url,
              alt: journey.coverImage.alt ?? journey.title,
            }
          : undefined,
      gallery: journey.coverImage
        ? [
            {
              kind: 'image',
              src: journey.coverImage.url,
              alt: journey.coverImage.alt ?? journey.title,
            },
          ]
        : undefined,
      meta,
      hint: 'Tap to enter journey sheet',
      actions: [
        {
          label: 'Open journey sheet',
          href: `/client/journeys/${journey.slug}`,
          intent: 'navigate',
          tone: 'primary',
        },
        {
          label: 'View public dossier',
          href: `/journeys/${journey.slug}`,
          intent: 'navigate',
          tone: 'ghost',
        },
      ],
    };
  });

  const campaignCards: DashboardCardData[] = shuffledCampaigns.map((campaign, index) => {
    const size = CAMPAIGN_SIZE_CYCLE[index % CAMPAIGN_SIZE_CYCLE.length];
    const gallerySource = campaign.gallery ?? [];
    const gallery = gallerySource.slice(0, 3).map((media) => ({
      kind: media.kind,
      src: media.url,
      alt: media.alt,
      poster: media.poster,
    }));

    return {
      id: `campaign-${campaign.id}`,
      kind: 'campaign',
      title: campaign.title,
      subtitle: 'Campaign Capsule',
      description: campaign.context?.[0]?.body,
      eyebrow: 'Campaign Spotlight',
      size,
      accent: 'sand',
      media: campaign.heroVideo
        ? {
            kind: 'video',
            src: campaign.heroVideo,
            alt: campaign.title,
            poster: campaign.heroPoster,
          }
        : campaign.heroPoster
          ? {
              kind: 'image',
              src: campaign.heroPoster,
              alt: campaign.title,
            }
          : gallery[0],
      gallery,
      meta: [
        campaign.credits?.[0]
          ? { label: campaign.credits[0].role, value: campaign.credits[0].value }
          : null,
        campaign.callToAction?.label ? { label: 'CTA', value: campaign.callToAction.label } : null,
      ].filter((item): item is { label: string; value: string } => Boolean(item)),
      hint: 'Expand the brand activation',
      actions: buildCampaignActions(campaign),
      badges: campaign.impactHighlights?.slice(0, 2),
    };
  });

  const heroJourneyBase: DashboardCardData = journeyCards[0]
    ? { ...journeyCards[0], size: 'lg' }
    : {
        id: 'journey-placeholder',
        kind: 'journey',
        title: 'Coming soon',
        subtitle: 'brand journey',
        size: 'lg',
        accent: 'onyx',
        hint: 'journey reveal incoming',
        actions: [],
      };

  const journeySpotlightBase: DashboardCardData = journeyCards[1]
    ? { ...journeyCards[1], size: 'md' }
    : journeyCards[0]
      ? { ...journeyCards[0], id: `${journeyCards[0].id}-secondary`, size: 'md' }
      : heroJourneyBase;

  const campaignSpotlightBase: DashboardCardData = campaignCards[0]
    ? { ...campaignCards[0], size: 'md' }
    : {
        id: 'campaign-placeholder',
        kind: 'campaign',
        title: 'Campaign reveal',
        subtitle: 'Campaign Capsule',
        size: 'md',
        accent: 'sand',
        actions: [],
      };

  const heroVideo = nextVideo();
  const campaignVideo = nextVideo();
  const conceptVideo = nextVideo();
  const campaignVaultVideo = nextVideo();
  const heroJourney = {
    ...heroJourneyBase,
    media: {
      kind: 'video' as const,
      src: heroVideo.src,
      alt: heroJourneyBase.title,
      poster: heroVideo.poster,
    },
    gallery: heroJourneyBase.gallery?.length
      ? heroJourneyBase.gallery
      : createJourneyGallery(heroJourneyBase.title),
  };

  const journeySpotlight = {
    ...journeySpotlightBase,
    media: {
      kind: 'image' as const,
      src: nextJourneyImage(),
      alt: journeySpotlightBase.title,
    },
    gallery: journeySpotlightBase.gallery?.length
      ? journeySpotlightBase.gallery
      : createJourneyGallery(journeySpotlightBase.title, 2),
  };

  const campaignSpotlight = {
    ...campaignSpotlightBase,
    media: campaignVideo
      ? {
          kind: 'video' as const,
          src: campaignVideo.src,
          alt: campaignSpotlightBase.title,
          poster: campaignVideo.poster,
        }
      : {
          kind: 'image' as const,
          src: nextCampaignImage(),
          alt: campaignSpotlightBase.title,
        },
    gallery: campaignSpotlightBase.gallery?.length
      ? campaignSpotlightBase.gallery
      : createCampaignGallery(campaignSpotlightBase.title, 3),
  };

  const staticCards: Record<string, DashboardCardData> = {
    allJourneys: {
      id: 'card-all-journeys',
      kind: 'all-journeys',
      title: 'Journey Atlas',
      subtitle: 'All journeys',
      eyebrow: 'Navigation',
      size: 'md',
      accent: 'iris',
      hint: 'Browse every journey',
      actions: [
        {
          label: 'Enter atlas',
          href: '/journeys',
          intent: 'navigate',
          tone: 'primary',
        },
      ],
    },
    campaignVault: {
      id: 'card-all-campaigns',
      kind: 'all-campaigns',
      title: 'Campaign Vault',
      subtitle: 'brand collaborations',
      eyebrow: 'Navigation',
      size: 'md',
      accent: 'pearl',
      tone: 'light',
      hint: 'Explore campaign cases',
      actions: [
        {
          label: 'Open campaign vault',
          href: '/campaigns',
          intent: 'navigate',
          tone: 'primary',
        },
      ],
    },
    concept: {
      id: 'card-concept',
      kind: 'concept',
      title: 'brand Concept',
      subtitle: 'Origin story',
      eyebrow: 'Experience',
      size: 'md',
      accent: 'honey',
      hint: 'Immerse in the ethos',
      actions: [
        {
          label: 'Open concept',
          href: '/concept',
          intent: 'navigate',
          tone: 'primary',
        },
      ],
    },
    concierge: {
      id: 'card-concierge',
      kind: 'concierge',
      title: 'brand Concierge',
      subtitle: 'Direct access',
      eyebrow: 'Concierge',
      description: 'Reach the liaison team for bespoke planning and impact coordination.',
      size: 'md',
      accentGradient:
        'bg-[linear-gradient(140deg,rgba(20,18,24,0.92)_0%,rgba(58,46,66,0.75)_55%,rgba(18,14,22,0.9)_100%)]',
      hint: 'Response under 24h',
      actions: [
        {
          label: 'Email concierge',
          href: 'mailto:hello@beeyondtheworld.com',
          intent: 'contact',
          tone: 'primary',
        },
        {
          label: 'Schedule a call',
          href: 'https://cal.com/beeyondtheworld/concierge',
          intent: 'navigate',
          tone: 'ghost',
        },
      ],
    },
    home: {
      id: 'card-home',
      kind: 'home',
      title: 'brand Home',
      subtitle: 'Landing',
      eyebrow: 'Navigation',
      size: 'xs',
      accent: 'pearl',
      tone: 'light',
      hint: 'Return to showcase',
      actions: [
        {
          label: 'Go to home',
          href: '/',
          intent: 'navigate',
          tone: 'primary',
        },
      ],
    },
    contact: {
      id: 'card-contact',
      kind: 'contact',
      title: 'Concierge Mail',
      subtitle: 'Write us',
      eyebrow: 'Contact',
      size: 'xs',
      accent: 'orchid',
      tone: 'light',
      hint: 'hello@beeyondtheworld.com',
      actions: [
        {
          label: 'Email brand',
          href: 'mailto:hello@beeyondtheworld.com',
          intent: 'contact',
          tone: 'primary',
        },
      ],
    },
    logout: {
      id: 'card-logout',
      kind: 'logout',
      title: 'Sign Out',
      subtitle: 'Secure exit',
      eyebrow: 'Session',
      size: 'xs',
      accent: 'onyx',
      hint: 'Close the dashboard',
      actions: [
        {
          label: 'Sign out securely',
          intent: 'logout',
          tone: 'primary',
        },
      ],
    },
  };

  staticCards.allJourneys.media = {
    kind: 'image',
    src: nextJourneyImage(),
    alt: staticCards.allJourneys.title,
  };

  staticCards.campaignVault.media = campaignVaultVideo
    ? {
        kind: 'video',
        src: campaignVaultVideo.src,
        alt: staticCards.campaignVault.title,
        poster: campaignVaultVideo.poster,
      }
    : {
        kind: 'image',
        src: nextCampaignImage(),
        alt: staticCards.campaignVault.title,
      };

  staticCards.concept.media = conceptVideo
    ? {
        kind: 'video',
        src: conceptVideo.src,
        alt: staticCards.concept.title,
        poster: conceptVideo.poster,
      }
    : {
        kind: 'image',
        src: CONCEPT_PLACEHOLDER_IMAGE,
        alt: staticCards.concept.title,
      };

  staticCards.concierge.media = {
    kind: 'image',
    src: CONCIERGE_PLACEHOLDER_IMAGE,
    alt: staticCards.concierge.title,
  };

  staticCards.home.media = {
    kind: 'image',
    src: HOME_PLACEHOLDER_IMAGE,
    alt: staticCards.home.title,
  };

  staticCards.contact.media = {
    kind: 'image',
    src: CONTACT_PLACEHOLDER_IMAGE,
    alt: staticCards.contact.title,
  };

  staticCards.logout.media = {
    kind: 'image',
    src: LOGOUT_PLACEHOLDER_IMAGE,
    alt: staticCards.logout.title,
  };

  const slots: DashboardGridSlot[] = [
    {
      id: 'slot-all-journeys',
      card: staticCards.allJourneys,
      layoutClass: SLOT_LAYOUT['slot-all-journeys'],
      expandedClass: SLOT_EXPANDED['slot-all-journeys'],
      collapsedClass: SLOT_COLLAPSED['slot-all-journeys'],
    },
    {
      id: 'slot-campaign-vault',
      card: staticCards.campaignVault,
      layoutClass: SLOT_LAYOUT['slot-campaign-vault'],
      expandedClass: SLOT_EXPANDED['slot-campaign-vault'],
      collapsedClass: SLOT_COLLAPSED['slot-campaign-vault'],
    },
    {
      id: 'slot-concept',
      card: staticCards.concept,
      layoutClass: SLOT_LAYOUT['slot-concept'],
      expandedClass: SLOT_EXPANDED['slot-concept'],
      collapsedClass: SLOT_COLLAPSED['slot-concept'],
    },
    {
      id: 'slot-home',
      card: staticCards.home,
      layoutClass: SLOT_LAYOUT['slot-home'],
      expandedClass: SLOT_EXPANDED['slot-home'],
      collapsedClass: SLOT_COLLAPSED['slot-home'],
    },
    {
      id: 'slot-journey-hero',
      card: heroJourney,
      layoutClass: SLOT_LAYOUT['slot-journey-hero'],
      expandedClass: SLOT_EXPANDED['slot-journey-hero'],
      collapsedClass: SLOT_COLLAPSED['slot-journey-hero'],
    },
    {
      id: 'slot-campaign-spotlight',
      card: campaignSpotlight,
      layoutClass: SLOT_LAYOUT['slot-campaign-spotlight'],
      expandedClass: SLOT_EXPANDED['slot-campaign-spotlight'],
      collapsedClass: SLOT_COLLAPSED['slot-campaign-spotlight'],
    },
    {
      id: 'slot-concierge',
      card: staticCards.concierge,
      layoutClass: SLOT_LAYOUT['slot-concierge'],
      expandedClass: SLOT_EXPANDED['slot-concierge'],
      collapsedClass: SLOT_COLLAPSED['slot-concierge'],
    },
    {
      id: 'slot-journey-spotlight',
      card: journeySpotlight,
      layoutClass: SLOT_LAYOUT['slot-journey-spotlight'],
      expandedClass: SLOT_EXPANDED['slot-journey-spotlight'],
      collapsedClass: SLOT_COLLAPSED['slot-journey-spotlight'],
    },
    {
      id: 'slot-contact',
      card: staticCards.contact,
      layoutClass: SLOT_LAYOUT['slot-contact'],
      expandedClass: SLOT_EXPANDED['slot-contact'],
      collapsedClass: SLOT_COLLAPSED['slot-contact'],
    },
    {
      id: 'slot-logout',
      card: staticCards.logout,
      layoutClass: SLOT_LAYOUT['slot-logout'],
      expandedClass: SLOT_EXPANDED['slot-logout'],
      collapsedClass: SLOT_COLLAPSED['slot-logout'],
    },
  ];

  return slots;
}
