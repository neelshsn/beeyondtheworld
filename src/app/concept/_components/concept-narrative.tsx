'use client';

import { motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';

import { AssetPlaceholder } from '@/components/primitives';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { ClientLogo, NarrativeSection } from '@/types/content';

interface ConceptNarrativeProps {
  sections: NarrativeSection[];
  clients: ClientLogo[];
}

const sectionVariants = {
  hidden: { opacity: 0, y: 32 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: 'easeOut' },
  },
};

export function ConceptNarrative({ sections, clients }: ConceptNarrativeProps) {
  const [activeId, setActiveId] = useState<string>(sections[0]?.id ?? '');
  const sectionRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const nodes = [...sectionRefs.current];
    const observers = nodes.map((node, index) => {
      if (!node) return null;
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setActiveId(sections[index].id);
            }
          });
        },
        { rootMargin: '-45% 0px -45% 0px' }
      );
      observer.observe(node);
      return observer;
    });

    return () => {
      observers.forEach((observer, index) => {
        const node = nodes[index];
        if (observer && node) {
          observer.unobserve(node);
        }
        observer?.disconnect();
      });
    };
  }, [sections]);

  return (
    <div className="grid gap-12 lg:grid-cols-[280px_1fr]">
      <aside className="hidden lg:block">
        <nav className="sticky top-36 space-y-5 rounded-3xl border border-foreground/15 bg-white/60 p-6 backdrop-blur">
          <p className="font-display text-xs uppercase tracking-[0.35em] text-foreground/55">
            Narrative
          </p>
          <ul className="space-y-3">
            {sections.map((section) => (
              <li key={section.id}>
                <Button
                  variant="ghost"
                  className={cn(
                    'h-auto w-full justify-start rounded-2xl px-5 py-4 text-left font-display text-xs uppercase tracking-[0.3em] transition-all',
                    activeId === section.id
                      ? 'bg-foreground text-background shadow-[0_20px_60px_-40px_rgba(87,62,38,0.5)]'
                      : 'bg-transparent text-foreground/70 hover:bg-white/60'
                  )}
                  onClick={() => {
                    const node = document.getElementById(section.id);
                    node?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }}
                >
                  {section.title.toUpperCase()}
                </Button>
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      <div className="space-y-24">
        {sections.map((section, index) => (
          <motion.section
            key={section.id}
            id={section.id}
            ref={(node) => {
              sectionRefs.current[index] = node;
            }}
            className="scroll-mt-32 rounded-[36px] border border-foreground/15 bg-white/55 p-10 backdrop-blur"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: false, amount: 0.4 }}
            variants={sectionVariants}
          >
            <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
              <div className="space-y-6">
                <p className="font-display text-xs uppercase tracking-[0.35em] text-foreground/55">
                  {section.title.toUpperCase()}
                </p>
                <h2 className="font-display text-3xl uppercase tracking-[0.2em] text-foreground sm:text-4xl">
                  {section.description.toUpperCase()}
                </h2>
                {section.bulletPoints ? (
                  <ul className="space-y-3 text-sm text-foreground/70">
                    {section.bulletPoints.map((point) => (
                      <li key={point} className="flex items-start gap-3">
                        <span className="mt-1 size-1.5 rounded-full bg-foreground/40" aria-hidden />
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>
              <div className="space-y-4">
                <AssetPlaceholder
                  label={`${section.media?.kind === 'video' ? 'Video' : 'Image'} placeholder`}
                  fileName={`${section.id}-feature.${section.media?.kind === 'video' ? 'mp4' : 'jpg'}`}
                  placement={`public/assets/concept/${section.id}`}
                  recommendedDimensions={
                    section.media?.kind === 'video' ? '1920x1080 | MP4 10-15s' : '1920x1280 | JPG'
                  }
                  type={section.media?.kind === 'video' ? 'video' : 'image'}
                  className="h-[240px]"
                />
                <p className="text-[11px] uppercase tracking-[0.35em] text-foreground/55">
                  Replace with the supporting visual that summarises this pillar.
                </p>
              </div>
            </div>
          </motion.section>
        ))}

        <section className="space-y-10 rounded-[36px] border border-foreground/15 bg-white/50 p-10 backdrop-blur">
          <p className="font-display text-xs uppercase tracking-[0.35em] text-foreground/55">
            They trust us
          </p>
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4">
            {clients.map((client) => {
              const cleanName = client.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
              return (
                <AssetPlaceholder
                  key={client.name}
                  label={client.name}
                  fileName={`${cleanName}.svg`}
                  placement="public/assets/clients"
                  recommendedDimensions="Vector SVG preferred"
                  type="image"
                  className="h-28"
                />
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}
