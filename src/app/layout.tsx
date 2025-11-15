import type { Metadata } from 'next';
import { Analytics } from '@vercel/analytics/next';

import { Header } from '@/components/layout/Header';
import { SupabaseProvider } from '@/components/providers/supabase-provider';
import { love, cannia, adam, avenir, saintBartogenia } from '@/lib/fonts';
import { getSupabaseServerClient } from '@/lib/supabase/server-client';
import './globals.css';

export const metadata: Metadata = {
  title: 'Beeyondtheworld Platform',
  description:
    'Luxury immersive experiences for high-fashion and lifestyle brands crafting meaningful journeys.',
  openGraph: {
    title: 'Beeyondtheworld Platform',
    description:
      'Discover immersive campaign journeys and sustainable fashion narratives crafted by Beeyondtheworld.',
    type: 'website',
  },
  metadataBase: new URL('https://beeyondtheworld.com'),
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await getSupabaseServerClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${love.variable} ${cannia.variable} ${adam.variable} ${avenir.variable} ${saintBartogenia.variable}`}
    >
      <body className="bg-background font-sans text-foreground">
        <SupabaseProvider initialSession={session}>
          <div className="relative flex min-h-screen flex-col">
            <div
              className="pointer-events-none fixed inset-0 z-[-3] bg-hero-gradient opacity-60"
              aria-hidden
            />
            <div className="pointer-events-none fixed inset-0 z-[-4]" aria-hidden>
              <div className="absolute -top-32 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-[rgba(235,180,80,0.16)] blur-3xl" />
              <div className="absolute bottom-[-160px] left-10 h-[460px] w-[460px] rounded-full bg-[rgba(94,68,52,0.18)] blur-3xl" />
              <div className="absolute right-[-120px] top-24 h-[380px] w-[380px] rounded-full bg-[rgba(255,233,204,0.4)] blur-3xl" />
            </div>
            <div
              className="pointer-events-none fixed inset-x-0 top-0 z-[-2] h-40 bg-gradient-to-b from-white/70 via-white/35 to-transparent"
              aria-hidden
            />

            <Header />

            <div className="relative z-10 flex-1">{children}</div>
          </div>
          <Analytics />
        </SupabaseProvider>
      </body>
    </html>
  );
}
