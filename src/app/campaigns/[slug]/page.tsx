import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { campaignShowcases } from '@/data/showcases';
import { campaigns } from '@/data/campaigns-carousel';

import { CampaignDetailExperience } from './_components/campaign-detail-experience';

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
  const campaignMeta = campaigns.find((item) => item.slug === campaign.slug);
  return <CampaignDetailExperience campaign={campaign} meta={campaignMeta ?? null} />;
}
