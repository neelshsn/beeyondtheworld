import type { Metadata } from 'next';

import { BloomExperience } from '@/components/community/bloom-experience';

export const metadata: Metadata = {
  title: 'Bee Community · Beeyondtheworld',
  description: 'Bloom the magic. Begin the journey with Beeyondtheworld.',
  alternates: { canonical: '/community' },
  robots: { index: true, follow: true },
  openGraph: {
    title: 'Bee Community · Beeyondtheworld',
    description: 'Bloom the magic. Begin the journey with Beeyondtheworld.',
    url: '/community',
    type: 'website',
  },
};

export default function CommunityPage() {
  return <BloomExperience />;
}
