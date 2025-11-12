'use client';

import { memo, useCallback, useMemo, useRef } from 'react';
import Image from 'next/image';
import { motion, useInView } from 'framer-motion';

import type { DashboardCardData } from './client-dashboard.types';

type CardVariant = 'spotlight' | 'medium' | 'small';

const ACCENT_CLASS_MAP: Record<NonNullable<DashboardCardData['accent']>, string> = {
  onyx: 'bg-[linear-gradient(135deg,rgba(12,12,14,0.9)_0%,rgba(26,26,32,0.74)_58%,rgba(10,10,14,0.92)_100%)]',
  pearl:
    'bg-[linear-gradient(135deg,rgba(246,240,236,0.92)_0%,rgba(255,255,255,0.78)_55%,rgba(245,238,232,0.94)_100%)]',
  orchid:
    'bg-[linear-gradient(140deg,rgba(116,82,115,0.92)_0%,rgba(148,104,142,0.75)_55%,rgba(96,62,126,0.84)_100%)]',
  honey:
    'bg-[linear-gradient(140deg,rgba(188,128,64,0.94)_0%,rgba(243,186,115,0.78)_60%,rgba(204,142,69,0.9)_100%)]',
  iris: 'bg-[linear-gradient(140deg,rgba(62,74,112,0.92)_0%,rgba(98,112,154,0.75)_55%,rgba(42,52,86,0.88)_100%)]',
  sand: 'bg-[linear-gradient(140deg,rgba(196,172,144,0.94)_0%,rgba(222,206,182,0.78)_55%,rgba(180,152,122,0.9)_100%)]',
};

const PADDING_BY_VARIANT: Record<CardVariant, string> = {
  spotlight: 'p-8 xl:p-10',
  medium: 'p-6',
  small: 'p-5',
};

const TITLE_BY_VARIANT: Record<CardVariant, string> = {
  spotlight: 'text-3xl xl:text-4xl',
  medium: 'text-2xl',
  small: 'text-lg',
};

const SUBTITLE_BY_VARIANT: Record<CardVariant, string> = {
  spotlight: 'text-sm tracking-[0.38em]',
  medium: 'text-[11px] tracking-[0.44em]',
  small: 'text-[10px] tracking-[0.42em]',
};

export interface DashboardCardProps {
  card: DashboardCardData;
  onSelect: (card: DashboardCardData) => void;
  isActive?: boolean;
}

function DashboardCardComponent({ card, onSelect, isActive }: DashboardCardProps) {
  const rootRef = useRef<HTMLButtonElement | null>(null);
  const isInView = useInView(rootRef, { margin: '0px', amount: 0.4 });

  const variant: CardVariant =
    card.size === 'lg' ? 'spotlight' : card.size === 'md' ? 'medium' : 'small';

  const accentClass = useMemo(() => {
    if (card.accentGradient) return card.accentGradient;
    if (card.accent) return ACCENT_CLASS_MAP[card.accent];
    return card.tone === 'light'
      ? 'bg-[linear-gradient(140deg,rgba(248,248,252,0.94)_0%,rgba(238,238,240,0.74)_55%,rgba(255,255,255,0.9)_100%)]'
      : 'bg-[linear-gradient(140deg,rgba(12,14,20,0.9)_0%,rgba(20,24,32,0.72)_55%,rgba(8,10,16,0.9)_100%)]';
  }, [card.accent, card.accentGradient, card.tone]);

  const primaryAction = card.actions?.[0];
  const headlineClass = TITLE_BY_VARIANT[variant];
  const subtitleClass = SUBTITLE_BY_VARIANT[variant];
  const paddingClass = PADDING_BY_VARIANT[variant];

  const showVideo = card.media?.kind === 'video' && isInView;
  const titleGlow =
    card.tone === 'light'
      ? '0 0 14px rgba(240, 168, 72, 0.45)'
      : '0 0 22px rgba(255, 214, 160, 0.85)';

  const handleSelect = useCallback(() => {
    onSelect(card);
  }, [card, onSelect]);

  return (
    <motion.button
      layout
      ref={rootRef}
      type="button"
      data-kind={card.kind}
      data-variant={variant}
      aria-pressed={isActive}
      onClick={handleSelect}
      className={`border-white/12 group relative flex h-full w-full cursor-pointer items-stretch overflow-hidden border text-left shadow-[0_45px_160px_-80px_rgba(12,12,20,0.8)] focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70 ${accentClass}`}
      whileTap={{ scale: 0.99 }}
      transition={{ type: 'spring', stiffness: 280, damping: 26 }}
      aria-label={card.title}
    >
      {card.media ? (
        <div className="absolute inset-0">
          {card.media.kind === 'video' ? (
            showVideo ? (
              <motion.video
                key={card.media.src}
                className="size-full object-cover"
                autoPlay
                muted
                loop
                playsInline
                poster={card.media.poster}
                preload="metadata"
                initial={{ scale: 1.05 }}
                animate={{ scale: 1.02 }}
                transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
              >
                <source src={card.media.src} />
              </motion.video>
            ) : card.media.poster ? (
              <motion.div
                className="size-full"
                initial={{ scale: 1.08 }}
                animate={{ scale: 1.02 }}
                transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
              >
                <Image
                  src={card.media.poster}
                  alt={`${card.title} poster`}
                  fill
                  loading="lazy"
                  sizes="(max-width: 768px) 95vw, 28vw"
                  className="object-cover"
                />
              </motion.div>
            ) : (
              <div className="size-full bg-black/30" />
            )
          ) : (
            <motion.div
              className="size-full"
              initial={{ scale: 1.08 }}
              animate={{ scale: 1.02 }}
              transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
            >
              <Image
                src={card.media.src}
                alt={card.media.alt}
                fill
                loading="lazy"
                sizes="(max-width: 768px) 95vw, 28vw"
                className="object-cover"
              />
            </motion.div>
          )}
        </div>
      ) : null}

      <div className="pointer-events-none absolute inset-0">
        <div className="duration-400 absolute inset-0 bg-black/35 transition-colors group-hover:bg-black/55" />
        <div className="absolute inset-0 origin-top-left scale-100 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.45),rgba(255,255,255,0)_60%)] opacity-0 mix-blend-screen transition-all duration-500 ease-out group-hover:scale-105 group-hover:opacity-55" />
      </div>

      <div className={`relative z-10 flex h-full w-full flex-col justify-between ${paddingClass}`}>
        {variant !== 'spotlight' ? (
          <div className="flex items-center justify-between text-white/70">
            {card.eyebrow ? (
              <span className="text-[10px] uppercase tracking-[0.5em] opacity-60 transition-opacity duration-500 group-hover:opacity-95">
                {card.eyebrow}
              </span>
            ) : null}
            {card.meta?.[0] ? (
              <span className="text-[9px] uppercase tracking-[0.45em] opacity-0 transition-opacity duration-500 group-hover:opacity-95">
                {card.meta[0].value}
              </span>
            ) : null}
          </div>
        ) : null}

        {variant === 'spotlight' ? (
          <div className="mt-auto space-y-5 text-white">
            {card.eyebrow ? (
              <span className="text-[11px] uppercase tracking-[0.48em] text-white/55 transition-opacity duration-500 group-hover:text-white/85">
                {card.eyebrow}
              </span>
            ) : null}
            <div className="space-y-3">
              <motion.h3
                className={`font-title uppercase tracking-[0.26em] text-white ${headlineClass}`}
                layout
                style={{ textShadow: titleGlow }}
              >
                {card.title}
              </motion.h3>
              {card.subtitle ? (
                <motion.p
                  className={`font-display uppercase text-white/70 transition-opacity duration-500 group-hover:text-white/90 ${subtitleClass}`}
                  layout
                >
                  {card.subtitle}
                </motion.p>
              ) : null}
            </div>
            {card.hint ? (
              <p className="text-[11px] uppercase tracking-[0.42em] text-white/55 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
                {card.hint}
              </p>
            ) : null}
          </div>
        ) : (
          <div className="flex flex-col gap-4 text-white">
            <div className="space-y-2">
              <motion.h3
                className={`font-title uppercase tracking-[0.26em] transition-opacity duration-500 ${headlineClass} ${card.tone === 'light' ? 'text-black' : 'text-white'} opacity-95 group-hover:opacity-100`}
                layout
                style={{ textShadow: titleGlow }}
              >
                {card.title}
              </motion.h3>
              {card.subtitle ? (
                <motion.p
                  className={`group-hover:text-white/88 font-display uppercase text-white/65 transition-opacity duration-500 ${subtitleClass}`}
                  layout
                >
                  {card.subtitle}
                </motion.p>
              ) : null}
            </div>
            {variant === 'medium' ? (
              <div className="flex items-end justify-between gap-2 text-[10px] uppercase tracking-[0.42em] text-white/55">
                {card.meta?.[0] ? (
                  <span>{card.meta[0].value}</span>
                ) : (
                  <span className="opacity-0">—</span>
                )}
                {primaryAction?.label ? (
                  <span className="inline-flex translate-y-3 items-center gap-2 rounded-sm border border-white/30 bg-white/15 px-4 py-2 text-[10px] uppercase tracking-[0.42em] text-white/85 opacity-0 shadow-[0_10px_30px_rgba(12,12,22,0.25)] transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
                    {primaryAction.label}
                  </span>
                ) : null}
              </div>
            ) : null}
            {variant === 'small' ? (
              <div className="text-[10px] uppercase tracking-[0.42em] text-white/60 transition-colors duration-300 group-hover:text-white/85">
                {card.hint ?? card.meta?.[0]?.value ?? 'Tap to open'}
              </div>
            ) : null}
          </div>
        )}
      </div>
    </motion.button>
  );
}

export const DashboardCard = memo(DashboardCardComponent);
