import type { SupabaseClient } from '@supabase/supabase-js';

const AUTH_UNAVAILABLE =
  'Client portal authentication is unavailable. Please contact hello@beeyondtheworld.com.';

export function isSupabaseConfigured() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return Boolean(url && anon && !anon.startsWith('sb_secret') && anon !== 'public-anon-key');
}

export function createUnavailableBrowserClient(): SupabaseClient {
  return {
    auth: {
      async signInWithPassword() {
        return { data: { user: null, session: null }, error: { message: AUTH_UNAVAILABLE } };
      },
      async getSession() {
        return { data: { session: null }, error: null };
      },
      onAuthStateChange() {
        return {
          data: { subscription: { unsubscribe() {} } },
          error: null,
        };
      },
      async signOut() {
        return { error: null };
      },
    },
  } as unknown as SupabaseClient;
}

export function createUnavailableServerClient(): SupabaseClient {
  return {
    auth: {
      async getSession() {
        return { data: { session: null }, error: null };
      },
      onAuthStateChange() {
        return {
          data: { subscription: { unsubscribe() {} } },
          error: null,
        };
      },
      async signOut() {
        return { error: null };
      },
      async signInWithPassword() {
        return { data: { user: null, session: null }, error: { message: AUTH_UNAVAILABLE } };
      },
    },
  } as unknown as SupabaseClient;
}
