import { getSupabaseServerClient } from '@/lib/supabase/server-client';

import HomeExperience from '@/app/_components/home-experience';

export default async function Home() {
  const supabase = await getSupabaseServerClient();
  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();
  const coCreateHref = !sessionError && session ? '/journeys' : '/login';

  return <HomeExperience coCreateHref={coCreateHref} />;
}
