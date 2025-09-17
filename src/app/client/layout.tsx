import { redirect } from 'next/navigation';

import { ClientHeader } from '@/app/client/_components/client-header';
import { getSupabaseServerClient } from '@/lib/supabase/server-client';

export default async function ClientLayout({ children }: { children: React.ReactNode }) {
  const supabase = await getSupabaseServerClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect('/login');
  }

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-white/80 via-white/60 to-rose-100/40">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(244,190,212,0.28),transparent_55%)]" />
      <div className="relative z-10 flex min-h-screen flex-col">
        <ClientHeader email={session.user.email ?? undefined} />
        <div className="mx-auto w-full max-w-[1440px] flex-1 px-6 py-12 sm:px-10 md:px-16">
          {children}
        </div>
      </div>
    </div>
  );
}
