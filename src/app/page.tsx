import Image from 'next/image';
import Link from 'next/link';
import { CalendarDays, Clapperboard, Compass, MapPin, Sparkles, Wand2 } from 'lucide-react';

import { GlowTitle } from '@/components/primitives';
import { Button } from '@/components/ui/button';
import { campaignShowcases, journeyShowcases } from '@/data/showcases';
import type { CampaignShowcase, JourneyShowcase } from '@/data/showcases';
import { getConceptNarrative } from '@/lib/cms/fetchers';

type ShowcaseEntry =
  | { kind: 'journey'; id: string; journey: JourneyShowcase }
  | { kind: 'campaign'; id: string; campaign: CampaignShowcase };

const heroVideoSrc = '/assets/home/main-background-hero-home.mp4';

function JourneyCard({ journey }: { journey: JourneyShowcase }) {
  return (
    <article className="bg-white/14 group relative overflow-hidden rounded-xl shadow-[0_40px_120px_-60px_rgba(26,35,58,0.55)] backdrop-blur-xl">
      <Image
        src={journey.hero.src}
        alt={journey.hero.alt}
        fill
        className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
        sizes="(max-width: 768px) 100vw, 80vw"
        priority={journey.id === 'philippines'}
      />
      <div className="absolute inset-0 bg-gradient-to-br from-white/70 via-white/25 to-transparent" />
      <div className="relative z-10 flex h-full flex-col justify-between gap-8 p-10 text-foreground">
        <div className="space-y-5">
          <div className="flex flex-wrap items-center gap-4 text-xs uppercase tracking-[0.4em] text-foreground/65">
            <span className="flex items-center gap-2">
              <MapPin className="size-3.5" aria-hidden />
              {journey.locale}
            </span>
            <span className="h-px flex-1 bg-foreground/20" aria-hidden />
            <span className="flex items-center gap-2">
              <CalendarDays className="size-3.5" aria-hidden />
              {journey.timeframe}
            </span>
          </div>
          <div className="space-y-4">
            <h3 className="font-display text-3xl uppercase tracking-[0.18em] text-foreground">
              {journey.title}
            </h3>
            <p className="max-w-2xl text-sm leading-relaxed text-foreground/75">
              {journey.summary}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <ul className="flex flex-wrap gap-3">
            {journey.highlights.slice(0, 3).map((highlight) => (
              <li
                key={highlight}
                className="flex items-center gap-2 rounded-full border border-foreground/25 bg-white/70 px-4 py-2 text-[11px] uppercase tracking-[0.32em] text-foreground/70"
              >
                <Sparkles className="size-3.5" aria-hidden />
                <span>{highlight}</span>
              </li>
            ))}
          </ul>
          <Button
            asChild
            variant="secondary"
            className="ml-auto rounded-full border border-foreground/40 bg-foreground/90 px-8 py-3 text-[11px] uppercase tracking-[0.4em] text-white hover:bg-foreground"
          >
            <Link href={`/journeys/${journey.slug}`}>Open journey</Link>
          </Button>
        </div>
      </div>
    </article>
  );
}

function CampaignCard({ campaign }: { campaign: CampaignShowcase }) {
  return (
    <article className="bg-white/14 group relative overflow-hidden rounded-xl shadow-[0_40px_120px_-60px_rgba(26,35,58,0.55)] backdrop-blur-xl">
      <video
        className="absolute inset-0 size-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
        autoPlay
        muted
        loop
        playsInline
        poster={campaign.hero.poster}
      >
        <source src={campaign.hero.src} />
      </video>
      <div className="absolute inset-0 bg-gradient-to-br from-white/65 via-white/20 to-transparent" />
      <div className="relative z-10 flex h-full flex-col justify-between gap-8 p-10 text-foreground">
        <div className="space-y-5">
          <div className="flex flex-wrap items-center gap-4 text-xs uppercase tracking-[0.4em] text-foreground/65">
            <span className="flex items-center gap-2">
              <MapPin className="size-3.5" aria-hidden />
              {campaign.destination}
            </span>
            <span className="h-px flex-1 bg-foreground/20" aria-hidden />
            <span className="flex items-center gap-2">
              <Clapperboard className="size-3.5" aria-hidden />
              {campaign.hero.caption}
            </span>
          </div>
          <div className="space-y-4">
            <h3 className="font-display text-3xl uppercase tracking-[0.18em] text-foreground">
              {campaign.title}
            </h3>
            <p className="max-w-2xl text-sm leading-relaxed text-foreground/75">
              {campaign.summary}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <ul className="flex flex-wrap gap-3">
            {campaign.highlights.slice(0, 3).map((highlight) => (
              <li
                key={highlight}
                className="flex items-center gap-2 rounded-full border border-foreground/25 bg-white/70 px-4 py-2 text-[11px] uppercase tracking-[0.32em] text-foreground/70"
              >
                <Sparkles className="size-3.5" aria-hidden />
                <span>{highlight}</span>
              </li>
            ))}
          </ul>
          <Button
            asChild
            variant="secondary"
            className="ml-auto rounded-full border border-foreground/40 bg-foreground/90 px-8 py-3 text-[11px] uppercase tracking-[0.4em] text-white hover:bg-foreground"
          >
            <Link href={`/campaigns/${campaign.slug}`}>Open campaign</Link>
          </Button>
        </div>
      </div>
    </article>
  );
}

export default async function Home() {
  const conceptSections = await getConceptNarrative();
  const highlightedConcepts = conceptSections.slice(0, 3);

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

  const heroStats = [
    {
      icon: Compass,
      label: 'Residencies scripted with on-ground partners',
    },
    {
      icon: Clapperboard,
      label: 'Campaign films already in market',
    },
  ];

  return (
    <main className="flex flex-col">
      <section className="relative flex min-h-screen flex-col justify-end overflow-hidden px-6 pb-24 pt-24 text-white sm:px-10 lg:px-20">
        <video className="absolute inset-0 size-full object-cover" autoPlay muted loop playsInline>
          <source src={heroVideoSrc} />
        </video>
        <div className="absolute inset-x-0 top-0 h-2/3 bg-gradient-to-b from-black/85 via-black/45 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-white/15" />
        <div className="relative z-10 max-w-4xl space-y-12">
          <p className="flex items-center gap-2 text-xs uppercase tracking-[0.45em] text-white/70">
            <Wand2 className="size-4" aria-hidden /> Beeyondtheworld Atelier
          </p>
          <h1 className="font-display text-5xl uppercase leading-tight tracking-[0.18em] text-white sm:text-6xl">
            Tailor-made journeys for heritage maisons
          </h1>
          <p className="text-white/82 max-w-2xl text-sm leading-relaxed">
            Discover our 2025 residencies and the cinematic tales already delivered for partnering
            maisons. Each card opens a full sheet with immersive media, logistics, and impact
            breakdowns ready for your review.
          </p>
          <div className="flex flex-wrap items-center gap-6">
            <Button
              asChild
              className="rounded-full border border-white/65 bg-white/85 px-10 py-5 font-display text-[11px] uppercase tracking-[0.45em] text-foreground hover:bg-white"
            >
              <Link href="mailto:hello@beeyondtheworld.com?subject=Co-create%20a%20journey">
                Co-create a journey
              </Link>
            </Button>
            <span className="flex items-center gap-2 text-[11px] uppercase tracking-[0.4em] text-white/70">
              <Compass className="size-4" aria-hidden /> Scroll to discover
            </span>
          </div>
          <div className="flex flex-wrap gap-4 text-sm text-white/80">
            {heroStats.map((stat) => (
              <span
                key={stat.label}
                className="bg-white/12 flex items-center gap-3 rounded-full border border-white/35 px-5 py-3"
              >
                <stat.icon className="size-4" aria-hidden />
                <span className="text-xs uppercase tracking-[0.35em]">{stat.label}</span>
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className="flex flex-col gap-14 bg-gradient-to-b from-white via-white to-stone-100 px-6 py-24 sm:px-10 lg:px-20">
        <GlowTitle
          eyebrow="Journeys & campaigns"
          title="Explore the residencies and films ready for maisons"
          description="Alternating cards reveal the essence of each programme. Click through to open the full sheet with itineraries, credits and immersive galleries."
          align="left"
          glowTone="dawn"
        />
        <div className="flex flex-col gap-12">
          {alternatingShowcases.map((entry) =>
            entry.kind === 'journey' ? (
              <JourneyCard key={entry.id} journey={entry.journey} />
            ) : entry.kind === 'campaign' ? (
              <CampaignCard key={entry.id} campaign={entry.campaign} />
            ) : null
          )}
        </div>
      </section>

      <section className="relative flex min-h-screen flex-col justify-center overflow-hidden px-6 py-24 text-white sm:px-10 lg:px-20">
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
                className="flex h-full flex-col gap-6 rounded-[28px] border border-white/25 bg-white/10 p-9 text-white backdrop-blur-xl"
              >
                <div className="space-y-3">
                  <p className="flex items-center gap-2 font-display text-xs uppercase tracking-[0.4em] text-white/70">
                    <Sparkles className="size-4" aria-hidden /> {section.title}
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
        </div>
      </section>
    </main>
  );
}
