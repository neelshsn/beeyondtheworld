'use client';

import { SmartVideo } from '@/components/primitives/smart-video';
import { Button } from '@/components/ui/button';

import { conceptNodes, type ConceptNode } from '@content/concept';

import Image from 'next/image';

import { useCallback, useEffect, useMemo, useRef } from 'react';

import { ConceptGoToIndexOptions, ConceptTrackProvider } from '../_context/concept-track-context';

import { Icono, ICON_MAP } from '../_components/icono';

import { useBodyScrollLock } from '../_hooks/use-body-scroll-lock';

import { useMotionPreferenceGuard } from '../_hooks/use-motion-preference-guard';

import { usePrefersReducedMotion } from '../_hooks/use-prefers-reduced-motion';

import { useConceptInteractionStore } from '../_store/use-concept-interaction-store';

const SNAP_TIMEOUT = 140;

const ENTER_INTERACTIVE_SELECTOR =
  'button, a, input, textarea, select, [role="button"], [data-interactive]';

const CARD_BACKDROPS = [
  '/assets/journeys/philippines-lagoon-2025/philippines-lagoon-2025-gallery-01.png',

  '/assets/journeys/philippines-lagoon-2025/philippines-lagoon-2025-gallery-02.png',

  '/assets/journeys/philippines-lagoon-2025/philippines-lagoon-2025-gallery-03.png',
];

export function ConceptFoundation() {
  useBodyScrollLock();

  useMotionPreferenceGuard();

  const prefersReducedMotion = usePrefersReducedMotion();

  const trackRef = useRef<HTMLDivElement | null>(null);

  const isProgrammaticScrollRef = useRef(false);

  const pendingIndexRef = useRef<number | null>(null);

  const targetIndexRef = useRef(0);

  const snapTimeoutRef = useRef<number | undefined>(undefined);

  const hasAppliedOpenParamRef = useRef(false);

  const currentIndex = useConceptInteractionStore((state) => state.currentIndex);

  const openIndex = useConceptInteractionStore((state) => state.openIndex);

  const setCurrentIndex = useConceptInteractionStore((state) => state.setCurrentIndex);

  const selectIndex = useConceptInteractionStore((state) => state.selectIndex);

  const setOpenIndex = useConceptInteractionStore((state) => state.setOpenIndex);

  const totalNodes = conceptNodes.length;

  const progressValue = totalNodes > 0 ? ((currentIndex + 1) / totalNodes) * 100 : 0;

  const goToIndex = useCallback(
    (index: number, { smooth = true, preserveOpen = false }: ConceptGoToIndexOptions = {}) => {
      const clamped = Math.max(0, Math.min(conceptNodes.length - 1, index));

      const container = trackRef.current;

      if (!preserveOpen) {
        setOpenIndex(null);
      }

      if (!container) {
        pendingIndexRef.current = clamped;

        setCurrentIndex(clamped);

        return;
      }

      const width = container.clientWidth || window.innerWidth || 1;

      const behavior = smooth && !prefersReducedMotion ? 'smooth' : 'auto';

      targetIndexRef.current = clamped;

      isProgrammaticScrollRef.current = true;

      container.scrollTo({
        left: clamped * width,

        behavior,
      });

      if (behavior === 'auto') {
        setCurrentIndex(clamped);

        isProgrammaticScrollRef.current = false;
      }
    },

    [prefersReducedMotion, setCurrentIndex, setOpenIndex]
  );

  useEffect(() => {
    if (!trackRef.current || pendingIndexRef.current === null) {
      return;
    }

    const pending = pendingIndexRef.current;

    pendingIndexRef.current = null;

    goToIndex(pending, { smooth: false });
  }, [goToIndex]);

  useEffect(() => {
    const container = trackRef.current;

    if (!container) {
      return;
    }

    const handleScroll = () => {
      const width = container.clientWidth || window.innerWidth || 1;

      const nextIndex = Math.round(container.scrollLeft / width);

      setCurrentIndex(nextIndex);

      if (openIndex !== null && openIndex !== nextIndex) {
        setOpenIndex(null);
      }

      if (isProgrammaticScrollRef.current && nextIndex === targetIndexRef.current) {
        isProgrammaticScrollRef.current = false;

        return;
      }

      if (snapTimeoutRef.current !== undefined) {
        window.clearTimeout(snapTimeoutRef.current);
      }

      snapTimeoutRef.current = window.setTimeout(
        () => {
          if (isProgrammaticScrollRef.current) {
            return;
          }

          const snapIndex = Math.round(container.scrollLeft / width);

          goToIndex(snapIndex, { smooth: false });
        },
        prefersReducedMotion ? 0 : SNAP_TIMEOUT
      );
    };

    container.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      container.removeEventListener('scroll', handleScroll);

      if (snapTimeoutRef.current !== undefined) {
        window.clearTimeout(snapTimeoutRef.current);

        snapTimeoutRef.current = undefined;
      }
    };
  }, [goToIndex, openIndex, prefersReducedMotion, setCurrentIndex, setOpenIndex]);

  useEffect(() => {
    const container = trackRef.current;

    if (!container) {
      return;
    }

    const handleWheel = (event: WheelEvent) => {
      if (Math.abs(event.deltaY) <= Math.abs(event.deltaX)) {
        return;
      }

      event.preventDefault();

      container.scrollBy({
        left: event.deltaY,

        behavior: prefersReducedMotion ? 'auto' : 'smooth',
      });
    };

    container.addEventListener('wheel', handleWheel, { passive: false });

    return () => container.removeEventListener('wheel', handleWheel);
  }, [prefersReducedMotion]);

  useEffect(() => {
    const container = trackRef.current;

    if (!container) {
      return;
    }

    let isPointerActive = false;

    let startX = 0;

    let startScrollLeft = 0;

    const handlePointerDown = (event: PointerEvent) => {
      if (event.pointerType === 'mouse' && event.button !== 0) {
        return;
      }

      const target = event.target as HTMLElement | null;

      if (
        target?.closest('button, a, input, textarea, select, [role="button"], [data-interactive]')
      ) {
        return;
      }

      isPointerActive = true;

      startX = event.clientX;

      startScrollLeft = container.scrollLeft;

      container.setPointerCapture(event.pointerId);
    };

    const handlePointerMove = (event: PointerEvent) => {
      if (!isPointerActive) {
        return;
      }

      const deltaX = event.clientX - startX;

      container.scrollLeft = startScrollLeft - deltaX;
    };

    const releasePointer = (event: PointerEvent) => {
      if (!isPointerActive) {
        return;
      }

      isPointerActive = false;

      if (container.hasPointerCapture(event.pointerId)) {
        container.releasePointerCapture(event.pointerId);
      }

      const width = container.clientWidth || window.innerWidth || 1;

      const snapIndex = Math.round(container.scrollLeft / width);

      goToIndex(snapIndex, { smooth: !prefersReducedMotion });
    };

    container.addEventListener('pointerdown', handlePointerDown);

    container.addEventListener('pointermove', handlePointerMove);

    container.addEventListener('pointerup', releasePointer);

    container.addEventListener('pointercancel', releasePointer);

    return () => {
      container.removeEventListener('pointerdown', handlePointerDown);

      container.removeEventListener('pointermove', handlePointerMove);

      container.removeEventListener('pointerup', releasePointer);

      container.removeEventListener('pointercancel', releasePointer);
    };
  }, [goToIndex, prefersReducedMotion]);

  const handleOpenRequest = useCallback(
    (index: number) => {
      const shouldOpen = openIndex !== index;

      selectIndex(index, { openCards: shouldOpen });

      goToIndex(index, { preserveOpen: shouldOpen });
    },

    [goToIndex, openIndex, selectIndex]
  );

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowRight') {
        event.preventDefault();

        goToIndex(currentIndex + 1);

        return;
      }

      if (event.key === 'ArrowLeft') {
        event.preventDefault();

        goToIndex(currentIndex - 1);

        return;
      }

      if (event.key === 'Escape' && openIndex !== null) {
        event.preventDefault();

        setOpenIndex(null);

        return;
      }

      if (event.key === 'Enter') {
        const activeElement = document.activeElement as HTMLElement | null;

        if (activeElement && activeElement.closest(ENTER_INTERACTIVE_SELECTOR)) {
          return;
        }

        event.preventDefault();

        handleOpenRequest(currentIndex);
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, goToIndex, handleOpenRequest, openIndex, setOpenIndex]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const applyHash = () => {
      const hash = window.location.hash.replace('#', '');

      if (!hash) {
        return;
      }

      const index = conceptNodes.findIndex((node) => node.id === hash);

      if (index >= 0) {
        goToIndex(index, { smooth: false });
      }
    };

    applyHash();

    window.addEventListener('hashchange', applyHash);

    return () => window.removeEventListener('hashchange', applyHash);
  }, [goToIndex]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const node = conceptNodes[currentIndex];

    if (!node) {
      return;
    }

    const desiredHash = `#${node.id}`;

    const params = window.location.search;

    const nextUrl = `${window.location.pathname}${params}${desiredHash}`;

    if (`${params}${desiredHash}` !== `${window.location.search}${window.location.hash}`) {
      history.replaceState(null, '', nextUrl);
    }
  }, [currentIndex]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const params = new URLSearchParams(window.location.search);

    if (openIndex !== null) {
      params.set('open', '1');
    } else {
      params.delete('open');
    }

    const search = params.toString();

    const nextUrl = `${window.location.pathname}${search ? `?${search}` : ''}${window.location.hash}`;

    if (nextUrl !== `${window.location.pathname}${window.location.search}${window.location.hash}`) {
      history.replaceState(null, '', nextUrl);
    }
  }, [openIndex]);

  useEffect(() => {
    if (typeof window === 'undefined' || hasAppliedOpenParamRef.current) {
      return;
    }

    const params = new URLSearchParams(window.location.search);

    if (params.get('open') !== '1') {
      hasAppliedOpenParamRef.current = true;

      return;
    }

    const hash = window.location.hash.replace('#', '');

    const hashIndex = conceptNodes.findIndex((node) => node.id === hash);

    const targetIndex = hashIndex >= 0 ? hashIndex : currentIndex;

    selectIndex(targetIndex, { openCards: true });

    goToIndex(targetIndex, { preserveOpen: true });

    hasAppliedOpenParamRef.current = true;
  }, [currentIndex, goToIndex, selectIndex]);

  const handleIconSelect = useCallback(
    (index: number) => {
      handleOpenRequest(index);
    },

    [handleOpenRequest]
  );

  const contextValue = useMemo(
    () => ({
      currentIndex,

      goToIndex,
    }),

    [currentIndex, goToIndex]
  );

  return (
    <ConceptTrackProvider value={contextValue}>
      <div className="relative h-screen w-screen overflow-hidden bg-black text-white">
        <BackgroundCanvas prefersReducedMotion={prefersReducedMotion} />

        <main className="relative z-10 h-full w-full">
          <div
            className="pointer-events-none absolute inset-x-0 top-0 z-20 h-1 overflow-hidden rounded-full bg-white/10"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={totalNodes}
            aria-valuenow={currentIndex + 1}
            aria-valuetext={`${currentIndex + 1} of ${totalNodes}`}
          >
            <div
              aria-hidden
              className="h-full w-full origin-left bg-gradient-to-r from-[#f6c452] via-[#f0a87a] to-[#f7d799]"
              style={{
                transform: `scaleX(${Math.max(0, Math.min(100, progressValue)) / 100})`,

                transformOrigin: 'left center',

                transition: 'transform 600ms var(--bee-ease)',
              }}
            />
          </div>

          <div
            ref={trackRef}
            className="concept-track flex h-full min-h-0 snap-x snap-mandatory overflow-x-auto scroll-smooth"
            style={{ scrollbarWidth: 'none' }}
          >
            {conceptNodes.map((node, index) => (
              <section
                key={node.id}
                className="flex h-full w-screen flex-shrink-0 snap-center items-center justify-center px-6 text-center sm:px-12"
                aria-hidden={index !== currentIndex}
              >
                <div className="flex w-full max-w-3xl flex-col items-center gap-10 sm:gap-12">
                  <div className="relative flex flex-col items-center gap-5">
                    <Icono
                      node={node}
                      isActive={index === currentIndex}
                      isExpanded={openIndex === index}
                      onSelect={() => handleIconSelect(index)}
                      onFocus={() => goToIndex(index, { smooth: false, preserveOpen: true })}
                    />

                    <span className="bg-white/12 inline-flex items-center rounded-full border border-white/20 px-5 py-2 text-[11px] uppercase tracking-[0.42em] text-white/70">
                      {node.id}
                    </span>
                  </div>

                  <div className="flex w-full flex-col items-center gap-5 text-center">
                    <h2 className="font-title text-3xl uppercase tracking-[0em] text-white sm:text-4xl md:text-5xl">
                      {node.title}
                    </h2>

                    <p className="max-w-2xl text-sm uppercase tracking-[0.24em] text-white/70 sm:text-base">
                      {node.lead}
                    </p>

                    <Button
                      type="button"
                      variant="secondary"
                      aria-expanded={openIndex === index}
                      aria-controls={`concept-detail-${node.id}`}
                      className="bg-white/12 group relative overflow-hidden border border-white/20 px-8 py-3 text-xs uppercase tracking-[0.32em] text-white transition [transition-timing-function:var(--bee-ease)] hover:bg-white/10 hover:shadow-[0_0_35px_rgba(246,196,82,0.35)] focus-visible:ring-[#f6c452]/35"
                      onClick={() => handleOpenRequest(index)}
                    >
                      <span
                        aria-hidden
                        className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-[#f6c452bf] to-transparent opacity-0 transition-transform duration-500 group-hover:translate-x-full group-hover:opacity-100"
                      />

                      <span className="relative">Open</span>
                    </Button>

                    <ConceptDetailCards node={node} isVisible={openIndex === index} />
                  </div>
                </div>
              </section>
            ))}
          </div>
        </main>
      </div>
    </ConceptTrackProvider>
  );
}

function ConceptDetailCards({ node, isVisible }: { node: ConceptNode; isVisible: boolean }) {
  if (!node.cards?.length) {
    return null;
  }

  return (
    <div id={`concept-detail-${node.id}`} className="w-full max-w-3xl" aria-hidden={!isVisible}>
      <div className="mt-8 grid gap-6 sm:grid-cols-3">
        {node.cards.slice(0, 3).map((card, cardIndex) => {
          const IconComponent = ICON_MAP[card.icon] ?? ICON_MAP.Bee;

          const backdrop = CARD_BACKDROPS[cardIndex % CARD_BACKDROPS.length];

          const delay = `${cardIndex * 90}ms`;

          const visibilityClass = isVisible
            ? 'opacity-100 translate-y-0'
            : 'pointer-events-none opacity-0 translate-y-8';

          return (
            <article
              key={`${node.id}-card-${cardIndex}`}
              className={`border-white/18 bg-white/14 supports-backdrop:bg-white/8 group relative flex min-h-[240px] flex-col items-center justify-center gap-8 overflow-hidden rounded-3xl border p-8 text-center shadow-[0_24px_60px_rgba(0,0,0,0.24)] backdrop-blur-2xl transition-all duration-500 ${visibilityClass}`}
              style={{ transitionDelay: delay }}
            >
              <Image
                src={backdrop}
                alt=""
                fill
                sizes="(min-width: 1280px) 18rem, (min-width: 768px) 33vw, 100vw"
                className="absolute inset-0 h-full w-full scale-100 object-cover opacity-60 transition duration-500 group-hover:scale-105 group-hover:opacity-75"
              />

              <div className="absolute inset-0 bg-gradient-to-br from-black/55 via-black/20 to-transparent" />

              <div className="pointer-events-none absolute inset-0 opacity-0 transition duration-500 group-hover:opacity-100">
                <div className="absolute inset-10 rounded-[inherit] bg-[radial-gradient(circle,_rgba(246,196,82,0.4),_transparent_70%)] blur-3xl" />
              </div>

              <span className="bg-white/18 supports-backdrop:bg-white/12 relative inline-flex size-20 items-center justify-center rounded-full border border-white/30 text-white shadow-[0_0_42px_rgba(246,196,82,0.38)] backdrop-blur-md transition duration-500 group-hover:border-[#f6c452]/70 group-hover:shadow-[0_0_80px_rgba(246,196,82,0.55)]">
                <IconComponent className="size-12 text-[#f6c452]" aria-hidden />
              </span>

              <p className="relative max-w-[18rem] text-sm leading-relaxed text-white/90">
                {card.description}
              </p>
            </article>
          );
        })}
      </div>
    </div>
  );
}

function BackgroundCanvas({ prefersReducedMotion }: { prefersReducedMotion: boolean }) {
  const posterSrc = '/assets/concept/sustainable-poster.png';

  return (
    <div className="absolute inset-0" aria-hidden>
      <div className="relative h-full w-full bg-black">
        {prefersReducedMotion ? (
          <Image src={posterSrc} alt="" fill priority sizes="100vw" className="object-cover" />
        ) : (
          <SmartVideo
            wrapperClassName="absolute inset-0"
            className="h-full w-full object-cover"
            sources={[
              { src: '/assets/concept/sustainable.mp4', type: 'video/mp4' },
              { src: '/assets/concept/sustainable.webm', type: 'video/webm' },
            ]}
            poster={posterSrc}
            fallbackImage={posterSrc}
            autoPlay
            muted
            loop
            playsInline
            priority
            aria-hidden
          />
        )}

        <div className="absolute inset-0 bg-gradient-to-br from-black/65 via-black/30 to-black/15" />
      </div>
    </div>
  );
}
