import type { CSSProperties } from 'react';
import Image from 'next/image';
import Link from 'next/link';

import { MainMenu } from '@/components/nav/MainMenu';

const SAFE_AREA_STYLES: CSSProperties = {
  paddingInlineStart: 'max(1.5rem, env(safe-area-inset-left))',
  paddingInlineEnd: 'max(1.5rem, env(safe-area-inset-right))',
};

export function Header() {
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
            width={44}
            height={44}
            className="h-9 w-auto object-contain sm:h-11"
            priority
          />
        </Link>
        <div className="pointer-events-auto flex items-center">
          <MainMenu />
        </div>
      </div>
    </div>
  );
}
