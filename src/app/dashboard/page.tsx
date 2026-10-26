import { DashboardHome } from './_components/dashboard-home';
import { HorizonApp } from '../community/horizon-app';

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ project?: string | string[] }>;
}) {
  const project = (await searchParams).project;
  return typeof project === 'string' && project ? <HorizonApp /> : <DashboardHome />;
}
