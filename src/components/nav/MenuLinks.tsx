'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { AnimatePresence, MotionConfig, motion, useReducedMotion } from 'framer-motion';
import * as React from 'react';

import { mainNav } from '@/config/navigation';
import { cn } from '@/lib/utils';

type MenuLinksProps = {
  isOpen: boolean;
  onNavigate?: () => void;
};

export function MenuLinks({ isOpen, onNavigate }: MenuLinksProps) {
  const pathname = usePathname();
  const reduceMotion = useReducedMotion();

  const itemVariants = React.useMemo(() => {
    const offset = reduceMotion ? 0 : 8;
    return {
      hidden: { opacity: 0, y: offset },
      visible: { opacity: 1, y: 0 },
      exit: { opacity: 0, y: reduceMotion ? 0 : -offset / 2 },
    };
  }, [reduceMotion]);

  const listVariants = React.useMemo(
    () => ({
      hidden: { opacity: 0 },
      visible: {
        opacity: 1,
        transition: { staggerChildren: reduceMotion ? 0 : 0.06 },
      },
      exit: {
        opacity: 0,
        transition: { staggerChildren: reduceMotion ? 0 : 0.04, staggerDirection: -1 },
      },
    }),
    [reduceMotion]
  );

  function handleNavigate() {
    onNavigate?.();
  }

  return (
    <MotionConfig transition={{ duration: 0.35, ease: [0.33, 1, 0.68, 1] }}>
      <AnimatePresence initial={false}>
        {isOpen ? (
          <motion.ul
            key="menu-links"
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={listVariants}
            className="flex flex-col gap-8"
          >
            {mainNav.map((item) => {
              const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`);

              return (
                <motion.li key={item.href} variants={itemVariants}>
                  <Link
                    href={item.href}
                    prefetch
                    aria-label={item.label}
                    aria-current={isActive ? 'page' : undefined}
                    onClick={handleNavigate}
                    className={cn(
                      'group relative grid min-h-[52px] grid-cols-[2.75rem_minmax(0,1fr)] items-center gap-x-4 rounded-[18px] px-1 py-3 text-white/90 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(244,199,122,0.9)] focus-visible:ring-offset-2 focus-visible:ring-offset-[rgba(34,24,18,0.95)]',
                      isActive ? 'text-[#f6c452]' : 'hover:text-[#f6c452]'
                    )}
                  >
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center">
                      <Image
                        src={item.iconSrc}
                        alt=""
                        width={36}
                        height={36}
                        className="h-8 w-8 object-contain drop-shadow-[0_4px_14px_rgba(0,0,0,0.32)] md:h-9 md:w-9"
                        aria-hidden
                      />
                      <span className="sr-only">{item.index}</span>
                    </span>
                    <span className="relative flex h-11 w-full items-center">
                      <span className="font-menu text-[clamp(30px,2vw,36px)] font-normal uppercase leading-[0.95] tracking-[0em]">
                        {item.label}
                      </span>
                      <span
                        aria-hidden
                        className={cn(
                          'absolute inset-x-0 bottom-0 h-px w-full origin-left scale-x-0 rounded-full bg-gradient-to-r from-[rgba(249,215,162,0.18)] via-[rgba(244,199,122,0.75)] to-[rgba(255,240,225,0.95)] transition-transform duration-300 ease-out group-hover:scale-x-100',
                          isActive && 'scale-x-100'
                        )}
                      />
                    </span>
                  </Link>
                </motion.li>
              );
            })}
          </motion.ul>
        ) : null}
      </AnimatePresence>
    </MotionConfig>
  );
}
