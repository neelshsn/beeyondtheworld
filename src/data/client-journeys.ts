import type { ClientJourney } from '@/types/client';

export const clientJourneys: ClientJourney[] = [
  {
    id: 'journey-italy-tuscany-venice',
    slug: 'italy-tuscany-venice',
    title: 'ITALY - TOSCANE & VENICE',
    country: 'Italy',
    regionTags: ['Tuscany', 'Venice', 'Montepulciano'],
    season: 'Spring Summer',
    budgetRange: '180k - 240k EUR',
    startDate: '2025-05-08',
    endDate: '2025-05-16',
    summary:
      "A cinematic escape across Tuscany's rolling vineyards and Venice's moonlit canals, choreographing couture moments, artisan encounters, and signature hospitality for maison VIPs.",
    heroVideo: 'https://cdn.coverr.co/videos/coverr-venetian-evening-1080p.mp4',
    heroPoster:
      'https://images.unsplash.com/photo-1526154480052-28d5f4c60b97?auto=format&fit=crop&w=1600&q=80',
    moodboard: [
      'https://images.unsplash.com/photo-1514894780887-121968d00567?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1526129318478-bbf3c95ea094?auto=format&fit=crop&w=1200&q=80',
    ],
    creativeDirector: 'DA - Aurelie Nocturne',
    logisticsLead: 'Logistics - Matteo Santorini',
    deliverables: [
      '3 hero films + 6 reels',
      '24 editorial stills',
      'Client hospitality playbook',
      'CSR impact brief',
    ],
    attachments: [
      {
        label: 'Staging blueprint',
        fileName: 'Italy - toscane & venise.pdf',
      },
    ],
    sections: [
      {
        id: 'montepulciano',
        title: 'MONTEPULCIANO SUNRISE',
        description:
          'Private takeover of a 12th-century borgo for sunrise storytelling. Fluid silks echo vineyard rows while analog projections bathe facades in peach light.',
        highlights: [
          'Drone ballet at golden hour',
          'Florist residency with wild rose botanicals',
          'Intimate tasting with regenerative wine collective',
        ],
        media: [
          {
            id: 'montepulciano-image-1',
            type: 'image',
            url: 'https://images.unsplash.com/photo-1470123383396-71b45dc3b44c?auto=format&fit=crop&w=1400&q=80',
            alt: 'Sunrise over Tuscan vineyards with couture model',
          },
          {
            id: 'montepulciano-video-1',
            type: 'video',
            url: 'https://cdn.coverr.co/videos/coverr-sunrise-over-the-tuscan-vineyard-1080p.mp4',
            alt: 'Sun-drenched vineyards',
          },
        ],
      },
      {
        id: 'dolce-vita',
        title: 'DOLCE VITA TABLEAUX',
        description:
          'A curated procession through hidden courtyards in Florence, choreographing live still lifes with artisans, bespoke gelato experiences, and luminous styling cues.',
        highlights: [
          'Cinematic still-life vignettes',
          'Slow food atelier pairing',
          'Guest styling bar with couture milliner',
        ],
        media: [
          {
            id: 'dolce-vita-image-1',
            type: 'image',
            url: 'https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?auto=format&fit=crop&w=1400&q=80',
            alt: 'Florence courtyard dinner',
          },
        ],
      },
      {
        id: 'dear-venice',
        title: "DEAR VENICE'S ROMANCE",
        description:
          'Moonlit gondola choreography and mirrors over canal waters. Bespoke soundscapes and suspended floral spheres for couture unveilings under San Giorgio Maggiore.',
        highlights: [
          'Private lagoon pyrotechnics',
          'Immersive binaural concert',
          'Glass artisans live craft showcase',
        ],
        media: [
          {
            id: 'venice-image-1',
            type: 'image',
            url: 'https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?auto=format&fit=crop&w=1400&q=80',
            alt: 'Evening gondolas in Venice',
          },
          {
            id: 'venice-video-1',
            type: 'video',
            url: 'https://cdn.coverr.co/videos/coverr-venice-gondolas-1080p.mp4',
            alt: 'Gondolas moving in Venice',
          },
        ],
      },
      {
        id: 'golden-hours',
        title: 'GOLDEN HOURS',
        description:
          'A twilight finale at a lagoon-side palazzo featuring immersive holo projections and culinary storytelling bridging land and sea.',
        highlights: [
          'Golden-hour drone capture with narrators',
          'Sustainable banquet with Michelin duo',
          'NFT concierge gifting experience',
        ],
        media: [
          {
            id: 'golden-hours-image-1',
            type: 'image',
            url: 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=1400&q=80',
            alt: 'Lagoon-side event at sunset',
          },
        ],
      },
    ],
  },
];
