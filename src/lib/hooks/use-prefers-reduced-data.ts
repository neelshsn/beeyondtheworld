'use client';

import { useEffect, useState } from 'react';

type NetworkInformationLike = {
  saveData?: boolean;
  effectiveType?: string;
  addEventListener?: (type: 'change', listener: () => void) => void;
  removeEventListener?: (type: 'change', listener: () => void) => void;
};

type NavigatorWithConnection = Navigator & {
  connection?: NetworkInformationLike;
  mozConnection?: NetworkInformationLike;
  webkitConnection?: NetworkInformationLike;
};

/**
 * Detects when the browser/device indicates a constrained connection
 * (Data Saver enabled or very slow radio) so we can disable autoplay
 * and delay fetching heavy video payloads until a user interacts.
 */
export function usePrefersReducedData() {
  const [prefersReducedData, setPrefersReducedData] = useState(false);

  useEffect(() => {
    if (typeof navigator === 'undefined') {
      return;
    }

    const nav = navigator as NavigatorWithConnection;
    const connection = nav.connection ?? nav.mozConnection ?? nav.webkitConnection;

    if (!connection) {
      return;
    }

    const updatePreference = () => {
      const isSlowConnection =
        connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g';
      setPrefersReducedData(Boolean(connection.saveData) || isSlowConnection);
    };

    updatePreference();

    connection.addEventListener?.('change', updatePreference);
    return () => connection.removeEventListener?.('change', updatePreference);
  }, []);

  return prefersReducedData;
}
