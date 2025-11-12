import type { Metadata } from 'next';

import { JourneyShowcaseGallery } from './_components/journey-showcase-gallery';

export const metadata: Metadata = {
  title: 'Journeys - Beeyondtheworld',
  description:
    'Discover the Beeyondtheworld journey atlas through immersive tales, cinematic logistics, and regenerative field notes.',
};

export default function JourneysPage() {
  return (
    <main className="relative flex min-h-screen flex-col overflow-hidden">
      <JourneyShowcaseGallery />
    </main>
  );
}
