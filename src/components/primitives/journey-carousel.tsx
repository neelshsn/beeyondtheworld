'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { ArrowRight, Play } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { GlassCard } from '@/components/primitives/glass-card';

export interface JourneyPreview {
  id: string;
  title: string;
  excerpt: string;
  location: string;
  coverImage: string;
  teaserVideo?: string;
  launchDate?: string;
  slug: string;
  accent?: 'rose' | 'peach' | 'lilac';
}

interface JourneyCarouselProps {
  items: JourneyPreview[];
  className?: string;
  onNavigate?: (slug: string) => void;
}

export function JourneyCarousel({ items, className, onNavigate }: JourneyCarouselProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [dragLimit, setDragLimit] = useState(0);

  useEffect(() => {
    const node = trackRef.current;
    if (!node) return;

    const updateWidth = () => {
      const totalWidth = node.scrollWidth;
      const visibleWidth = node.clientWidth;
      setDragLimit(Math.max(totalWidth - visibleWidth, 0));
    };

    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, [items]);

  return (
    <div className={cn('relative', className)}>
      <div className="absolute inset-0 -z-10 rounded-[48px] bg-white/30 blur-3xl" />
      <motion.div ref={trackRef} className="overflow-hidden">
        <motion.div
          drag="x"
          dragConstraints={{ left: -dragLimit, right: 0 }}
          className="flex gap-6 pb-4"
          whileTap={{ cursor: 'grabbing' }}
        >
          {items.map((item) => (
            <GlassCard
              key={item.id}
              accent={item.accent ?? 'rose'}
              className="min-h-[420px] min-w-[280px] flex-1 sm:min-w-[360px] md:min-w-[420px]"
            >
              <div className="relative overflow-hidden rounded-3xl">
                <div className="relative aspect-[5/6] overflow-hidden rounded-3xl">
                  <Image
                    src={item.coverImage}
                    alt={item.title}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-[1.05]"
                    sizes="(max-width: 768px) 320px, 420px"
                  />
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/40" />
                  {item.teaserVideo ? (
                    <span className="absolute right-4 top-4 inline-flex items-center gap-2 rounded-full bg-white/80 px-4 py-2 font-display text-[10px] uppercase tracking-[0.35em] text-foreground/80 backdrop-blur">
                      <Play className="size-4" />
                      Teaser
                    </span>
                  ) : null}
                </div>
              </div>
              <div className="flex flex-1 flex-col gap-4">
                <div className="flex items-center justify-between font-display text-[10px] uppercase tracking-[0.35em] text-muted-foreground/70">
                  <span>{item.location}</span>
                  {item.launchDate ? <span>{item.launchDate}</span> : null}
                </div>
                <h3 className="font-title text-2xl uppercase tracking-[0em] text-foreground sm:text-3xl">
                  {item.title}
                </h3>
                <p className="line-clamp-3 text-sm text-muted-foreground/90">{item.excerpt}</p>
                <div className="mt-auto pt-2">
                  <Button
                    variant="ghost"
                    className="group/button inline-flex items-center gap-2 px-0 font-display text-xs uppercase tracking-[0.35em] text-foreground"
                    onClick={() => onNavigate?.(item.slug)}
                  >
                    EXPLORE
                    <ArrowRight className="size-4 transition-transform duration-300 group-hover/button:translate-x-1" />
                  </Button>
                </div>
              </div>
            </GlassCard>
          ))}
        </motion.div>
      </motion.div>
    </div>
  );
}
