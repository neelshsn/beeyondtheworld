import type { Metadata } from 'next';

import { LegalPage } from '@/app/_components/legal-page';

export const metadata: Metadata = { title: 'Cookie notice - Beeyondtheworld' };

export default function CookiesPage() {
  return (
    <LegalPage
      eyebrow="Last updated 22 July 2026"
      title="Cookies"
      intro="The platform uses browser storage and similar technologies for essential sessions and limited performance measurement. We do not use them to sell personal data."
      sections={[
        {
          title: 'Essential operation',
          paragraphs: [
            'Authentication and security technologies may be used to maintain an authorised session, protect requests and remember short-lived interface state. These are necessary for the service requested by the user.',
          ],
        },
        {
          title: 'Performance measurement',
          paragraphs: [
            'The platform uses Vercel Analytics and Speed Insights to understand aggregate usage and technical performance. These tools help us identify slow or failing pages. We do not use advertising trackers in the current codebase.',
          ],
        },
        {
          title: 'Your controls',
          paragraphs: [
            'You can delete or block browser storage through your browser settings. Blocking essential storage may prevent sign-in or other protected features from working. If the platform adds non-essential tracking in the future, this notice and the relevant consent controls must be updated before activation.',
          ],
        },
      ]}
    />
  );
}
