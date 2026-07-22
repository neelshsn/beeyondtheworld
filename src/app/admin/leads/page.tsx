import type { Metadata } from 'next';
import { Suspense } from 'react';

import { AdminAuthGate } from '../journeys/_components/admin-auth-gate';
import { LeadInbox } from './lead-inbox';

export const metadata: Metadata = {
  title: 'Lead Inbox - Beeyondtheworld',
  description: 'Protected inbox for contact and journey booking requests.',
};

export default function AdminLeadsPage() {
  return (
    <Suspense>
      <AdminAuthGate>
        <LeadInbox />
      </AdminAuthGate>
    </Suspense>
  );
}
