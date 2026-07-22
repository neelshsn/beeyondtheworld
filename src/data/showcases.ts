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

const allJourneyShowcases: JourneyShowcase[] = [
  {
    id: 'balearic',
    slug: 'balearic',
    title: 'Balearic',
    headline:
      'An island journey of stone, sea, and Mediterranean stillness unfolding across Mallorca, Ibiza, and Menorca.',
    locale: 'Mallorca, Ibiza & Menorca',
    timeframe: 'From 1st May to 30th September',
    summary:
      'A Balearic journey shaped by golden stone, hidden coves, white cliffs, and quiet turquoise waters where island life feels both luminous and deeply unhurried.',
    story: [
      'Mallorca opens the journey with dry-stone villages, secret calas, and a warm mineral light that binds hillside and sea together.',
      'Ibiza brings a freer, brighter rhythm through white architecture, open horizons, and a landscape stripped back to light, pine, and salt.',
      'Menorca closes the arc in a quieter key, where untouched coves and pale coastal paths create a more intimate and contemplative Mediterranean chapter.',
    ],
    highlights: [
      'Golden-stone island storytelling between cliffs, terraces, calas, and sea air',
      'Whitewashed Mediterranean chapters shaped by sky, pine, and luminous open horizons',
      'Quiet coastal finales built around turquoise water, hidden beaches, and slowed island time',
    ],
    logistics: [
      'Shared inter-island production system designed to limit transfers and maximize local anchoring',
      'Flexible art direction balancing mineral stillness, bright Mediterranean architecture, and coastal intimacy',
      'Editorial and motion delivery adapted for fashion, hospitality, beauty, and leisure-driven storytelling',
    ],
    hero: {
      id: 'balearic-hero',
      type: 'image',
      src: '/assets/journeys/balearic-2026/balearic-all-journeys-thumbnail.png',
      alt: 'Balearic journey background with Mallorca light',
      aspectRatio: 'landscape',
      caption: 'Balearic opening frame',
      overlayLabel: 'Journey 09',
    },
    gallery: [
      {
        id: 'balearic-2026-gallery-01',
        type: 'image',
        src: '/assets/journeys/balearic-2026/balearic-location-mallorca-thumbnail.png',
        alt: 'Mallorca journey thumbnail',
        aspectRatio: 'landscape',
        caption: 'Mallorca',
      },
      {
        id: 'balearic-2026-gallery-02',
        type: 'image',
        src: '/assets/journeys/balearic-2026/balearic-location-ibiza-thumbnail.png',
        alt: 'Ibiza journey thumbnail',
        aspectRatio: 'landscape',
        caption: 'Ibiza',
      },
      {
        id: 'balearic-2026-gallery-03',
        type: 'image',
        src: '/assets/journeys/balearic-2026/balearic-location-menorca-thumbnail.png',
        alt: 'Menorca journey thumbnail',
        aspectRatio: 'landscape',
        caption: 'Menorca',
      },
    ],
    cta: {
      label: 'Discuss Balearic',
      href: 'mailto:hello@beeyondtheworld.com?subject=Balearic%20Journey',
    },
  },
  {
    id: 'italy',
    slug: 'italy',
    title: 'Italy',
    headline:
      'A poetic Italian journey drifting from cypress hills to alpine peaks, Mediterranean stone, and cliffside coastlines.',
    locale: 'Tuscany, Dolomites, Sicily & Amalfi',
    timeframe: 'From 1st May to 30th June',
    summary:
      'A four-part Italy journey shaped by the green rhythm of Tuscany, the mineral stillness of the Dolomites, the architectural serenity of Sicily, and the luminous cliffs of Amalfi.',
    story: [
      'Tuscany opens the journey with cypress lines, olive groves, and a countryside where light and time soften everything they touch.',
      'The Dolomites shift the scale upward into alpine silence, where stone, lakes, and forests create a more elemental and vertical chapter.',
      'Sicily and Amalfi close the arc through Mediterranean architecture, sea horizons, and coastlines where simplicity and grandeur coexist.',
    ],
    highlights: [
      'Countryside storytelling through vineyards, cypress rhythms, and luminous Tuscan stillness',
      'Alpine chapters between peaks, lakes, forests, and crisp mountain air',
      'Mediterranean finales shaped by baroque stone, coastal terraces, and sea-borne light',
    ],
    logistics: [
      'Shared route production connecting inland, alpine, and coastal Italy through one coherent seasonal system',
      'Flexible art direction balancing pastoral calm, alpine scale, and Mediterranean elegance',
      'Editorial and motion delivery adapted for fashion, hospitality, beauty, and culture-led storytelling',
    ],
    hero: {
      id: 'italy-hero',
      type: 'image',
      src: '/assets/journeys/italy-2026/italy-all-journeys-thumbnail.jpg',
      alt: 'Italy journey background with Tuscan hills',
      aspectRatio: 'landscape',
      caption: 'Tuscan opening frame',
      overlayLabel: 'Journey 08',
    },
    gallery: [
      {
        id: 'italy-2026-gallery-01',
        type: 'image',
        src: '/assets/journeys/italy-2026/italy-location-tuscany-thumbnail.png',
        alt: 'Tuscany journey thumbnail',
        aspectRatio: 'landscape',
        caption: 'Tuscany',
      },
      {
        id: 'italy-2026-gallery-02',
        type: 'image',
        src: '/assets/journeys/italy-2026/italy-location-dolomites-thumbnail.png',
        alt: 'Dolomites journey thumbnail',
        aspectRatio: 'landscape',
        caption: 'Dolomites',
      },
      {
        id: 'italy-2026-gallery-03',
        type: 'image',
        src: '/assets/journeys/italy-2026/italy-location-sicily-thumbnail.png',
        alt: 'Sicily journey thumbnail',
        aspectRatio: 'landscape',
        caption: 'Sicily',
      },
      {
        id: 'italy-2026-gallery-04',
        type: 'image',
        src: '/assets/journeys/italy-2026/italy-location-amalfi-thumbnail.png',
        alt: 'Amalfi journey thumbnail',
        aspectRatio: 'landscape',
        caption: 'Amalfi',
      },
    ],
    cta: {
      label: 'Discuss Italy',
      href: 'mailto:hello@beeyondtheworld.com?subject=Italy%20Journey',
    },
  },
  {
    id: 'morocco',
    slug: 'morocco',
    title: 'Morocco',
    headline:
      'A Moroccan arc unfolding between desert light, Atlantic stillness, medina textures, and vast horizons.',
    locale: 'Ouarzazate, Agafay, Dakhla, Taghazout & Essaouira',
    timeframe: 'From 1st April to 30th June',
    summary:
      'A multi-chapter Morocco journey shaped by desert silence, Atlantic breeze, medina density, and landscapes where water and stone constantly rebalance one another.',
    story: [
      'Ouarzazate opens the journey with kasbah silhouettes, desert gold, and the softer mirror of lake water beneath the Atlas line.',
      'Agafay and Marrakech accelerate the narrative through stone desert stillness and medina movement, where earth and culture breathe together.',
      'Dakhla, Taghazout, and Essaouira stretch the arc toward the Atlantic, with lagoons, surf lines, wind-shaped ports, and minimalist horizons closing the story.',
    ],
    highlights: [
      'Desert chapters between kasbahs, lake reflections, pale earth, and immense sky',
      'Atlantic sequences shaped by surf culture, port textures, dunes, and wind-softened light',
      'City and craft atmospheres woven through medinas, riads, and Moroccan material culture',
    ],
    logistics: [
      'Shared route production linking desert, city, lagoon, surf coast, and port through one coherent seasonal system',
      'Flexible art direction balancing raw earth, Atlantic minerality, and richly textured cultural chapters',
      'Editorial and motion delivery adapted for fashion, hospitality, beauty, and culture-led storytelling',
    ],
    hero: {
      id: 'morocco-hero',
      type: 'image',
      src: '/assets/journeys/morocco-2026/morocco-all-journeys-thumbnail.png',
      alt: 'Morocco journey background with Atlantic oasis landscape',
      aspectRatio: 'landscape',
      caption: 'Atlantic opening frame',
      overlayLabel: 'Journey 07',
    },
    gallery: [
      {
        id: 'morocco-2026-gallery-01',
        type: 'image',
        src: '/assets/journeys/morocco-2026/morocco-location-ouarzazate-thumbnail.png',
        alt: 'Ouarzazate journey thumbnail',
        aspectRatio: 'landscape',
        caption: 'Ouarzazate',
      },
      {
        id: 'morocco-2026-gallery-02',
        type: 'image',
        src: '/assets/journeys/morocco-2026/morocco-location-taghazout-thumbnail.png',
        alt: 'Taghazout journey thumbnail',
        aspectRatio: 'landscape',
        caption: 'Taghazout',
      },
      {
        id: 'morocco-2026-gallery-03',
        type: 'image',
        src: '/assets/journeys/morocco-2026/morocco-location-essaouira-thumbnail.png',
        alt: 'Essaouira journey thumbnail',
        aspectRatio: 'landscape',
        caption: 'Essaouira',
      },
    ],
    cta: {
      label: 'Discuss Morocco',
      href: 'mailto:hello@beeyondtheworld.com?subject=Morocco%20Journey',
    },
  },
  {
    id: 'france',
    slug: 'france',
    title: 'France',
    headline:
      'A French journey drifting from Mediterranean stone gardens to salt lagoons and alpine light.',
    locale: 'Provence, Camargue & Avoriaz',
    timeframe: 'From 1st June to 30th September',
    summary:
      'A three-part France journey shaped by the warm stillness of Provence, the wild pastel horizons of the Camargue, and the crystalline mountain calm of Avoriaz.',
    story: [
      'Provence opens the journey with ochre stone, fragrant gardens, and sun-softened light that turns every frame into a quiet Mediterranean tableau.',
      'The Camargue expands the atmosphere into lagoons, white horses, and wind-shaped wetlands where sky and water dissolve into one continuous horizon.',
      'Avoriaz closes the arc in alpine clarity, with lakes, forests, and mountain air creating a more elevated, mineral, and contemplative rhythm.',
    ],
    highlights: [
      'Mediterranean chapters woven through stone houses, dry herbs, and warm evening light',
      'Wetland storytelling between salt flats, flamingos, reeds, and pale pastel horizons',
      'Alpine sequences built around lakes, forests, and crystalline mountain atmospheres',
    ],
    logistics: [
      'Shared route production connecting south and alpine France through one coherent seasonal system',
      'Flexible art direction balancing Mediterranean softness, wild wetland openness, and alpine purity',
      'Editorial and motion delivery adapted for luxury, hospitality, beauty, and nature-led storytelling',
    ],
    hero: {
      id: 'france-hero',
      type: 'image',
      src: '/assets/journeys/france-2026/france-all-journeys-thumbnail.png',
      alt: 'France journey background with Camargue pastel landscape',
      aspectRatio: 'landscape',
      caption: 'Camargue opening frame',
      overlayLabel: 'Journey 06',
    },
    gallery: [
      {
        id: 'france-2026-gallery-01',
        type: 'image',
        src: '/assets/journeys/france-2026/france-location-provence-thumbnail.png',
        alt: 'Provence journey thumbnail',
        aspectRatio: 'landscape',
        caption: 'Provence',
      },
      {
        id: 'france-2026-gallery-02',
        type: 'image',
        src: '/assets/journeys/france-2026/france-location-camargue-thumbnail.png',
        alt: 'Camargue journey thumbnail',
        aspectRatio: 'landscape',
        caption: 'Camargue',
      },
      {
        id: 'france-2026-gallery-03',
        type: 'image',
        src: '/assets/journeys/france-2026/france-location-avoriaz-thumbnail.png',
        alt: 'Avoriaz journey thumbnail',
        aspectRatio: 'landscape',
        caption: 'Avoriaz',
      },
    ],
    cta: {
      label: 'Discuss France',
      href: 'mailto:hello@beeyondtheworld.com?subject=France%20Journey',
    },
  },
  {
    id: 'azores',
    slug: 'azores',
    title: 'Azores',
    headline:
      'An Atlantic pause where volcanic lakes, misted forests, and open ocean light become one continuous horizon.',
    locale: 'Azores',
    timeframe: 'From 1st June to 30th September',
    summary:
      'A cinematic Azores journey shaped by emerald crater lakes, pale hydrangea cliffs, mist-washed forests, and the quiet force of the Atlantic.',
    story: [
      'The Azores open as a suspended landscape where volcanic lakes shimmer beneath shifting clouds and the ocean seems to begin just beyond every ridge.',
      'Forests, cliffs, and winding paths create a rhythm of slowness and silence, turning the territory into a natural set shaped by mist, wind, and deep green light.',
      'The journey closes in a state of rare balance, where fire-born landscapes are softened by water, and every frame feels both elemental and serene.',
    ],
    highlights: [
      'Volcanic-lake storytelling between crater ridges, soft mist, and luminous Atlantic skies',
      'Hydrangea-lined cliffs and island paths that keep the narrative suspended between land, ocean, and cloud',
      'A naturally slowed atmosphere ideal for fashion, hospitality, beauty, and contemplative brand storytelling',
    ],
    logistics: [
      'One coherent island-based production system designed to minimize movement and maximize local anchoring',
      'Flexible art direction shaped for stillness, texture, weather shifts, and volcanic landscape continuity',
      'Editorial and motion delivery adapted for luxury, lifestyle, hospitality, and ecology-led narratives',
    ],
    hero: {
      id: 'azores-hero',
      type: 'image',
      src: '/assets/journeys/azores-2026/azores-all-journeys-thumbnail.jpg',
      alt: 'Azores journey background with oceanic volcanic landscape',
      aspectRatio: 'landscape',
      caption: 'Azores opening frame',
      overlayLabel: 'Journey 05',
    },
    gallery: [
      {
        id: 'azores-2026-gallery-01',
        type: 'image',
        src: '/assets/journeys/azores-2026/azores-location-azores-thumbnail.png',
        alt: 'Azores journey location thumbnail',
        aspectRatio: 'landscape',
        caption: 'Azores',
      },
      {
        id: 'azores-2026-gallery-02',
        type: 'image',
        src: '/assets/journeys/azores-2026/azores-location-azores-background.jpg',
        alt: 'Azores journey background landscape',
        aspectRatio: 'landscape',
        caption: 'Atlantic landscape',
      },
      {
        id: 'azores-2026-gallery-03',
        type: 'image',
        src: '/assets/journeys/azores-2026/azores-location-azores-story.jpg',
        alt: 'Azores story panorama',
        aspectRatio: 'landscape',
        caption: 'Volcanic tale',
      },
    ],
    cta: {
      label: 'Discuss Azores',
      href: 'mailto:hello@beeyondtheworld.com?subject=Azores%20Journey',
    },
  },
  {
    id: 'thailand',
    slug: 'thailand',
    title: 'Thailand',
    headline:
      'A cinematic drift from rainforest karsts to neon streets and luminous island horizons.',
    locale: 'Khao Sok, Bangkok & Koh Phi Phi',
    timeframe: 'From 1st December 2026 to 31st March 2027',
    summary:
      'A three-part Thailand journey unfolding between the misted karst lake of Khao Sok, the electric density of Bangkok, and the crystalline tropical stillness of Koh Phi Phi.',
    story: [
      'Khao Sok opens the journey with floating lake chapters, jungle silence, and limestone walls emerging from emerald water like sculpted islands.',
      'Bangkok shifts the tempo into neon streets, market alleys, metal shutters, and a vibrant urban rhythm where tradition and intensity collide.',
      'Koh Phi Phi closes the arc with longtail boats, translucent shallows, and sunset skies that dissolve the production into a luminous tropical horizon.',
    ],
    highlights: [
      'Karst-lake storytelling between rainforest waterlines, hidden coves, and drifting boats',
      'Bangkok night chapters shaped by neon density, street textures, and cinematic city energy',
      'Island finales framed by turquoise water, limestone cliffs, and sunset-soft tropical light',
    ],
    logistics: [
      'Shared route design connecting inland lake, capital city, and island chapter with pooled local crews',
      'Flexible art direction system moving from organic jungle atmospheres to structured urban density and coastal stillness',
      'Editorial and motion delivery shaped for fashion, hospitality, beauty, and culture-led storytelling',
    ],
    hero: {
      id: 'thailand-hero',
      type: 'image',
      src: '/assets/journeys/thailand-2026/thailand-all-journeys-thumbnail.png',
      alt: 'Thailand journey background showing Khao Sok lake atmosphere',
      aspectRatio: 'landscape',
      caption: 'Khao Sok lake opening frame',
      overlayLabel: 'Journey 03',
    },
    gallery: [
      {
        id: 'thailand-2026-gallery-01',
        type: 'image',
        src: '/assets/journeys/thailand-2026/thailand-location-khao-sok-thumbnail.png',
        alt: 'Khao Sok journey thumbnail',
        aspectRatio: 'landscape',
        caption: 'Khao Sok',
      },
      {
        id: 'thailand-2026-gallery-02',
        type: 'image',
        src: '/assets/journeys/thailand-2026/thailand-location-bangkok-thumbnail.png',
        alt: 'Bangkok journey thumbnail',
        aspectRatio: 'landscape',
        caption: 'Bangkok',
      },
      {
        id: 'thailand-2026-gallery-03',
        type: 'image',
        src: '/assets/journeys/thailand-2026/thailand-location-koh-phi-phi-thumbnail.png',
        alt: 'Koh Phi Phi journey thumbnail',
        aspectRatio: 'landscape',
        caption: 'Koh Phi Phi',
      },
    ],
    cta: {
      label: 'Discuss Thailand',
      href: 'mailto:hello@beeyondtheworld.com?subject=Thailand%20Journey',
    },
  },
  {
    id: 'philippines',
    slug: 'philippines',
    title: 'Philippines',
    headline: 'Island chapters drifting from turquoise lagoons to cloud-high inland landscapes.',
    locale: 'Palawan, Bukidnon & Siargao',
    timeframe: 'From 1st March to 31st May 2026',
    summary:
      'A cinematic island journey unfolding between the translucent lagoons of Palawan, the cloud-wrapped highlands of Bukidnon, and the slow surf rhythm of Siargao.',
    story: [
      'Palawan opens the journey with hidden lagoons, transparent waters, and limestone walls that make every frame feel suspended between jungle and sea.',
      'Bukidnon shifts the atmosphere inland, where cloud seas, soft plantations, and cooler air stretch the narrative into something slower, higher, and deeply natural.',
      'Siargao closes the story with palms, surf roads, tidal pools, and pastel evenings that dissolve the production into the rhythm of the ocean.',
    ],
    highlights: [
      'Turquoise lagoon storytelling across secret coves and limestone passages',
      'Cloud-high inland chapters rooted in agriculture, calm light, and wide horizons',
      'Ocean-led finales shaped by surf culture, island roads, and slow tropical sunsets',
    ],
    logistics: [
      'Shared island logistics designed around light transfers, local crews, and pooled accommodation windows',
      'Flexible art-direction system moving between marine, inland, and surf environments without breaking narrative continuity',
      'Editorial and motion delivery shaped for campaigns, hospitality, fashion, and community storytelling',
    ],
    hero: {
      id: 'philippines-hero',
      type: 'image',
      src: '/assets/journeys/philippines-2026/philippines-all-journeys-thumbnail.png',
      alt: 'Philippines island background for the 2026 journey',
      aspectRatio: 'landscape',
      caption: 'Island drift opening frame',
      overlayLabel: 'Journey 01',
    },
    gallery: [
      {
        id: 'philippines-2026-gallery-01',
        type: 'image',
        src: '/assets/journeys/philippines-2026/philippines-location-palawan-thumbnail.jpg',
        alt: 'Palawan lagoon opening frame',
        aspectRatio: 'landscape',
        caption: 'Palawan',
      },
      {
        id: 'philippines-2026-gallery-02',
        type: 'image',
        src: '/assets/journeys/philippines-2026/philippines-location-bukidnon-thumbnail.png',
        alt: 'Bukidnon highland chapter',
        aspectRatio: 'landscape',
        caption: 'Bukidnon',
      },
      {
        id: 'philippines-2026-gallery-03',
        type: 'image',
        src: '/assets/journeys/philippines-2026/philippines-location-siargao-thumbnail.png',
        alt: 'Siargao surf island chapter',
        aspectRatio: 'landscape',
        caption: 'Siargao',
      },
    ],
    cta: {
      label: 'Discuss Philippines',
      href: 'mailto:hello@beeyondtheworld.com?subject=Philippines%20Journey',
    },
  },
  {
    id: 'mallorca',
    slug: 'mallorca',
    title: 'Mallorca Balearic Reverie',
    headline: 'Balearic reveries framed by Tramuntana cliffs and terracotta villages.',
    locale: 'Mallorca & Ibiza',
    timeframe: 'May - July 2025',
    summary:
      'Modernist fincas, Balearic sailboats, and sun-baked plazas create an Iberian moodboard for brands chasing warm-light storytelling and artisanal detail.',
    story: [
      'Sunrise shoots weave through olive terraces with flamenco guitarists scoring slow pans before the atelier opens inside a private finca dressed in terracotta and linen.',
      "Afternoons ride a vintage sailboat around Es Vedra for wind-brushed motion, then return to Deia's plazas for twilight tapas scenes that wrap each chapter in Iberian hospitality.",
    ],
    highlights: [
      'Golden-hour resortwear portraits in Tramuntana terraces',
      'Es Vedra sailing sequences with steady 16mm capture',
      'Iberian soundscapes and tapas rituals for intimate evening scenes',
    ],
    logistics: [
      'Three fincas with accommodation for 18 guests and crew',
      'Vintage Riva tender plus 38ft sailboat for mobile scenes',
      'On-site edit pod for daily still and motion selects',
    ],
    hero: {
      id: 'mallorca-hero',
      type: 'image',
      src: '/assets/journeys/mallorca-balearic-reverie/mallorca-balearic-reverie-gallery-06.png',
      alt: 'Es Vedra island shot from sailboat deck',
      aspectRatio: 'landscape',
      caption: 'Es Vedra sail recce',
      overlayLabel: 'Journey 02',
    },
    gallery: [
      {
        id: 'mallorca-balearic-reverie-gallery-02',
        type: 'image',
        src: '/assets/journeys/mallorca-balearic-reverie/mallorca-balearic-reverie-gallery-02.png',
        alt: 'Hidden cala with turquoise water and white sand',
        aspectRatio: 'landscape',
        caption: 'Macarelleta scouting',
      },
      {
        id: 'mallorca-balearic-reverie-gallery-04',
        type: 'image',
        src: '/assets/journeys/mallorca-balearic-reverie/mallorca-balearic-reverie-gallery-04.png',
        alt: 'Stone village street in Deia under warm light',
        aspectRatio: 'landscape',
        caption: 'Deia golden grid',
      },
      {
        id: 'mallorca-balearic-reverie-gallery-06',
        type: 'image',
        src: '/assets/journeys/mallorca-balearic-reverie/mallorca-balearic-reverie-gallery-06.png',
        alt: 'Es Vedra island shot from sailboat deck',
        aspectRatio: 'landscape',
        caption: 'Es Vedra sail recce',
      },
      {
        id: 'mallorca-balearic-reverie-gallery-09',
        type: 'image',
        src: '/assets/journeys/mallorca-balearic-reverie/mallorca-balearic-reverie-gallery-09.png',
        alt: 'Lush Mallorcan villa courtyard with pool',
        aspectRatio: 'landscape',
        caption: 'Creative sanctuary courtyard',
      },
      {
        id: 'mallorca-balearic-reverie-gallery-13',
        type: 'image',
        src: '/assets/journeys/mallorca-balearic-reverie/mallorca-balearic-reverie-gallery-13.png',
        alt: 'Mountain road descending into narrow gorge',
        aspectRatio: 'landscape',
        caption: 'Sa Calobra descent',
      },
      {
        id: 'mallorca-balearic-reverie-gallery-18',
        type: 'image',
        src: '/assets/journeys/mallorca-balearic-reverie/mallorca-balearic-reverie-gallery-18.png',
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
    title: 'Greece Mineral Dreams',
    headline: 'Cycladic mineral tales floating between Santorini terraces and Milos boathouses.',
    locale: 'Santorini, Mykonos & Milos',
    timeframe: 'September 2025',
    summary:
      "A blue-and-white narrative woven for brands craving Greek island escapism - from Oia's dawn light to Klima's fishermen docks and Milos' volcanic coves.",
    story: [
      "We open each day on Santorini rooftops where dresses catch the caldera breeze before sailing to Milos' Klima village for chromatic scenes inside the boat garages.",
      'Sunset dinners unfold on the sand of Sarakiniko with lantern rigs reflecting off chalk cliffs, closing on Mykonos nights scored by bouzouki and electronic blends.',
    ],
    highlights: [
      'Caldera sunrise styling on private Santorini terraces',
      'Milos syrmata boathouse sets bathed in pastel reflections',
      'Sarakiniko night portraits lit with custom Cycladic lantern rig',
    ],
    logistics: [
      'Three island bases with 20 suites and backstage lounges',
      'Heritage caique outfitted with power, wardrobe and light rig',
      'Local gastronomy partners for bespoke tasting journeys',
    ],
    hero: {
      id: 'greece-hero',
      type: 'image',
      src: '/assets/journeys/greece-mineral-dreams/greece-mineral-dreams-gallery-08.png',
      alt: 'Santorini restaurant terrace at sunset',
      aspectRatio: 'landscape',
      caption: 'Tableau tasting setup',
      overlayLabel: 'Journey 03',
    },
    gallery: [
      {
        id: 'greece-mineral-dreams-gallery-01',
        type: 'image',
        src: '/assets/journeys/greece-mineral-dreams/greece-mineral-dreams-gallery-01.png',
        alt: 'View over Santorini caldera at first light',
        aspectRatio: 'landscape',
        caption: 'Caldera lookout scout',
      },
      {
        id: 'greece-mineral-dreams-gallery-05',
        type: 'image',
        src: '/assets/journeys/greece-mineral-dreams/greece-mineral-dreams-gallery-05.png',
        alt: 'Whitewashed stairs with bougainvillea in Mykonos',
        aspectRatio: 'landscape',
        caption: 'Mykonos chroma study',
      },
      {
        id: 'greece-mineral-dreams-gallery-08',
        type: 'image',
        src: '/assets/journeys/greece-mineral-dreams/greece-mineral-dreams-gallery-08.png',
        alt: 'Santorini restaurant terrace at sunset',
        aspectRatio: 'landscape',
        caption: 'Tableau tasting setup',
      },
      {
        id: 'greece-mineral-dreams-gallery-11',
        type: 'image',
        src: '/assets/journeys/greece-mineral-dreams/greece-mineral-dreams-gallery-11.png',
        alt: 'Editorial portrait of muse in Cycladic architecture',
        aspectRatio: 'landscape',
        caption: 'Muse frame reference',
      },
      {
        id: 'greece-mineral-dreams-gallery-15',
        type: 'image',
        src: '/assets/journeys/greece-mineral-dreams/greece-mineral-dreams-gallery-15.png',
        alt: 'Sea horizon with traditional wooden boat',
        aspectRatio: 'landscape',
        caption: 'Caique transfer route',
      },
      {
        id: 'greece-mineral-dreams-gallery-19',
        type: 'image',
        src: '/assets/journeys/greece-mineral-dreams/greece-mineral-dreams-gallery-19.png',
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
  {
    id: 'morocco-april-2026',
    slug: 'morocco-april-2026',
    title: 'Morocco Desert Caravan',
    headline: 'Agafay dunes, Marrakech riads, and Taghazout swells share one cinematic caravan.',
    locale: 'Agafay, Marrakech & Taghazout',
    timeframe: 'February - April 2026',
    summary:
      'We choreograph a nomadic atelier that drifts between wind-carved dunes, palm-filled palaces, and Atlantic surf towns. Brands glide through desert rituals by dawn, riad couture salons by noon, and Taghazout sunsets by night.',
    story: [
      'The caravan opens before sunrise in Agafay where mirrored runways and camel caravans sculpt silhouettes against the dunes. Steadicam rigs chase the sandstorms while the glam team operates from a mobile kasbah.',
      'Afternoons reset inside Marrakech palaces for couture fittings, before heading to Taghazout cliffs for salt-sprayed finales. The story closes with a fireside ritual scored by Gnawa riffs and ocean beats.',
    ],
    highlights: [
      'Agafay dune choreography with mirrored styling sanctuaries',
      'Palace couture salons that pair Moroccan craft with maison teams',
      'Atlantic surf town finale mixing fashion and wave-side percussion',
    ],
    logistics: [
      'Nomadic production village spanning dunes, riads, and coast',
      'Dual crews covering film + stills with on-site post pod',
      'Desert sustainability team monitoring footprint each day',
    ],
    hero: {
      id: 'morocco-april-2026-hero',
      type: 'image',
      src: '/assets/journeys/morocco-april-2026/morocco-april-2026-hero.png',
      alt: 'Golden Moroccan desert runway with nomad tents',
      aspectRatio: 'landscape',
      caption: 'Agafay mirrored runway',
      overlayLabel: 'Journey 04',
    },
    gallery: [
      {
        id: 'morocco-april-2026-gallery-05',
        type: 'image',
        src: '/assets/journeys/morocco-april-2026/morocco-april-2026-gallery-05.png',
        alt: 'Fashion crew walking along Agafay dunes',
        aspectRatio: 'landscape',
        caption: 'Dune scouting loop',
      },
      {
        id: 'morocco-april-2026-gallery-08',
        type: 'image',
        src: '/assets/journeys/morocco-april-2026/morocco-april-2026-gallery-08.png',
        alt: 'Moroccan riad courtyard with lush palms',
        aspectRatio: 'landscape',
        caption: 'Marrakech couture salon',
      },
      {
        id: 'morocco-april-2026-gallery-14',
        type: 'image',
        src: '/assets/journeys/morocco-april-2026/morocco-april-2026-gallery-14.png',
        alt: 'Taghazout coastline at sunset',
        aspectRatio: 'landscape',
        caption: 'Atlantic coast finale',
      },
      {
        id: 'morocco-april-2026-gallery-24',
        type: 'image',
        src: '/assets/journeys/morocco-april-2026/morocco-april-2026-gallery-24.png',
        alt: 'Art direction board with Moroccan palette',
        aspectRatio: 'portrait',
        caption: 'Palette + props lab',
      },
    ],
    cta: {
      label: 'Plan the desert recce',
      href: 'mailto:hello@beeyondtheworld.com?subject=Morocco%20Desert%20Caravan',
    },
  },
  {
    id: 'india-january-2026',
    slug: 'india-january-2026',
    title: 'India Palace Circuit',
    headline: 'Couture caravans weaving through Jaipur, Udaipur lakes, and Goan sunsets.',
    locale: 'Jaipur, Udaipur & Goa',
    timeframe: 'From 1st November 2026 to 31st March 2027',
    summary:
      'A travelling palace narrative captures dawn pujas in Jaipur, mirrored lotus rides in Udaipur, and spice-scented Goa nights. Maison teams co-create with artisans to infuse each frame with royal craft and seaside ease.',
    story: [
      'Day one begins at an amber-hued Jaipur fort where dancers rehearse between thikri mirrors. Drone sweeps and dollys track the garments as they catch the first sun.',
      'Midweek, the convoy sails across Udaipur lakes for moonlit couture reveals, before closing in Goa with barefoot receptions blending sitar sets and coastal feast scenes.',
    ],
    highlights: [
      'Fortress catwalks blending tradition and avant-garde staging',
      'Lake palace flotilla for night-time couture reveals',
      'Goan beach banquets activating culinary + musical talent',
    ],
    logistics: [
      'Full heritage location permitting + royal liaison service',
      'Rail + air corridor moving crews seamlessly between cities',
      'Cultural stewardship partners ensuring rituals remain respectful',
    ],
    hero: {
      id: 'india-january-2026-hero',
      type: 'image',
      src: '/assets/journeys/india-january-2026/india-january-2026-hero.png',
      alt: 'Sunset over Indian palace courtyard',
      aspectRatio: 'landscape',
      caption: 'Amber palace glow',
      overlayLabel: 'Journey 05',
    },
    gallery: [
      {
        id: 'india-january-2026-gallery-02',
        type: 'image',
        src: '/assets/journeys/india-january-2026/india-january-2026-gallery-02.png',
        alt: 'Intricate palace hallway in Jaipur',
        aspectRatio: 'portrait',
        caption: 'Jaipur fort rehearsal',
      },
      {
        id: 'india-january-2026-gallery-05',
        type: 'image',
        src: '/assets/journeys/india-january-2026/india-january-2026-gallery-05.png',
        alt: 'Lake palace floating terrace',
        aspectRatio: 'landscape',
        caption: 'Udaipur moonlit raft',
      },
      {
        id: 'india-january-2026-gallery-08',
        type: 'image',
        src: '/assets/journeys/india-january-2026/india-january-2026-gallery-08.png',
        alt: 'Goan beach with lantern dinner setup',
        aspectRatio: 'landscape',
        caption: 'Goa night banquet',
      },
      {
        id: 'india-january-2026-gallery-11',
        type: 'image',
        src: '/assets/journeys/india-january-2026/india-january-2026-gallery-11.png',
        alt: 'Close up of hand embroidery workshop',
        aspectRatio: 'portrait',
        caption: 'Artisan collaboration studio',
      },
    ],
    cta: {
      label: 'Discuss India circuit',
      href: 'mailto:hello@beeyondtheworld.com?subject=India%20Palace%20Circuit',
    },
  },
  {
    id: 'dolomites-april-2026',
    slug: 'dolomites-april-2026',
    title: 'Dolomites Alpine Atelier',
    headline: 'Alpine catwalks tracing sunrise peaks, mirrored lakes, and snow ateliers.',
    locale: 'Dolomiti, Italy',
    timeframe: 'April 2026',
    summary:
      'An elevated atelier clings to the Dolomite ridgelines, mixing glacier soundscapes with couture textures. Crews capture first-light peaks, ice caves, and spring meadows in one orchestrated journey.',
    story: [
      'Mornings unfold on sky decks suspended between peaks, where flowing silhouettes catch the pink alpenglow. FPV drones and cable cams chase the lines.',
      'Afternoons retreat into glassy lakes and pine meadows for tactile close-ups, before nights close inside a snow cave cinema projecting the day’s rushes.',
    ],
    highlights: [
      'Peak-top runways with 360-degree alpine vistas',
      'Ice cave cinema for nightly review + immersive content drops',
      'Sonic palette blending glacier crackle with bespoke scores',
    ],
    logistics: [
      'Mountain safety + lift coordination covering multiple ranges',
      'Modular alpine studio with warming pods and styling racks',
      'On-site finishing suite delivering edits for investor teasers',
    ],
    hero: {
      id: 'dolomites-april-2026-hero',
      type: 'image',
      src: '/assets/journeys/dolomites-april-2026/dolomites-april-2026-hero.png',
      alt: 'Golden hour over Dolomite peaks',
      aspectRatio: 'landscape',
      caption: 'Seceda ridge stage',
      overlayLabel: 'Journey 06',
    },
    gallery: [
      {
        id: 'dolomites-april-2026-gallery-02',
        type: 'image',
        src: '/assets/journeys/dolomites-april-2026/dolomites-april-2026-gallery-02.png',
        alt: 'Cinematic shot of snow covered peaks',
        aspectRatio: 'landscape',
        caption: 'Alpenglow grid',
      },
      {
        id: 'dolomites-april-2026-gallery-05',
        type: 'image',
        src: '/assets/journeys/dolomites-april-2026/dolomites-april-2026-gallery-05.png',
        alt: 'Model in alpine meadow',
        aspectRatio: 'portrait',
        caption: 'Meadow atelier',
      },
      {
        id: 'dolomites-april-2026-gallery-10',
        type: 'image',
        src: '/assets/journeys/dolomites-april-2026/dolomites-april-2026-gallery-10.png',
        alt: 'Frozen lake reflecting mountains',
        aspectRatio: 'landscape',
        caption: 'Mirror lake runway',
      },
      {
        id: 'dolomites-april-2026-gallery-15',
        type: 'image',
        src: '/assets/journeys/dolomites-april-2026/dolomites-april-2026-gallery-15.png',
        alt: 'Snow cave lit with warm lights',
        aspectRatio: 'landscape',
        caption: 'Ice cinema ritual',
      },
    ],
    cta: {
      label: 'Reserve alpine dates',
      href: 'mailto:hello@beeyondtheworld.com?subject=Dolomites%20Alpine%20Atelier',
    },
  },
];

export const journeyShowcases: JourneyShowcase[] = allJourneyShowcases.filter(
  (journey) =>
    journey.slug === 'balearic' ||
    journey.slug === 'italy' ||
    journey.slug === 'morocco' ||
    journey.slug === 'france' ||
    journey.slug === 'azores' ||
    journey.slug === 'india-january-2026' ||
    journey.slug === 'philippines' ||
    journey.slug === 'thailand'
);

export const campaignShowcases: CampaignShowcase[] = [
  {
    id: 'maradji-ibiza',
    slug: 'maradji-ibiza',
    title: 'Maradji - Salt Breeze Chapters',
    destination: 'Ibiza, Balearic Islands',
    headline: 'Summer hat rituals carried by coastal nature and Balearic glow.',
    summary:
      "Maradji's hand-crafted hats drift through Ibiza's shoulder season, pairing spring bloom palettes with sea-sprayed sunsets. The campaign feels like a coastal novella, stitching slow cinema with tactile field sound.",
    story: [
      'Dawn opens at Cala Salada where the crew choreographs hat silhouettes against turquoise tide lines; diffusion sails tame the breeze while Super 8 reels capture every gust lifting the brims.',
      'Afternoons slide into pine groves and cliffside rooftops with live guitarists scoring the styling flow. Twilight closes around a beachfire where muses trade hats and whispered vows to keep summer energy alive.',
    ],
    highlights: [
      'Sunrise hat choreography across hidden calas',
      'Cliffside styling lab mixing straw, silk, and shell details',
      'Live coastal soundtrack recorded for the hero edit',
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
      'Portion of production spend reinvested in Ibiza coastal preservation groups',
      'Photo and film suites delivered in three summer-spring waves for retail, press, and socials',
      'Field-recorded coastline soundtrack packaged for in-store ambience',
    ],
    cta: {
      label: 'Watch full film',
      href: '/assets/campaigns/maradji-ibiza/maradji-ibiza-story-02.mp4',
    },
  },
  {
    id: 'almaaz-kenya',
    slug: 'almaaz-kenya',
    title: 'Almaaz - The Bloom of Inclusivity',
    destination: 'Mombasa, Kenya',
    headline: 'The Bloom of Inclusivity',
    summary:
      'In our pursuit of global inclusion, meet Vera from the vibrant city of Mombasa, Kenya. Her story celebrates talent beyond borders and the identities that enrich our world.',
    story: [
      'Recognizing the diverse backgrounds and experiences that enrich our world, we are committed to creating opportunities where talent is seen beyond borders.',
      'Through our initiatives, we empower local women who may face barriers to entering the fashion industry, helping them share their stories and identities on an international stage.',
      'Thanks to this collaboration, Vera was celebrated on the cover of Off Town Magazine, bringing her story, identity and culture to an international audience.',
    ],
    highlights: [
      'Local talent seen beyond borders',
      'International visibility through Off Town Magazine',
      'Spring Summer 2023 · Kenya',
    ],
    credits: [
      { role: 'Maison', value: 'Almaaz' },
      { role: 'Creative production', value: 'Beeyondtheworld' },
    ],
    hero: {
      id: 'almaaz-hero-video',
      type: 'video',
      src: '/assets/campaigns/almaaz-kenya/almaaz-kenya-story.mp4',
      alt: 'Model wearing Almaaz jewellery in savannah dusk light',
      poster: '/assets/campaigns/almaaz-kenya/almaaz-kenya-cover.jpg',
      caption: 'Kenya · Spring Summer 2023',
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
      'Opportunity created for a local woman entering the fashion industry',
      'Vera’s identity and culture shared with an international audience',
      'A campaign tale grounded in genuine encounters and human creativity',
    ],
    cta: {
      label: 'Request case study',
      href: 'mailto:hello@beeyondtheworld.com?subject=Almaaz%20Kenya%20Case%20Study',
    },
  },
  {
    id: 'craie-maroc',
    slug: 'craie-maroc',
    title: 'Craie Studio - The Poetry of Contrasts',
    destination: 'Morocco',
    headline: 'The Poetry of Contrasts',
    summary:
      'There are places where just a few kilometres are enough to step into another world, where every road tells a new story and a single country becomes an endless journey of discovery.',
    story: [
      'Distance fades away, giving way to exploration. Every landscape becomes a new setting, a new emotion and a new source of inspiration.',
      'Four distinct visual chapters reveal different faces of the same land while preserving one coherent creative tale.',
    ],
    highlights: [
      'Four visual chapters within one country',
      'Contrasting Moroccan landscapes',
      'Spring Summer 2025 · Morocco',
    ],
    credits: [
      { role: 'Maison', value: 'Craie Studio' },
      { role: 'Creative production', value: 'Beeyondtheworld' },
    ],
    hero: {
      id: 'craie-hero-video',
      type: 'video',
      src: '/assets/campaigns/craie-maroc/craie-maroc-story-02.mp4',
      alt: 'Craie Studio muse walking through desert camp',
      poster: '/assets/campaigns/craie-maroc/craie-maroc-gallery-01.jpg',
      caption: 'Morocco · Spring Summer 2025',
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
      'One shared destination transformed into four creative settings',
      'Resources concentrated within a single coherent production journey',
      'A tale built around contrast, discovery and visual continuity',
    ],
    cta: {
      label: 'Discuss the tale',
      href: 'mailto:hello@beeyondtheworld.com?subject=Craie%20Studio%20Morocco%20Tale',
    },
  },
  {
    id: 'craie-suisse',
    slug: 'craie-suisse',
    title: 'Craie Studio - The Blooming Snowflakes',
    destination: 'Switzerland',
    headline: 'The Blooming… Snowflakes.',
    summary:
      'One place, a thousand awakenings. At the heart of a single landscape, nature unfolds in endless variations and becomes a living painting that breathes through time.',
    story: [
      'Every passing moment reveals a new expression of the same place, where light, atmosphere and perspective gently evolve.',
      'Today, we choose to celebrate the beauty of temporality, from blooming landscapes to snowflakes.',
    ],
    highlights: [
      'One landscape across two seasons',
      'Spring Summer 2023 and Spring Summer 2024',
      'Switzerland',
    ],
    credits: [
      { role: 'Maison', value: 'Craie Studio' },
      { role: 'Creative production', value: 'Beeyondtheworld' },
    ],
    hero: {
      id: 'craie-suisse-hero',
      type: 'image',
      src: '/assets/campaigns/craie-suisse/swiss3.jpg',
      alt: 'Craie Studio seasonal tale in Switzerland',
      aspectRatio: 'landscape',
      caption: 'Switzerland · seasonal tale',
      loopLabel: 'Campaign 04',
    },
    gallery: [],
    impact: [
      'One location revisited through changing light and season',
      'A shared production language across distinct seasonal chapters',
      'A tale focused on time, atmosphere and perspective',
    ],
    cta: {
      label: 'Discuss the tale',
      href: 'mailto:hello@beeyondtheworld.com?subject=Craie%20Studio%20Switzerland%20Tale',
    },
  },
  {
    id: 'grace-mila-morocco',
    slug: 'grace-mila-morocco',
    title: 'Grace & Mila - From Warm Fall to Solstice Summer',
    destination: 'Morocco',
    headline: 'From Warm Fall to Solstice Summer.',
    summary:
      'Two seasonal chapters unfold through the same Moroccan light, moving from the warmth of fall to the clarity of summer.',
    story: [
      'The Fall Winter chapter follows soft coastal light, warm tones and a slower rhythm, allowing the silhouettes to sit naturally within the landscape.',
      'The Spring Summer chapter opens the frame to brighter colour and sunlit horizons, creating a complementary visual story without losing the identity of the first season.',
    ],
    highlights: [
      'Fall Winter 2024 and Spring Summer 2024',
      'A two-season visual narrative in Morocco',
      'Coastal light, colour and natural movement',
    ],
    credits: [
      { role: 'Maison', value: 'Grace & Mila' },
      { role: 'Creative production', value: 'Beeyondtheworld' },
    ],
    hero: {
      id: 'grace-mila-morocco-hero',
      type: 'image',
      src: '/assets/campaigns/grace-mila-morocco/grace-mila-morocco-cover.webp',
      alt: 'Grace and Mila model walking across a sunlit Moroccan shoreline',
      aspectRatio: 'landscape',
      caption: 'Morocco · Fall Winter 2024 / Spring Summer 2024',
      loopLabel: 'Campaign 05',
    },
    gallery: [
      {
        id: 'grace-mila-morocco-gallery-01',
        type: 'image',
        src: '/assets/campaigns/grace-mila-morocco/grace-mila-morocco-gallery-01.webp',
        alt: 'Grace and Mila model in warm light by the Moroccan coast',
        aspectRatio: 'portrait',
        caption: 'Warm fall light',
      },
      {
        id: 'grace-mila-morocco-gallery-02',
        type: 'image',
        src: '/assets/campaigns/grace-mila-morocco/grace-mila-morocco-gallery-02.webp',
        alt: 'Grace and Mila silhouette framed by a bright Moroccan landscape',
        aspectRatio: 'portrait',
        caption: 'Solstice summer chapter',
      },
    ],
    impact: [
      'One destination shaped into two distinct seasonal chapters',
      'A consistent visual language across Fall Winter and Spring Summer',
      'A campaign tale grounded in landscape, light and movement',
    ],
    cta: {
      label: 'Discuss the tale',
      href: 'mailto:hello@beeyondtheworld.com?subject=Grace%20%26%20Mila%20Morocco%20Tale',
    },
  },
  {
    id: 'veganboost-greece',
    slug: 'veganboost-greece',
    title: 'Veganboost - Greece',
    destination: 'Greece',
    headline: 'Greece, shaped by light and water.',
    summary:
      'A sunlit coastal tale built around open-air movement, clear water and the quiet energy of a Greek summer.',
    story: [
      'The campaign begins close to the body, using warm natural light and tactile details to create an immediate, unforced presence.',
      'The story then opens toward the coast, where sea, stone and movement give the images a lighter and more expansive rhythm.',
    ],
    highlights: [
      'A coastal Greek setting',
      'Warm natural light and water-led movement',
      'A visual suite designed across landscape and portrait formats',
    ],
    credits: [
      { role: 'Maison', value: 'Veganboost' },
      { role: 'Creative production', value: 'Beeyondtheworld' },
    ],
    hero: {
      id: 'veganboost-greece-hero',
      type: 'image',
      src: '/assets/campaigns/veganboost-greece/veganboost-greece-cover.webp',
      alt: 'Veganboost campaign portrait in warm Greek sunlight',
      aspectRatio: 'landscape',
      caption: 'Greece · coastal tale',
      loopLabel: 'Campaign 06',
    },
    gallery: [
      {
        id: 'veganboost-greece-gallery-01',
        type: 'image',
        src: '/assets/campaigns/veganboost-greece/veganboost-greece-gallery-01.webp',
        alt: 'Veganboost portrait captured in warm outdoor light',
        aspectRatio: 'portrait',
        caption: 'Sunlit portrait',
      },
      {
        id: 'veganboost-greece-gallery-02',
        type: 'image',
        src: '/assets/campaigns/veganboost-greece/veganboost-greece-gallery-02.webp',
        alt: 'Veganboost coastal image framed by clear Greek water',
        aspectRatio: 'portrait',
        caption: 'Water-led chapter',
      },
    ],
    impact: [
      'A concise visual story anchored in one coastal environment',
      'Portrait and landscape assets prepared for complementary uses',
      'A consistent tale built through light, water and natural movement',
    ],
    cta: {
      label: 'Discuss the tale',
      href: 'mailto:hello@beeyondtheworld.com?subject=Veganboost%20Greece%20Tale',
    },
  },
  {
    id: 'almaaz-new-york',
    slug: 'almaaz-new-york',
    title: 'Almaaz - New York City',
    destination: 'New York City, United States',
    headline: 'Two silhouettes, one moving skyline.',
    summary:
      'An urban campaign where colour, silhouette and movement meet the unmistakable scale of New York City.',
    story: [
      'The skyline establishes the scale of the tale before the camera moves closer to two distinct silhouettes, balancing architecture with human presence.',
      'Blue and cream tones carry the visual continuity from elevated city views to street-level frames, keeping the collection at the centre of a fast-moving environment.',
    ],
    highlights: [
      'New York skyline and street-level perspectives',
      'Two complementary silhouettes',
      'Fall Winter and Summer 2024',
    ],
    credits: [
      { role: 'Maison', value: 'Almaaz' },
      { role: 'Creative production', value: 'Beeyondtheworld' },
    ],
    hero: {
      id: 'almaaz-new-york-hero',
      type: 'video',
      src: '/assets/campaigns/almaaz-new-york/almaaz-new-york-story.mp4',
      alt: 'Almaaz models framed by the New York City skyline',
      poster: '/assets/campaigns/almaaz-new-york/almaaz-new-york-cover.webp',
      caption: 'New York City · 2024',
      loopLabel: 'Campaign 07',
    },
    gallery: [
      {
        id: 'almaaz-new-york-gallery-01',
        type: 'image',
        src: '/assets/campaigns/almaaz-new-york/almaaz-new-york-gallery-01.webp',
        alt: 'Two Almaaz models in blue and cream with the New York skyline',
        aspectRatio: 'landscape',
        caption: 'Skyline dialogue',
      },
      {
        id: 'almaaz-new-york-gallery-02',
        type: 'image',
        src: '/assets/campaigns/almaaz-new-york/almaaz-new-york-gallery-02.webp',
        alt: 'Almaaz editorial portrait photographed in New York City',
        aspectRatio: 'portrait',
        caption: 'City portrait',
      },
    ],
    impact: [
      'One city production expressed through motion and still imagery',
      'A coherent colour story across skyline and street perspectives',
      'A distinct Almaaz identity preserved within a shared New York production',
    ],
    cta: {
      label: 'Discuss the tale',
      href: 'mailto:hello@beeyondtheworld.com?subject=Almaaz%20New%20York%20Tale',
    },
  },
  {
    id: 'ange-new-york',
    slug: 'ange-new-york',
    title: "AN'GE - Power of Parallel",
    destination: 'New York City, United States',
    headline: 'Power of Parallel.',
    summary:
      'Two brands with distinct identities came together through one New York production, sharing resources without compromising their own creative voice.',
    story: [
      'Some stories are born not from sharing the same audience, but from sharing the same vision. In a city that never stands still, two non-competing brands moved through one production toward a shared destination.',
      "Every journey, resource and moment on set gained a greater purpose while each brand preserved its own identity. AN'GE kept its urban, effortless voice within a smarter and more intentional way of creating.",
    ],
    highlights: [
      'Two brands, two audiences, one shared destination',
      'A shared New York production with distinct creative identities',
      'Fall Winter 2024 · New York City',
    ],
    credits: [
      { role: 'Maison', value: "AN'GE" },
      { role: 'Creative production', value: 'Beeyondtheworld' },
    ],
    hero: {
      id: 'ange-new-york-hero',
      type: 'video',
      src: '/assets/campaigns/ange-new-york/ange-new-york-story.mp4',
      alt: "AN'GE campaign moving through New York City streets",
      poster: '/assets/campaigns/ange-new-york/ange-new-york-cover.webp',
      caption: 'New York City · Fall Winter 2024',
      loopLabel: 'Campaign 08',
    },
    gallery: [
      {
        id: 'ange-new-york-gallery-01',
        type: 'image',
        src: '/assets/campaigns/ange-new-york/ange-new-york-gallery-01.webp',
        alt: "AN'GE model in a cream look beside a New York taxi",
        aspectRatio: 'portrait',
        caption: 'Taxi window portrait',
      },
      {
        id: 'ange-new-york-gallery-02',
        type: 'image',
        src: '/assets/campaigns/ange-new-york/ange-new-york-gallery-02.webp',
        alt: "AN'GE editorial portrait in a New York interior",
        aspectRatio: 'portrait',
        caption: 'Urban interior',
      },
      {
        id: 'ange-new-york-gallery-03',
        type: 'image',
        src: '/assets/campaigns/ange-new-york/ange-new-york-gallery-03.webp',
        alt: "AN'GE models crossing a New York City street",
        aspectRatio: 'landscape',
        caption: 'Parallel city movement',
      },
    ],
    impact: [
      'Production resources shared across two non-competing brands',
      'Distinct brand identities preserved within one city production',
      'A more intentional use of each journey and moment on set',
    ],
    cta: {
      label: 'Discuss the tale',
      href: 'mailto:hello@beeyondtheworld.com?subject=AN%27GE%20New%20York%20Tale',
    },
  },
];
