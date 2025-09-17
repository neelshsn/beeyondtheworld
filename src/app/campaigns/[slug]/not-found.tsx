import Link from 'next/link';

import { GlowTitle } from '@/components/primitives';
import { Button } from '@/components/ui/button';

export default function CampaignNotFound() {
  return (
    <main className="mx-auto flex min-h-[70vh] w-full max-w-[960px] flex-col items-center justify-center gap-12 px-6 text-center">
      <GlowTitle
        eyebrow="Campaign"
        title="We could not locate this journey yet."
        description="The requested campaign may still be in private preview. Reach out to unlock tailored access."
        align="center"
      />
      <Button asChild className="rounded-full px-8 py-6 text-xs uppercase tracking-[0.4em]">
        <Link href="/">Return home</Link>
      </Button>
    </main>
  );
}
