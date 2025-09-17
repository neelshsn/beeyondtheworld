import Image from 'next/image';
import Link from 'next/link';
import { CalendarDays, Compass, MapPin, Sparkles } from 'lucide-react';

import { SeasonCarousel } from '@/app/client/_components/season-carousel';
import { ClientJourneyDashboard } from '@/app/client/_components/client-journey-dashboard';
import { GlowTitle } from '@/components/primitives';
import { Button } from '@/components/ui/button';
import { clientJourneys } from '@/data/client-journeys';

export default function ClientHomePage() {
  const spotlightJourney = clientJourneys[0];

  return (
    <div className="space-y-16">
      {spotlightJourney ? (
        <section className="relative overflow-hidden rounded-2xl border border-white/20 bg-white/65 shadow-[0_35px_120px_-70px_rgba(24,28,45,0.65)]">
          <Image
            src={spotlightJourney.heroPoster}
            alt={spotlightJourney.title}
            fill
            priority
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 70vw"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-black/75 via-black/35 to-transparent" />
          <div className="relative z-10 grid gap-10 px-6 py-12 text-white sm:px-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <div className="space-y-6">
              <GlowTitle
                eyebrow="Spotlight residency"
                title={spotlightJourney.title}
                description={spotlightJourney.summary}
                align="left"
                glowTone="honey"
              />
              <div className="flex flex-wrap gap-3 text-[11px] uppercase tracking-[0.35em] text-white/75">
                <span className="flex items-center gap-2 rounded-full border border-white/35 px-4 py-2">
                  <MapPin className="size-3.5" aria-hidden /> {spotlightJourney.country}
                </span>
                <span className="flex items-center gap-2 rounded-full border border-white/35 px-4 py-2">
                  <Compass className="size-3.5" aria-hidden />{' '}
                  {spotlightJourney.regionTags.join(' / ')}
                </span>
                <span className="flex items-center gap-2 rounded-full border border-white/35 px-4 py-2">
                  <CalendarDays className="size-3.5" aria-hidden />
                  {new Date(spotlightJourney.startDate).toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                  })}
                  {' – '}
                  {new Date(spotlightJourney.endDate).toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                  })}
                </span>
              </div>
              <Button
                asChild
                className="rounded-full border border-white/40 bg-white/85 px-8 py-4 font-display text-[11px] uppercase tracking-[0.35em] text-foreground hover:bg-white"
              >
                <Link href={`/client/journeys/${spotlightJourney.slug}`}>
                  Open spotlight journey
                </Link>
              </Button>
            </div>
            <div className="bg-white/12 space-y-4 rounded-xl border border-white/30 p-6 backdrop-blur">
              <GlowTitle
                eyebrow="Quick facts"
                title="What the maison receives"
                description={null}
                align="left"
                glowTone="dawn"
              />
              <ul className="space-y-3 text-sm text-white/80">
                {spotlightJourney.deliverables.slice(0, 3).map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <Sparkles className="mt-0.5 size-4" aria-hidden />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      ) : null}

      <SeasonCarousel journeys={clientJourneys} />

      <section className="space-y-6">
        <GlowTitle
          eyebrow="Client journeys"
          title="Navigate upcoming residencies"
          description="Filter by destination, budget, or season, explore the gallery previews, then dive into the dedicated sheet."
          align="left"
          glowTone="honey"
        />
        <ClientJourneyDashboard journeys={clientJourneys} />
      </section>
    </div>
  );
}
