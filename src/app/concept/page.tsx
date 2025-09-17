import type { Metadata } from 'next';

import { Leaf, Globe, Handshake } from 'lucide-react';

import { AssetPlaceholder, GlowTitle } from '@/components/primitives';
import { getClientLogos, getConceptNarrative } from '@/lib/cms/fetchers';

import { ConceptNarrative } from './_components/concept-narrative';

const pillarPlaceholders = [
  {
    id: 'co-travel',
    title: 'Co-travel methodology',
    label: 'Co-travel mood still',
    fileName: 'concept-co-travel.jpg',
    placement: 'public/assets/concept',
    recommendedDimensions: '1920x1280 | JPG',
  },
  {
    id: 'sustainability',
    title: 'Sustainable production',
    label: 'Sustainability artifact',
    fileName: 'concept-sustainability.jpg',
    placement: 'public/assets/concept',
    recommendedDimensions: '1920x1280 | JPG',
  },
  {
    id: 'rse-charter',
    title: 'RSE charter',
    label: 'RSE documentation still',
    fileName: 'concept-rse.jpg',
    placement: 'public/assets/concept',
    recommendedDimensions: '1920x1280 | JPG',
  },
];

export const metadata: Metadata = {
  title: 'Concept - Beeyondtheworld',
  description:
    "Discover Beeyondtheworld's immersive methodology: innovative journey design, CSR commitments, and global impact for luxury brands.",
};

export default async function ConceptPage() {
  const [sections, clients] = await Promise.all([getConceptNarrative(), getClientLogos()]);

  return (
    <main className="flex flex-col gap-24 pb-32">
      <section className="relative flex min-h-[70vh] flex-col justify-end gap-10 px-6 pt-24 sm:px-10 lg:px-20">
        <video className="absolute inset-0 size-full object-cover" autoPlay muted loop playsInline>
          <source src="/assets/concept/sustainable.mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-br from-black/40 via-black/15 to-transparent" />
        <div className="relative z-10 space-y-8 rounded-[48px] border border-white/40 bg-white/85 p-10 backdrop-blur">
          <GlowTitle
            eyebrow="Beeyondtheworld Concept"
            title="Journey-first storytelling for tomorrow"
            description="We choreograph collaborative expeditions that balance creative ambition, regenerative logistics, and measurable CSR outcomes."
            align="left"
            glowTone="honey"
          />
          <div className="flex flex-wrap gap-4 text-[11px] uppercase tracking-[0.45em] text-foreground/60">
            <span className="flex items-center gap-2 rounded-full border border-foreground/25 px-4 py-2">
              <Handshake className="size-4" aria-hidden /> Co-travel labs
            </span>
            <span className="flex items-center gap-2 rounded-full border border-foreground/25 px-4 py-2">
              <Leaf className="size-4" aria-hidden /> Sustainable sets
            </span>
            <span className="flex items-center gap-2 rounded-full border border-foreground/25 px-4 py-2">
              <Globe className="size-4" aria-hidden /> CSR charter
            </span>
          </div>
        </div>
      </section>

      <section className="px-6 sm:px-10 lg:px-20">
        <div className="grid gap-8 lg:grid-cols-3">
          {pillarPlaceholders.map((pillar) => (
            <div key={pillar.id} className="glass-pane min-h-[340px] p-9">
              <AssetPlaceholder
                label={pillar.label}
                fileName={pillar.fileName}
                placement={pillar.placement}
                recommendedDimensions={pillar.recommendedDimensions}
                type="image"
                className="h-[200px]"
              />
              <h3 className="mt-6 font-display text-xl uppercase tracking-[0.24em] text-foreground">
                {pillar.title}
              </h3>
              <p className="mt-3 text-sm text-foreground/70">
                Use this card to highlight the promise with a key visual or infographic. Add the
                supporting copy via the CMS.
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="px-6 sm:px-10 lg:px-20">
        <ConceptNarrative sections={sections} clients={clients} />
      </section>
    </main>
  );
}
