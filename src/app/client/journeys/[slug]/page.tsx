import { notFound } from 'next/navigation';

import { JourneyExportButton } from '@/app/client/_components/journey-export-button';
import { JourneySectionBlock } from '@/app/client/_components/journey-section-block';
import { AssetPlaceholder, GlowTitle } from '@/components/primitives';
import { clientJourneys } from '@/data/client-journeys';

interface JourneyPageProps {
  params: Promise<{ slug: string }>;
}

export default async function ClientJourneyPage({ params }: JourneyPageProps) {
  const { slug } = await params;
  const journey = clientJourneys.find((item) => item.slug === slug);

  if (!journey) {
    notFound();
  }

  const heroPlaceholder = {
    label: `${journey.title} hero preview`,
    fileName: `${journey.slug}-hero.mp4`,
    placement: `public/assets/client/${journey.slug}`,
    recommendedDimensions: '1920x1080 | MP4 15-20s',
    type: 'video' as const,
  };

  const moodboardPlaceholders = journey.moodboard.map((_, index) => ({
    id: `${journey.slug}-moodboard-${index + 1}`,
    fileName: `${journey.slug}-moodboard-${index + 1}.jpg`,
    placement: `public/assets/client/${journey.slug}/moodboard`,
    recommendedDimensions: '1080x1350 | JPG',
  }));

  return (
    <div className="space-y-16">
      <section className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
        <div className="space-y-6">
          <GlowTitle
            eyebrow="Journey sheet"
            title={journey.title}
            description={journey.summary}
            align="left"
            glowTone="dawn"
          />
          <div className="flex flex-wrap gap-3 text-xs uppercase tracking-[0.35em] text-foreground/55">
            <span className="rounded-full border border-foreground/25 px-3 py-1">
              {journey.country}
            </span>
            <span className="rounded-full border border-foreground/25 px-3 py-1">
              {journey.budgetRange}
            </span>
            <span className="rounded-full border border-foreground/25 px-3 py-1">
              {journey.regionTags.join(' / ')}
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-4 text-xs uppercase tracking-[0.3em] text-foreground/55">
            <span>
              {new Date(journey.startDate).toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric',
              })}{' '}
              -{' '}
              {new Date(journey.endDate).toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric',
              })}
            </span>
            <JourneyExportButton />
          </div>
        </div>
        <div className="space-y-4">
          <AssetPlaceholder {...heroPlaceholder} className="h-[320px] w-full rounded-[40px]" />
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-[28px] border border-foreground/15 bg-white/60 px-5 py-3 text-[11px] uppercase tracking-[0.4em] text-foreground/55">
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

      <section className="grid gap-8 lg:grid-cols-3">
        <div className="glass-pane p-8">
          <p className="font-display text-xs uppercase tracking-[0.35em] text-foreground/55">
            Production team
          </p>
          <p className="mt-4 text-sm uppercase tracking-[0.3em] text-foreground/70">
            {journey.creativeDirector}
          </p>
          <p className="text-sm uppercase tracking-[0.3em] text-foreground/50">
            {journey.logisticsLead}
          </p>
          <ul className="mt-6 space-y-2 text-sm text-foreground/70">
            {journey.deliverables.map((deliverable) => (
              <li key={deliverable}>- {deliverable}</li>
            ))}
          </ul>
        </div>
        <div className="glass-pane p-8 lg:col-span-2">
          <p className="font-display text-xs uppercase tracking-[0.35em] text-foreground/55">
            Moodboard placeholders
          </p>
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            {moodboardPlaceholders.map((item) => (
              <AssetPlaceholder
                key={item.id}
                label="Mood"
                fileName={item.fileName}
                placement={item.placement}
                recommendedDimensions={item.recommendedDimensions}
                type="image"
                className="h-[160px]"
              />
            ))}
          </div>
        </div>
      </section>

      <div className="space-y-10">
        {journey.sections.map((section, index) => (
          <JourneySectionBlock key={section.id} section={section} index={index} />
        ))}
      </div>

      {journey.attachments.length ? (
        <section className="rounded-[32px] border border-foreground/15 bg-white/55 p-8 backdrop-blur">
          <p className="font-display text-xs uppercase tracking-[0.35em] text-foreground/55">
            Attachments
          </p>
          <div className="mt-4 flex flex-wrap gap-4 text-xs uppercase tracking-[0.35em] text-foreground/60">
            {journey.attachments.map((attachment) => (
              <span
                key={attachment.fileName}
                className="rounded-full border border-foreground/25 px-4 py-2"
              >
                {`${attachment.label} -> ${attachment.fileName}`}
              </span>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
