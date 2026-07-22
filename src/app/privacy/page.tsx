import type { Metadata } from 'next';

import { LegalPage } from '@/app/_components/legal-page';

export const metadata: Metadata = { title: 'Privacy notice - Beeyondtheworld' };

export default function PrivacyPage() {
  return (
    <LegalPage
      eyebrow="Last updated 22 July 2026"
      title="Privacy"
      intro="Beeyondtheworld Limited uses personal data only to operate the platform, respond to requests and protect the service. This notice explains the information collected through the current platform."
      sections={[
        {
          title: 'Who is responsible',
          paragraphs: [
            'BEEYONDTHEWORLD LIMITED is the controller for personal data collected through this platform. Company number 14163182. Registered office: Parsons Green House, 27 Parsons Green Lane, London SW6 4HH, United Kingdom. Privacy contact: rachid@beeyondtheworld.com.',
          ],
        },
        {
          title: 'Data we collect',
          bullets: [
            'Information you submit in a contact or journey request, such as your name, organisation, email address, telephone number, availability and project preferences.',
            'Account and session information used for authorised platform access.',
            'Limited technical and performance information needed to secure, operate and improve the website.',
          ],
        },
        {
          title: 'Why we use it',
          paragraphs: [
            'We use request data to answer you and take steps you ask us to take before a possible collaboration. We use account and technical data to provide, secure and improve the platform. Where consent is required, you may withdraw it at any time.',
          ],
        },
        {
          title: 'Service providers and international processing',
          paragraphs: [
            'We use service providers for hosting, authentication, data storage, performance monitoring and operational notifications. They process data only to provide those services. Some processing may take place outside the United Kingdom; where required, we rely on recognised transfer safeguards.',
          ],
        },
        {
          title: 'Retention and your rights',
          paragraphs: [
            'We keep personal data only for as long as needed for the request, the relationship, security and applicable legal obligations, and review it periodically. Depending on the circumstances, you may ask for access, correction, deletion, restriction, portability or object to processing.',
            'To exercise a right, contact rachid@beeyondtheworld.com. You may also complain to the UK Information Commissioner’s Office at ico.org.uk.',
          ],
        },
      ]}
    />
  );
}
