import { ClientDashboard } from '@/app/client/_components/client-dashboard';
import { buildClientDashboardCards } from '@/app/client/_lib/client-dashboard-data';
import { getCampaigns, getJourneys } from '@/lib/cms/fetchers';

export default async function ClientHomePage() {
  const [journeys, campaigns] = await Promise.all([getJourneys(), getCampaigns()]);
  const slots = buildClientDashboardCards({ journeys, campaigns });

  return (
    <div className="h-full w-full overflow-hidden">
      <ClientDashboard slots={slots} />
    </div>
  );
}
