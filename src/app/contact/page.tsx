import type { Metadata } from 'next';

import { BloomExperience } from '@/components/community/bloom-experience';

export const metadata: Metadata = {
  title: 'Begin The Journey | Beeyondtheworld Contact',
  description: 'Bloom the magic. Begin the journey with Beeyondtheworld.',
  alternates: { canonical: '/community' },
};

export default function ContactPage() {
  return <BloomExperience />;
}
