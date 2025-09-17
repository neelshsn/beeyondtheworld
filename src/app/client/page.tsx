import { SeasonCarousel } from '@/app/client/_components/season-carousel';
import { ClientJourneyDashboard } from '@/app/client/_components/client-journey-dashboard';
import { AssetPlaceholder, GlowTitle } from '@/components/primitives';
import { clientJourneys } from '@/data/client-journeys';

const heroPlaceholder = {
  label: 'Client lobby hero',
  fileName: 'client-hero.mp4',
  placement: 'public/assets/client/lobby',
  recommendedDimensions: '1920x1080 | MP4 15-20s',
  type: 'video' as const,
};

export default function ClientHomePage() {
  const spotlightJourney = clientJourneys[0];

  return (
    <div className="space-y-16">
      {spotlightJourney ? (
        <section className="grid gap-10 rounded-[48px] border border-foreground/15 bg-white/70 p-8 backdrop-blur lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
          <div className="space-y-6">
            <GlowTitle
              eyebrow="Current signature"
              title={spotlightJourney.title}
              description={spotlightJourney.summary}
              align="left"
              glowTone="honey"
            />
            <div className="flex flex-wrap gap-3 text-xs uppercase tracking-[0.35em] text-foreground/55">
              <span className="rounded-full border border-foreground/20 px-3 py-1">
                {spotlightJourney.country}
              </span>
              <span className="rounded-full border border-foreground/20 px-3 py-1">
                {spotlightJourney.budgetRange}
              </span>
              <span className="rounded-full border border-foreground/20 px-3 py-1">
                {spotlightJourney.regionTags.join(' / ')}
              </span>
            </div>
          </div>
          <div className="space-y-3">
            <AssetPlaceholder {...heroPlaceholder} className="h-[260px] w-full rounded-[38px]" />
            <div className="flex flex-wrap items-center justify-between gap-4 text-[11px] uppercase tracking-[0.35em] text-foreground/55">
              <span>
                {'Upload -> '}
                {heroPlaceholder.fileName}
              </span>
              <span>
                {'Folder -> '}
                {heroPlaceholder.placement}
              </span>
            </div>
          </div>
        </section>
      ) : null}

      <SeasonCarousel journeys={clientJourneys} />

      <ClientJourneyDashboard journeys={clientJourneys} />
    </div>
  );
}
