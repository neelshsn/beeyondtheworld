'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import Image from 'next/image';
import { useRef, type ReactNode } from 'react';

import { cn } from '@/lib/utils';
import { SmartVideo } from './smart-video';

interface ParallaxSectionProps {
  id?: string;
  backgroundImage?: string;
  backgroundVideo?: string;
  overlayClassName?: string;
  className?: string;
  children?: ReactNode;
  intensity?: number;
  minHeight?: string;
}

export function ParallaxSection({
  id,
  backgroundImage,
  backgroundVideo,
  overlayClassName,
  className,
  children,
  intensity = 18,
  minHeight = 'min-h-[70vh]',
}: ParallaxSectionProps) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  });

  const offset = `${intensity}%`;
  const translateY = useTransform(scrollYProgress, [0, 1], [`-${offset}`, offset]);

  return (
    <section
      id={id}
      ref={sectionRef}
      className={cn('relative overflow-hidden', minHeight, className)}
    >
      <motion.div className="absolute inset-0" style={{ y: translateY }} aria-hidden>
        {backgroundVideo ? (
          <SmartVideo
            wrapperClassName="absolute inset-0"
            className="size-full object-cover"
            src={backgroundVideo}
            autoPlay
            muted
            loop
            playsInline
            fallbackImage={backgroundImage}
            aria-hidden
          />
        ) : backgroundImage ? (
          <Image src={backgroundImage} alt="Parallax background" fill className="object-cover" />
        ) : null}
      </motion.div>
      <div
        className={cn(
          'absolute inset-0 bg-gradient-to-b from-black/40 via-black/10 to-white/5 backdrop-blur-[2px]',
          overlayClassName
        )}
      />
      <div className="relative z-10 mx-auto flex h-full w-full max-w-6xl flex-col justify-center gap-8 px-6 py-24 text-white sm:px-12">
        {children}
      </div>
    </section>
  );
}
