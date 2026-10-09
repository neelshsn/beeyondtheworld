import type { Metadata } from 'next';
import './community.css';
export const metadata: Metadata = {
  title: 'Bee Community · Beeyondtheworld',
  description: 'One journey. Creative intention, production and lasting impact.',
  robots: { index: false, follow: false },
};
export default function CommunityLayout({ children }: { children: React.ReactNode }) {
  return children;
}
