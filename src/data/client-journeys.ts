import type { ClientJourney } from '@/types/client';

export const clientJourneys: ClientJourney[] = [
  {
    id: 'journey-philippines-deep-blue',
    slug: 'philippines-deep-blue',
    title: 'Philippines Deep Blue Journey',
    country: 'Philippines',
    regionTags: ['Palawan', 'Siargao', 'Coron'],
    season: 'Fall Winter',
    budgetRange: '320k - 380k EUR',
    startDate: '2025-10-05',
    endDate: '2025-11-02',
    summary:
      'Floating ateliers drift between hidden lagoons and jungle canopy cinemas to script sun-drenched storytelling with regenerative impact for reef communities.',
    heroVideo: 'https://cdn.coverr.co/videos/coverr-floating-on-the-blue-ocean-1080p.mp4',
    heroPoster: '/assets/journeys/philippines/philippines-gallery-01.png',
    moodboard: [
      '/assets/journeys/philippines/philippines-gallery-03.png',
      '/assets/journeys/philippines/philippines-gallery-07.png',
      '/assets/journeys/philippines/philippines-gallery-12.png',
    ],
    creativeDirector: 'DA - Isla Navarro',
    logisticsLead: 'Logistics - Mateo Dela Cruz',
    deliverables: [
      'Hero film cut + 3 teaser reels',
      'Underwater capsule stills',
      'Hospitality activation blueprint',
      'Impact report with reef partners',
    ],
    attachments: [],
    sections: [
      {
        id: 'catamaran-lab',
        title: 'CATAMARAN COLOR LAB',
        description:
          'Daybreak palette workshops aboard the catamaran with textile artisans translating reef hues into brand swatches.',
        highlights: [
          'Floating atelier with regenerative textiles',
          'Analog projection tests on sails',
          'Carbon-tracked lagoon surveys for storyboard alignment',
        ],
        media: [
          {
            id: 'catamaran-image-1',
            type: 'image',
            url: '/assets/journeys/philippines/philippines-gallery-04.png',
            alt: 'Wooden sailboat cruising emerald waters at golden hour',
          },
        ],
      },
      {
        id: 'jungle-cinema',
        title: 'JUNGLE CINEMA SESSION',
        description:
          'Immersive night cinema with reef-safe lighting to capture storytelling rituals alongside island collectives.',
        highlights: [
          'Bioluminescent-inspired lighting rig',
          'Live scoring with island musicians',
          'Underwater camera rehearsals',
        ],
        media: [
          {
            id: 'jungle-image-1',
            type: 'image',
            url: '/assets/journeys/philippines/philippines-gallery-07.png',
            alt: 'Jungle canopy amphitheatre overlooking the sea',
          },
        ],
      },
      {
        id: 'floating-banquet',
        title: 'FLOATING BANQUET',
        description:
          'Lagoon-side finale featuring regenerative gastronomy, sonic storytelling, and immersive styling reveals.',
        highlights: [
          'Floating tables with reef-friendly decor',
          'Live documentation suites on catamaran decks',
          'Impact pledges recorded with local partners',
        ],
        media: [
          {
            id: 'banquet-image-1',
            type: 'image',
            url: '/assets/journeys/philippines/philippines-gallery-10.png',
            alt: 'Chef plating Filipino tasting menu on floating deck',
          },
        ],
      },
    ],
  },
  {
    id: 'journey-mallorca-serra-studio',
    slug: 'mallorca-serra-studio',
    title: 'Mallorca Serra Studio',
    country: 'Spain',
    regionTags: ['Deia', 'Tramuntana', 'Es Vedra'],
    season: 'Spring Summer',
    budgetRange: '260k - 310k EUR',
    startDate: '2025-05-12',
    endDate: '2025-06-04',
    summary:
      'Slow-living dreamlike journey across Tramuntana fincas, cliffside sound baths, and sunset sail capsules for Mediterranean drops.',
    heroVideo: 'https://cdn.coverr.co/videos/coverr-sea-and-mountains-1080p.mp4',
    heroPoster: '/assets/journeys/mallorca/mallorca-gallery-06.png',
    moodboard: [
      '/assets/journeys/mallorca/mallorca-gallery-02.png',
      '/assets/journeys/mallorca/mallorca-gallery-09.png',
      '/assets/journeys/mallorca/mallorca-gallery-18.png',
    ],
    creativeDirector: 'DA - Louna Serrat',
    logisticsLead: 'Logistics - Pau Mirallet',
    deliverables: [
      'Hero film + 4 scenic loops',
      'Editorial still kit for press drop',
      'Hospitality playbook for brand guests',
      'Sound bath audio stems',
    ],
    attachments: [
      {
        label: 'Journey overview',
        fileName: 'mallorca-journey-overview.pdf',
      },
    ],
    sections: [
      {
        id: 'olive-terraces',
        title: 'OLIVE TERRACE RUNWAY',
        description:
          'Sunrise film run weaving through olive terraces with analog super 8 coverage and bespoke styling pods.',
        highlights: [
          'Finca takeover for wardrobe & glam',
          'Sunrise kinetic capture',
          'Local ceramist collaboration corner',
        ],
        media: [
          {
            id: 'terrace-image-1',
            type: 'image',
            url: '/assets/journeys/mallorca/mallorca-gallery-04.png',
            alt: 'Stone village street in Deia under warm light',
          },
        ],
      },
      {
        id: 'es-vedra-sail',
        title: 'ES VEDRA SAIL WINDOW',
        description:
          'Afternoon sail around Es Vedra for 16mm coverage, sound baths, and floating atelier pop-up.',
        highlights: [
          'Vintage sailboat with modular production pod',
          'Live Balearic scoring onboard',
          'Sunset styling reveal on deck',
        ],
        media: [
          {
            id: 'vedra-image-1',
            type: 'image',
            url: '/assets/journeys/mallorca/mallorca-gallery-06.png',
            alt: 'Es Vedra island shot from sailboat deck',
          },
        ],
      },
      {
        id: 'cliff-sound-bath',
        title: 'CLIFF SOUND BATH',
        description:
          'Twilight sound bath and tasting pairing on Tramuntana cliffs with projection-mapped scenography.',
        highlights: [
          'Sound bath produced with Balearic composers',
          'Lighting design with sustainable rig',
          'In-situ atelier for artisan collaborations',
        ],
        media: [
          {
            id: 'cliff-image-1',
            type: 'image',
            url: '/assets/journeys/mallorca/mallorca-gallery-13.png',
            alt: 'Mountain road descending into narrow gorge',
          },
        ],
      },
    ],
  },
  {
    id: 'journey-cyclades-light-tale',
    slug: 'cyclades-light-tale',
    title: 'Cyclades Light Tale',
    country: 'Greece',
    regionTags: ['Santorini', 'Mykonos', 'Milos'],
    season: 'Fall Winter',
    budgetRange: '290k - 340k EUR',
    startDate: '2025-09-04',
    endDate: '2025-09-21',
    summary:
      'An odyssey of sunrise caldera reveals, Klimata dinners, and dual-format filming delivering both campaign-grade assets and brand lore.',
    heroVideo: 'https://cdn.coverr.co/videos/coverr-santorini-with-a-boat-1080p.mp4',
    heroPoster: '/assets/journeys/greece/greece-gallery-08.png',
    moodboard: [
      '/assets/journeys/greece/greece-gallery-01.png',
      '/assets/journeys/greece/greece-gallery-11.png',
      '/assets/journeys/greece/greece-gallery-19.png',
    ],
    creativeDirector: 'DA - Thalia Vrettos',
    logisticsLead: 'Logistics - Niko Spartalis',
    deliverables: [
      'Hero film + 5 modular edits',
      'Still suite for e-commerce refresh',
      'Hospitality & tasting playbook',
      'Impact capsule on local partnerships',
    ],
    attachments: [],
    sections: [
      {
        id: 'oia-sunrise',
        title: 'OIA SUNRISE OPENER',
        description:
          'Sunrise reveal above the caldera with dual camera teams capturing couture fittings and slow portraiture.',
        highlights: [
          'Dual format capture (digital + 16mm)',
          'Bougainvillea styling takeovers',
          'Guest hospitality capsule at dawn',
        ],
        media: [
          {
            id: 'oia-image-1',
            type: 'image',
            url: '/assets/journeys/greece/greece-gallery-01.png',
            alt: 'View over Santorini caldera at first light',
          },
        ],
      },
      {
        id: 'klima-dinner',
        title: 'KLIMA DINNER CHOREO',
        description:
          'Lantern-lit dinners in Milos boathouses with live gastronomy and artisan showcases.',
        highlights: [
          'Custom lantern lighting rig',
          'Culinary collaboration with local chefs',
          'Live craft storytelling capsules',
        ],
        media: [
          {
            id: 'klima-image-1',
            type: 'image',
            url: '/assets/journeys/greece/greece-gallery-08.png',
            alt: 'Santorini restaurant terrace at sunset',
          },
        ],
      },
      {
        id: 'caique-transfer',
        title: 'CAIQUE TRANSFER ARC',
        description:
          'Slow travel legs aboard a restored caique converted into a mobile production hub.',
        highlights: [
          'Onboard wardrobe & glam pods',
          'Live grading bay for daily selects',
          'Acoustic score sessions at sea',
        ],
        media: [
          {
            id: 'caique-image-1',
            type: 'image',
            url: '/assets/journeys/greece/greece-gallery-15.png',
            alt: 'Sea horizon with traditional wooden boat',
          },
        ],
      },
    ],
  },
];
