import { AssetPlaceholder } from '@/components/primitives';

import type { ClientJourneySection } from '@/types/client';

interface JourneySectionProps {
  section: ClientJourneySection;
  index: number;
}

export function JourneySectionBlock({ section, index }: JourneySectionProps) {
  return (
    <section className="grid gap-8 rounded-[32px] border border-foreground/15 bg-white/60 p-8 backdrop-blur lg:grid-cols-[1.1fr_0.9fr]">
      <div className="space-y-6">
        <p className="font-display text-xs uppercase tracking-[0.35em] text-foreground/55">
          {String(index + 1).padStart(2, '0')} - {section.title}
        </p>
        <p className="font-display text-2xl uppercase tracking-[0.2em] text-foreground">
          {section.description.toUpperCase()}
        </p>
        <ul className="space-y-2 text-sm text-foreground/70">
          {section.highlights.map((highlight) => (
            <li key={highlight}>- {highlight}</li>
          ))}
        </ul>
      </div>
      <div className="grid gap-4">
        {section.media.map((media, mediaIndex) => (
          <AssetPlaceholder
            key={media.id}
            label={`${media.type === 'video' ? 'Video' : 'Image'} card ${mediaIndex + 1}`}
            fileName={`${section.id}-${mediaIndex + 1}.${media.type === 'video' ? 'mp4' : 'jpg'}`}
            placement={`public/assets/client/${section.id}`}
            recommendedDimensions={
              media.type === 'video' ? '1920x1080 | MP4 6-10s' : '1920x1280 | JPG'
            }
            type={media.type}
            className="h-[220px]"
          />
        ))}
      </div>
    </section>
  );
}
