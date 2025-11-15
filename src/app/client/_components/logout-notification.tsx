'use client';

import { AnimatePresence, motion } from 'framer-motion';

interface LogoutNotificationProps {
  account?: string | null;
  visible: boolean;
}

export function LogoutNotification({ account, visible }: LogoutNotificationProps) {
  return (
    <AnimatePresence>
      {visible ? (
        <motion.div
          key="logout-notification"
          initial={{ opacity: 0, y: 18, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 12, scale: 0.96 }}
          transition={{ duration: 0.4, ease: [0.33, 1, 0.68, 1] }}
          className="pointer-events-none fixed inset-x-0 bottom-8 z-[80] flex justify-center px-4 sm:inset-auto sm:right-8 sm:w-[360px] sm:justify-end"
          aria-live="polite"
        >
          <div className="border-white/18 pointer-events-auto overflow-hidden rounded-[28px] border bg-[rgba(15,16,23,0.88)] shadow-[0_22px_80px_-40px_rgba(2,3,8,0.95)] backdrop-blur-xl">
            <div className="relative px-6 py-5 text-white">
              <div className="absolute inset-0 opacity-65">
                <div className="absolute -right-20 -top-16 h-48 w-48 rounded-full bg-[radial-gradient(circle_at_center,rgba(172,143,255,0.35)_0%,rgba(108,82,255,0.15)_50%,transparent_80%)] blur-3xl" />
                <div className="absolute -left-1/3 bottom-0 h-32 w-32 rounded-full bg-[radial-gradient(circle_at_center,rgba(255,180,140,0.35)_0%,rgba(255,120,80,0.18)_55%,transparent_80%)] blur-3xl" />
              </div>
              <div className="relative space-y-3">
                <span className="font-display text-[10px] uppercase tracking-[0.5em] text-white/55">
                  Session ended
                </span>
                <p className="font-title text-lg uppercase tracking-[0em] text-white">
                  You have been logged out
                </p>
                <p className="text-[11px] uppercase tracking-[0.4em] text-white/60">
                  {account ? 'From the following account' : 'Your session is now closed'}
                </p>
                {account ? (
                  <p className="border-white/22 bg-white/12 w-full rounded-full border px-4 py-2 text-center text-[11px] uppercase tracking-[0.38em] text-white/85">
                    {account}
                  </p>
                ) : null}
              </div>
            </div>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
