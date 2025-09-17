'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';

import { cn } from '@/lib/utils';

export type MediaType = 'image' | 'video';

export interface MediaItem {
  id: string;
  type: MediaType;
  src: string;
  alt: string;
  caption?: string;
  aspectRatio?: 'portrait' | 'landscape' | 'square';
  poster?: string;
}

interface MediaMasonryProps {
  items: MediaItem[];
  className?: string;
  columns?: 2 | 3 | 4;
}

const columnClasses: Record<NonNullable<MediaMasonryProps['columns']>, string> = {
  2: 'md:columns-2',
  3: 'md:columns-2 lg:columns-3',
  4: 'md:columns-3 xl:columns-4',
};

const aspectRatioClasses = {
  portrait: 'aspect-[4/5]',
  landscape: 'aspect-[3/2]',
  square: 'aspect-square',
};

export function MediaMasonry({ items, className, columns = 3 }: MediaMasonryProps) {
  return (
    <div
      className={cn(
        'columns-1 gap-6 space-y-6 md:gap-8 md:space-y-8',
        columnClasses[columns],
        className
      )}
    >
      {items.map((item) => (
        <motion.figure
          key={item.id}
          className="group relative break-inside-avoid overflow-hidden rounded-[28px] border border-white/30 bg-white/5 shadow-aurora"
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          <div
            className={cn(
              'relative w-full overflow-hidden',
              aspectRatioClasses[item.aspectRatio ?? 'portrait']
            )}
          >
            {item.type === 'image' ? (
              <Image
                src={item.src}
                alt={item.alt}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-[1.05]"
                sizes="(max-width: 768px) 100vw, 40vw"
              />
            ) : (
              <video
                className="absolute inset-0 size-full object-cover"
                poster={item.poster}
                autoPlay
                muted
                loop
                playsInline
              >
                <source src={item.src} />
              </video>
            )}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent opacity-60" />
          </div>
          {item.caption ? (
            <figcaption className="px-6 py-4 text-xs uppercase tracking-[0.25em] text-white/80">
              {item.caption}
            </figcaption>
          ) : null}
        </motion.figure>
      ))}
    </div>
  );
}
