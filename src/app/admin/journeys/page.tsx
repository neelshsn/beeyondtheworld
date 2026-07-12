import type { Metadata } from 'next';

import { JourneysManager } from './_components/journeys-manager';

export const metadata: Metadata = {
  title: 'Journeys CMS - Beeyondtheworld',
  description:
    'Create and edit journeys and locations: texts, media, dates, positions — reflected across the whole site.',
};

export default function AdminJourneysPage() {
  return <JourneysManager />;
}
