import Image from 'next/image';
import Link from 'next/link';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { CalendarDays, Compass, MapPin, Quote, Sparkles, Waypoints } from 'lucide-react';

import { GlowTitle, ShowcaseMediaGallery } from '@/components/primitives';
import SplitText from '@/components/SplitText';
import { Button } from '@/components/ui/button';
import type { JourneyShowcase } from '@/data/showcases';
import { journeyShowcases } from '@/data/showcases';

import { PhilippinesJourneyLayout } from './_sections/philippines-journey-layout';

type JourneyPageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return journeyShowcases.map((journey) => ({ slug: journey.slug }));
}

export async function generateMetadata({ params }: JourneyPageProps): Promise<Metadata> {
  const { slug } = await params;
  const journey = journeyShowcases.find((item) => item.slug === slug);

  if (!journey) {
    return {
      title: 'Journey not found - Beeyondtheworld',
    };
  }

  return {
    title: `${journey.title} - Beeyondtheworld`,
    description: journey.summary,
  };
}

export default async function JourneyPage({ params }: JourneyPageProps) {
  const { slug } = await params;
  const journey = journeyShowcases.find((item) => item.slug === slug) ?? notFound();

  if (slug === 'philippines') {
    return <PhilippinesJourneyLayout journey={journey} />;
  }

  return <DefaultJourneyLayout journey={journey} />;
}

function DefaultJourneyLayout({ journey }: { journey: JourneyShowcase }) {
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
                <Button
                  asChild
                  className="mt-2 inline-flex items-center justify-center gap-3 rounded-full border border-white/30 bg-white/15 px-6 py-3 text-[11px] uppercase tracking-[0.4em] text-white hover:bg-white/25"
                >
                  <Link href={journey.cta.href}>{journey.cta.label}</Link>
                </Button>
              ) : null}
            </div>
          </div>
        </div>
      </section>

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
          <Button
            asChild
            className="rounded-full border border-foreground/30 bg-foreground px-10 py-4 text-[11px] uppercase tracking-[0.42em] text-white hover:bg-foreground/90"
          >
            <Link href="/contact">Composer cette journey</Link>
          </Button>
        </div>
      </section>
    </main>
  );
}
