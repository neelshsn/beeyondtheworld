import type { Metadata } from 'next';

import { getJourneys } from '@/lib/cms/journeys';

import { JourneyShowcaseGallery } from './_components/journey-showcase-gallery';

export const metadata: Metadata = {
  title: 'Journeys - Beeyondtheworld',
  description:
    'Discover the Beeyondtheworld journey atlas through immersive tales, cinematic logistics, and regenerative field notes.',
};

export const dynamic = 'force-dynamic';

export default async function JourneysPage() {
  const journeys = await getJourneys();

  return (
    <main className="relative flex min-h-screen flex-col overflow-hidden">
      <JourneyShowcaseGallery journeys={journeys} />
    </main>
  );
}
