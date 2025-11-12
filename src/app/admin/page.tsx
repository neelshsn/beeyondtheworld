import type { Metadata } from 'next';

import AdminDashboardPage from './_components/dashboard-page';

export const metadata: Metadata = {
  title: 'Admin Dashboard - Beeyondtheworld',
  description:
    'Orchestrate brand dreams across production phases, freelancers, contracts, deliverables, and castings in one luminous console.',
};

export default function AdminPage() {
  return <AdminDashboardPage />;
}
