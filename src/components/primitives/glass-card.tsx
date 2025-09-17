'use client';

import { Slot } from '@radix-ui/react-slot';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import type { HTMLAttributes } from 'react';

import { cn } from '@/lib/utils';

const glowAccent = {
  honey: 'from-[#f0cc7b]/60 via-[#f6ede1]/30 to-transparent',
  umber: 'from-[#7b5433]/45 via-[#f6ede1]/25 to-transparent',
  dawn: 'from-[#f9e9d0]/55 via-[#f6ede1]/35 to-transparent',
};

type GlowAccentKey = keyof typeof glowAccent;

interface GlassCardProps extends HTMLAttributes<HTMLDivElement> {
  asChild?: boolean;
  accent?: GlowAccentKey;
  floating?: boolean;
  hoverGlow?: boolean;
}

export function GlassCard({
  asChild,
  accent = 'honey',
  floating = false,
  hoverGlow = true,
  className,
  children,
  ...props
}: GlassCardProps) {
  const Comp = asChild ? Slot : 'div';
  const rotateX = useSpring(0, { stiffness: 200, damping: 15 });
  const rotateY = useSpring(0, { stiffness: 200, damping: 15 });
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const glowOpacity = useTransform([x, y], ([latestX, latestY]) => {
    return Math.min(0.8, Math.max(0.35, (Math.abs(latestX) + Math.abs(latestY)) / 220));
  });

  return (
    <motion.div
      className="group relative"
      onPointerMove={(event) => {
        const bounds = event.currentTarget.getBoundingClientRect();
        const offsetX = event.clientX - bounds.left;
        const offsetY = event.clientY - bounds.top;
        const centerX = bounds.width / 2;
        const centerY = bounds.height / 2;
        const rotateAmountX = ((offsetY - centerY) / centerY) * -6;
        const rotateAmountY = ((offsetX - centerX) / centerX) * 6;
        x.set(rotateAmountY);
        y.set(rotateAmountX);
        rotateX.set(rotateAmountX);
        rotateY.set(rotateAmountY);
      }}
      onPointerLeave={() => {
        rotateX.set(0);
        rotateY.set(0);
        x.set(0);
        y.set(0);
      }}
    >
      <motion.div
        style={{ rotateX, rotateY }}
        animate={floating ? { y: [0, -8, 0] } : undefined}
        transition={floating ? { duration: 6, repeat: Infinity, ease: 'easeInOut' } : undefined}
        className="relative"
      >
        <Comp
          {...props}
          className={cn(
            'glass-pane relative z-10 flex flex-col gap-6 border-foreground/20 bg-white/20 p-6 backdrop-blur-xl transition-transform duration-500',
            'before:pointer-events-none before:absolute before:inset-0 before:-z-10 before:rounded-[inherit] before:bg-gradient-to-br before:opacity-0 before:transition-opacity',
            hoverGlow &&
              'group-hover:scale-[1.01] group-hover:shadow-[0_35px_90px_-55px_rgba(87,62,38,0.55)]',
            hoverGlow && 'group-hover:before:opacity-60',
            className
          )}
        >
          {children}
        </Comp>
        <motion.div
          aria-hidden
          style={{ opacity: glowOpacity }}
          className={cn(
            'pointer-events-none absolute inset-4 -z-[5] rounded-3xl blur-2xl transition-opacity duration-500',
            'bg-gradient-to-br',
            glowAccent[accent],
            !hoverGlow && 'opacity-40'
          )}
        />
      </motion.div>
    </motion.div>
  );
}
