import Image from 'next/image';
import Link from 'next/link';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { CalendarDays, Clapperboard, MapPin, Sparkles } from 'lucide-react';

import { GlowTitle, ShowcaseMediaGallery } from '@/components/primitives';
import SplitText from '@/components/SplitText';
import { Button } from '@/components/ui/button';
import { campaignShowcases } from '@/data/showcases';
import { campaigns } from '@/data/campaigns-carousel';

type CampaignPageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return campaignShowcases.map((campaign) => ({ slug: campaign.slug }));
}

export async function generateMetadata({ params }: CampaignPageProps): Promise<Metadata> {
  const { slug } = await params;
  const campaign = campaignShowcases.find((item) => item.slug === slug);

  if (!campaign) {
    return {
      title: 'Campaign not found - Beeyondtheworld',
    };
  }

  return {
    title: `${campaign.title} - Beeyondtheworld`,
    description: campaign.summary,
  };
}

export default async function CampaignPage({ params }: CampaignPageProps) {
  const { slug } = await params;
  const campaign = campaignShowcases.find((item) => item.slug === slug) ?? notFound();

  const heroMedia = campaign.hero;
  const isVideoHero = heroMedia.type === 'video';
  const storyBeats = campaign.story.length > 0 ? campaign.story : [campaign.summary];
  const campaignMeta = campaigns.find((item) => item.slug === campaign.slug);
  const releaseWindow = campaignMeta?.releaseWindow ?? 'To be announced';
  const brandName = campaignMeta?.client ?? campaign.title;

  return (
    <main className="flex flex-col gap-24 pb-24">
      <section className="relative flex min-h-[90vh] flex-col justify-end overflow-hidden">
        {isVideoHero ? (
          <video
            className="absolute inset-0 size-full object-cover"
            autoPlay
            muted
            loop
            playsInline
            poster={heroMedia.poster}
          >
            <source src={heroMedia.src} />
          </video>
        ) : (
          <Image
            src={heroMedia.src}
            alt={heroMedia.alt}
            fill
            className="object-cover"
            sizes="100vw"
            priority
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-black/75 via-black/35 to-black/80" />
        <div className="relative z-10 flex flex-col gap-10 px-6 pb-20 pt-24 text-white sm:px-10 lg:px-20">
          <div className="flex flex-wrap items-center gap-4 text-xs uppercase tracking-[0.45em] text-white/70">
            <span className="flex items-center gap-2">
              <MapPin className="size-4" aria-hidden />
              {campaign.destination}
            </span>
            <span className="hidden h-px flex-1 bg-white/40 sm:block" aria-hidden />
            <span className="flex items-center gap-2">
              <Clapperboard className="size-4" aria-hidden />
              {campaign.hero.caption ?? 'Campaign loop'}
            </span>
          </div>
          <GlowTitle
            eyebrow={campaign.hero.loopLabel ?? 'Campaign film'}
            title={
              <SplitText
                text={campaign.title}
                tag="h2"
                splitType="words"
                className="font-display text-4xl uppercase leading-[1.08] text-white sm:text-5xl md:text-6xl"
                textAlign="left"
              />
            }
            description={campaign.headline}
            align="left"
            glowTone="honey"
          />
          <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <p className="text-sm leading-relaxed text-white/80 sm:text-base">{campaign.summary}</p>
            <div className="flex flex-col gap-3 rounded-3xl border border-white/25 bg-white/10 p-7 text-[11px] uppercase tracking-[0.42em] text-white/75 backdrop-blur">
              <span className="flex items-center gap-3 text-white">
                <CalendarDays className="size-4" aria-hidden />
                Fentre de diffusion
              </span>
              <p className="text-xs leading-relaxed tracking-[0.28em] text-white/70">
                {releaseWindow}
              </p>
              <span className="flex items-center gap-3 text-white">
                <Clapperboard className="size-4" aria-hidden />
                marque
              </span>
              <p className="text-xs leading-relaxed tracking-[0.28em] text-white/70">{brandName}</p>
              {campaign.cta ? (
                <Button
                  asChild
                  className="mt-2 inline-flex items-center justify-center gap-3 rounded-full border border-white/30 bg-white/15 px-6 py-3 text-[11px] uppercase tracking-[0.4em] text-white hover:bg-white/25"
                >
                  <Link href={campaign.cta.href}>{campaign.cta.label}</Link>
                </Button>
              ) : null}
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-12 px-6 sm:px-10 lg:px-20">
        <GlowTitle
          eyebrow="marque & terrain"
          title="Quand la marque pouse le lieu"
          description="Nous orchestrons des rencontres sensibles entre l'univers de la marque, les communauts locales et la matire du territoire pour gnrer des images sincres."
          align="left"
          glowTone="dawn"
        />
        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-6 rounded-3xl border border-foreground/15 bg-white/85 p-10 text-foreground shadow-[0_32px_120px_rgba(15,20,30,0.12)]">
            <p className="text-sm leading-relaxed text-foreground/75">
              Les premires heures sont ddies immerger la marque dans la culture du lieu :
              conversations avec artisans, reprages lumire et captation de textures sonores. Le
              script nat de ces rencontres pour garder l&apos;authenticit du terrain.
            </p>
            <div className="flex flex-wrap gap-3 text-[11px] uppercase tracking-[0.34em] text-foreground/65">
              {campaign.highlights.map((highlight) => (
                <span
                  key={highlight}
                  className="rounded-full border border-foreground/25 bg-white/70 px-4 py-2"
                >
                  {highlight}
                </span>
              ))}
            </div>
          </div>
          <div className="space-y-4 rounded-3xl border border-foreground/15 bg-white/85 p-10 text-foreground shadow-[0_32px_120px_rgba(15,20,30,0.12)]">
            <p className="flex items-center gap-2 font-display text-xs uppercase tracking-[0.42em] text-foreground/60">
              <Clapperboard className="size-4" aria-hidden />
              Crdits principaux
            </p>
            <ul className="space-y-3 text-sm uppercase tracking-[0.18em] text-foreground/70">
              {campaign.credits.map((credit) => (
                <li
                  key={`${credit.role}-${credit.value}`}
                  className="flex flex-wrap justify-between gap-3"
                >
                  <span>{credit.role}</span>
                  <span className="text-foreground/50">{credit.value}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="space-y-12 px-6 sm:px-10 lg:px-20">
        <GlowTitle
          eyebrow="Arc narratif"
          title={`Comment ${campaign.title} se droule`}
          description="De la prparation motionnelle aux squences nocturnes, chaque acte capture l'nergie du lieu et la griffe de la marque."
          align="left"
          glowTone="dawn"
        />
        <ol className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {storyBeats.map((paragraph, index) => (
            <li
              key={`${campaign.id}-story-${index}`}
              className="flex h-full flex-col gap-5 rounded-3xl border border-foreground/15 bg-white/85 p-7 text-foreground shadow-[0_32px_120px_rgba(15,20,30,0.12)]"
            >
              <span className="flex items-center gap-3 text-xs uppercase tracking-[0.38em] text-foreground/60">
                <Sparkles className="size-4" aria-hidden />
                Squence {String(index + 1).padStart(2, '0')}
              </span>
              <p className="text-sm leading-relaxed text-foreground/75">{paragraph}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="grid gap-10 px-6 sm:px-10 lg:grid-cols-[1.1fr_0.9fr] lg:px-20">
        <div className="space-y-8 rounded-3xl border border-foreground/15 bg-white/85 p-10 text-foreground shadow-[0_32px_120px_rgba(15,20,30,0.12)]">
          <p className="flex items-center gap-2 font-display text-xs uppercase tracking-[0.42em] text-foreground/60">
            <CalendarDays className="size-4" aria-hidden />
            Impact terrain
          </p>
          <ul className="space-y-3 text-sm text-foreground/70">
            {campaign.impact.map((item) => (
              <li key={item} className="flex items-start gap-3">
                <span className="mt-1 size-1.5 rounded-full bg-foreground/25" aria-hidden />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="space-y-8 rounded-3xl border border-foreground/15 bg-white/85 p-10 text-foreground shadow-[0_32px_120px_rgba(15,20,30,0.12)]">
          <p className="flex items-center gap-2 font-display text-xs uppercase tracking-[0.42em] text-foreground/60">
            <MapPin className="size-4" aria-hidden />
            Moments clefs
          </p>
          <p className="text-sm leading-relaxed text-foreground/75">
            Ces instants nourrissent la narration et le patrimoine de la marque : ils deviennent
            moodboards, assets retail et matire pour vos prises de parole.
          </p>
          <div className="flex justify-start">
            <Button
              asChild
              className="rounded-full border border-foreground/30 bg-foreground px-10 py-4 text-[11px] uppercase tracking-[0.42em] text-white hover:bg-foreground/90"
            >
              <Link href="/contact">Imaginer votre campagne</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="space-y-10 px-6 sm:px-10 lg:px-20">
        <GlowTitle
          eyebrow="Galerie et motion"
          title={`Plongez dans ${campaign.title}`}
          description="Stills, loops et extraits destins aux lancements marques, retail et relations presse."
          align="center"
          glowTone="dawn"
        />
        <ShowcaseMediaGallery items={campaign.gallery} />
      </section>
    </main>
  );
}
