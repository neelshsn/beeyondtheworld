import type { ReactNode } from 'react';
import { VisualPoetsShowreel } from '../_components/visual-poets-showreel';
export default async function JourneyLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return (
    <>
      {children}
      <VisualPoetsShowreel slug={slug} />
    </>
  );
}
