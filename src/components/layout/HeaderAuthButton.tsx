'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import * as React from 'react';

import { useSupabase } from '@/components/providers/supabase-provider';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type HeaderAuthButtonProps = {
  className?: string;
};

const baseClasses =
  'relative flex h-14 w-14 items-center justify-center rounded-full border border-transparent bg-transparent text-white transition duration-200 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent';

export function HeaderAuthButton({ className }: HeaderAuthButtonProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { session, supabase, loading } = useSupabase();
  const [isSigningOut, setIsSigningOut] = React.useState(false);

  const isLoginRoute = pathname === '/login';
  const isJourneysRoute = pathname === '/journeys';
  const interactionClasses = isJourneysRoute
    ? 'focus-visible:ring-white/65 hover:!border-white/55 hover:!bg-white/10 hover:!text-white hover:shadow-[0_0_22px_rgba(255,255,255,0.5)]'
    : 'focus-visible:ring-[#f6c452]/60 hover:!border-[#f6c452]/55 hover:!bg-[#f6c4521a] hover:!text-white hover:shadow-[0_0_22px_rgba(246,196,82,0.6)]';
  const iconSrc = isJourneysRoute
    ? '/assets/icones/Ico White BEE-12.svg'
    : '/assets/icones/Ico Gold BEE-12.svg';
  const iconClass = isJourneysRoute
    ? 'h-11 w-11 drop-shadow-[0_0_18px_rgba(255,255,255,0.52)] transition duration-200'
    : 'h-11 w-11 drop-shadow-[0_0_18px_rgba(246,196,82,0.54)] transition duration-200';

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
        className={cn(baseClasses, interactionClasses, 'cursor-wait text-white/60', className)}
      >
        <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
        <span className="sr-only">Loading</span>
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
        className={cn(baseClasses, interactionClasses, className)}
      >
        <Image src={iconSrc} alt="" width={44} height={44} className={iconClass} aria-hidden />
        <span className="sr-only">Log out</span>
      </Button>
    );
  }

  return (
    <Button
      size="sm"
      variant="ghost"
      asChild
      className={cn(baseClasses, interactionClasses, className)}
    >
      <Link href="/login" prefetch={!isLoginRoute}>
        <Image src={iconSrc} alt="" width={44} height={44} className={iconClass} aria-hidden />
        <span className="sr-only">Sign in</span>
      </Link>
    </Button>
  );
}
