'use client';

import { useEffect } from 'react';

const DATA_ATTRIBUTE = 'data-reduce-motion';

export function useMotionPreferenceGuard() {
  useEffect(() => {
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      return () => {};
    }

    const root = document.documentElement;
    const previousValue = root.getAttribute(DATA_ATTRIBUTE);
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

    const applyPreference = (shouldReduce: boolean) => {
      if (shouldReduce) {
        root.setAttribute(DATA_ATTRIBUTE, 'true');
      } else {
        root.removeAttribute(DATA_ATTRIBUTE);
      }
    };

    applyPreference(mediaQuery.matches);

    const listener = (event: MediaQueryListEvent) => {
      applyPreference(event.matches);
    };

    mediaQuery.addEventListener('change', listener);

    return () => {
      mediaQuery.removeEventListener('change', listener);
      if (previousValue === null) {
        root.removeAttribute(DATA_ATTRIBUTE);
      } else {
        root.setAttribute(DATA_ATTRIBUTE, previousValue);
      }
    };
  }, []);
}
