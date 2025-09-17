'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import Image from 'next/image';
import { useRef, useState, type ReactNode } from 'react';

import { cn } from '@/lib/utils';

interface ImmersiveVideoProps {
  src: string;
  poster?: string;
  caption?: string;
  className?: string;
  overlayContent?: ReactNode;
  autoPlay?: boolean;
  muted?: boolean;
  loop?: boolean;
  controls?: boolean;
  aspectRatio?: 'portrait' | 'square' | 'landscape';
  priority?: boolean;
  fallbackImage?: string;
}

const aspectClassMap: Record<NonNullable<ImmersiveVideoProps['aspectRatio']>, string> = {
  landscape: 'aspect-[16/9]',
  portrait: 'aspect-[4/5]',
  square: 'aspect-square',
};

export function ImmersiveVideo({
  src,
  poster,
  caption,
  className,
  overlayContent,
  autoPlay = true,
  muted = true,
  loop = true,
  controls = false,
  aspectRatio = 'landscape',
  priority = false,
  fallbackImage,
}: ImmersiveVideoProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start'],
  });

  const translateY = useTransform(scrollYProgress, [0, 1], ['-6%', '6%']);
  const [isError, setIsError] = useState(false);

  return (
    <motion.figure
      ref={containerRef}
      style={{ y: translateY }}
      className={cn(
        'relative overflow-hidden rounded-[32px] border border-white/30 bg-card shadow-aurora',
        className
      )}
    >
      <div className={cn('relative w-full', aspectClassMap[aspectRatio])}>
        {!isError ? (
          <video
            className="absolute inset-0 size-full object-cover"
            poster={poster}
            autoPlay={autoPlay}
            muted={muted}
            loop={loop}
            playsInline
            controls={controls}
            onError={() => setIsError(true)}
          >
            <source src={src} />
          </video>
        ) : fallbackImage ? (
          <Image
            src={fallbackImage}
            alt={caption ?? 'Video fallback'}
            fill
            priority={priority}
            className="object-cover"
          />
        ) : null}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-white/10" />
        {overlayContent ? (
          <div className="absolute inset-0 flex items-end justify-between p-8 text-white">
            {overlayContent}
          </div>
        ) : null}
      </div>
      {caption ? (
        <figcaption className="flex items-center justify-between px-8 py-6 text-sm text-muted-foreground">
          {caption}
        </figcaption>
      ) : null}
    </motion.figure>
  );
}
