import type { Metadata } from 'next';
import '../community/community.css';
import './dashboard.css';

export const metadata: Metadata = {
  title: { default: 'Dashboard · Beeyondtheworld', template: '%s · Beeyondtheworld' },
  robots: { index: false, follow: false },
  referrer: 'no-referrer',
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return children;
}
