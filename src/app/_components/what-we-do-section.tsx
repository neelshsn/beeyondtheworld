'use client';

import Image from 'next/image';
import Link from 'next/link';
import type { ReactNode } from 'react';
import { motion, useMotionTemplate, useMotionValue } from 'framer-motion';
import type { Variants } from 'framer-motion';
import { useEffect, useMemo, useRef } from 'react';

import { GlowTitle, SmartVideo } from '@/components/primitives';
import { cn } from '@/lib/utils';
import { Clapperboard, Leaf, Users } from 'lucide-react';

const iconMap = {
  users: Users,
  clapperboard: Clapperboard,
  leaf: Leaf,
} as const;

type IconName = keyof typeof iconMap;

type MediaAsset = {
  type: 'image' | 'video';
  src: string;
  alt: string;
  poster?: string;
};

type WhatWeDoEntry = {
  id: string;
  label: string;
  icon: IconName;
  title: ReactNode;
  description: string;
  highlights: string[];
  media: MediaAsset;
  surfaceClassName?: string;
};

export type WhatWeDoSectionProps = {
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  entries: [WhatWeDoEntry, ...WhatWeDoEntry[]];
  trustedBrands?: TrustedBrand[];
};

type TrustedBrand = {
  name: string;
  logo: string;
  href?: string;
};

const CARD_EASE = [0.22, 1, 0.36, 1] as const;

const cardRevealVariants = {
  hidden: { opacity: 0, y: 36 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.75, ease: CARD_EASE },
  },
} satisfies Variants;

function WhatWeDoCard({ entry, priority = false }: { entry: WhatWeDoEntry; priority?: boolean }) {
  const cardRef = useRef<HTMLDivElement | null>(null);
  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);

  useEffect(() => {
    const node = cardRef.current;
    if (!node) return;
    const bounds = node.getBoundingClientRect();
    pointerX.set(bounds.width / 2);
    pointerY.set(bounds.height / 2);
  }, [pointerX, pointerY]);

  const glowMask = useMotionTemplate`radial-gradient(360px circle at ${pointerX}px ${pointerY}px, rgba(255,255,255,0.22), transparent 65%)`;
  const IconComponent = iconMap[entry.icon];

  return (
    <motion.article
      ref={cardRef}
      className={cn(
        'group/card border-white/12 relative isolate flex min-h-[460px] w-full max-w-[23.5rem] flex-col overflow-hidden border bg-[#110904]/90 p-8 text-[#fff3dd] shadow-[0_40px_120px_-70px_rgba(8,7,4,0.9)] transition-transform duration-700 [transition-timing-function:var(--bee-ease)] focus-within:-translate-y-1.5 hover:-translate-y-1.5 sm:p-9 lg:p-10',
        entry.surfaceClassName
      )}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.55 }}
      variants={cardRevealVariants}
      onPointerMove={(event) => {
        const node = cardRef.current;
        if (!node) return;
        const bounds = node.getBoundingClientRect();
        pointerX.set(event.clientX - bounds.left);
        pointerY.set(event.clientY - bounds.top);
      }}
      onPointerLeave={() => {
        const node = cardRef.current;
        if (!node) return;
        const bounds = node.getBoundingClientRect();
        pointerX.set(bounds.width / 2);
        pointerY.set(bounds.height / 2);
      }}
    >
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        initial={{ scale: 1.02 }}
        whileHover={{ scale: 1.06 }}
        transition={{ duration: 0.9, ease: CARD_EASE }}
      >
        {entry.media.type === 'video' ? (
          <SmartVideo
            wrapperClassName="absolute inset-0 size-full"
            className="size-full object-cover transition-[transform,opacity] duration-700 ease-bee"
            src={entry.media.src}
            poster={entry.media.poster}
            fallbackImage={entry.media.poster}
            autoPlay
            muted
            loop
            playsInline
            priority={priority}
            aria-hidden
          />
        ) : (
          <Image
            src={entry.media.src}
            alt={entry.media.alt}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 92vw, (max-width: 1280px) 44vw, 23vw"
            priority={priority}
          />
        )}
        <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(11,8,6,0.8)_0%,rgba(11,8,6,0.45)_48%,rgba(11,8,6,0.82)_100%)]" />
      </motion.div>

      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover/card:opacity-100"
        style={{ background: glowMask }}
      />

      <div className="relative z-20 flex h-full flex-col gap-8 text-left">
        <div className="space-y-5">
          <div className="flex items-center gap-3">
            <span className="border-white/18 inline-flex size-12 items-center justify-center border bg-white/10 text-white/80">
              {IconComponent ? <IconComponent className="size-5" aria-hidden /> : null}
            </span>
            <span className="font-display text-xs uppercase tracking-[0.4em] text-white/70">
              {entry.label}
            </span>
          </div>
          <h3 className="font-title text-3xl uppercase leading-[1.08] tracking-[0em] text-white drop-shadow-[0_12px_44px_rgba(0,0,0,0.6)] sm:text-[2.1rem]">
            {entry.title}
          </h3>
          <p className="text-white/78 text-sm leading-relaxed sm:text-base">{entry.description}</p>
        </div>
        <ul className="mt-auto grid gap-3 text-sm text-white/75 sm:text-[15px]">
          {entry.highlights.map((item) => (
            <li key={item} className="flex items-start gap-3">
              <span className="mt-1.5 inline-flex h-1.5 w-1.5 shrink-0 bg-white/70" aria-hidden />
              <span className="leading-snug">{item}</span>
            </li>
          ))}
        </ul>
      </div>
    </motion.article>
  );
}

export function WhatWeDoSection({
  eyebrow,
  title,
  description,
  entries,
  trustedBrands = [],
}: WhatWeDoSectionProps) {
  const marqueeLogos = useMemo(() => {
    if (!trustedBrands.length) return [];
    return [...trustedBrands, ...trustedBrands];
  }, [trustedBrands]);

  return (
    <section className="relative bg-gradient-to-b from-[#fdf9ee] via-[#fdf2e2] to-white px-6 py-20 sm:px-10 lg:px-20">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-12 text-center">
        <GlowTitle
          eyebrow={eyebrow}
          title={title}
          description={description}
          align="center"
          glowTone="honey"
          className="gap-6"
        />
      </div>
      <div className="mx-auto mt-14 flex w-full max-w-6xl flex-col gap-10">
        <div className="grid justify-items-center gap-6 md:grid-cols-2 xl:grid-cols-3">
          {entries.map((entry) => (
            <WhatWeDoCard key={entry.id} entry={entry} priority={entry.media.type === 'video'} />
          ))}
        </div>
        {marqueeLogos.length ? (
          <div className="flex flex-col gap-6">
            <p className="text-center text-xs uppercase tracking-[0.55em] text-foreground/45">
              They trust us
            </p>
            <motion.div className="relative overflow-hidden" animate={{}}>
              <motion.div
                className="flex min-w-max items-center gap-10 px-2"
                animate={{ x: ['0%', '-50%'] }}
                transition={{ repeat: Infinity, repeatType: 'loop', duration: 32, ease: 'linear' }}
              >
                {marqueeLogos.map((brand, index) => {
                  const logo = (
                    <div className="flex h-10 min-w-[120px] items-center justify-center opacity-70 transition-opacity hover:opacity-100">
                      <Image
                        src={brand.logo}
                        alt={brand.name}
                        width={120}
                        height={36}
                        className="h-8 w-auto object-contain"
                        sizes="120px"
                      />
                    </div>
                  );

                  return brand.href ? (
                    <Link
                      key={`${brand.name}-${index}`}
                      href={brand.href}
                      aria-label={brand.name}
                      className="inline-flex"
                    >
                      {logo}
                    </Link>
                  ) : (
                    <div key={`${brand.name}-${index}`}>{logo}</div>
                  );
                })}
              </motion.div>
            </motion.div>
          </div>
        ) : null}
      </div>
    </section>
  );
}
