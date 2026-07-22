import type { Metadata } from 'next';

import { LegalPage } from '@/app/_components/legal-page';

export const metadata: Metadata = { title: 'Legal notice - Beeyondtheworld' };

export default function LegalNoticePage() {
  return (
    <LegalPage
      eyebrow="Last updated 22 July 2026"
      title="Legal notice"
      intro="This website is operated by Beeyondtheworld Limited. The information below identifies the company responsible for the platform and the rules that apply when using it."
      sections={[
        {
          title: 'Company',
          paragraphs: [
            'BEEYONDTHEWORLD LIMITED, a private limited company registered in England and Wales under company number 14163182. VAT registration number: GB450245815.',
            'Registered office: Parsons Green House, 27 Parsons Green Lane, London SW6 4HH, United Kingdom. Contact: rachid@beeyondtheworld.com.',
          ],
        },
        {
          title: 'Website and content',
          paragraphs: [
            'The platform presents Beeyondtheworld services, journeys and creative work. Unless expressly stated otherwise, its content is provided for general information and does not create a binding commercial commitment.',
            'Brand names, visuals, films, texts, design elements and other materials remain the property of their respective rights holders. They may not be copied, redistributed or reused without the relevant permission.',
          ],
        },
        {
          title: 'Availability and external links',
          paragraphs: [
            'We aim to keep the platform accurate and available, but cannot guarantee uninterrupted access. External websites are operated by third parties and are subject to their own terms and privacy practices.',
          ],
        },
      ]}
    />
  );
}
