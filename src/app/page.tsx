import { getSupabaseServerClient } from '@/lib/supabase/server-client';

import HomePageContent from '@/app/_components/home-page-content';
import { campaignShowcases, journeyShowcases } from '@/data/showcases';
import type { JourneyShowcase } from '@/data/showcases';

const heroVideoSrc = '/assets/home/main-background-hero-home.mp4';

export default async function Home() {
  const supabase = await getSupabaseServerClient();
  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();
  const coCreateHref = !sessionError && session ? '/journeys' : '/login';

  const preferredIds = ['india-january-2026', 'morocco-april-2026', 'dolomites-april-2026'];
  const upcomingJourneys = preferredIds
    .map((id) => journeyShowcases.find((journey) => journey.id === id))
    .filter((journey): journey is JourneyShowcase => Boolean(journey));
  const campaignCtaImage =
    campaignShowcases[0]?.hero.poster ?? campaignShowcases[0]?.hero.src ?? undefined;

  return (
    <HomePageContent
      coCreateHref={coCreateHref}
      heroVideoSrc={heroVideoSrc}
      upcomingJourneys={upcomingJourneys}
      campaignCtaImage={campaignCtaImage}
    />
  );
}
