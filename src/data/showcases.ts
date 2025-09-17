export type ShowcaseMedia = {
  id: string;
  type: 'image' | 'video';
  src: string;
  alt: string;
  aspectRatio?: 'portrait' | 'landscape' | 'square';
  poster?: string;
  caption?: string;
};

export type JourneyShowcase = {
  id: string;
  slug: string;
  title: string;
  headline: string;
  locale: string;
  timeframe: string;
  summary: string;
  story: string[];
  highlights: string[];
  logistics: string[];
  hero: ShowcaseMedia & { overlayLabel?: string };
  gallery: ShowcaseMedia[];
  cta?: { label: string; href: string };
};

export type CampaignShowcase = {
  id: string;
  slug: string;
  title: string;
  destination: string;
  headline: string;
  summary: string;
  story: string[];
  highlights: string[];
  credits: { role: string; value: string }[];
  hero: ShowcaseMedia & { poster?: string; loopLabel?: string };
  gallery: ShowcaseMedia[];
  impact: string[];
  cta?: { label: string; href: string };
};

export const journeyShowcases: JourneyShowcase[] = [
  {
    id: 'philippines',
    slug: 'philippines',
    title: 'Philippines Deep Blue Residency',
    headline: 'A floating creative camp linking Palawan and Siargao.',
    locale: 'Palawan & Siargao',
    timeframe: 'October - November 2025',
    summary:
      'A travelling atelier staged across turquoise lagoons, floating eco-lodges and indigenous workshops. The residency is built for maisons seeking sun-drenched storytelling with measurable reef impact.',
    story: [
      'The residency embarks from a private catamaran base camp, drifting between crystal lagoons and remote sandbars. Morning scouting in seaplanes unlocks hidden coves while the crew prepares submerged lighting rigs for underwater cinema.',
      'Afternoons blend textile collaborations with island makers and slow culinary rituals at sea. Evenings close with floating dinner scenography and live soundscapes recorded with guardians of the reef.',
    ],
    highlights: [
      'Seaplane scouting with banca tenders to hidden coves',
      'Underwater cinema lab with reef-safe illumination',
      'Floating dinner scenography with live island makers',
    ],
    logistics: [
      'Catamaran base camp with 12 berths and modular styling space',
      'Impact-certified reef teams handling citizen-science activations',
      'On-board post suite for daily selects and mood drafts',
    ],
    hero: {
      id: 'philippines-hero',
      type: 'image',
      src: '/assets/journeys/philippines/philippines-gallery-01.png',
      alt: 'Turquoise lagoon surrounded by limestone cliffs in Palawan',
      aspectRatio: 'landscape',
      caption: 'Secret lagoon recce, Palawan',
      overlayLabel: 'Residency 01',
    },
    gallery: [
      {
        id: 'philippines-gallery-01',
        type: 'image',
        src: '/assets/journeys/philippines/philippines-gallery-01.png',
        alt: 'Turquoise lagoon surrounded by limestone cliffs in Palawan',
        aspectRatio: 'landscape',
        caption: 'Secret lagoon recce, Palawan',
      },
      {
        id: 'philippines-gallery-03',
        type: 'image',
        src: '/assets/journeys/philippines/philippines-gallery-03.png',
        alt: 'Overwater villa shaded by tropical canopy',
        aspectRatio: 'landscape',
        caption: 'Floating atelier suite',
      },
      {
        id: 'philippines-gallery-04',
        type: 'image',
        src: '/assets/journeys/philippines/philippines-gallery-04.png',
        alt: 'Wooden sailboat cruising emerald waters at golden hour',
        aspectRatio: 'landscape',
        caption: 'Sunset banca transfer',
      },
      {
        id: 'philippines-gallery-07',
        type: 'image',
        src: '/assets/journeys/philippines/philippines-gallery-07.png',
        alt: 'Jungle canopy amphitheatre overlooking the sea',
        aspectRatio: 'landscape',
        caption: 'Jungle cinema installation',
      },
      {
        id: 'philippines-gallery-10',
        type: 'image',
        src: '/assets/journeys/philippines/philippines-gallery-10.png',
        alt: 'Chef plating Filipino tasting menu on floating deck',
        aspectRatio: 'landscape',
        caption: 'Floating table experience',
      },
      {
        id: 'philippines-gallery-12',
        type: 'image',
        src: '/assets/journeys/philippines/philippines-gallery-12.png',
        alt: 'Diver filming coral reef with cinematic rig',
        aspectRatio: 'landscape',
        caption: 'Underwater story capture',
      },
    ],
    cta: {
      label: 'Download journey sheet',
      href: '/assets/pdfs/Italy - toscane & venise.pdf',
    },
  },
  {
    id: 'mallorca',
    slug: 'mallorca',
    title: 'Mallorca Serra Studio',
    headline: 'A hilltop creative residence breathing with Tramuntana light.',
    locale: 'Deia, Cala Figuera & Es Vedra',
    timeframe: 'May - June 2025',
    summary:
      'Modernist fincas, restored sailboats and cliffside sound baths compose a slow-living residency built for Mediterranean capsule drops.',
    story: [
      'Each day starts with sunrise film runs through the olive terraces before the atelier opens inside a private finca. Craft sessions pair local ceramists with maison artisans to co-design tactile totems.',
      'Afternoons sail around Es Vedra for 16mm coverage, while evenings settle into afterglow tastings guided by Michelin collaborators and live Balearic soundscapes.',
    ],
    highlights: [
      'Sunrise film runs through the olive terraces',
      'Editorial sail around Es Vedra with 16mm coverage',
      'Afterglow tasting pairing by Michelin guest chef',
    ],
    logistics: [
      'Three fincas with accommodation for 18 guests and crew',
      'Vintage Riva tender plus 38ft sailboat for mobile scenes',
      'On-site edit pod for daily still and motion selects',
    ],
    hero: {
      id: 'mallorca-hero',
      type: 'image',
      src: '/assets/journeys/mallorca/mallorca-gallery-06.png',
      alt: 'Es Vedra island shot from sailboat deck',
      aspectRatio: 'landscape',
      caption: 'Es Vedra sail recce',
      overlayLabel: 'Residency 02',
    },
    gallery: [
      {
        id: 'mallorca-gallery-02',
        type: 'image',
        src: '/assets/journeys/mallorca/mallorca-gallery-02.png',
        alt: 'Hidden cala with turquoise water and white sand',
        aspectRatio: 'landscape',
        caption: 'Macarelleta scouting',
      },
      {
        id: 'mallorca-gallery-04',
        type: 'image',
        src: '/assets/journeys/mallorca/mallorca-gallery-04.png',
        alt: 'Stone village street in Deia under warm light',
        aspectRatio: 'landscape',
        caption: 'Deia golden grid',
      },
      {
        id: 'mallorca-gallery-06',
        type: 'image',
        src: '/assets/journeys/mallorca/mallorca-gallery-06.png',
        alt: 'Es Vedra island shot from sailboat deck',
        aspectRatio: 'landscape',
        caption: 'Es Vedra sail recce',
      },
      {
        id: 'mallorca-gallery-09',
        type: 'image',
        src: '/assets/journeys/mallorca/mallorca-gallery-09.png',
        alt: 'Lush Mallorcan villa courtyard with pool',
        aspectRatio: 'landscape',
        caption: 'Creative residence courtyard',
      },
      {
        id: 'mallorca-gallery-13',
        type: 'image',
        src: '/assets/journeys/mallorca/mallorca-gallery-13.png',
        alt: 'Mountain road descending into narrow gorge',
        aspectRatio: 'landscape',
        caption: 'Sa Calobra descent',
      },
      {
        id: 'mallorca-gallery-18',
        type: 'image',
        src: '/assets/journeys/mallorca/mallorca-gallery-18.png',
        alt: 'Stylist moodboard on table with ceramics',
        aspectRatio: 'landscape',
        caption: 'Material board session',
      },
    ],
    cta: {
      label: 'Request availability',
      href: 'mailto:hello@beeyondtheworld.com?subject=Mallorca%20Serra%20Studio',
    },
  },
  {
    id: 'greece',
    slug: 'greece',
    title: 'Cyclades Light Tale',
    headline: 'An odyssey across Santorini terraces and Milos fishing villages.',
    locale: 'Santorini, Mykonos & Milos',
    timeframe: 'September 2025',
    summary:
      'Sunrise openings in Oia, intimate dinners in Klima boathouses and dual-format filming deliver campaign assets and internal lore in one journey.',
    story: [
      'We choreograph dawn reveals above the caldera before moving to private terraces transformed for fittings. Midday sessions focus on craft demonstrations in Milos boat houses while evenings shift to lantern-lit dinners.',
      'A restored caique carries the crew between islands, doubling as a mobile production hub with live post and wardrobe support.',
    ],
    highlights: [
      'Sunrise reveal above the caldera',
      'Night portraits lit with bespoke lantern rig',
      'Slow travel legs aboard restored caique',
    ],
    logistics: [
      'Three island bases with 20 suites and backstage lounges',
      'Heritage caique outfitted with power, wardrobe and light rig',
      'Local gastronomy partners for bespoke tasting journeys',
    ],
    hero: {
      id: 'greece-hero',
      type: 'image',
      src: '/assets/journeys/greece/greece-gallery-08.png',
      alt: 'Santorini restaurant terrace at sunset',
      aspectRatio: 'landscape',
      caption: 'Tableau tasting setup',
      overlayLabel: 'Residency 03',
    },
    gallery: [
      {
        id: 'greece-gallery-01',
        type: 'image',
        src: '/assets/journeys/greece/greece-gallery-01.png',
        alt: 'View over Santorini caldera at first light',
        aspectRatio: 'landscape',
        caption: 'Caldera lookout scout',
      },
      {
        id: 'greece-gallery-05',
        type: 'image',
        src: '/assets/journeys/greece/greece-gallery-05.png',
        alt: 'Whitewashed stairs with bougainvillea in Mykonos',
        aspectRatio: 'landscape',
        caption: 'Mykonos chroma study',
      },
      {
        id: 'greece-gallery-08',
        type: 'image',
        src: '/assets/journeys/greece/greece-gallery-08.png',
        alt: 'Santorini restaurant terrace at sunset',
        aspectRatio: 'landscape',
        caption: 'Tableau tasting setup',
      },
      {
        id: 'greece-gallery-11',
        type: 'image',
        src: '/assets/journeys/greece/greece-gallery-11.png',
        alt: 'Editorial portrait of muse in Cycladic architecture',
        aspectRatio: 'landscape',
        caption: 'Muse frame reference',
      },
      {
        id: 'greece-gallery-15',
        type: 'image',
        src: '/assets/journeys/greece/greece-gallery-15.png',
        alt: 'Sea horizon with traditional wooden boat',
        aspectRatio: 'landscape',
        caption: 'Caique transfer route',
      },
      {
        id: 'greece-gallery-19',
        type: 'image',
        src: '/assets/journeys/greece/greece-gallery-19.png',
        alt: 'Minimalist Cycladic interior with sculptural light',
        aspectRatio: 'landscape',
        caption: 'Suite takeover staging',
      },
    ],
    cta: {
      label: 'Plan a Cyclades preview',
      href: 'mailto:hello@beeyondtheworld.com?subject=Cyclades%20Light%20Tale',
    },
  },
];

export const campaignShowcases: CampaignShowcase[] = [
  {
    id: 'maradji-ibiza',
    slug: 'maradji-ibiza',
    title: 'Maradji - Sunset Routines in Ibiza',
    destination: 'Ibiza, Balearic Islands',
    headline: 'Bohemian leather and silk captured in golden hour rituals across hidden calas.',
    summary:
      'Shot across four coves and a rooftop riad, the campaign fuses slow cinema with kinetic handheld sequences backed by a tactile live soundtrack.',
    story: [
      'We built a roaming production hub that shifted between coves, ensuring wardrobe, glam and post were always within reach. Each sequence captured the intimacy of sunset routines through hybrid drone and Super 8 coverage.',
      'The finale unfolded on a rooftop riad where audio-reactive lights pulsed with a custom soundscape, delivering a visceral close to the film.',
    ],
    highlights: [
      'Hybrid drone plus Super 8 coverage',
      'Sunset styling across four calas',
      'Audio reactive light design for the finale',
    ],
    credits: [
      { role: 'Maison', value: 'Maradji' },
      { role: 'Director', value: 'Beeyondtheworld Studio' },
      { role: 'DOP', value: 'Luna Ferrer' },
      { role: 'Sound design', value: 'Isla Resonance' },
    ],
    hero: {
      id: 'maradji-hero-video',
      type: 'video',
      src: '/assets/campaigns/maradji-ibiza/maradji-ibiza-story-02.mp4',
      alt: 'Motion clip of Maradji muses walking along Ibiza cliff',
      poster: '/assets/campaigns/maradji-ibiza/maradji-ibiza-cover.jpg',
      caption: 'Hero reel, 45 s loop',
      loopLabel: 'Campaign 01',
    },
    gallery: [
      {
        id: 'maradji-gallery-01',
        type: 'image',
        src: '/assets/campaigns/maradji-ibiza/maradji-ibiza-gallery-02.jpg',
        alt: 'Maradji model posing in terracotta dress on rooftop',
        aspectRatio: 'landscape',
        caption: 'Rooftop sunset look',
      },
      {
        id: 'maradji-gallery-02',
        type: 'image',
        src: '/assets/campaigns/maradji-ibiza/maradji-ibiza-carousel-02.jpg',
        alt: 'Close-up of Maradji leather bag against sea backdrop',
        aspectRatio: 'portrait',
        caption: 'Craft focus detail',
      },
      {
        id: 'maradji-gallery-03',
        type: 'image',
        src: '/assets/campaigns/maradji-ibiza/maradji-ibiza-gallery-03.jpg',
        alt: 'Two muses dancing on the beach with flowing scarves',
        aspectRatio: 'landscape',
        caption: 'Evening ritual choreo',
      },
      {
        id: 'maradji-gallery-04',
        type: 'video',
        src: '/assets/campaigns/maradji-ibiza/maradji-ibiza-story-01.mp4',
        alt: 'Handheld motion of Maradji muses running through cove',
        poster: '/assets/campaigns/maradji-ibiza/maradji-ibiza-gallery-01.jpg',
        caption: 'Analog overlay sequence',
      },
    ],
    impact: [
      'Local creative crew of 18 talents',
      'Soundtrack collaboration with Ibiza-based composer',
      'Campaign delivered in 4 content suites (launch, social, BTS, retail)',
    ],
    cta: {
      label: 'Watch full film',
      href: '/assets/campaigns/maradji-ibiza/maradji-ibiza-story-02.mp4',
    },
  },
  {
    id: 'almaaz-kenya',
    slug: 'almaaz-kenya',
    title: 'Almaaz - Savannah Bloom in Kenya',
    destination: 'Laikipia & Masai Mara',
    headline: 'High jewellery staged between red earth plains and night-blooming acacia.',
    summary:
      'A travelling studio mixing editorial film, documentary portraits and sonic textures recorded with local collectives.',
    story: [
      'Days opened with helicopter scouting across the conservancy followed by tactile still-life tables shot on terracotta fabric. Dusk portraits leveraged mirrored light rigs to capture jewellery glow against the savannah.',
      'Night sessions gathered storytellers around fireside circles to record soundscapes that anchor the immersive edit.',
    ],
    highlights: [
      'Dusk portraits with mirrored light rigs',
      'Helicopter scouting across the conservancy',
      'Night fireside sound recordings',
    ],
    credits: [
      { role: 'Maison', value: 'Almaaz' },
      { role: 'Director', value: 'Beeyondtheworld Studio' },
      { role: 'Photography', value: 'Sacha Mpesa' },
      { role: 'Sound design', value: 'Savannah Resonance' },
    ],
    hero: {
      id: 'almaaz-hero-video',
      type: 'video',
      src: '/assets/campaigns/almaaz-kenya/almaaz-kenya-story.mp4',
      alt: 'Model wearing Almaaz jewellery in savannah dusk light',
      poster: '/assets/campaigns/almaaz-kenya/almaaz-kenya-cover.jpg',
      caption: 'Immersive reel, 60 s loop',
      loopLabel: 'Campaign 02',
    },
    gallery: [
      {
        id: 'almaaz-gallery-01',
        type: 'image',
        src: '/assets/campaigns/almaaz-kenya/almaaz-kenya-carousel-02.jpg',
        alt: 'Model in Almaaz jewellery framed by acacia branches',
        aspectRatio: 'portrait',
        caption: 'Golden hour portrait',
      },
      {
        id: 'almaaz-gallery-02',
        type: 'image',
        src: '/assets/campaigns/almaaz-kenya/almaaz-kenya-gallery-03.jpg',
        alt: 'Almaaz collection styled on terracotta fabric in the savannah',
        aspectRatio: 'landscape',
        caption: 'Material altar setup',
      },
      {
        id: 'almaaz-gallery-03',
        type: 'image',
        src: '/assets/campaigns/almaaz-kenya/almaaz-kenya-gallery-05.jpg',
        alt: 'Storyteller rehearsing ritual with jewellery under night sky',
        aspectRatio: 'landscape',
        caption: 'Night ritual rehearsal',
      },
      {
        id: 'almaaz-gallery-04',
        type: 'image',
        src: '/assets/campaigns/almaaz-kenya/almaaz-kenya-gallery-07.jpg',
        alt: 'Landscape vista with giraffes near art installation',
        aspectRatio: 'landscape',
        caption: 'Savannah installation',
      },
      {
        id: 'almaaz-gallery-05',
        type: 'image',
        src: '/assets/campaigns/almaaz-kenya/almaaz-kenya-carousel-05.jpg',
        alt: 'Close-up of Almaaz bracelet with beaded textiles',
        aspectRatio: 'portrait',
        caption: 'Tactile macro detail',
      },
    ],
    impact: [
      '2 community cooperatives financed through campaign revenue share',
      'Carbon-positive logistics across 7 shooting days',
      'Deliverables packaged for retail, PR, and brand film',
    ],
    cta: {
      label: 'Request case study',
      href: 'mailto:hello@beeyondtheworld.com?subject=Almaaz%20Kenya%20Case%20Study',
    },
  },
  {
    id: 'craie-maroc',
    slug: 'craie-maroc',
    title: 'Craie Studio - Atlas Mirage',
    destination: 'Agafay Desert & Marrakech',
    headline: 'Slow-crafted leather staged in mineral dunes and lantern-lit riads.',
    summary:
      'A five-day arc that moves from dawn dunes to night medina roofscapes, alternating Steadicam tracking with handheld poetry.',
    story: [
      'We mapped dawn call times in the Agafay desert to capture long-lens mirage sequences with anamorphic glass. Midday, the action moved to a nomad tent for tactile still-life work and interviews.',
      'Nights culminated on ochre medina rooftops where sound baths and lantern design shaped the atmospheric finale.',
    ],
    highlights: [
      'Mirage shoot with anamorphic lenses',
      'Sound bath in a desert nomad tent',
      'Nightfall lookbook in ochre medina',
    ],
    credits: [
      { role: 'Maison', value: 'Craie Studio' },
      { role: 'Director', value: 'Beeyondtheworld Studio' },
      { role: 'Photography', value: 'Naila Benali' },
      { role: 'Sound design', value: 'Atlas Echo' },
    ],
    hero: {
      id: 'craie-hero-video',
      type: 'video',
      src: '/assets/campaigns/craie-maroc/craie-maroc-story-02.mp4',
      alt: 'Craie Studio muse walking through desert camp',
      poster: '/assets/campaigns/craie-maroc/craie-maroc-gallery-01.jpg',
      caption: 'Reel edit, 55 s loop',
      loopLabel: 'Campaign 03',
    },
    gallery: [
      {
        id: 'craie-gallery-01',
        type: 'video',
        src: '/assets/campaigns/craie-maroc/craie-maroc-story-03.mp4',
        alt: 'Craie Studio muse walking through desert camp',
        poster: '/assets/campaigns/craie-maroc/craie-maroc-gallery-02.jpg',
        caption: 'Dune walk sequence',
      },
      {
        id: 'craie-gallery-02',
        type: 'image',
        src: '/assets/campaigns/craie-maroc/craie-maroc-carousel-01.jpg',
        alt: 'Leather goods styled on dune crest',
        aspectRatio: 'landscape',
        caption: 'Atlas sunrise still life',
      },
      {
        id: 'craie-gallery-03',
        type: 'image',
        src: '/assets/campaigns/craie-maroc/craie-maroc-gallery-04.jpg',
        alt: 'Model reclining in desert tent with lanterns',
        aspectRatio: 'portrait',
        caption: 'Nomad tent portrait',
      },
      {
        id: 'craie-gallery-04',
        type: 'image',
        src: '/assets/campaigns/craie-maroc/craie-maroc-gallery-05.jpg',
        alt: 'Night scene of medina rooftop dinner',
        aspectRatio: 'landscape',
        caption: 'Medina rooftop finale',
      },
      {
        id: 'craie-gallery-05',
        type: 'image',
        src: '/assets/campaigns/craie-maroc/craie-maroc-carousel-05.jpg',
        alt: 'Close-up of Craie bag with perforated leather pattern',
        aspectRatio: 'portrait',
        caption: 'Material close-up',
      },
    ],
    impact: [
      'Circular production plan with desert community partners',
      'Hybrid film delivery (hero, BTS, sound bath audio drops)',
      'Crew of 26 across Marrakech and Agafay',
    ],
    cta: {
      label: 'Discuss Atlas Mirage',
      href: 'mailto:hello@beeyondtheworld.com?subject=Craie%20Studio%20Atlas%20Mirage',
    },
  },
];
