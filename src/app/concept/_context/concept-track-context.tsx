'use client';

import { createContext, useContext } from 'react';

export type ConceptGoToIndexOptions = {
  smooth?: boolean;
  preserveOpen?: boolean;
};

export type ConceptTrackContextValue = {
  currentIndex: number;
  goToIndex: (index: number, options?: ConceptGoToIndexOptions) => void;
};

const ConceptTrackContext = createContext<ConceptTrackContextValue | null>(null);

export function ConceptTrackProvider({
  value,
  children,
}: {
  value: ConceptTrackContextValue;
  children: React.ReactNode;
}) {
  return <ConceptTrackContext.Provider value={value}>{children}</ConceptTrackContext.Provider>;
}

export function useConceptTrack() {
  const context = useContext(ConceptTrackContext);

  if (!context) {
    throw new Error('useConceptTrack must be used within a ConceptTrackProvider');
  }

  return context;
}
