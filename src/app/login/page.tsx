'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import SplitText from '@/components/SplitText';
import { useRouter, useSearchParams } from 'next/navigation';
import { KeyRound, Lock, Mail } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { useSupabase } from '@/components/providers/supabase-provider';
import {
  DEMO_AUTH_COOKIE,
  DEMO_EMAIL,
  DEMO_PASSWORD,
  isDemoMode,
} from '@/lib/supabase/demo-client';

const DEMO_ENABLED = isDemoMode();

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { supabase, session, loading } = useSupabase();
  const [email, setEmail] = useState(DEMO_EMAIL);
  const [password, setPassword] = useState(DEMO_PASSWORD);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && session) {
      const redirectTo = searchParams.get('redirectTo') ?? '/client';
      router.replace(redirectTo);
    }
  }, [session, loading, router, searchParams]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    if (DEMO_ENABLED && email === DEMO_EMAIL && password === DEMO_PASSWORD) {
      document.cookie = `${DEMO_AUTH_COOKIE}=demo; path=/; max-age=${60 * 60 * 24 * 30}; SameSite=Lax`;
      setSubmitting(false);
      router.replace('/client');
      return;
    }

    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setError(authError.message);
      setSubmitting(false);
      return;
    }

    router.replace('/client');
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden">
      <video className="absolute inset-0 size-full object-cover" autoPlay muted loop playsInline>
        <source src="/assets/concept/sustainable.mp4" />
      </video>
      <div className="absolute inset-0 bg-foreground/60" aria-hidden />

      <div className="relative z-10 mx-auto w-full max-w-lg rounded-[36px] border border-white/30 bg-white/20 p-10 shadow-[0_45px_120px_rgba(20,12,8,0.55)] backdrop-blur-xl">
        <p className="flex items-center gap-2 font-display text-xs uppercase tracking-[0.35em] text-white/70">
          <Lock className="size-4" aria-hidden /> Client access
        </p>
        <div className="mt-4 flex items-center gap-3">
          <KeyRound className="size-6" aria-hidden />
          <SplitText
            text="Beeyondtheworld client space"
            tag="h1"
            splitType="chars"
            className="font-display text-3xl uppercase tracking-[0.2em] text-white"
            textAlign="left"
          />
        </div>
        <p className="mt-3 text-sm text-white/80">
          The client portal hosts your private co-travel dashboard, journey sheets, and exports.
          Accounts are curated by our team; use the credentials provided by your producer.
        </p>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <label
              className="flex items-center gap-2 font-display text-xs uppercase tracking-[0.3em] text-white/70"
              htmlFor="email"
            >
              <Mail className="size-4" aria-hidden /> Email
            </label>
            <input
              id="email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full rounded-2xl border border-white/40 bg-white/15 px-4 py-3 text-sm text-white placeholder:text-white/50 focus:border-white focus:outline-none"
            />
          </div>

          <div className="space-y-2">
            <label
              className="flex items-center gap-2 font-display text-xs uppercase tracking-[0.3em] text-white/70"
              htmlFor="password"
            >
              <KeyRound className="size-4" aria-hidden /> Password
            </label>
            <input
              id="password"
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full rounded-2xl border border-white/40 bg-white/15 px-4 py-3 text-sm text-white placeholder:text-white/50 focus:border-white focus:outline-none"
            />
          </div>

          {error ? <p className="text-xs text-rose-200">{error}</p> : null}

          <Button
            type="submit"
            disabled={submitting}
            className="w-full rounded-full border border-white/50 bg-white/85 px-6 py-4 font-display text-xs uppercase tracking-[0.35em] text-foreground hover:bg-white"
          >
            {submitting ? 'Signing in...' : 'Enter the journey'}
          </Button>
        </form>

        <div className="mt-6 rounded-2xl border border-white/30 bg-white/10 p-4 text-xs text-white/70">
          <p className="font-display text-[10px] uppercase tracking-[0.35em] text-white/60">
            Demo access
          </p>
          <p className="mt-2">
            Email: <span className="font-sans">{DEMO_EMAIL}</span> / Password:{' '}
            <span className="font-sans">{DEMO_PASSWORD}</span>
          </p>
          <p className="mt-3">
            Need access? Contact{' '}
            <Link href="mailto:hello@beeyondtheworld.com" className="underline">
              hello@beeyondtheworld.com
            </Link>
            .
          </p>
        </div>
      </div>
    </main>
  );
}
