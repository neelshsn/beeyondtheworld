import type { Metadata } from 'next';

import { ContactLanding } from './_components/contact-landing';

export const metadata: Metadata = {
  title: 'Begin The Journey | Beeyondtheworld Contact',
  description: 'Bloom the magic. Begin the journey with Beeyondtheworld.',
};

export default function ContactPage() {
  return <ContactLanding />;
}
