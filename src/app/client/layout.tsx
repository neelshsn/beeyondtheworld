import { redirect } from 'next/navigation';

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
    <div className="relative h-screen w-screen overflow-hidden bg-gradient-to-br from-[#0e0f16] via-[#161821] to-[#201722] text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.12),transparent_55%)]" />
      <div className="relative z-10 flex h-full w-full flex-col">
        <main className="h-full w-full overflow-hidden">{children}</main>
      </div>
    </div>
  );
}
