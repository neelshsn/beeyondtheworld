import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { AssetPlaceholder, GlowTitle } from '@/components/primitives';
import { Button } from '@/components/ui/button';
import { getCampaignBySlug, getCampaigns } from '@/lib/cms/fetchers';

interface CampaignPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const campaigns = await getCampaigns();
  return campaigns.map((campaign) => ({ slug: campaign.slug }));
}

export async function generateMetadata({ params }: CampaignPageProps): Promise<Metadata> {
  const { slug } = await params;
  const campaign = await getCampaignBySlug(slug);

  if (!campaign) {
    return {
      title: 'Campaign not found - Beeyondtheworld',
    };
  }

  return {
    title: `${campaign.title} - Beeyondtheworld`,
    description: campaign.context?.[0]?.body ?? campaign.title,
  };
}

export default async function CampaignPage({ params }: CampaignPageProps) {
  const { slug } = await params;
  const campaign = await getCampaignBySlug(slug);

  if (!campaign) {
    notFound();
  }

  const heroPlaceholder = {
    label: `${campaign.title} hero film`,
    fileName: `${campaign.slug}-hero.mp4`,
    placement: `public/assets/campaigns/${campaign.slug}`,
    recommendedDimensions: '1920x1080 | MP4 20-30s',
    type: 'video' as const,
  };

  const galleryPlaceholders = campaign.gallery.map((item, index) => {
    const isVideo = item.kind === 'video';
    return {
      id: item.id,
      label: isVideo ? `Storyboard clip ${index + 1}` : `Still frame ${index + 1}`,
      fileName: `${campaign.slug}-gallery-${index + 1}.${isVideo ? 'mp4' : 'jpg'}`,
      placement: `public/assets/campaigns/${campaign.slug}`,
      recommendedDimensions: isVideo ? '1080x1350 | MP4 6-10s' : '1080x1350 | JPG',
      type: isVideo ? 'video' : 'image',
      caption: item.caption,
    };
  });

  return (
    <main className="mx-auto flex w-full max-w-[1320px] flex-col gap-20 px-6 pb-32 pt-24 sm:px-10 lg:px-16">
      <section className="relative grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-end">
        <div className="space-y-8">
          <GlowTitle
            eyebrow="Campaign"
            title={campaign.title.toUpperCase()}
            description={
              campaign.context[0]?.body ?? 'Immersive production orchestrated by Beeyondtheworld.'
            }
            align="left"
            glowTone="honey"
          />
          <div className="flex flex-wrap gap-4 text-[11px] uppercase tracking-[0.45em] text-foreground/60">
            <span className="rounded-full border border-foreground/30 px-4 py-2">
              Deliverable set
            </span>
            <span className="rounded-full border border-foreground/30 px-4 py-2">
              {campaign.region}
            </span>
            <span className="rounded-full border border-foreground/30 px-4 py-2">
              {campaign.season}
            </span>
          </div>
          <p className="max-w-2xl text-sm leading-relaxed text-foreground/70">
            Replace the hero placeholder with your edited film export. The overlay copy is handled
            in code so the video remains clean.
          </p>
        </div>
        <div className="space-y-4">
          <AssetPlaceholder {...heroPlaceholder} className="h-[360px] w-full rounded-[44px]" />
          <div className="flex flex-wrap items-center justify-between gap-4 rounded-[32px] border border-foreground/15 bg-white/60 px-6 py-4 text-[11px] uppercase tracking-[0.4em] text-foreground/55">
            <span>
              {'Upload -> '}
              {heroPlaceholder.fileName}
            </span>
            <span>
              {'Folder -> '}
              {heroPlaceholder.placement}
            </span>
            {campaign.callToAction ? (
              <Button
                asChild
                variant="ghost"
                className="rounded-full border border-foreground/30 bg-white px-5 py-3 text-[11px] uppercase tracking-[0.4em]"
              >
                <a href={campaign.callToAction.href}>{campaign.callToAction.label}</a>
              </Button>
            ) : null}
          </div>
        </div>
      </section>

      <section className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
        <div className="glass-pane min-h-[360px] p-10">
          <p className="font-display text-xs uppercase tracking-[0.4em] text-foreground/55">
            Narrative context
          </p>
          <div className="mt-6 space-y-6 text-sm leading-relaxed text-foreground/70">
            {campaign.context.map((block) => (
              <div key={block.heading}>
                <p className="font-display text-xl uppercase tracking-[0.22em] text-foreground">
                  {block.heading}
                </p>
                <p className="mt-2">{block.body}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="glass-pane min-h-[360px] p-10">
          <p className="font-display text-xs uppercase tracking-[0.4em] text-foreground/55">
            Credits and impact
          </p>
          <ul className="mt-6 space-y-4 text-sm uppercase tracking-[0.18em] text-foreground/70">
            {campaign.credits.map((credit) => (
              <li
                key={`${credit.role}-${credit.value}`}
                className="flex flex-wrap justify-between gap-3"
              >
                <span>{credit.role}</span>
                <span className="text-foreground/55">{credit.value}</span>
              </li>
            ))}
          </ul>
          <div className="mt-8 rounded-[28px] border border-foreground/15 bg-white/60 p-6 text-xs uppercase tracking-[0.35em] text-foreground/60">
            <p className="font-display text-xs uppercase tracking-[0.35em] text-foreground/70">
              Impact markers
            </p>
            <ul className="mt-4 space-y-2 text-foreground/70">
              {campaign.impactHighlights.map((impact) => (
                <li key={impact}>- {impact}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="space-y-10">
        <GlowTitle
          eyebrow="Gallery and motion"
          title="Assemble the journey proof"
          description="Each placeholder represents a storytelling card for the client space. Drop the final stills or teaser loops to replace them."
          align="center"
          glowTone="dawn"
        />
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {galleryPlaceholders.map((item) => (
            <div
              key={item.id}
              className="rounded-[34px] border border-foreground/15 bg-white/60 p-6"
            >
              <AssetPlaceholder
                label={item.label}
                fileName={item.fileName}
                placement={item.placement}
                recommendedDimensions={item.recommendedDimensions}
                type={item.type}
                className="h-[220px]"
              />
              {item.caption ? (
                <p className="mt-4 text-xs uppercase tracking-[0.32em] text-foreground/55">
                  Caption: {item.caption}
                </p>
              ) : null}
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-[36px] border border-foreground/15 bg-white/65 p-10 text-center">
        <p className="font-display text-xs uppercase tracking-[0.35em] text-foreground/55">
          Start the next chapter
        </p>
        <h2 className="mt-4 font-display text-3xl uppercase tracking-[0.2em] text-foreground">
          Lets craft an immersive journey tailored to your maison
        </h2>
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <Button asChild className="rounded-full px-8 py-6 text-xs uppercase tracking-[0.4em]">
            <a href="mailto:hello@beeyondtheworld.com?subject=New%20Campaign">Book a call</a>
          </Button>
          <Button
            asChild
            variant="ghost"
            className="rounded-full border border-foreground/30 px-8 py-6 text-xs uppercase tracking-[0.4em]"
          >
            <a href="/pdfs/BEE-DECK.pdf" download>
              Download overview
            </a>
          </Button>
        </div>
      </section>
    </main>
  );
}
