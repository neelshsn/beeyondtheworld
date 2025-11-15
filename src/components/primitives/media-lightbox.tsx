'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Image from 'next/image';

import type { ShowcaseMedia } from '@/data/showcases';
import { cn } from '@/lib/utils';
import { SmartVideo } from '@/components/primitives/smart-video';

interface ShowcaseMediaGalleryProps {
  items: ShowcaseMedia[];
  columns?: 2 | 3 | 4;
  className?: string;
}

const columnClasses: Record<NonNullable<ShowcaseMediaGalleryProps['columns']>, string> = {
  2: 'md:columns-2',
  3: 'md:columns-2 xl:columns-3',
  4: 'md:columns-3 xl:columns-4',
};

const cardAspectClass = {
  portrait: 'aspect-[3/4]',
  landscape: 'aspect-[5/3]',
  square: 'aspect-square',
};

export function ShowcaseMediaGallery({ items, columns = 3, className }: ShowcaseMediaGalleryProps) {
  const [active, setActive] = useState<ShowcaseMedia | null>(null);

  const close = useCallback(() => {
    setActive(null);
  }, []);

  useEffect(() => {
    if (!active) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        close();
      }
    }

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [active, close]);

  const galleryItems = useMemo(() => items.filter(Boolean), [items]);

  return (
    <>
      <div
        className={cn(
          'columns-1 gap-6 space-y-6 md:gap-8 md:space-y-8',
          columnClasses[columns],
          className
        )}
      >
        {galleryItems.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setActive(item)}
            className="group relative block w-full cursor-zoom-in break-inside-avoid overflow-hidden rounded-[34px] border border-white/25 bg-white/10 text-left shadow-[0_32px_120px_rgba(15,20,30,0.25)] backdrop-blur"
          >
            <div
              className={cn(
                'relative w-full overflow-hidden',
                cardAspectClass[item.aspectRatio ?? 'portrait']
              )}
            >
              {item.type === 'image' ? (
                <Image
                  src={item.src}
                  alt={item.alt}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, 40vw"
                />
              ) : (
                <SmartVideo
                  wrapperClassName="absolute inset-0"
                  className="size-full object-cover"
                  src={item.src}
                  poster={item.poster}
                  fallbackImage={item.poster}
                  autoPlay
                  muted
                  loop
                  playsInline
                  aria-hidden
                />
              )}
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
            </div>
            {item.caption ? (
              <div className="px-6 py-4 text-xs uppercase tracking-[0.35em] text-white/80">
                {item.caption}
              </div>
            ) : null}
          </button>
        ))}
      </div>

      <AnimatePresence>
        {active ? (
          <motion.div
            className="fixed inset-0 z-[90] flex items-center justify-center bg-black/80 backdrop-blur"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={close}
          >
            <motion.div
              className="relative mx-auto w-[min(90vw,1200px)]"
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.94 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              onClick={(event) => event.stopPropagation()}
            >
              <button
                type="button"
                onClick={close}
                className="absolute right-6 top-6 z-10 rounded-full border border-white/40 bg-black/50 px-4 py-2 text-xs uppercase tracking-[0.4em] text-white transition hover:bg-white/30"
              >
                Close
              </button>
              <div className="relative w-full overflow-hidden rounded-[40px] border border-white/20 bg-black/80">
                <div
                  className={cn(
                    'relative w-full',
                    active.aspectRatio === 'portrait'
                      ? 'aspect-[3/4]'
                      : active.aspectRatio === 'landscape'
                        ? 'aspect-[16/9]'
                        : 'aspect-square'
                  )}
                >
                  {active.type === 'image' ? (
                    <Image src={active.src} alt={active.alt} fill className="object-cover" />
                  ) : (
                    <SmartVideo
                      wrapperClassName="absolute inset-0"
                      className="size-full object-cover"
                      src={active.src}
                      poster={active.poster}
                      fallbackImage={active.poster}
                      controls
                      autoPlay
                      loop
                      muted
                      playsInline
                    />
                  )}
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                </div>
                <div className="space-y-2 px-8 py-6 text-sm text-white/80">
                  <p className="font-display text-xs uppercase tracking-[0.35em] text-white/70">
                    {active.caption ?? 'Immersive detail'}
                  </p>
                  <p>{active.alt}</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
