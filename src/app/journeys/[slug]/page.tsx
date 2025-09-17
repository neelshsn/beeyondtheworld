import Image from 'next/image';
import Link from 'next/link';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { CalendarDays, Compass, MapPin, Sparkles, Waypoints } from 'lucide-react';

import { GlowTitle, ShowcaseMediaGallery } from '@/components/primitives';
import { Button } from '@/components/ui/button';
import { journeyShowcases } from '@/data/showcases';

interface JourneyPageProps {
  params: { slug: string };
}

export function generateStaticParams() {
  return journeyShowcases.map((journey) => ({ slug: journey.slug }));
}

export function generateMetadata({ params }: JourneyPageProps): Metadata {
  const journey = journeyShowcases.find((item) => item.slug === params.slug);

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

export default function JourneyPage({ params }: JourneyPageProps) {
  const journey = journeyShowcases.find((item) => item.slug === params.slug);

  if (!journey) {
    notFound();
  }

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
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/25 to-white/10" />
        <div className="relative z-10 flex flex-col gap-10 px-6 pb-20 pt-24 text-white sm:px-10 lg:px-20">
          <div className="flex flex-wrap items-center gap-4 text-xs uppercase tracking-[0.45em] text-white/70">
            <span className="flex items-center gap-2">
              <MapPin className="size-4" aria-hidden />
              {journey.locale}
            </span>
            <span className="h-px flex-1 bg-white/40" aria-hidden />
            <span className="flex items-center gap-2">
              <CalendarDays className="size-4" aria-hidden />
              {journey.timeframe}
            </span>
          </div>
          <GlowTitle
            eyebrow={journey.hero.overlayLabel ?? 'Journey residency'}
            title={journey.title}
            description={journey.headline}
            align="left"
            glowTone="honey"
          />
          <div className="flex flex-wrap gap-3 text-[11px] uppercase tracking-[0.35em] text-white/75">
            {journey.highlights.map((highlight) => (
              <span
                key={highlight}
                className="flex items-center gap-2 rounded-full border border-white/40 px-4 py-2"
              >
                <Sparkles className="size-3.5" aria-hidden />
                {highlight}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className="space-y-10 px-6 sm:px-10 lg:px-20">
        <GlowTitle
          eyebrow="Journey chapters"
          title={`Inside ${journey.title}`}
          description={journey.summary}
          align="left"
          glowTone="dawn"
        />
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {journey.story.map((paragraph, index) => (
            <div
              key={paragraph}
              className="flex h-full flex-col gap-4 rounded-2xl border border-foreground/15 bg-white/80 p-6 text-foreground shadow-[0_32px_120px_rgba(15,20,30,0.12)]"
            >
              <span className="flex items-center gap-3 text-xs uppercase tracking-[0.35em] text-foreground/55">
                <Sparkles className="size-3.5" aria-hidden /> Chapter{' '}
                {String(index + 1).padStart(2, '0')}
              </span>
              <p className="text-sm leading-relaxed text-foreground/75">{paragraph}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-10 px-6 sm:px-10 lg:grid-cols-[1.05fr_0.95fr] lg:px-20">
        <div className="space-y-8 rounded-2xl border border-foreground/15 bg-white/80 p-10 text-foreground shadow-[0_32px_120px_rgba(15,20,30,0.12)]">
          <p className="flex items-center gap-2 font-display text-xs uppercase tracking-[0.4em] text-foreground/55">
            <Waypoints className="size-4" aria-hidden /> Production blueprint
          </p>
          <ul className="space-y-3 text-sm text-foreground/70">
            {journey.logistics.map((item) => (
              <li key={item} className="flex items-start gap-3">
                <span className="mt-1 size-1.5 rounded-full bg-foreground/25" aria-hidden />
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <div className="flex flex-wrap gap-3 text-[11px] uppercase tracking-[0.32em] text-foreground/65">
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
        <div className="space-y-8 rounded-2xl border border-foreground/15 bg-white/80 p-10 text-foreground shadow-[0_32px_120px_rgba(15,20,30,0.12)]">
          <p className="flex items-center gap-2 font-display text-xs uppercase tracking-[0.4em] text-foreground/55">
            <Compass className="size-4" aria-hidden /> Residency overview
          </p>
          <p className="text-foreground/72 text-sm leading-relaxed">{journey.summary}</p>
          {journey.cta ? (
            <Button
              asChild
              className="rounded-full border border-foreground/30 bg-foreground/90 px-8 py-4 text-[11px] uppercase tracking-[0.4em] text-white hover:bg-foreground"
            >
              <Link href={journey.cta.href}>{journey.cta.label}</Link>
            </Button>
          ) : null}
        </div>
      </section>

      <section className="space-y-12 px-6 sm:px-10 lg:px-20">
        <GlowTitle
          eyebrow="Immersive gallery"
          title={`Scenes captured during ${journey.title}`}
          description={`Still and motion frames ready to brief maison teams ahead of production.`}
          align="center"
          glowTone="dawn"
        />
        <ShowcaseMediaGallery items={journey.gallery} />
      </section>
    </main>
  );
}
