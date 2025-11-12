import type { Metadata } from 'next';

import { ConceptFoundation } from './_components/concept-foundation';

export const metadata: Metadata = {
  title: 'Concept - Beeyondtheworld',
  description: 'Explore the Beeyondtheworld concept experience (foundation scaffold).',
};

export default function ConceptPage() {
  return <ConceptFoundation />;
}
