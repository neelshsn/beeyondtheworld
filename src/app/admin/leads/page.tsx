import type { Metadata } from 'next';

import { LeadInbox } from './lead-inbox';

export const metadata: Metadata = {
  title: 'Lead Inbox - Beeyondtheworld',
  description: 'Protected inbox for contact and journey booking requests.',
};

export default function AdminLeadsPage() {
  return <LeadInbox />;
}
