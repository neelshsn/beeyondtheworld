'use client';

import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

import { cn } from '@/lib/utils';

const highlightVariants = {
  hidden: { opacity: 0, y: 28, filter: 'blur(6px)' },
  visible: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: 0.7 },
  },
};

const descriptionVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { delay: 0.15, duration: 0.6 },
  },
};

const glowPalette = {
  honey: 'from-white/55 via-white/25 to-transparent',
  umber: 'from-white/40 via-white/20 to-transparent',
  dawn: 'from-white/50 via-white/22 to-transparent',
};

export type GlowTone = keyof typeof glowPalette;

interface GlowTitleProps {
  eyebrow?: string;
  title: string | ReactNode;
  description?: string | ReactNode;
  align?: 'left' | 'center' | 'right';
  className?: string;
  glowTone?: GlowTone;
  revealOnce?: boolean;
}

export function GlowTitle({
  eyebrow,
  title,
  description,
  align = 'left',
  className,
  glowTone = 'honey',
  revealOnce = true,
}: GlowTitleProps) {
  const alignment = {
    left: 'items-start text-left',
    center: 'items-center text-center',
    right: 'items-end text-right',
  }[align];

  return (
    <motion.div
      className={cn('relative mx-auto flex w-full max-w-4xl flex-col gap-4', alignment, className)}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: revealOnce, amount: 0.55 }}
    >
      {eyebrow ? (
        <span
          className={cn(
            'font-display text-xs uppercase tracking-[0.35em] text-foreground/55',
            align === 'center' && 'mx-auto'
          )}
        >
          {eyebrow}
        </span>
      ) : null}
      <motion.h2
        variants={highlightVariants}
        className={cn(
          'relative font-title text-4xl uppercase leading-[1.1] text-foreground sm:text-5xl md:text-6xl',
          '[text-wrap:balance]'
        )}
      >
        <span className="relative inline-block">
          <span className="absolute -inset-y-4 -left-6 -right-6 -z-10 blur-3xl">
            <span
              className={cn(
                'block h-full w-full rounded-full bg-gradient-to-r',
                glowPalette[glowTone]
              )}
            />
          </span>
          <span className="text-glow drop-shadow-[0_16px_64px_rgba(255,255,255,0.35)]">
            {title}
          </span>
        </span>
      </motion.h2>
      {description ? (
        <motion.p
          variants={descriptionVariants}
          className="max-w-2xl text-base text-foreground/70 sm:text-lg"
        >
          {description}
        </motion.p>
      ) : null}
    </motion.div>
  );
}
