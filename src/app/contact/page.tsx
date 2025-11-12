import type { Metadata } from 'next';

import { ContactExperience } from './_components/contact-experience';
import { getCampaigns, getJourneys } from '@/lib/cms/fetchers';

export const metadata: Metadata = {
  title: 'Begin Your Journey | Beeyondtheworld Contact',
  description:
    'Share your brand story, journey ambitions, and preferred touchpoints to begin a bespoke collaboration with Beeyondtheworld.',
};

export default async function ContactPage() {
  const [journeys, campaigns] = await Promise.all([getJourneys(), getCampaigns()]);

  return <ContactExperience journeys={journeys} campaigns={campaigns} />;
}
