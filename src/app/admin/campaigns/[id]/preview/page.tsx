import type { Metadata } from 'next';

import { CampaignDraftPreview } from './_components/campaign-draft-preview';

export const metadata: Metadata = {
  title: 'Aperçu de la campagne - Espace Bee',
  description: 'Aperçu protégé du brouillon enregistré.',
};

type CampaignPreviewPageProps = {
  params: Promise<{ id: string }>;
};

export default async function CampaignPreviewPage({ params }: CampaignPreviewPageProps) {
  const { id } = await params;
  return <CampaignDraftPreview id={Number.parseInt(id, 10)} />;
}
