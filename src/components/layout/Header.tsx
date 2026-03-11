import type { CSSProperties } from 'react';

import { MainMenu } from '@/components/nav/MainMenu';

const SAFE_AREA_STYLES: CSSProperties = {
  paddingInlineStart: 'max(1.5rem, env(safe-area-inset-left))',
  paddingInlineEnd: 'max(1.5rem, env(safe-area-inset-right))',
};

export function Header() {
  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-40">
      <div
        className="flex justify-end px-6 py-4 sm:px-10 sm:py-6 lg:px-16"
        style={SAFE_AREA_STYLES}
      >
        <div className="pointer-events-auto flex items-center">
          <MainMenu />
        </div>
      </div>
    </div>
  );
}
