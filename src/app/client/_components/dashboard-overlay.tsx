'use client';

import { useCallback, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';

import { Button } from '@/components/ui/button';

import type { DashboardAction, DashboardCardData } from './client-dashboard.types';

export interface DashboardOverlayProps {
  card: DashboardCardData | null;
  onClose: () => void;
  onAction?: (action: DashboardAction, card: DashboardCardData) => void;
}

export function DashboardOverlay({ card, onClose, onAction }: DashboardOverlayProps) {
  const handleKeydown = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    },
    [onClose]
  );

  useEffect(() => {
    if (!card) {
      return undefined;
    }
    document.body.classList.add('overflow-hidden');
    window.addEventListener('keydown', handleKeydown);
    return () => {
      document.body.classList.remove('overflow-hidden');
      window.removeEventListener('keydown', handleKeydown);
    };
  }, [card, handleKeydown]);

  const handleActionClick = useCallback(
    (action: DashboardAction, currentCard: DashboardCardData) => {
      if (action.intent === 'navigate' && action.href) {
        return;
      }
      onAction?.(action, currentCard);
      if (action.intent !== 'modal') {
        onClose();
      }
    },
    [onAction, onClose]
  );

  return (
    <AnimatePresence>
      {card ? (
        <motion.div
          key={card.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35, ease: [0.33, 1, 0.68, 1] }}
          className="fixed inset-0 z-[70] bg-black/75 backdrop-blur-sm"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 16 }}
            transition={{ duration: 0.45, ease: [0.33, 1, 0.68, 1] }}
            className="absolute inset-6 overflow-hidden rounded-[40px] border border-white/15 bg-gradient-to-br from-[#0d0d12] via-[#14141c] to-[#111015] shadow-[0_55px_160px_-60px_rgba(0,0,0,0.85)]"
          >
            <button
              type="button"
              onClick={onClose}
              className="absolute right-6 top-6 z-20 flex size-11 items-center justify-center rounded-full border border-white/25 bg-white/10 text-white transition hover:bg-white/15"
              aria-label="Close overlay"
            >
              <X className="size-5" />
            </button>
            <div className="relative flex h-full flex-col gap-8 overflow-y-auto px-8 pb-12 pt-20 md:px-12 lg:px-16">
              <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
                <div className="space-y-6 text-white">
                  <div className="space-y-3">
                    {card.eyebrow ? (
                      <span className="font-display text-[11px] uppercase tracking-[0.45em] text-white/45">
                        {card.eyebrow}
                      </span>
                    ) : null}
                    <h2 className="font-title text-4xl uppercase tracking-[0em] text-white md:text-5xl">
                      {card.title}
                    </h2>
                    {card.subtitle ? (
                      <p className="text-sm uppercase tracking-[0.32em] text-white/65">
                        {card.subtitle}
                      </p>
                    ) : null}
                  </div>
                  {card.description ? (
                    <p className="max-w-2xl text-base leading-relaxed text-white/80">
                      {card.description}
                    </p>
                  ) : null}
                  {card.meta ? (
                    <dl className="grid gap-4 text-xs uppercase tracking-[0.35em] text-white/55 sm:grid-cols-2 md:grid-cols-3">
                      {card.meta.map((item) => (
                        <div
                          key={`${card.id}-overlay-${item.label}`}
                          className="border-white/12 bg-white/8 rounded-[22px] border px-5 py-3"
                        >
                          <dt className="text-white/45">{item.label}</dt>
                          <dd className="mt-2 text-white/85">{item.value}</dd>
                        </div>
                      ))}
                    </dl>
                  ) : null}
                  <div className="flex flex-wrap gap-3">
                    {card.actions?.map((action, index) => {
                      const tone = action.tone ?? (index === 0 ? 'primary' : 'secondary');
                      const buttonClass =
                        tone === 'primary'
                          ? 'rounded-full border border-white/25 bg-white/85 px-7 py-3 font-display text-[11px] uppercase tracking-[0.4em] text-black hover:bg-white'
                          : tone === 'ghost'
                            ? 'rounded-full border border-white/25 bg-transparent px-7 py-3 font-display text-[11px] uppercase tracking-[0.4em] text-white hover:bg-white/10'
                            : 'rounded-full border border-white/25 bg-white/12 px-7 py-3 font-display text-[11px] uppercase tracking-[0.4em] text-white hover:bg-white/18';

                      if (action.href) {
                        return (
                          <Button
                            asChild
                            key={`${card.id}-action-${action.label}`}
                            className={buttonClass}
                          >
                            <Link href={action.href}>{action.label}</Link>
                          </Button>
                        );
                      }

                      return (
                        <Button
                          key={`${card.id}-action-${action.label}`}
                          onClick={() => handleActionClick(action, card)}
                          className={buttonClass}
                        >
                          {action.label}
                        </Button>
                      );
                    })}
                    {!card.actions?.length && card.href ? (
                      <Button
                        asChild
                        className="rounded-full border border-white/25 bg-white/85 px-7 py-3 font-display text-[11px] uppercase tracking-[0.4em] text-black hover:bg-white"
                      >
                        <Link href={card.href}>Open experience</Link>
                      </Button>
                    ) : null}
                  </div>
                </div>
                <div className="relative h-[320px] w-full overflow-hidden rounded-[36px] border border-white/15 bg-white/10 md:h-[420px]">
                  {card.media ? (
                    card.media.kind === 'video' ? (
                      <video
                        className="size-full object-cover"
                        autoPlay
                        playsInline
                        loop
                        muted
                        poster={card.media.poster}
                      >
                        <source src={card.media.src} />
                      </video>
                    ) : (
                      <Image
                        src={card.media.src}
                        alt={card.media.alt}
                        fill
                        sizes="(max-width: 768px) 90vw, 45vw"
                        className="object-cover"
                      />
                    )
                  ) : (
                    <div className="flex h-full items-center justify-center text-sm uppercase tracking-[0.4em] text-white/60">
                      Visual to be curated
                    </div>
                  )}
                </div>
              </div>

              {card.gallery && card.gallery.length ? (
                <div className="space-y-4">
                  <p className="font-display text-xs uppercase tracking-[0.38em] text-white/55">
                    Gallery glimpses
                  </p>
                  <div className="grid gap-4 md:grid-cols-3">
                    {card.gallery.map((media) => (
                      <div
                        key={`${card.id}-gallery-${media.src}`}
                        className="border-white/12 bg-white/6 relative h-[180px] overflow-hidden rounded-[28px] border"
                      >
                        {media.kind === 'video' ? (
                          <video
                            className="size-full object-cover"
                            playsInline
                            muted
                            loop
                            autoPlay
                            poster={media.poster}
                          >
                            <source src={media.src} />
                          </video>
                        ) : (
                          <Image
                            src={media.src}
                            alt={media.alt}
                            fill
                            sizes="(max-width: 768px) 90vw, 24vw"
                            className="object-cover"
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}

              {card.badges && card.badges.length ? (
                <div className="space-y-3">
                  <p className="font-display text-xs uppercase tracking-[0.38em] text-white/55">
                    Highlights
                  </p>
                  <ul className="grid gap-3 text-sm text-white/80 md:grid-cols-2">
                    {card.badges.map((badge) => (
                      <li
                        key={`${card.id}-badge-${badge}`}
                        className="bg-white/8 rounded-[22px] border border-white/15 px-5 py-4"
                      >
                        {badge}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
