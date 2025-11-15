'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';

import { SmartVideo } from '@/components/primitives/smart-video';
import { useSupabase } from '@/components/providers/supabase-provider';
import { BASE_TEMPLATE, type DashboardSlotId } from '@/app/client/_lib/dashboard-layout';

import type {
  DashboardAction,
  DashboardCardData,
  DashboardGridSlot,
} from './client-dashboard.types';
import { DashboardCard } from './dashboard-card';
import { DashboardOverlay } from './dashboard-overlay';
import { LogoutNotification } from './logout-notification';

interface ClientDashboardProps {
  slots: DashboardGridSlot[];
}

const OVERLAY_KINDS = new Set<DashboardCardData['kind']>([
  'journey',
  'campaign',
  'contact',
  'concierge',
  'favorites',
  'profile',
]);

const DIRECT_NAV_KINDS = new Set<DashboardCardData['kind']>([
  'all-journeys',
  'all-campaigns',
  'home',
]);

const MOBILE_WIDTH_CLASS: Record<DashboardCardData['size'], string> = {
  lg: 'min-w-[92vw] sm:min-w-[80vw] lg:min-w-0',
  md: 'min-w-[82vw] sm:min-w-[68vw] lg:min-w-0',
  sm: 'min-w-[68vw] sm:min-w-[54vw] lg:min-w-0',
  xs: 'min-w-[56vw] sm:min-w-[44vw] lg:min-w-0',
};

export function ClientDashboard({ slots }: ClientDashboardProps) {
  const router = useRouter();
  const { supabase, session } = useSupabase();
  const [activeCard, setActiveCard] = useState<DashboardCardData | null>(null);
  const [isLogoutNoticeVisible, setIsLogoutNoticeVisible] = useState(false);
  const [logoutAccount, setLogoutAccount] = useState<string | null>(null);
  const logoutRedirectTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const logoutResetTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (logoutRedirectTimeout.current) {
        clearTimeout(logoutRedirectTimeout.current);
      }
      if (logoutResetTimeout.current) {
        clearTimeout(logoutResetTimeout.current);
      }
    };
  }, []);

  const slotMap = useMemo(() => slots.filter((slot) => Boolean(slot.card)), [slots]);
  const userEmail = session?.user?.email ?? null;

  const handleOverlayAction = useCallback(
    async (action: DashboardAction, card: DashboardCardData) => {
      if (action.intent === 'modal') {
        setActiveCard(card);
        return;
      }
      if (action.intent === 'logout') {
        const { data: userData } = await supabase.auth.getUser();
        const user = userData?.user;
        const accountLabel =
          user?.email ??
          (typeof user?.user_metadata?.full_name === 'string'
            ? user.user_metadata.full_name
            : null);

        setLogoutAccount(accountLabel ?? null);
        setIsLogoutNoticeVisible(true);

        try {
          await supabase.auth.signOut();
        } catch {
          // Ignore sign-out errors so the UI can continue
        }

        if (logoutRedirectTimeout.current) {
          clearTimeout(logoutRedirectTimeout.current);
        }
        if (logoutResetTimeout.current) {
          clearTimeout(logoutResetTimeout.current);
        }

        logoutRedirectTimeout.current = setTimeout(() => {
          router.replace('/login');
        }, 1600);

        logoutResetTimeout.current = setTimeout(() => {
          setIsLogoutNoticeVisible(false);
          setLogoutAccount(null);
        }, 4200);

        return;
      }
      if (action.intent === 'contact' && action.href) {
        window.location.href = action.href;
        return;
      }
      if (action.intent === 'navigate' && action.href) {
        router.push(action.href);
      }
    },
    [router, supabase, logoutRedirectTimeout, logoutResetTimeout]
  );

  const handleCardSelect = useCallback(
    (card: DashboardCardData) => {
      if (card.kind === 'logout') {
        void handleOverlayAction({ intent: 'logout', label: 'Sign out' }, card);
        return;
      }

      if (card.kind === 'contact') {
        setActiveCard(card);
        return;
      }

      const firstAction = card.actions?.[0];

      if (
        firstAction?.intent === 'navigate' &&
        firstAction.href &&
        DIRECT_NAV_KINDS.has(card.kind)
      ) {
        router.push(firstAction.href);
        return;
      }

      if (OVERLAY_KINDS.has(card.kind) || (card.actions && card.actions.length > 1)) {
        setActiveCard(card);
        return;
      }

      if (firstAction?.intent === 'navigate' && firstAction.href) {
        router.push(firstAction.href);
        return;
      }

      if (firstAction?.intent === 'contact' && firstAction.href) {
        window.location.href = firstAction.href;
      }
    },
    [handleOverlayAction, router]
  );

  const handleCloseOverlay = useCallback(() => {
    setActiveCard(null);
  }, []);

  return (
    <div className="relative h-full w-full overflow-hidden">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <SmartVideo
          wrapperClassName="absolute inset-0"
          className="h-full w-full object-cover opacity-45"
          sources={[
            { src: '/assets/concept/sustainable.webm', type: 'video/webm' },
            { src: '/assets/concept/sustainable.mp4', type: 'video/mp4' },
          ]}
          poster="/assets/concept/sustainable-poster.png"
          fallbackImage="/assets/concept/sustainable-poster.png"
          autoPlay
          loop
          muted
          playsInline
          aria-hidden
        />
        <div className="absolute inset-0 bg-gradient-to-br from-[#fbe8d7]/85 via-[#f4ddea]/35 to-[#f5f0e7]/20 backdrop-blur-[14px]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,205,170,0.25),transparent_55%),radial-gradient(circle_at_80%_10%,rgba(246,196,215,0.18),transparent_60%),radial-gradient(circle_at_45%_85%,rgba(248,236,210,0.4),transparent_68%)]" />
        <div className="grain-overlay absolute inset-0 opacity-35 mix-blend-soft-light" />
        <motion.span
          aria-hidden
          className="absolute -left-1/3 -top-1/4 h-[160%] w-[120%] opacity-45 blur-[160px]"
          style={{
            background:
              'radial-gradient(circle at center, rgba(255,198,110,0.38) 0%, rgba(241,162,60,0.24) 52%, transparent 82%)',
          }}
          animate={{ rotate: [0, 45, 0] }}
          transition={{ duration: 55, repeat: Infinity, ease: 'linear' }}
        />
        <motion.span
          aria-hidden
          className="absolute -right-1/4 top-[-15%] h-[140%] w-[120%] opacity-40 blur-[150px]"
          style={{
            background:
              'radial-gradient(circle at center, rgba(255,236,210,0.38) 0%, rgba(252,205,140,0.24) 48%, transparent 78%)',
          }}
          animate={{ rotate: [0, -35, 0] }}
          transition={{ duration: 48, repeat: Infinity, ease: 'linear' }}
        />
      </div>

      <div className="relative z-10 flex h-full w-full flex-col p-6 md:p-10 2xl:p-14">
        <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.45em] text-white/60">
          <span className="hidden lg:inline-flex">{userEmail ?? 'Maison dashboard'}</span>
          <span className="lg:hidden">{userEmail ?? 'Maison dashboard'}</span>
        </div>

        <div className="mt-6 flex h-full w-full snap-x snap-mandatory gap-2 overflow-x-auto pb-2 lg:grid lg:snap-none lg:grid-flow-dense lg:grid-cols-2 lg:grid-rows-[repeat(5,minmax(160px,1fr))] lg:gap-2 lg:overflow-visible lg:pb-0 xl:grid-cols-4 xl:grid-rows-[repeat(4,minmax(180px,1fr))] 2xl:grid-cols-4 2xl:grid-rows-[repeat(4,minmax(190px,1fr))]">
          {slotMap.map((slot) => {
            const layoutClass = BASE_TEMPLATE[slot.id as DashboardSlotId] ?? slot.layoutClass;

            return (
              <motion.div
                key={slot.id}
                layout
                transition={{ layout: { type: 'spring', stiffness: 260, damping: 32 } }}
                className={`snap-start lg:snap-none ${MOBILE_WIDTH_CLASS[slot.card.size]} ${layoutClass}`}
              >
                <DashboardCard
                  card={slot.card}
                  onSelect={handleCardSelect}
                  isActive={activeCard?.id === slot.card.id}
                />
              </motion.div>
            );
          })}
        </div>
      </div>

      <LogoutNotification account={logoutAccount} visible={isLogoutNoticeVisible} />
      <DashboardOverlay
        card={activeCard}
        onClose={handleCloseOverlay}
        onAction={handleOverlayAction}
      />
    </div>
  );
}
