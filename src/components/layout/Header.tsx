'use client';

import type { CSSProperties } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { MainMenu } from '@/components/nav/MainMenu';

const SAFE_AREA_STYLES: CSSProperties = {
  paddingInlineStart: 'max(1.5rem, env(safe-area-inset-left))',
  paddingInlineEnd: 'max(1.5rem, env(safe-area-inset-right))',
};

export function Header() {
  const pathname = usePathname();
  const isCommunityLanding = pathname === '/community';
  const isPrivateCommunityRoute = pathname.startsWith('/community/');

  if (
    pathname.startsWith('/admin') ||
    pathname.startsWith('/dashboard') ||
    isPrivateCommunityRoute
  ) {
    return null;
  }

  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-40">
      <div
        className="flex items-center justify-between px-6 py-4 sm:px-10 sm:py-6 lg:px-16"
        style={SAFE_AREA_STYLES}
      >
        <Link
          href="/"
          aria-label="Beeyond the World — Home"
          className="pointer-events-auto flex items-center"
        >
          <Image
            src="/assets/icones/Ico Gold BEE-13.svg"
            alt="Beeyond the World"
            width={38}
            height={38}
            className="h-7 w-auto object-contain sm:h-8"
            priority
          />
        </Link>
        <div className="pointer-events-auto flex items-center gap-5 sm:gap-7">
          {isCommunityLanding ? (
            <Link
              href="/dashboard"
              className="group inline-flex min-h-11 flex-col items-start justify-center font-display text-[10px] uppercase leading-none tracking-[0.4em] text-white transition-colors hover:text-[#f6c452] focus-visible:text-[#f6c452] focus-visible:outline-none"
            >
              <span>Dashboard</span>
              <span
                aria-hidden
                className="mt-1.5 h-px w-full origin-left scale-x-0 bg-gradient-to-r from-[rgba(249,215,162,0.18)] via-[rgba(244,199,122,0.75)] to-[rgba(255,240,225,0.95)] transition-transform duration-300 ease-out group-hover:scale-x-100 group-focus-visible:scale-x-100"
              />
            </Link>
          ) : null}
          <MainMenu />
        </div>
      </div>
    </div>
  );
}
