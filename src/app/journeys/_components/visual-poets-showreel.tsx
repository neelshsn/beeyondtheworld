'use client';
/* eslint-disable @next/next/no-img-element -- Rights-checked renditions must not be cached by the public image loader. */
import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, Feather, MapPin } from 'lucide-react';
import type { PublicPoetAsset } from '@/lib/ecosystem/public';
export function VisualPoetsShowreel({ slug }: { slug: string }) {
  const [items, setItems] = useState<PublicPoetAsset[]>([]),
    track = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const controller = new AbortController();
    fetch('/api/community/ecosystem/showreel?journey=' + encodeURIComponent(slug), {
      cache: 'no-store',
      signal: controller.signal,
    })
      .then((r) => (r.ok ? r.json() : { items: [] }))
      .then((d) => setItems(d.items || []))
      .catch(() => {});
    return () => controller.abort();
  }, [slug]);
  if (!items.length) return null;
  const move = (direction: number) => {
    const node = track.current;
    if (node)
      node.scrollBy({
        left: node.clientWidth * 0.85 * direction,
        behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth',
      });
  };
  return (
    <section
      className="mx-auto w-full max-w-[1600px] px-6 py-20 sm:px-10 lg:px-20"
      aria-label="Visual Poets destination showreel"
    >
      <div className="mb-8 flex items-end justify-between gap-6">
        <div>
          <p className="mb-3 flex items-center gap-2 text-xs uppercase tracking-[.28em] text-[#bb965a]">
            <Feather size={16} aria-hidden />
            BEE Visual Poets
          </p>
          <h2 className="font-display text-3xl sm:text-5xl">Through local eyes.</h2>
          <p className="mt-4 text-sm text-muted-foreground">
            Original perspectives, selected by the BEE Creative Studio.
          </p>
        </div>
        <div className="flex shrink-0 gap-2">
          <button
            type="button"
            aria-label="Previous local perspective"
            onClick={() => move(-1)}
            className="rounded-full border border-[#bb965a]/50 p-3"
          >
            <ArrowLeft size={18} />
          </button>
          <button
            type="button"
            aria-label="Next local perspective"
            onClick={() => move(1)}
            className="rounded-full border border-[#bb965a]/50 p-3"
          >
            <ArrowRight size={18} />
          </button>
        </div>
      </div>
      <div ref={track} className="flex snap-x snap-mandatory gap-5 overflow-x-auto pb-5">
        {items.map((item) => (
          <article
            key={item.id}
            className="w-[85vw] max-w-[620px] shrink-0 snap-start overflow-hidden rounded-xl border border-[#bb965a]/20 bg-black/5 sm:w-[55vw] lg:w-[40vw]"
          >
            <div className="relative aspect-[4/3] overflow-hidden bg-black/10">
              {item.mime.startsWith('video/') ? (
                <video
                  className="h-full w-full object-contain"
                  src={'/api/community/ecosystem/showreel?asset=' + item.id}
                  controls
                  playsInline
                  preload="none"
                  aria-label={item.title}
                />
              ) : (
                <img
                  src={'/api/community/ecosystem/showreel?asset=' + item.id}
                  alt={item.description || item.title}
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
              )}
            </div>
            <div className="p-5">
              <p className="mb-2 flex items-center gap-2 text-xs text-muted-foreground">
                <MapPin size={13} aria-hidden />
                {item.location}
              </p>
              <h3 className="font-display text-xl">{item.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{item.description}</p>
              <p className="mt-4 text-xs">
                {item.credit} · {item.creator}
              </p>
              {item.aiDisclosure === 'ai_assisted' && (
                <p className="mt-2 text-xs text-muted-foreground">
                  AI assistance disclosed by the creator.
                </p>
              )}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
