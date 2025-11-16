'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Loader2, LogIn, LogOut } from 'lucide-react';
import * as React from 'react';

import { useSupabase } from '@/components/providers/supabase-provider';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type HeaderAuthButtonProps = {
  className?: string;
};

const baseClasses =
  'group relative flex h-11 items-center gap-2 rounded-full bg-white/10 px-4 text-sm font-sans font-semibold uppercase tracking-[0.32em] text-white/90 transition duration-200 backdrop-blur-lg hover:bg-[rgba(244,199,122,0.3)] focus-visible:ring-2 focus-visible:ring-[#f6c452]/45 focus-visible:ring-offset-0';
const labelRevealClasses =
  'ml-0 max-w-0 overflow-hidden font-sans text-[11px] uppercase tracking-[0.32em] text-white/90 opacity-0 transition-all duration-200 ease-out group-hover:ml-2 group-hover:max-w-[160px] group-hover:opacity-100 group-focus-visible:ml-2 group-focus-visible:max-w-[160px] group-focus-visible:opacity-100';

export function HeaderAuthButton({ className }: HeaderAuthButtonProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { session, supabase, loading } = useSupabase();
  const [isSigningOut, setIsSigningOut] = React.useState(false);

  const isLoginRoute = pathname === '/login';

  const handleSignOut = React.useCallback(async () => {
    if (isSigningOut) return;
    setIsSigningOut(true);
    await supabase.auth.signOut();
    router.refresh();
    setIsSigningOut(false);
  }, [isSigningOut, router, supabase]);

  if (loading && !session) {
    return (
      <Button
        size="sm"
        variant="ghost"
        disabled
        className={cn(baseClasses, 'cursor-wait text-white/60', className)}
      >
        <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
        <span className="sr-only">Loading</span>
        <span className={labelRevealClasses}>Loading</span>
      </Button>
    );
  }

  if (session) {
    return (
      <Button
        size="sm"
        type="button"
        variant="ghost"
        onClick={handleSignOut}
        disabled={isSigningOut}
        className={cn(baseClasses, className)}
      >
        <LogOut className="h-5 w-5" aria-hidden />
        <span className="sr-only">Log out</span>
        <span className={labelRevealClasses}>{isSigningOut ? 'Logging out...' : 'Log out'}</span>
      </Button>
    );
  }

  return (
    <Button size="sm" variant="ghost" asChild className={cn(baseClasses, className)}>
      <Link href="/login" prefetch={!isLoginRoute}>
        <LogIn className="h-5 w-5" aria-hidden />
        <span className="sr-only">Sign in</span>
        <span className={labelRevealClasses}>Sign in</span>
      </Link>
    </Button>
  );
}
