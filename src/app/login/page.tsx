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

const DEMO_ACCOUNTS: ReadonlyArray<{ email: string; password: string; note?: string }> = [
  { email: DEMO_EMAIL, password: DEMO_PASSWORD, note: 'Client space' },
  { email: 'neels@beeyondtheworld.com', password: 'admin', note: 'Developer, Super Admin' },
  { email: 'eugenie@beeyondtheworld.com', password: 'admin' },
  { email: 'talent@beeyondtheworld.com', password: 'talent' },
  { email: 'producer@beeyondtheworld.com', password: 'producer' },
];

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { supabase, session, loading } = useSupabase();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDemoPrefill = (demoEmail: string, demoPassword: string) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setError(null);
  };

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
            className="group relative w-full overflow-hidden rounded-full border border-white/50 bg-white/85 px-6 py-4 font-display text-xs uppercase tracking-[0.35em] text-foreground transition [transition-timing-function:var(--bee-ease)] hover:bg-white focus-visible:ring-[#f6c452]/35 disabled:cursor-not-allowed disabled:opacity-80"
          >
            <span
              aria-hidden
              className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-[#f6c452bf] to-transparent opacity-0 transition-transform duration-500 group-hover:translate-x-full group-hover:opacity-100 group-focus-visible:translate-x-full group-focus-visible:opacity-100"
            />
            <span className="relative">{submitting ? 'Signing in...' : 'Enter the journey'}</span>
          </Button>
        </form>

        <div className="mt-6 rounded-2xl border border-white/30 bg-white/10 p-4 text-xs text-white/70">
          <p className="font-display text-[10px] uppercase tracking-[0.35em] text-white/60">
            Demo access
          </p>
          <ul className="mt-2 space-y-2 text-[11px] sm:text-xs">
            {DEMO_ACCOUNTS.map(({ email: demoEmail, password: demoPassword, note }) => (
              <li key={demoEmail}>
                <button
                  type="button"
                  onClick={() => handleDemoPrefill(demoEmail, demoPassword)}
                  className="flex w-full flex-col rounded-xl border border-white/10 bg-white/5 p-3 text-left transition hover:border-white/30 hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/80"
                  title={`Prefill with ${demoEmail}`}
                >
                  <p>
                    Email: <span className="font-sans text-white">{demoEmail}</span>
                  </p>
                  <p className="mt-1 text-white/80">
                    Password: <span className="font-sans text-white">{demoPassword}</span>
                  </p>
                  {note ? (
                    <p className="mt-2 text-[10px] uppercase tracking-[0.3em] text-white/60">
                      {note}
                    </p>
                  ) : null}
                </button>
              </li>
            ))}
          </ul>
          <p className="mt-4">
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
