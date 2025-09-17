'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

const MINIMUM_DURATION = 2400;

type LoadingSplashProps = {
  onFinish?: () => void;
};

export function LoadingSplash({ onFinish }: LoadingSplashProps) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setVisible(false);
      onFinish?.();
    }, MINIMUM_DURATION);

    return () => clearTimeout(timeout);
  }, [onFinish]);

  return (
    <AnimatePresence>
      {visible ? (
        <motion.div
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: 'easeInOut' }}
          className="fixed inset-0 z-[80] flex items-center justify-center bg-foreground text-background"
        >
          <div className="relative flex h-[220px] w-[min(540px,90vw)] items-center justify-center overflow-hidden rounded-[44px] bg-background/10 shadow-[0_50px_140px_rgba(30,20,10,0.6)]">
            <motion.div
              initial={{ scaleY: 1 }}
              animate={{ scaleY: 0, opacity: 0 }}
              transition={{ duration: 1.4, delay: 1.1, ease: [0.65, 0, 0.35, 1] }}
              className="loader-curtain absolute inset-0 origin-top bg-gradient-to-b from-foreground via-foreground/90 to-foreground/0"
            />
            <motion.span
              initial={{ letterSpacing: '1.6em', opacity: 0, y: 40 }}
              animate={{ letterSpacing: '0.22em', opacity: 1, y: 0 }}
              transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
              className="loader-word relative z-10 font-display text-[1.1rem] uppercase tracking-[0.2em] text-background"
            >
              BEEYONDTHEWORLD
            </motion.span>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
