import Image from 'next/image';
import Link from 'next/link';

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
    <article className="relative overflow-hidden rounded-[48px] border border-white/40 bg-white/10 shadow-[0_40px_160px_rgba(15,20,30,0.22)] backdrop-blur">
      <Image
        src={journey.hero.src}
        alt={journey.hero.alt}
        fill
        className="object-cover"
        sizes="(max-width: 768px) 100vw, 70vw"
        priority={journey.id === 'philippines'}
      />
      <div className="absolute inset-0 bg-gradient-to-br from-white/70 via-white/35 to-transparent" />
      <div className="relative z-10 flex h-full flex-col justify-between gap-10 p-10 text-foreground">
        <div className="space-y-5">
          <div className="flex items-center gap-4 text-xs uppercase tracking-[0.45em] text-foreground/60">
            <span>{journey.locale}</span>
            <span className="h-px flex-1 bg-foreground/20" aria-hidden />
            <span>{journey.timeframe}</span>
          </div>
          <div className="space-y-4">
            <p className="text-xs uppercase tracking-[0.45em] text-foreground/55">
              Journey residency
            </p>
            <h3 className="font-display text-3xl uppercase tracking-[0.2em] text-foreground">
              {journey.title}
            </h3>
            <p className="max-w-2xl text-sm leading-relaxed text-foreground/75">
              {journey.summary}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {journey.highlights.slice(0, 3).map((highlight) => (
            <span
              key={highlight}
              className="rounded-full border border-foreground/30 bg-white/70 px-4 py-2 text-[11px] uppercase tracking-[0.35em] text-foreground/70"
            >
              {highlight}
            </span>
          ))}
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
    <article className="relative overflow-hidden rounded-[48px] border border-white/35 bg-white/10 shadow-[0_40px_160px_rgba(15,20,30,0.22)] backdrop-blur">
      <video
        className="absolute inset-0 size-full object-cover"
        autoPlay
        muted
        loop
        playsInline
        poster={campaign.hero.poster}
      >
        <source src={campaign.hero.src} />
      </video>
      <div className="absolute inset-0 bg-gradient-to-br from-white/65 via-white/25 to-transparent" />
      <div className="relative z-10 flex h-full flex-col justify-between gap-10 p-10 text-foreground">
        <div className="space-y-5">
          <div className="flex items-center gap-4 text-xs uppercase tracking-[0.45em] text-foreground/60">
            <span>{campaign.destination}</span>
            <span className="h-px flex-1 bg-foreground/20" aria-hidden />
            <span>{campaign.hero.caption}</span>
          </div>
          <div className="space-y-4">
            <p className="text-xs uppercase tracking-[0.45em] text-foreground/55">Campaign film</p>
            <h3 className="font-display text-3xl uppercase tracking-[0.2em] text-foreground">
              {campaign.title}
            </h3>
            <p className="max-w-2xl text-sm leading-relaxed text-foreground/75">
              {campaign.summary}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {campaign.highlights.slice(0, 3).map((highlight) => (
            <span
              key={highlight}
              className="rounded-full border border-foreground/30 bg-white/70 px-4 py-2 text-[11px] uppercase tracking-[0.35em] text-foreground/70"
            >
              {highlight}
            </span>
          ))}
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

  return (
    <main className="flex flex-col">
      <section className="relative flex min-h-screen flex-col justify-end overflow-hidden px-6 pb-24 pt-24 text-white sm:px-10 lg:px-20">
        <video className="absolute inset-0 size-full object-cover" autoPlay muted loop playsInline>
          <source src={heroVideoSrc} />
        </video>
        <div className="absolute inset-x-0 top-0 h-2/3 bg-gradient-to-b from-black/80 via-black/35 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-white/20" />
        <div className="relative z-10 max-w-4xl space-y-10">
          <p className="text-xs uppercase tracking-[0.45em] text-white/70">
            Beeyondtheworld Atelier
          </p>
          <h1 className="font-display text-5xl uppercase leading-tight tracking-[0.18em] text-white sm:text-6xl">
            Tailor-made journeys for heritage maisons
          </h1>
          <p className="max-w-2xl text-sm leading-relaxed text-white/80">
            Discover our 2025 residencies and the cinematic tales already delivered for partnering
            maisons. Each card opens a full sheet with immersive media, logistics, and impact
            breakdowns ready for your review.
          </p>
          <div className="flex flex-wrap items-center gap-6">
            <Button
              asChild
              className="rounded-full border border-white/60 bg-white/80 px-10 py-5 font-display text-[11px] uppercase tracking-[0.45em] text-foreground hover:bg-white"
            >
              <Link href="mailto:hello@beeyondtheworld.com?subject=Co-create%20a%20journey">
                Co-create a journey
              </Link>
            </Button>
            <span className="text-[11px] uppercase tracking-[0.4em] text-white/70">
              Scroll to discover journeys & campaigns
            </span>
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
        <div className="grid gap-12">
          {alternatingShowcases.map((entry) =>
            entry.kind === 'journey' ? (
              <JourneyCard key={entry.id} journey={entry.journey} />
            ) : entry.kind === 'campaign' && entry.campaign ? (
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
        </div>
      </section>
    </main>
  );
}
