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
    title: 'Philippines Turquoise Resort Journey',
    headline: 'Resortwear dreamscapes across Palawan lagoons and Siargao palms.',
    locale: 'Palawan & Siargao',
    timeframe: 'October - November 2025',
    summary:
      'A floating resortwear laboratory that sails through turquoise coves, coconut-lined sandbars, and reef sanctuaries. Maisons capture saturated sun stories while contributing to ocean regeneration.',
    story: [
      'Mornings open on powder sandbars where models glide barefoot in resortwear while Steadicam crews wade knee-deep in crystal water. The catamaran doubles as a moving wardrobe with palm-dried fabrics swaying above deck.',
      'Afternoons anchor beneath coconut trees for collaborative dye baths with island artisans, before twilight swims trace bioluminescent threads around the collection for the hero film.',
    ],
    highlights: [
      'Turquoise runway sequences with underwater tracking rigs',
      'Coconut grove ateliers co-creating accessories with island makers',
      'Night swim bioluminescence capture for the resortwear finale',
    ],
    logistics: [
      'Catamaran base camp with 12 berths, floating closet, and modular glam stations',
      'Impact-certified reef teams guiding citizen-science activations for crews',
      'On-board post suite delivering daily selects and palette decks',
    ],
    hero: {
      id: 'philippines-hero',
      type: 'image',
      src: '/assets/journeys/philippines/philippines-gallery-01.png',
      alt: 'Turquoise lagoon surrounded by limestone cliffs in Palawan',
      aspectRatio: 'landscape',
      caption: 'Secret lagoon recce, Palawan',
      overlayLabel: 'Journey 01',
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
    title: 'Mallorca Iberian Light Studio',
    headline: 'Iberian resortwear framed by Tramuntana cliffs and terracotta villages.',
    locale: 'Deia, Cala Figuera & Es Vedra',
    timeframe: 'May - June 2025',
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
      src: '/assets/journeys/mallorca/mallorca-gallery-06.png',
      alt: 'Es Vedra island shot from sailboat deck',
      aspectRatio: 'landscape',
      caption: 'Es Vedra sail recce',
      overlayLabel: 'Journey 02',
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
        caption: 'Creative sanctuary courtyard',
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
    title: 'Cyclades Milos Odyssey',
    headline: 'Cycladic resort tales floating between Santorini terraces and Milos boathouses.',
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
      src: '/assets/journeys/greece/greece-gallery-08.png',
      alt: 'Santorini restaurant terrace at sunset',
      aspectRatio: 'landscape',
      caption: 'Tableau tasting setup',
      overlayLabel: 'Journey 03',
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
    title: 'Almaaz - Wild Canopy Kenya',
    destination: 'Laikipia & Masai Mara',
    headline: "High jewellery legends ignited inside Kenya's jungle and savannah night.",
    summary:
      'Three muses - Lila from Paris, Ayanda from Johannesburg, and Veronica, the Kenyan talent we scouted on-site - carry Almaaz through a wild journey that honours local beauty and global craft.',
    story: [
      'Daybreak opens beneath fever trees where Lila and Ayanda move through mist and birdsong while jewellery glows against deep green canopies. Tracking rigs hug the terrain so the camera feels animal and alive.',
      "At dusk we hand the spotlight to Veronica, the Nairobi-born muse discovered during community casting. She leads a fireside rite that fuses Maasai percussion, Almaaz's new line, and her own words about opportunity.",
    ],
    highlights: [
      'Tri-continental casting bringing Paris, South Africa, and Kenya into one frame',
      'Jungle sequences with organic lighting that breathes with the canopy',
      'Fireside storytelling led by Veronica, the Kenyan muse we scouted in the conservancy',
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
      'Campaign revenue funds mentorship stipends for Veronica and two Kenyan apprentices',
      'Low-impact logistics audited with local conservation partners across seven shooting days',
      'Deliverables split into wild story film, portrait gallery, and press-ready origin pieces',
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
    headline: 'Leather reveries flowing between Agafay dunes and Marrakech villas.',
    summary:
      'Berta from Spain and Malak from Morocco anchor a dynamic yet fashion-forward tale that flips between sun-baked desert tracks and lantern-lit riad salons for Craie Studio’s bags.',
    story: [
      'We begin at first light with Berta racing dune crests while Steadicam traces the bags in motion; a mobile villa base keeps wardrobe crisp before Malak takes over within a palm-filled patio for poised still-life chapters.',
      'Twilight reunites both muses in a riad rooftop jam where Gnawa rhythms drive swinging camera moves, closing on an intimate bag ritual beside an artisan leather atelier.',
    ],
    highlights: [
      'Twin-muse casting featuring Berta (Spain) and Malak (Morocco)',
      'Villa-to-dune production flow keeping bags pristine in extreme conditions',
      'Gnawa-infused rooftop finale merging fashion and movement',
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
      'Joint atelier sessions with Marrakech leather collective documented for press kits',
      'Hero film, lookbook stills, and motion loops delivered within ten days',
      'Local crew pathway pairing Moroccan trainees with Spanish department heads',
    ],
    cta: {
      label: 'Discuss Atlas Mirage',
      href: 'mailto:hello@beeyondtheworld.com?subject=Craie%20Studio%20Atlas%20Mirage',
    },
  },
];
