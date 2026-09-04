import type { Metadata } from 'next';

import { CampaignsEditor } from './_components/campaigns-editor';

export const metadata: Metadata = {
  title: 'Campagnes & Tales - Espace Bee',
  description: 'Modifie les textes, les formats et les médias des campagnes Beeyondtheworld.',
};

export default function AdminCampaignsPage() {
  return <CampaignsEditor />;
}
