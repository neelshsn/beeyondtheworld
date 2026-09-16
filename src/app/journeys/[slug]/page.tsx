import Image from 'next/image';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { CalendarDays, Compass, MapPin, Quote, Sparkles, Waypoints } from 'lucide-react';

import { GlowTitle, ShowcaseMediaGallery } from '@/components/primitives';
import { BeeButton } from '@/components/primitives/bee-button';
import SplitText from '@/components/SplitText';
import type { JourneyShowcase } from '@/data/showcases';
import { getPublishedJourneyLocationCollection } from '@/lib/cms/journey-locations';
import {
  isJourneyBackgroundVideo,
  isLocationSeasonSelection,
  LOCATION_SEASONS,
} from '@/lib/cms/journey-location-settings';
import { getPublishedJourneyShowcase } from '@/lib/cms/journeys';
import type { CmsJourneyLocation } from '@/types/journey-location';

import { IndiaJourneyLayout } from './_sections/india-journey-layout';
import { PhilippinesJourneyLayout } from './_sections/philippines-journey-layout';
import { ThailandJourneyLayout } from './_sections/thailand-journey-layout';
import { AzoresJourneyLayout } from './_sections/azores-journey-layout';
import { FranceJourneyLayout } from './_sections/france-journey-layout';
import { MoroccoJourneyLayout } from './_sections/morocco-journey-layout';
import { ItalyJourneyLayout } from './_sections/italy-journey-layout';
import { BalearicJourneyLayout } from './_sections/balearic-journey-layout';

type JourneyPageProps = {
  params: Promise<{ slug: string }>;
};

// Les Tales sont éditables dans Neon : la page doit refléter chaque sauvegarde
// sans attendre un nouveau déploiement.
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function generateMetadata({ params }: JourneyPageProps): Promise<Metadata> {
  const { slug } = await params;
  const journey = await getPublishedJourneyShowcase(slug);

  if (!journey) {
    return {
      title: 'Journey not found - Beeyondtheworld',
    };
  }

  if (slug === 'india-january-2026') {
    return {
      title: 'India - From 1st November 2026 to 31st March 2027',
      description: journey.summary,
    };
  }

  if (slug === 'philippines') {
    return {
      title: 'Philippines - From 1st March to 31st May 2026',
      description: journey.summary,
    };
  }

  if (slug === 'thailand') {
    return {
      title: 'Thailand - From 1st December 2026 to 31st March 2027',
      description: journey.summary,
    };
  }

  if (slug === 'azores') {
    return {
      title: 'Portugal - Azores, Madeira & Lisboa - From 1st June to 30th September',
      description: journey.summary,
    };
  }

  if (slug === 'france') {
    return {
      title: 'France - From 1st June to 30th September',
      description: journey.summary,
    };
  }

  if (slug === 'morocco') {
    return {
      title: 'Morocco - From 1st April to 30th June',
      description: journey.summary,
    };
  }

  if (slug === 'italy') {
    return {
      title: 'Italy - From 1st May to 30th June',
      description: journey.summary,
    };
  }

  if (slug === 'balearic') {
    return {
      title: 'Balearic - From 1st May to 30th September',
      description: journey.summary,
    };
  }

  return {
    title: `${journey.title} - Beeyondtheworld`,
    description: journey.summary,
  };
}

export default async function JourneyPage({ params }: JourneyPageProps) {
  const { slug } = await params;
  const [journey, locationCollection] = await Promise.all([
    getPublishedJourneyShowcase(slug),
    getPublishedJourneyLocationCollection(slug),
  ]);
  if (!journey) notFound();
  const cmsLocations = locationCollection.locations;
  const cmsManaged = locationCollection.managed;

  if (slug === 'philippines') {
    return (
      <PhilippinesJourneyLayout
        journey={journey}
        cmsLocations={cmsLocations}
        cmsManaged={cmsManaged}
      />
    );
  }

  if (slug === 'thailand') {
    return (
      <ThailandJourneyLayout
        journey={journey}
        cmsLocations={cmsLocations}
        cmsManaged={cmsManaged}
      />
    );
  }

  if (slug === 'azores') {
    return (
      <AzoresJourneyLayout
        journey={journey}
        cmsLocations={cmsLocations}
        cmsManaged={cmsManaged}
        cmsEdited={locationCollection.edited === true}
      />
    );
  }

  if (slug === 'france') {
    return (
      <FranceJourneyLayout journey={journey} cmsLocations={cmsLocations} cmsManaged={cmsManaged} />
    );
  }

  if (slug === 'morocco') {
    return (
      <MoroccoJourneyLayout journey={journey} cmsLocations={cmsLocations} cmsManaged={cmsManaged} />
    );
  }

  if (slug === 'italy') {
    return (
      <ItalyJourneyLayout journey={journey} cmsLocations={cmsLocations} cmsManaged={cmsManaged} />
    );
  }

  if (slug === 'balearic') {
    return (
      <BalearicJourneyLayout
        journey={journey}
        cmsLocations={cmsLocations}
        cmsManaged={cmsManaged}
      />
    );
  }

  if (slug === 'india-january-2026') {
    return (
      <IndiaJourneyLayout journey={journey} cmsLocations={cmsLocations} cmsManaged={cmsManaged} />
    );
  }

  return (
    <DefaultJourneyLayout journey={journey} cmsLocations={cmsLocations} cmsManaged={cmsManaged} />
  );
}

function DefaultJourneyLayout({
  journey,
  cmsLocations,
  cmsManaged,
}: {
  journey: JourneyShowcase;
  cmsLocations: CmsJourneyLocation[];
  cmsManaged: boolean;
}) {
  const storyBeats = journey.story.length > 0 ? journey.story : [journey.summary];

  return (
    <main className="flex flex-col gap-24 pb-24">
      <section className="relative flex min-h-[90vh] flex-col justify-end overflow-hidden">
        <Image
          src={journey.hero.src}
          alt={journey.hero.alt}
          fill
          className="object-cover"
          sizes="100vw"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/35 to-black/75" />
        <div className="relative z-10 flex flex-col gap-10 px-6 pb-20 pt-24 text-white sm:px-10 lg:px-20">
          <div className="flex flex-wrap items-center gap-4 text-xs uppercase tracking-[0.45em] text-white/70">
            <span className="flex items-center gap-2">
              <MapPin className="size-4" aria-hidden />
              {journey.locale}
            </span>
            <span className="hidden h-px flex-1 bg-white/40 sm:block" aria-hidden />
            <span className="flex items-center gap-2">
              <CalendarDays className="size-4" aria-hidden />
              {journey.timeframe}
            </span>
          </div>
          <GlowTitle
            eyebrow={journey.hero.overlayLabel ?? 'journey tale'}
            title={
              <SplitText
                text={journey.title}
                tag="h2"
                splitType="words"
                className="font-display text-4xl uppercase leading-[1.08] text-white sm:text-5xl md:text-6xl"
                textAlign="left"
              />
            }
            description={journey.headline}
            align="left"
            glowTone="honey"
          />
          <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
            <p className="text-sm leading-relaxed text-white/80 sm:text-base">{journey.summary}</p>
            <div className="flex flex-col gap-4 rounded-3xl border border-white/25 bg-white/10 p-7 text-[11px] uppercase tracking-[0.42em] text-white/75 backdrop-blur">
              <span className="flex items-center gap-3 text-white">
                <Quote className="size-4" aria-hidden />
                Prologue notes
              </span>
              <p className="text-xs leading-relaxed tracking-[0.28em] text-white/70">
                {journey.hero.caption ?? 'Immersive journey field note'}
              </p>
              {journey.cta ? (
                <BeeButton href={journey.cta.href} size="md" className="mt-2">
                  {journey.cta.label}
                </BeeButton>
              ) : null}
            </div>
          </div>
        </div>
      </section>

      {cmsManaged ? (
        <section className="space-y-12 px-6 sm:px-10 lg:px-20" aria-label="Journey locations">
          {cmsLocations.map((location) => (
            <article key={location.id} id={`location-${location.id}`} className="space-y-6">
              <GlowTitle
                eyebrow={location.subtitle ?? 'Location'}
                title={location.name}
                align="left"
                glowTone="dawn"
              />
              <p
                className="text-xs uppercase tracking-[0.16em] text-white/65"
                aria-label="Location seasons"
              >
                {(isLocationSeasonSelection(location.seasonTags)
                  ? location.seasonTags
                  : LOCATION_SEASONS
                )
                  .map((season) =>
                    season === 'spring-summer' ? 'SS · Spring Summer' : 'FW · Fall Winter'
                  )
                  .join(' / ')}
              </p>
              {location.leftTitle.length > 0 ? (
                <h3 className="font-display text-xl">{location.leftTitle.join(' ')}</h3>
              ) : null}
              <p className="whitespace-pre-line text-sm leading-relaxed sm:text-base">
                {location.narrative}
              </p>
              <ShowcaseMediaGallery
                items={[
                  ...(location.image
                    ? [
                        {
                          id: `location-${location.id}-image`,
                          type: 'image' as const,
                          src: location.image,
                          alt: location.name,
                        },
                      ]
                    : []),
                  ...(location.video
                    ? [
                        {
                          id: `location-${location.id}-background`,
                          type: isJourneyBackgroundVideo(location.video)
                            ? ('video' as const)
                            : ('image' as const),
                          src: location.video,
                          alt: location.name,
                        },
                      ]
                    : []),
                  ...location.media.map((media, index) => ({
                    id: `location-${location.id}-media-${index}`,
                    type: media.type,
                    src: media.url,
                    alt: media.alt ?? location.name,
                  })),
                ]}
              />
            </article>
          ))}
        </section>
      ) : (
        <section className="space-y-12 px-6 sm:px-10 lg:px-20">
          <GlowTitle
            eyebrow="Arc narratif"
            title={`Les chapitres de ${journey.title}`}
            description="Du lever du decor a l'epilogue impact, chaque sequence embarque votre equipe dans un voyage sensoriel."
            align="left"
            glowTone="dawn"
          />
          <ol className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {storyBeats.map((paragraph, index) => (
              <li
                key={`${journey.id}-story-${index}`}
                className="flex h-full flex-col gap-5 rounded-3xl border border-foreground/15 bg-white/85 p-7 text-foreground shadow-[0_32px_120px_rgba(15,20,30,0.12)]"
              >
                <span className="flex items-center gap-3 text-xs uppercase tracking-[0.38em] text-foreground/60">
                  <Sparkles className="size-4" aria-hidden />
                  Acte {String(index + 1).padStart(2, '0')}
                </span>
                <p className="text-sm leading-relaxed text-foreground/75">{paragraph}</p>
              </li>
            ))}
          </ol>
        </section>
      )}

      <section className="grid gap-10 px-6 sm:px-10 lg:grid-cols-[1.1fr_0.9fr] lg:px-20">
        <div className="space-y-8 rounded-3xl border border-foreground/15 bg-white/85 p-10 text-foreground shadow-[0_32px_120px_rgba(15,20,30,0.12)]">
          <p className="flex items-center gap-2 font-display text-xs uppercase tracking-[0.42em] text-foreground/60">
            <Waypoints className="size-4" aria-hidden />
            Carnet de terrain
          </p>
          <p className="text-sm leading-relaxed text-foreground/75">
            Chaque journee alterne explorations sensibles et tournages precis. Nos equipes locales
            orchestrent les transitions afin que la marque reste immergee dans la dramaturgie du
            lieu.
          </p>
          <ul className="space-y-3 text-sm text-foreground/70">
            {journey.logistics.map((item) => (
              <li key={item} className="flex items-start gap-3">
                <span className="mt-1 size-1.5 rounded-full bg-foreground/25" aria-hidden />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="space-y-8 rounded-3xl border border-foreground/15 bg-white/85 p-10 text-foreground shadow-[0_32px_120px_rgba(15,20,30,0.12)]">
          <p className="flex items-center gap-2 font-display text-xs uppercase tracking-[0.42em] text-foreground/60">
            <Compass className="size-4" aria-hidden />
            Atmospheres et allies
          </p>
          <p className="text-sm leading-relaxed text-foreground/75">
            Ce voyage convoque les matieres, les sons et les communautes qui faconnent
            l&apos;identite du territoire. Voici les marqueurs sensoriels que nous activons avec
            votre marque.
          </p>
          <div className="flex flex-wrap gap-3 text-[11px] uppercase tracking-[0.34em] text-foreground/65">
            {journey.highlights.map((highlight) => (
              <span
                key={highlight}
                className="rounded-full border border-foreground/25 bg-white/70 px-4 py-2"
              >
                {highlight}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className="space-y-10 px-6 sm:px-10 lg:px-20">
        <GlowTitle
          eyebrow="Galerie immersive"
          title={`Scenes capturees pendant ${journey.title}`}
          description="Frames fixes et sequences motion pretes a brief marque, retail et relations presse."
          align="center"
          glowTone="dawn"
        />
        <ShowcaseMediaGallery items={journey.gallery} />
        <div className="flex justify-center">
          <BeeButton href="/contact" align="center" size="md" className="text-foreground">
            Composer cette journey
          </BeeButton>
        </div>
      </section>
    </main>
  );
}
