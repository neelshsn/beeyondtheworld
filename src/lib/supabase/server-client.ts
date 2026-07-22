import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { SupabaseClient } from '@supabase/supabase-js';

import { createUnavailableServerClient, isSupabaseConfigured } from './unavailable-client';

export async function getSupabaseServerClient(): Promise<SupabaseClient> {
  const cookieStore = await cookies();

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!isSupabaseConfigured() || !supabaseUrl || !supabaseAnonKey) {
    return createUnavailableServerClient();
  }

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value;
      },
      set() {
        // No-op on server components. Cookies are managed in middleware and route handlers.
      },
      remove() {
        // No-op on server components. Cookies are managed in middleware and route handlers.
      },
    },
  });
}
