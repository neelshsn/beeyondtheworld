import Link from 'next/link';

import { GlowTitle, ImmersiveVideo, MediaMasonry } from '@/components/primitives';
import type { MediaItem } from '@/components/primitives/media-masonry';
import { Button } from '@/components/ui/button';
import { getConceptNarrative } from '@/lib/cms/fetchers';

const heroVideoSrc = '/assets/home/main-background-hero-home.mp4';

type JourneyShowcase = {
  id: string;
  title: string;
  headline: string;
  locale: string;
  timeframe: string;
  description: string;
  highlights: string[];
  gallery: MediaItem[];
};

type CampaignShowcase = {
  id: string;
  title: string;
  destination: string;
  headline: string;
  description: string;
  heroVideo: string;
  heroPoster: string;
  heroCaption: string;
  highlights: string[];
  media: MediaItem[];
};

const journeyShowcases: JourneyShowcase[] = [
  {
    id: 'philippines',
    title: 'Philippines Deep Blue Residency',
    headline: 'A floating creative camp linking Palawan and Siargao.',
    locale: 'Palawan & Siargao',
    timeframe: 'October - November 2025',
    description:
      'A private catamaran base camp connects secret lagoons, stilted eco-resorts, and indigenous textile ateliers. The residency is scripted for maisons that need sun-drenched stories with measurable impact on the reef communities we partner with.',
    highlights: [
      'Seaplane scouting with banca tenders to hidden coves',
      'Underwater cinema lab with reef-safe illumination',
      'Floating dinner scenography with live island makers',
    ],
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
  },
  {
    id: 'mallorca',
    title: 'Mallorca Serra Studio',
    headline: 'A hilltop creative residence breathing with Tramuntana light.',
    locale: 'Deia, Cala Figuera & Es Vedra',
    timeframe: 'May - June 2025',
    description:
      'We privatise modernist fincas around Deia for slow living, craft analog totems with local ceramists, and stage sunset sound baths on the cliffs. Every capsule blends Spanish savoir-faire with Mediterranean cinematography.',
    highlights: [
      'Sunrise film runs through the olive terraces',
      'Editorial sail around Es Vedra with 16mm coverage',
      'Afterglow tasting pairing by Michelin guest chef',
    ],
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
  },
  {
    id: 'greece',
    title: 'Cyclades Light Tale',
    headline: 'An odyssey across Santorini terraces and Milos fishing villages.',
    locale: 'Santorini, Mykonos & Milos',
    timeframe: 'September 2025',
    description:
      'We choreograph sunrise openings in Oia, intimate dinners in Klima boat houses, and design-led cliff suites for private fittings. The journey is filmed in dual formats to deliver both campaign-grade assets and internal lore.',
    highlights: [
      'Sunrise reveal above the caldera',
      'Night portraits lit with bespoke lantern rig',
      'Slow travel legs aboard restored caique',
    ],
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
  },
];

const campaignShowcases: CampaignShowcase[] = [
  {
    id: 'maradji-ibiza',
    title: 'Maradji - Sunset Routines in Ibiza',
    destination: 'Ibiza, Balearic Islands',
    headline: 'Bohemian leather and silk captured in golden hour rituals across hidden calas.',
    description:
      'Shot across four coves and a rooftop riad, the campaign stitches slow cinema with kinetic handheld sequences. We paired a live sound designer to sculpt the evening dunes into a tactile soundtrack.',
    heroVideo: '/assets/campaigns/maradji-ibiza/maradji-ibiza-story-02.mp4',
    heroPoster: '/assets/campaigns/maradji-ibiza/maradji-ibiza-cover.jpg',
    heroCaption: 'Hero reel, 45 s loop',
    highlights: [
      'Hybrid drone plus Super 8 coverage',
      'Sunset styling across four calas',
      'Audio reactive light design for the finale',
    ],
    media: [
      {
        id: 'maradji-video-01',
        type: 'video',
        src: '/assets/campaigns/maradji-ibiza/maradji-ibiza-story-01.mp4',
        alt: 'Motion clip of Maradji muses walking along Ibiza cliff',
        poster: '/assets/campaigns/maradji-ibiza/maradji-ibiza-gallery-01.jpg',
        aspectRatio: 'landscape',
        caption: 'Analog overlay sequence',
      },
      {
        id: 'maradji-image-01',
        type: 'image',
        src: '/assets/campaigns/maradji-ibiza/maradji-ibiza-gallery-02.jpg',
        alt: 'Maradji model posing in terracotta dress on rooftop',
        aspectRatio: 'landscape',
        caption: 'Rooftop sunset look',
      },
      {
        id: 'maradji-image-02',
        type: 'image',
        src: '/assets/campaigns/maradji-ibiza/maradji-ibiza-carousel-02.jpg',
        alt: 'Close-up of Maradji leather bag against sea backdrop',
        aspectRatio: 'portrait',
        caption: 'Craft focus detail',
      },
      {
        id: 'maradji-image-03',
        type: 'image',
        src: '/assets/campaigns/maradji-ibiza/maradji-ibiza-gallery-03.jpg',
        alt: 'Two muses dancing on the beach with flowing scarves',
        aspectRatio: 'landscape',
        caption: 'Evening ritual choreo',
      },
      {
        id: 'maradji-image-04',
        type: 'image',
        src: '/assets/campaigns/maradji-ibiza/maradji-ibiza-carousel-01.jpg',
        alt: 'Ibiza cove with styling rack on rocks',
        aspectRatio: 'landscape',
        caption: 'On-location styling hub',
      },
    ],
  },
  {
    id: 'almaaz-kenya',
    title: 'Almaaz - Savannah Bloom in Kenya',
    destination: 'Laikipia & Masai Mara',
    headline: 'High jewellery staged between red earth plains and night-blooming acacia.',
    description:
      'A traveling studio mixing editorial film, documentary portraits, and sonic textures recorded with local collectives. The Almaaz team co-created ritual scenography with the communities that guard the conservancies.',
    heroVideo: '/assets/campaigns/almaaz-kenya/almaaz-kenya-story.mp4',
    heroPoster: '/assets/campaigns/almaaz-kenya/almaaz-kenya-cover.jpg',
    heroCaption: 'Immersive reel, 60 s loop',
    highlights: [
      'Dusk portraits with mirrored light rigs',
      'Helicopter scouting across the conservancy',
      'Night fireside sound recordings',
    ],
    media: [
      {
        id: 'almaaz-image-01',
        type: 'image',
        src: '/assets/campaigns/almaaz-kenya/almaaz-kenya-carousel-02.jpg',
        alt: 'Model in Almaaz jewellery framed by acacia branches',
        aspectRatio: 'portrait',
        caption: 'Golden hour portrait',
      },
      {
        id: 'almaaz-image-02',
        type: 'image',
        src: '/assets/campaigns/almaaz-kenya/almaaz-kenya-gallery-03.jpg',
        alt: 'Almaaz collection styled on terracotta fabric in the savannah',
        aspectRatio: 'landscape',
        caption: 'Material altar setup',
      },
      {
        id: 'almaaz-image-03',
        type: 'image',
        src: '/assets/campaigns/almaaz-kenya/almaaz-kenya-gallery-05.jpg',
        alt: 'Storyteller rehearsing ritual with jewellery under night sky',
        aspectRatio: 'landscape',
        caption: 'Night ritual rehearsal',
      },
      {
        id: 'almaaz-image-04',
        type: 'image',
        src: '/assets/campaigns/almaaz-kenya/almaaz-kenya-gallery-07.jpg',
        alt: 'Landscape vista with giraffes near art installation',
        aspectRatio: 'landscape',
        caption: 'Savannah installation',
      },
      {
        id: 'almaaz-image-05',
        type: 'image',
        src: '/assets/campaigns/almaaz-kenya/almaaz-kenya-carousel-05.jpg',
        alt: 'Close-up of Almaaz bracelet with beaded textiles',
        aspectRatio: 'portrait',
        caption: 'Tactile macro detail',
      },
    ],
  },
  {
    id: 'craie-maroc',
    title: 'Craie Studio - Atlas Mirage',
    destination: 'Agafay desert & Marrakech',
    headline: 'Slow-crafted leather staged in mineral dunes and lantern-lit riads.',
    description:
      'We composed a five day story arc moving from dawn dunes to night medina roofscapes. The crew alternated Steadicam tracking with handheld poetry to honour the texture-forward DNA of Craie.',
    heroVideo: '/assets/campaigns/craie-maroc/craie-maroc-story-02.mp4',
    heroPoster: '/assets/campaigns/craie-maroc/craie-maroc-gallery-01.jpg',
    heroCaption: 'Reel edit, 55 s loop',
    highlights: [
      'Mirage shoot with anamorphic lenses',
      'Sound bath in a desert nomad tent',
      'Nightfall lookbook in ochre medina',
    ],
    media: [
      {
        id: 'craie-video-01',
        type: 'video',
        src: '/assets/campaigns/craie-maroc/craie-maroc-story-03.mp4',
        alt: 'Craie Studio muse walking through desert camp',
        poster: '/assets/campaigns/craie-maroc/craie-maroc-gallery-02.jpg',
        aspectRatio: 'landscape',
        caption: 'Dune walk sequence',
      },
      {
        id: 'craie-image-01',
        type: 'image',
        src: '/assets/campaigns/craie-maroc/craie-maroc-carousel-01.jpg',
        alt: 'Leather goods styled on dune crest',
        aspectRatio: 'landscape',
        caption: 'Atlas sunrise still life',
      },
      {
        id: 'craie-image-02',
        type: 'image',
        src: '/assets/campaigns/craie-maroc/craie-maroc-gallery-04.jpg',
        alt: 'Model reclining in desert tent with lanterns',
        aspectRatio: 'portrait',
        caption: 'Nomad tent portrait',
      },
      {
        id: 'craie-image-03',
        type: 'image',
        src: '/assets/campaigns/craie-maroc/craie-maroc-gallery-05.jpg',
        alt: 'Night scene of medina rooftop dinner',
        aspectRatio: 'landscape',
        caption: 'Medina rooftop finale',
      },
      {
        id: 'craie-image-04',
        type: 'image',
        src: '/assets/campaigns/craie-maroc/craie-maroc-carousel-05.jpg',
        alt: 'Close-up of Craie bag with perforated leather pattern',
        aspectRatio: 'portrait',
        caption: 'Material close-up',
      },
    ],
  },
];

export default async function Home() {
  const conceptSections = await getConceptNarrative();
  const highlightedConcepts = conceptSections.slice(0, 3);

  return (
    <div className="snap-screen relative h-screen overflow-y-scroll">
      <section className="snap-section relative flex min-h-screen flex-col justify-end overflow-hidden px-6 pb-16 pt-24 text-white sm:px-10 lg:px-20">
        <video className="absolute inset-0 size-full object-cover" autoPlay muted loop playsInline>
          <source src={heroVideoSrc} />
        </video>
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/45 to-black/10" />
        <div className="relative z-10 flex flex-col gap-16">
          <div className="max-w-4xl space-y-10">
            <GlowTitle
              eyebrow="Beeyondtheworld Atelier"
              title={
                <>
                  Tailor-made journeys
                  <br />
                  for heritage maisons
                </>
              }
              description="A curated selection of residencies, sea escapes, and moving studios designed as intimate reveal journeys. Each program ships with pre-produced video boards so your teams can feel the narrative before boarding."
              glowTone="umber"
            />
            <div className="grid gap-6 text-xs uppercase tracking-[0.45em] text-white/80 sm:grid-cols-2">
              <span className="rounded-full border border-white/30 px-5 py-3 text-center">
                Three signature journeys 2025
              </span>
              <span className="rounded-full border border-white/30 px-5 py-3 text-center">
                Three campaigns already delivered
              </span>
            </div>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-6 text-[11px] uppercase tracking-[0.5em] text-white/70">
            <span>Scroll to explore</span>
            <span className="h-px w-24 bg-white/45" aria-hidden />
            <Button
              asChild
              variant="ghost"
              className="border border-white/40 bg-white/10 px-10 py-5 font-display text-[11px] uppercase tracking-[0.45em] text-white hover:bg-white/25"
            >
              <Link href="mailto:hello@beeyondtheworld.com?subject=Co-create%20a%20journey">
                Co-create a journey
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="snap-section flex min-h-screen flex-col justify-center gap-16 bg-gradient-to-b from-black via-black to-zinc-900 px-6 py-16 text-white sm:px-10 lg:px-20">
        <GlowTitle
          eyebrow="Journeys 2025"
          title="Three journeys ready with our local partners"
          description="Permits, hospitality buy-ins, and production boards are already secured. Swap in your house codes and we start pre-boarding your teams."
          glowTone="dawn"
        />
        <div className="space-y-16">
          {journeyShowcases.map((journey) => (
            <article
              key={journey.id}
              className="space-y-10 rounded-[48px] border border-white/15 bg-white/10 p-10 shadow-aurora backdrop-blur-2xl"
            >
              <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
                <div className="space-y-6">
                  <div className="flex items-center gap-6 text-xs uppercase tracking-[0.45em] text-white/70">
                    <span>{journey.locale}</span>
                    <span className="h-px flex-1 bg-white/25" aria-hidden />
                    <span>{journey.timeframe}</span>
                  </div>
                  <h3 className="font-display text-3xl uppercase tracking-[0.18em]">
                    {journey.title}
                  </h3>
                  <p className="text-sm uppercase tracking-[0.3em] text-white/60">
                    {journey.headline}
                  </p>
                  <p className="text-sm leading-relaxed text-white/75">{journey.description}</p>
                  <ul className="flex flex-wrap gap-3 text-[11px] uppercase tracking-[0.35em] text-white/75">
                    {journey.highlights.map((highlight) => (
                      <li key={highlight} className="rounded-full border border-white/30 px-4 py-2">
                        {highlight}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="rounded-[36px] border border-white/15 bg-black/30 p-6">
                  <MediaMasonry items={journey.gallery} columns={3} />
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="snap-section flex min-h-screen flex-col justify-center gap-16 bg-gradient-to-b from-stone-100 via-white to-stone-100 px-6 py-16 text-foreground sm:px-10 lg:px-20">
        <GlowTitle
          eyebrow="Campaigns delivered"
          title="Immersive tales already in market"
          description="Three productions that blend documentary nuance with cinematic craft. Each storyline is modular, letting your teams deploy content from teaser to flagship reveal."
          glowTone="honey"
        />
        <div className="space-y-16">
          {campaignShowcases.map((campaign) => (
            <article
              key={campaign.id}
              className="space-y-10 rounded-[48px] border border-foreground/10 bg-white/80 p-10 text-foreground shadow-aurora"
            >
              <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
                <ImmersiveVideo
                  src={campaign.heroVideo}
                  poster={campaign.heroPoster}
                  caption={campaign.heroCaption}
                  overlayContent={
                    <div className="flex w-full flex-col gap-2 text-left uppercase tracking-[0.35em] text-white">
                      <span>{campaign.destination}</span>
                      <span className="text-xs tracking-[0.3em] text-white/70">
                        {campaign.heroCaption}
                      </span>
                    </div>
                  }
                  className="bg-black/80"
                />
                <div className="space-y-6">
                  <p className="text-xs uppercase tracking-[0.45em] text-foreground/55">
                    {campaign.destination}
                  </p>
                  <h3 className="font-display text-3xl uppercase tracking-[0.18em]">
                    {campaign.title}
                  </h3>
                  <p className="text-sm uppercase tracking-[0.3em] text-foreground/60">
                    {campaign.headline}
                  </p>
                  <p className="text-sm leading-relaxed text-foreground/70">
                    {campaign.description}
                  </p>
                  <ul className="flex flex-wrap gap-3 text-[11px] uppercase tracking-[0.35em] text-foreground/65">
                    {campaign.highlights.map((highlight) => (
                      <li
                        key={highlight}
                        className="rounded-full border border-foreground/20 px-4 py-2"
                      >
                        {highlight}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              <div className="rounded-[36px] border border-foreground/10 bg-neutral-950/90 p-6 text-white">
                <MediaMasonry items={campaign.media} columns={3} />
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="snap-section relative flex min-h-screen flex-col justify-center overflow-hidden px-6 py-16 text-white sm:px-10 lg:px-20">
        <video className="absolute inset-0 size-full object-cover" autoPlay muted loop playsInline>
          <source src="/assets/concept/sustainable.mp4" />
        </video>
        <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
        <div className="relative z-10 space-y-14">
          <GlowTitle
            eyebrow="Concept framework"
            title="Sustainability laced into every production"
            description="From low-impact travel design to regenerative give-back, the concept framework keeps each activation honest and future ready."
            align="center"
            glowTone="honey"
          />
          <div className="grid gap-8 lg:grid-cols-3">
            {highlightedConcepts.map((section) => (
              <div
                key={section.id}
                className="flex h-full flex-col gap-6 rounded-[32px] border border-white/25 bg-white/10 p-9 text-white backdrop-blur-xl"
              >
                <div className="space-y-3">
                  <p className="font-display text-xs uppercase tracking-[0.4em] text-white/70">
                    {section.title}
                  </p>
                  <p className="font-display text-2xl uppercase tracking-[0.18em] text-white">
                    {section.description}
                  </p>
                </div>
                {section.bulletPoints ? (
                  <ul className="space-y-3 text-sm text-white/75">
                    {section.bulletPoints.map((point) => (
                      <li key={point} className="flex items-start gap-3">
                        <span className="mt-1 size-1.5 rounded-full bg-white/50" aria-hidden />
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                ) : null}
                <Button
                  asChild
                  variant="ghost"
                  className="mt-auto inline-flex items-center gap-2 self-start px-0 font-display text-[11px] uppercase tracking-[0.4em] text-white hover:text-white"
                >
                  <Link href={`/concept#${section.id}`}>Deep dive</Link>
                </Button>
              </div>
            ))}
          </div>
          <div className="flex flex-wrap items-center justify-center gap-6 text-xs uppercase tracking-[0.4em] text-white/70">
            <span className="rounded-full border border-white/30 px-5 py-3">
              Impact reporting templates ready
            </span>
            <span className="rounded-full border border-white/30 px-5 py-3">
              Local partners onboarded
            </span>
            <Button
              asChild
              variant="ghost"
              className="border border-white/35 bg-white/10 px-10 py-4 font-display text-[11px] uppercase tracking-[0.45em] text-white hover:bg-white/25"
            >
              <Link href="mailto:hello@beeyondtheworld.com?subject=Schedule%20a%20concept%20review">
                Schedule a concept review
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
