import Image from 'next/image';
import Link from 'next/link';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import dynamic from 'next/dynamic';
import { CalendarDays, Compass, MapPin, Sparkles, Waypoints } from 'lucide-react';

import { GlowTitle } from '@/components/primitives';
import { Button } from '@/components/ui/button';
import { journeyShowcases } from '@/data/showcases';

const ShowcaseMediaGallery = dynamic(
  () => import('@/components/primitives/media-lightbox').then((mod) => mod.ShowcaseMediaGallery),
  { ssr: false }
);

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

      <section className="grid gap-10 px-6 sm:px-10 lg:grid-cols-[1.05fr_0.95fr] lg:px-20">
        <div className="space-y-8 rounded-2xl border border-foreground/15 bg-white/80 p-10 text-foreground shadow-[0_32px_120px_rgba(15,20,30,0.12)]">
          <p className="flex items-center gap-2 font-display text-xs uppercase tracking-[0.4em] text-foreground/55">
            <Sparkles className="size-4" aria-hidden /> Narrative arc
          </p>
          <div className="space-y-4 text-sm leading-relaxed text-foreground/70">
            {journey.story.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
          <div className="rounded-2xl border border-foreground/15 bg-white/70 p-6">
            <p className="flex items-center gap-2 font-display text-xs uppercase tracking-[0.35em] text-foreground/55">
              <Waypoints className="size-4" aria-hidden /> Logistics in place
            </p>
            <ul className="mt-4 space-y-2 text-sm text-foreground/70">
              {journey.logistics.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <span className="mt-1 size-1.5 rounded-full bg-foreground/30" aria-hidden />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="space-y-8 rounded-2xl border border-foreground/15 bg-white/80 p-10 text-foreground shadow-[0_32px_120px_rgba(15,20,30,0.12)]">
          <p className="flex items-center gap-2 font-display text-xs uppercase tracking-[0.4em] text-foreground/55">
            <Compass className="size-4" aria-hidden /> Residency overview
          </p>
          <p className="text-sm leading-relaxed text-foreground/70">{journey.summary}</p>
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
          title="Preview the residency atmosphere"
          description="Click any frame to open it in full screen. Still and motion assets are graded for board previews and client walk-throughs."
          align="center"
          glowTone="dawn"
        />
        <ShowcaseMediaGallery items={journey.gallery} />
      </section>
    </main>
  );
}
