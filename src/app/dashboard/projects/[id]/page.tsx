import { permanentRedirect } from 'next/navigation';
import { dashboardProjectHref } from '../../_lib/routes';

export default async function DashboardProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  permanentRedirect(dashboardProjectHref(id));
}
