import type { Metadata } from 'next';

import { CampaignShowcaseGallery } from './_components/campaign-showcase-gallery';

export const metadata: Metadata = {
  title: 'Campaigns - Beeyondtheworld',
  description:
    'Explore brand collaborations where dream universes merge with the spirit of each destination.',
};

export default function CampaignsPage() {
  return (
    <main className="relative flex min-h-screen flex-col overflow-hidden">
      <CampaignShowcaseGallery />
    </main>
  );
}
