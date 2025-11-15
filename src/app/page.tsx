import Image from 'next/image';
import Link from 'next/link';
import {
  CalendarDays,
  Clapperboard,
  Compass,
  Instagram,
  Linkedin,
  MapPin,
  Wand2,
} from 'lucide-react';
import { getSupabaseServerClient } from '@/lib/supabase/server-client';

import { GlowTitle } from '@/components/primitives';
import { WhatWeDoSection, type WhatWeDoSectionProps } from '@/app/_components/what-we-do-section';
import SplitText from '@/components/SplitText';
import { Button } from '@/components/ui/button';
import { campaignShowcases, journeyShowcases } from '@/data/showcases';
import type { CampaignShowcase, JourneyShowcase } from '@/data/showcases';

type ShowcaseEntry =
  | { kind: 'journey'; id: string; journey: JourneyShowcase }
  | { kind: 'campaign'; id: string; campaign: CampaignShowcase };

const heroVideoSrc = '/assets/home/main-background-hero-home.mp4';

function JourneyCard({ journey }: { journey: JourneyShowcase }) {
  return (
    <article className="group relative isolate flex min-h-[806px] w-full items-center justify-center overflow-hidden">
      <Image
        src={journey.hero.src}
        alt={journey.hero.alt}
        fill
        className="ease-[cubic-bezier(0.22,1,0.36,1)] absolute inset-0 size-full object-cover transition-[transform,opacity] duration-700"
        sizes="(max-width: 768px) 100vw, 80vw"
        priority={journey.id === 'philippines'}
      />
      <div className="ease-[cubic-bezier(0.22,1,0.36,1)] pointer-events-none absolute inset-0 bg-black/55 transition-colors duration-500 group-hover:bg-black/40" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-36 bg-[linear-gradient(to_bottom,rgba(6,8,12,0.92)_0%,rgba(6,8,12,0.55)_60%,rgba(6,8,12,0)_100%)]" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[52%] bg-[linear-gradient(to_top,rgba(6,8,12,0.9)_0%,rgba(6,8,12,0.48)_58%,rgba(6,8,12,0)_100%)]" />
      <div className="ease-[cubic-bezier(0.22,1,0.36,1)] relative z-20 mx-auto flex w-full max-w-4xl flex-col items-center justify-center gap-10 px-6 py-20 text-center text-white transition-transform duration-500 sm:px-10">
        <div className="flex flex-wrap items-center justify-center gap-4 text-[11px] uppercase tracking-[0.32em] text-white/75 drop-shadow-[0_8px_18px_rgba(0,0,0,0.55)]">
          <span className="flex items-center gap-2">
            <MapPin className="size-3.5" aria-hidden />
            {journey.locale}
          </span>
          <span className="hidden h-px w-16 bg-white/35 sm:block" aria-hidden />
          <span className="flex items-center gap-2">
            <CalendarDays className="size-3.5" aria-hidden />
            {journey.timeframe}
          </span>
        </div>
        <div className="max-w-3xl space-y-5 text-center">
          <SplitText
            text={journey.title}
            tag="h3"
            splitType="words"
            className="font-title text-4xl uppercase tracking-[0em] text-white drop-shadow-[0_28px_60px_rgba(0,0,0,0.7)] sm:text-[2.9rem]"
            textAlign="center"
          />
          <p className="text-sm leading-relaxed text-white/85 drop-shadow-[0_12px_32px_rgba(0,0,0,0.55)] sm:text-base">
            {journey.summary}
          </p>
        </div>
        <Button
          asChild
          className="group relative inline-flex items-center justify-center gap-4 overflow-hidden rounded-full border border-white/55 bg-white/10 px-16 py-5 font-display text-[11px] uppercase tracking-[0.5em] text-white transition-colors duration-300 [transition-timing-function:var(--bee-ease)] hover:border-white hover:bg-white/15 focus-visible:ring-[#f6c452]/35"
        >
          <Link
            href={`/journeys/${journey.slug}`}
            className="relative inline-flex items-center justify-center gap-4"
          >
            <span
              aria-hidden
              className="pointer-events-none absolute inset-0 z-0 -translate-x-full bg-gradient-to-r from-transparent via-[#f6c452bf] to-transparent opacity-0 transition-transform duration-500 group-hover:translate-x-full group-hover:opacity-100"
            />
            <span className="relative z-10">Open Journey</span>
          </Link>
        </Button>
      </div>
    </article>
  );
}

function CampaignCard({ campaign }: { campaign: CampaignShowcase }) {
  return (
    <article className="group relative isolate flex min-h-[806px] w-full items-center justify-center overflow-hidden">
      <video
        className="ease-[cubic-bezier(0.22,1,0.36,1)] absolute inset-0 size-full object-cover transition-[transform,opacity] duration-700"
        autoPlay
        muted
        loop
        playsInline
        poster={campaign.hero.poster}
      >
        <source src={campaign.hero.src} />
      </video>
      <div className="ease-[cubic-bezier(0.22,1,0.36,1)] pointer-events-none absolute inset-0 bg-black/55 transition-colors duration-500 group-hover:bg-black/40" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-36 bg-[linear-gradient(to_bottom,rgba(6,8,12,0.92)_0%,rgba(6,8,12,0.55)_60%,rgba(6,8,12,0)_100%)]" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[52%] bg-[linear-gradient(to_top,rgba(6,8,12,0.9)_0%,rgba(6,8,12,0.48)_58%,rgba(6,8,12,0)_100%)]" />
      <div className="ease-[cubic-bezier(0.22,1,0.36,1)] relative z-20 mx-auto flex w-full max-w-4xl flex-col items-center justify-center gap-10 px-6 py-20 text-center text-white transition-transform duration-500 sm:px-10">
        <div className="flex flex-wrap items-center justify-center gap-4 text-[11px] uppercase tracking-[0.32em] text-white/75 drop-shadow-[0_8px_18px_rgba(0,0,0,0.55)]">
          <span className="flex items-center gap-2">
            <MapPin className="size-3.5" aria-hidden />
            {campaign.destination}
          </span>
          <span className="hidden h-px w-16 bg-white/35 sm:block" aria-hidden />
          <span className="flex items-center gap-2">
            <Clapperboard className="size-3.5" aria-hidden />
            {campaign.headline}
          </span>
        </div>
        <div className="max-w-3xl space-y-5 text-center">
          <SplitText
            text={campaign.title}
            tag="h3"
            splitType="words"
            className="font-title text-4xl uppercase tracking-[0em] text-white drop-shadow-[0_28px_60px_rgba(0,0,0,0.7)] sm:text-[2.9rem]"
            textAlign="center"
          />
          <p className="text-sm leading-relaxed text-white/85 drop-shadow-[0_12px_32px_rgba(0,0,0,0.55)] sm:text-base">
            {campaign.summary}
          </p>
        </div>
        <Button
          asChild
          className="group relative inline-flex items-center justify-center gap-4 overflow-hidden rounded-full border border-white/55 bg-white/10 px-16 py-5 font-display text-[11px] uppercase tracking-[0.5em] text-white transition-colors duration-300 [transition-timing-function:var(--bee-ease)] hover:border-white hover:bg-white/15 focus-visible:ring-[#f6c452]/35"
        >
          <Link
            href={`/campaigns/${campaign.slug}`}
            className="relative inline-flex items-center justify-center gap-4"
          >
            <span
              aria-hidden
              className="pointer-events-none absolute inset-0 z-0 -translate-x-full bg-gradient-to-r from-transparent via-[#f6c452bf] to-transparent opacity-0 transition-transform duration-500 group-hover:translate-x-full group-hover:opacity-100"
            />
            <span className="relative z-10">Open Campaign</span>
          </Link>
        </Button>
      </div>
    </article>
  );
}

export default async function Home() {
  const supabase = await getSupabaseServerClient();
  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();
  const coCreateHref = !sessionError && session ? '/journeys' : '/login';

  const alternatingShowcases: ShowcaseEntry[] = [];

  journeyShowcases.forEach((journey, index) => {
    alternatingShowcases.push({ kind: 'journey', id: `journey-${journey.id}`, journey });
    const linkedCampaign = campaignShowcases[index];
    if (linkedCampaign) {
      alternatingShowcases.push({
        kind: 'campaign',
        id: `campaign-${linkedCampaign.id}`,
        campaign: linkedCampaign,
      });
    }
  });
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
        src: '/assets/journeys/philippines/philippines-gallery-07.png',
        alt: 'Jungle cinema installation from the Philippines journey',
      },
    },
  ];

  const whatWeDoDeliverables = [
    'Hero film edits',
    'Lookbook & e-comm stills',
    'BTS & soundscapes',
    'Impact reporting suite',
    'Talent casting & styling',
    'Community reinvestment ledger',
    'Launch microsites',
    'CRM-ready asset library',
  ];

  return (
    <main className="flex flex-col">
      <section className="relative isolate flex min-h-[92svh] flex-col justify-end overflow-hidden text-white">
        <video
          className="absolute inset-0 z-0 h-full w-full object-cover"
          autoPlay
          muted
          loop
          playsInline
        >
          <source src={heroVideoSrc} />
        </video>
        <div className="relative z-20 flex flex-col gap-8 px-6 pb-32 pt-24 sm:px-10 lg:px-20">
          <div className="max-w-3xl space-y-6">
            <p className="flex items-center gap-2 text-xs uppercase tracking-[0.45em] text-white/80 drop-shadow-[0_3px_12px_rgba(0,0,0,0.65)]">
              <Wand2 className="size-4" aria-hidden /> Beeyondtheworld Atelier
            </p>
            <SplitText
              text="Co-travel dreamcraft for fashion and lifestyle brands"
              tag="h1"
              splitType="words, chars"
              className="font-title text-5xl uppercase leading-tight tracking-[0em] text-white drop-shadow-[0_12px_32px_rgba(0,0,0,0.55)] sm:text-6xl"
              textAlign="left"
            />
            <p className="max-w-2xl text-sm leading-relaxed text-white/85 drop-shadow-[0_6px_20px_rgba(0,0,0,0.55)]">
              Beeyondtheworld whispers dreamlike production tales. We weave non-competing brands
              into shared journeys, letting them share the same wind, crews, and glow while their
              stories stay singular and luminous.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-6">
            <Button
              asChild
              className="group relative inline-flex items-center justify-center gap-4 overflow-hidden rounded-full border border-white/55 bg-white/10 px-16 py-5 font-display text-[11px] uppercase tracking-[0.5em] text-white transition-colors duration-300 [transition-timing-function:var(--bee-ease)] hover:border-white hover:bg-white/15 focus-visible:ring-[#f6c452]/35"
            >
              <Link
                href={coCreateHref}
                className="relative inline-flex items-center justify-center gap-4"
              >
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-0 z-0 -translate-x-full bg-gradient-to-r from-transparent via-[#f6c452bf] to-transparent opacity-0 transition-transform duration-500 group-hover:translate-x-full group-hover:opacity-100"
                />
                <span className="relative z-10">Co-create a journey</span>
              </Link>
            </Button>
            <Button
              asChild
              className="group relative inline-flex items-center justify-center gap-4 overflow-hidden rounded-full border border-white/45 bg-white/10 px-16 py-5 font-display text-[11px] uppercase tracking-[0.5em] text-white transition-colors duration-300 [transition-timing-function:var(--bee-ease)] hover:border-white hover:bg-white/15 focus-visible:ring-[#f6c452]/35"
            >
              <Link
                href="/concept"
                className="relative inline-flex items-center justify-center gap-4"
              >
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-0 z-0 -translate-x-full bg-gradient-to-r from-transparent via-[#f6c452bf] to-transparent opacity-0 transition-transform duration-500 group-hover:translate-x-full group-hover:opacity-100"
                />
                <span className="relative z-10">Discover the concept</span>
              </Link>
            </Button>
          </div>
        </div>
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-[18svh] bg-[linear-gradient(to_bottom,rgba(253,249,238,0)_0%,rgba(253,249,238,0)_40%,rgba(253,249,238,0.32)_68%,#fdf9ee_100%)] backdrop-blur-[2.5px] sm:h-[20svh] sm:backdrop-blur-[4px] lg:h-[22svh]"
        />
        <div className="absolute bottom-12 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2 text-[11px] uppercase tracking-[0.4em] text-white/75">
          <Compass className="size-4" aria-hidden />
          <span>Scroll to discover</span>
        </div>
      </section>

      <WhatWeDoSection
        eyebrow="What we do"
        title={
          <SplitText
            text="Creative productions shared across co-travels"
            tag="h2"
            splitType="words"
            className="font-title text-4xl uppercase leading-[1.1] text-foreground sm:text-5xl md:text-6xl"
            textAlign="center"
          />
        }
        description="Journeys breathe like roaming ateliers: brands co-create cinematic tales, share resources, and sail home with launch-ready magic."
        entries={whatWeDoEntries}
        deliverables={whatWeDoDeliverables}
      />

      <section className="flex flex-col gap-14 bg-gradient-to-b from-white via-white to-stone-100 pb-0 pt-24">
        <div className="px-6 text-center sm:px-10 lg:px-20">
          <GlowTitle
            eyebrow="Journeys & campaigns"
            title="Explore the journeys and films awaiting brands"
            description="Alternating cards unveil the pulse of each tale. Drift inside to open dream-sheets with itineraries, credits, and immersive galleries."
            align="center"
            glowTone="dawn"
          />
        </div>
        <div className="flex flex-col">
          {alternatingShowcases.map((entry) =>
            entry.kind === 'journey' ? (
              <JourneyCard key={entry.id} journey={entry.journey} />
            ) : entry.kind === 'campaign' ? (
              <CampaignCard key={entry.id} campaign={entry.campaign} />
            ) : null
          )}
        </div>
      </section>

      <section className="relative flex min-h-[70vh] flex-col justify-center overflow-hidden px-6 pb-28 pt-10 text-white sm:px-10 lg:px-20">
        <video className="absolute inset-0 size-full object-cover" autoPlay muted loop playsInline>
          <source src="/assets/concept/sustainable.mp4" />
        </video>
        <div className="pointer-events-none absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-[#101b24]/85 via-[#101b24]/45 to-transparent sm:h-28 lg:h-36" />
        <div className="absolute inset-0 bg-black/65 backdrop-blur-sm" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-b from-transparent via-[#fdf9ee]/25 to-[#fdf9ee] backdrop-blur-[3px] sm:h-32 lg:h-36" />
        <div className="relative z-10 mx-auto flex max-w-3xl flex-col items-center gap-8 text-center">
          <span className="font-display text-xs uppercase tracking-[0.4em] text-white/65">
            Concept teaser
          </span>
          <SplitText
            text="Dream-sustained by design, luminous in delivery"
            tag="h2"
            splitType="words"
            className="font-title text-4xl uppercase leading-[1.1] text-white sm:text-5xl"
            textAlign="center"
          />
          <p className="text-center text-base leading-relaxed text-white/75">
            Journeys follow a three-part spell that softens footprint, heals destinations, and
            leaves every brand with transparent, heart-lit proof.
          </p>
          <Button
            asChild
            className="group relative inline-flex items-center justify-center gap-4 overflow-hidden rounded-full border border-white/55 bg-white/10 px-16 py-5 font-display text-[11px] uppercase tracking-[0.5em] text-white transition-colors duration-300 [transition-timing-function:var(--bee-ease)] hover:border-white hover:bg-white/15 focus-visible:ring-[#f6c452]/35"
          >
            <Link href="/concept">Explore the concept</Link>
          </Button>
        </div>
      </section>
      <footer className="bg-[#fdf9ee] px-6 py-16 sm:px-10 lg:px-20">
        <div className="mx-auto flex max-w-6xl flex-col gap-8 border-t border-[#efc070]/30 pt-10">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <p className="font-display text-xs uppercase tracking-[0.4em] text-foreground/60">
              Beeyondtheworld
            </p>
            <nav className="flex flex-wrap gap-6 text-xs uppercase tracking-[0.35em] text-foreground/70">
              <Link href="/" className="transition hover:text-foreground">
                Home
              </Link>
              <Link href="/concept" className="transition hover:text-foreground">
                Concept
              </Link>
              <Link href="/journeys" className="transition hover:text-foreground">
                Journeys
              </Link>
              <Link href="/campaigns" className="transition hover:text-foreground">
                Campaigns
              </Link>
              <Link href="/contact" className="transition hover:text-foreground">
                Contact
              </Link>
            </nav>
          </div>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <span className="text-xs uppercase tracking-[0.35em] text-foreground/45">
              Follow the journey
            </span>
            <div className="flex items-center gap-4">
              <Link
                href="https://instagram.com/beeyondtheworld.co"
                target="_blank"
                rel="noreferrer"
                className="inline-flex size-10 items-center justify-center rounded-full border border-[#efc070]/40 bg-white/70 text-foreground/70 transition hover:bg-white hover:text-foreground"
              >
                <Instagram className="size-5" aria-hidden />
                <span className="sr-only">Instagram</span>
              </Link>
              <Link
                href="https://www.linkedin.com/company/beeyondtheworld"
                target="_blank"
                rel="noreferrer"
                className="inline-flex size-10 items-center justify-center rounded-full border border-[#efc070]/40 bg-white/70 text-foreground/70 transition hover:bg-white hover:text-foreground"
              >
                <Linkedin className="size-5" aria-hidden />
                <span className="sr-only">LinkedIn</span>
              </Link>
            </div>
          </div>
          <div className="flex flex-col gap-2 text-xs uppercase tracking-[0.35em] text-foreground/35 md:flex-row md:items-center md:justify-between">
            <span>Copyright {new Date().getFullYear()} Beeyondtheworld</span>
            <span>Co-travel dreamcraft for brands</span>
          </div>
        </div>
      </footer>
    </main>
  );
}
