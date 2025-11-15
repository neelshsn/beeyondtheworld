'use client';

import Link from 'next/link';
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
              const isActive =
                pathname === item.href || (item.href !== '/' && pathname?.startsWith(item.href));

              return (
                <motion.li key={item.href} variants={itemVariants}>
                  <Link
                    href={item.href}
                    prefetch
                    aria-current={isActive ? 'page' : undefined}
                    onClick={handleNavigate}
                    className={cn(
                      'group relative flex min-h-[44px] items-start gap-3 rounded-[18px] px-1 py-3 text-[rgba(255,237,222,0.86)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(244,199,122,0.9)] focus-visible:ring-offset-2 focus-visible:ring-offset-[rgba(34,24,18,0.95)]',
                      isActive
                        ? 'text-[rgba(255,243,231,0.98)]'
                        : 'hover:text-[rgba(255,243,231,0.98)]'
                    )}
                  >
                    <span className="mt-[0.35em] text-xs text-[rgba(244,199,122,0.78)] md:text-sm">
                      <span className="align-super font-display tracking-[0.35em] text-[rgba(244,199,122,0.9)]">
                        {item.index}
                      </span>
                    </span>
                    <span className="relative flex w-full flex-col">
                      <span className="font-menu text-[clamp(32px,5vw,72px)] font-semibold uppercase leading-[0.95] tracking-[0.35em]">
                        {item.label}
                      </span>
                      <span
                        aria-hidden
                        className={cn(
                          'mt-3 h-[3px] w-full origin-left scale-x-0 rounded-full bg-gradient-to-r from-[rgba(249,215,162,0.18)] via-[rgba(244,199,122,0.75)] to-[rgba(255,240,225,0.95)] transition-transform duration-300 ease-out group-hover:scale-x-100',
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
