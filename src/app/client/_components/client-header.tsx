'use client';

import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { useSupabase } from '@/components/providers/supabase-provider';

interface ClientHeaderProps {
  email?: string;
}

export function ClientHeader({ email }: ClientHeaderProps) {
  const router = useRouter();
  const { supabase } = useSupabase();

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.replace('/login');
  }

  return (
    <header className="flex flex-col gap-4 border-b border-white/20 bg-white/40 px-6 py-6 backdrop-blur md:flex-row md:items-center md:justify-between md:px-10">
      <div>
        <p className="font-display text-xs uppercase tracking-[0.35em] text-muted-foreground/70">
          Client Space
        </p>
        <h1 className="font-title text-2xl uppercase tracking-[0em] text-foreground">
          Bespoke Journeys Dashboard
        </h1>
      </div>
      <div className="flex items-center gap-4">
        <div className="text-right text-xs text-muted-foreground/70">
          <p className="font-display text-[10px] uppercase tracking-[0.35em] text-muted-foreground/80">
            Signed in
          </p>
          <p className="font-sans text-sm text-foreground/80">{email ?? 'client'}</p>
        </div>
        <Button
          variant="ghost"
          onClick={handleSignOut}
          className="rounded-full border border-foreground/30 bg-white/70 px-5 py-3 font-display text-xs uppercase tracking-[0.35em] text-foreground hover:bg-white"
        >
          Sign out
        </Button>
      </div>
    </header>
  );
}
