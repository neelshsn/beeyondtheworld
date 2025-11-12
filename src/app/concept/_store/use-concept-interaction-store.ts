import { create } from 'zustand';

export type ConceptInteractionState = {
  currentIndex: number;
  openIndex: number | null;
};

export type ConceptInteractionActions = {
  setCurrentIndex: (index: number) => void;
  selectIndex: (index: number, options?: { openCards?: boolean }) => void;
  setOpenIndex: (index: number | null) => void;
  reset: () => void;
};

const INITIAL_STATE: ConceptInteractionState = {
  currentIndex: 0,
  openIndex: null,
};

export type ConceptInteractionStore = ConceptInteractionState & ConceptInteractionActions;

export const useConceptInteractionStore = create<ConceptInteractionStore>()((set, get) => ({
  ...INITIAL_STATE,
  setCurrentIndex: (index) => {
    if (get().currentIndex === index) {
      return;
    }

    set({ currentIndex: index });
  },
  selectIndex: (index, options) => {
    const targetIndex = Math.max(0, index);
    const openCards = options?.openCards;

    set((state) => {
      const shouldUpdateIndex = state.currentIndex !== targetIndex;
      let nextOpen = state.openIndex;

      if (openCards === true) {
        nextOpen = targetIndex;
      } else if (openCards === false) {
        nextOpen = null;
      } else if (shouldUpdateIndex) {
        nextOpen = null;
      }

      if (!shouldUpdateIndex && nextOpen === state.openIndex) {
        return state;
      }

      return {
        currentIndex: shouldUpdateIndex ? targetIndex : state.currentIndex,
        openIndex: nextOpen,
      };
    });
  },
  setOpenIndex: (index) => {
    if (get().openIndex === index) {
      return;
    }
    set({ openIndex: index });
  },
  reset: () => {
    set({ ...INITIAL_STATE });
  },
}));
