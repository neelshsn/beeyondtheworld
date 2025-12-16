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
  'relative flex h-14 w-14 items-center justify-center rounded-full border border-transparent bg-transparent text-white transition duration-200 focus-visible:ring-2 focus-visible:ring-[#f6c452]/60 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent hover:!border-[#f6c452]/55 hover:!bg-[#f6c4521a] hover:!text-white hover:shadow-[0_0_22px_rgba(246,196,82,0.6)]';

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
        <Image
          src="/assets/icones/Ico Gold BEE-12.svg"
          alt=""
          width={44}
          height={44}
          className="h-11 w-11 drop-shadow-[0_0_18px_rgba(246,196,82,0.54)] transition duration-200"
          aria-hidden
        />
        <span className="sr-only">Log out</span>
      </Button>
    );
  }

  return (
    <Button size="sm" variant="ghost" asChild className={cn(baseClasses, className)}>
      <Link href="/login" prefetch={!isLoginRoute}>
        <Image
          src="/assets/icones/Ico Gold BEE-12.svg"
          alt=""
          width={44}
          height={44}
          className="h-11 w-11 drop-shadow-[0_0_18px_rgba(246,196,82,0.54)] transition duration-200"
          aria-hidden
        />
        <span className="sr-only">Sign in</span>
      </Link>
    </Button>
  );
}
