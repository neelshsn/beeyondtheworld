'use client';

import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';

import type { JourneyLocationMedia } from '@/types/journey-location';

/** Keeps the existing Tale canvas while showing every saved image and video. */
export function JourneyTaleMedia({
  image,
  media,
  alt,
}: {
  image: string;
  media?: JourneyLocationMedia[];
  alt: string;
}) {
  const [index, setIndex] = useState(0);
  const items = media?.length ? media : [{ type: 'image' as const, url: image, alt }];
  const current = items[index % items.length];
  const change = (direction: number) =>
    setIndex((value) => (value + direction + items.length) % items.length);

  return (
    <>
      {current.type === 'video' ? (
        <video
          key={current.url}
          src={current.url}
          controls
          playsInline
          preload="metadata"
          aria-label={current.alt ?? alt}
          className="absolute inset-0 h-full w-full object-contain"
        />
      ) : current.url ? (
        <Image
          src={current.url}
          alt={current.alt ?? alt}
          fill
          className="object-contain"
          sizes="(min-width: 1024px) 2240px, 1440px"
          quality={100}
        />
      ) : null}
      {items.length > 1 ? (
        <div className="absolute bottom-5 left-1/2 z-20 flex -translate-x-1/2 items-center gap-4 border border-white/25 bg-black/75 px-3 py-1 text-sm text-white">
          <button
            type="button"
            onClick={() => change(-1)}
            aria-label="Previous Tale media"
            className="flex min-h-11 min-w-11 items-center justify-center focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
          >
            <ChevronLeft className="size-5" />
          </button>
          <span className="min-w-12 text-center" aria-live="polite">
            {(index % items.length) + 1} / {items.length}
          </span>
          <button
            type="button"
            onClick={() => change(1)}
            aria-label="Next Tale media"
            className="flex min-h-11 min-w-11 items-center justify-center focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
          >
            <ChevronRight className="size-5" />
          </button>
        </div>
      ) : null}
    </>
  );
}
