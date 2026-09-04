import type { Metadata } from 'next';

import { campaignCardFromPublished, getPublishedCampaigns } from '@/lib/cms/campaign-content';

import { CampaignShowcaseGallery } from './_components/campaign-showcase-gallery';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata: Metadata = {
  title: 'Campaigns - Beeyondtheworld',
  description:
    'Explore brand collaborations where dream universes merge with the spirit of each destination.',
};

export default async function CampaignsPage() {
  const entries = await getPublishedCampaigns();
  const campaigns = entries.map(campaignCardFromPublished);

  return (
    <main className="relative flex min-h-screen flex-col overflow-hidden">
      <CampaignShowcaseGallery campaigns={campaigns} />
    </main>
  );
}
