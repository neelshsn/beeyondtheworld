import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { campaignShowcases } from '@/data/showcases';
import {
  campaignCardFromPublished,
  getPublishedCampaign,
  getPublishedCampaigns,
} from '@/lib/cms/campaign-content';

import { CampaignDetailExperience } from './_components/campaign-detail-experience';

type CampaignPageProps = {
  params: Promise<{ slug: string }>;
};

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export function generateStaticParams() {
  return campaignShowcases.map((campaign) => ({ slug: campaign.slug }));
}

export async function generateMetadata({ params }: CampaignPageProps): Promise<Metadata> {
  const { slug } = await params;
  const campaign = (await getPublishedCampaign(slug))?.showcase;

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
  const [entry, catalog] = await Promise.all([getPublishedCampaign(slug), getPublishedCampaigns()]);
  if (!entry) notFound();
  const campaignMeta = campaignCardFromPublished(entry);
  return (
    <CampaignDetailExperience
      campaign={entry.showcase}
      meta={campaignMeta}
      format={entry.format}
      tale={entry.tale}
      campaignCatalog={catalog.map((item) => item.showcase)}
    />
  );
}
