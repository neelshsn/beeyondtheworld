import type { AuthChangeEvent, Session, SupabaseClient } from '@supabase/supabase-js';
import type { ReadonlyRequestCookies } from 'next/dist/server/web/spec-extension/adapters/request-cookies';

export const DEMO_AUTH_COOKIE = 'demo-auth';
export const DEMO_EMAIL = process.env.NEXT_PUBLIC_DEMO_EMAIL ?? 'client@test.com';
export const DEMO_PASSWORD = process.env.NEXT_PUBLIC_DEMO_PASSWORD ?? 'test';

function buildDemoSession(): Session {
  const now = Math.floor(Date.now() / 1000);
  return {
    access_token: 'demo-access-token',
    token_type: 'bearer',
    expires_in: 60 * 60,
    expires_at: now + 60 * 60,
    refresh_token: 'demo-refresh-token',
    user: {
      id: 'demo-user-id',
      aud: 'authenticated',
      email: DEMO_EMAIL,
      created_at: new Date().toISOString(),
      role: 'authenticated',
      app_metadata: { provider: 'demo', providers: ['demo'] },
      user_metadata: { demo: true },
      identities: [],
      updated_at: new Date().toISOString(),
    },
  } as unknown as Session;
}

function shouldUseDemoMode() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anon) return true;
  if (anon.startsWith('sb_secret')) return true;
  if (anon === 'public-anon-key') return true;
  return false;
}

export function isDemoMode() {
  return shouldUseDemoMode();
}

type AuthListener = (event: AuthChangeEvent, session: Session | null) => void;

export function createDemoBrowserClient(): SupabaseClient {
  let session: Session | null = null;
  const listeners = new Set<AuthListener>();

  if (typeof document !== 'undefined') {
    const hasCookie = document.cookie
      .split(';')
      .map((cookie) => cookie.trim())
      .some((cookie) => cookie === `${DEMO_AUTH_COOKIE}=demo`);
    if (hasCookie) {
      session = buildDemoSession();
    }
  }

  const notify = (event: AuthChangeEvent) => {
    listeners.forEach((listener) => listener(event, session));
  };

  const client = {
    auth: {
      async signInWithPassword({ email, password }: { email: string; password: string }) {
        if (email === DEMO_EMAIL && password === DEMO_PASSWORD) {
          session = buildDemoSession();
          notify('SIGNED_IN');
          return { data: { session }, error: null };
        }

        return {
          data: { session: null },
          error: { message: 'Invalid login credentials' },
        };
      },
      async getSession() {
        return { data: { session }, error: null };
      },
      onAuthStateChange(callback: AuthListener) {
        listeners.add(callback);
        return {
          data: {
            subscription: {
              unsubscribe() {
                listeners.delete(callback);
              },
            },
          },
          error: null,
        };
      },
      async signOut() {
        session = null;
        if (typeof document !== 'undefined') {
          document.cookie = `${DEMO_AUTH_COOKIE}=; path=/; max-age=0; SameSite=Lax`;
        }
        notify('SIGNED_OUT');
        return { error: null };
      },
    },
  } as unknown as SupabaseClient;

  return client;
}

export function createDemoServerClient(cookieStore: ReadonlyRequestCookies): SupabaseClient {
  const client = {
    auth: {
      async getSession() {
        const cookie = cookieStore.get(DEMO_AUTH_COOKIE)?.value;
        if (cookie === 'demo') {
          return { data: { session: buildDemoSession() }, error: null };
        }
        return { data: { session: null }, error: null };
      },
      onAuthStateChange() {
        return {
          data: {
            subscription: {
              unsubscribe() {
                // no-op
              },
            },
          },
          error: null,
        };
      },
      async signOut() {
        return { error: null };
      },
      async signInWithPassword() {
        return {
          data: { session: null },
          error: { message: 'signInWithPassword is not available in demo mode' },
        };
      },
    },
  } as unknown as SupabaseClient;

  return client;
}
