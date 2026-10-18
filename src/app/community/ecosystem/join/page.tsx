import type { Metadata } from 'next';
import { VisualPoetJoin } from './join-form';
export const metadata: Metadata = {
  title: 'Your invitation · BEE Visual Poets',
  robots: { index: false, follow: false },
  referrer: 'no-referrer',
};
export default function Page() {
  return <VisualPoetJoin />;
}
