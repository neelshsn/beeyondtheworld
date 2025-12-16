'use client';

import { SmartVideo } from '@/components/primitives/smart-video';
import { Button } from '@/components/ui/button';

import { conceptNodes, type ConceptNode } from '@content/concept';

import Image from 'next/image';

import { useCallback, useEffect, useMemo, useRef } from 'react';

import { AnimatePresence, motion } from 'framer-motion';

import { ConceptGoToIndexOptions, ConceptTrackProvider } from '../_context/concept-track-context';

import { Icono } from '../_components/icono';

import { useBodyScrollLock } from '../_hooks/use-body-scroll-lock';

import { useMotionPreferenceGuard } from '../_hooks/use-motion-preference-guard';

import { usePrefersReducedMotion } from '../_hooks/use-prefers-reduced-motion';

import { useConceptInteractionStore } from '../_store/use-concept-interaction-store';

const SNAP_TIMEOUT = 140;

const ENTER_INTERACTIVE_SELECTOR =
  'button, a, input, textarea, select, [role="button"], [data-interactive]';

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

  const activeBackground =
    conceptNodes[Math.max(0, Math.min(conceptNodes.length - 1, currentIndex))]?.background ??
    conceptNodes[0]?.background;

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
      if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
        event.preventDefault();

        goToIndex(currentIndex + 1);

        return;
      }

      if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
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
        {activeBackground ? (
          <BackgroundCanvas
            background={activeBackground}
            prefersReducedMotion={prefersReducedMotion}
          />
        ) : null}

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

          <div className="pointer-events-none absolute inset-0 z-30 flex items-center justify-between px-3 sm:px-6">
            <NavArrow
              direction="left"
              onClick={() => goToIndex(currentIndex - 1)}
              disabled={currentIndex <= 0}
            />
            <NavArrow
              direction="right"
              onClick={() => goToIndex(currentIndex + 1)}
              disabled={currentIndex >= totalNodes - 1}
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
                className="relative flex h-full w-screen flex-shrink-0 snap-center items-center justify-center px-6 py-10 sm:px-12 md:px-16"
                aria-hidden={index !== currentIndex}
              >
                <div
                  className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/65"
                  aria-hidden
                />
                <ConceptSlide
                  node={node}
                  isCurrent={index === currentIndex}
                  isOpen={openIndex === index}
                  prefersReducedMotion={prefersReducedMotion}
                  onToggle={() => handleOpenRequest(index)}
                  onFocus={() => goToIndex(index, { smooth: false, preserveOpen: true })}
                />
              </section>
            ))}
          </div>
        </main>
      </div>
    </ConceptTrackProvider>
  );
}

function ConceptSlide({
  node,
  isCurrent,
  isOpen,
  prefersReducedMotion,
  onToggle,
  onFocus,
}: {
  node: ConceptNode;
  isCurrent: boolean;
  isOpen: boolean;
  prefersReducedMotion: boolean;
  onToggle: () => void;
  onFocus: () => void;
}) {
  const fadeDistance = prefersReducedMotion ? 0 : 18;

  const sharedTransition = useMemo(
    () => ({
      duration: prefersReducedMotion ? 0 : 0.65,
      ease: prefersReducedMotion ? 'linear' : [0.16, 1, 0.3, 1],
    }),
    [prefersReducedMotion]
  );

  return (
    <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-col items-center gap-9 text-center sm:gap-12">
      <motion.div
        className="relative flex flex-col items-center"
        animate={
          prefersReducedMotion
            ? { y: 0, scale: 1, filter: 'drop-shadow(0 16px 42px rgba(0,0,0,0.32))' }
            : {
                y: isOpen ? -18 : 0,
                scale: isOpen ? 0.95 : 1,
                filter: isOpen
                  ? 'drop-shadow(0 26px 60px rgba(0,0,0,0.55))'
                  : 'drop-shadow(0 18px 42px rgba(0,0,0,0.35))',
              }
        }
        transition={sharedTransition}
      >
        <Icono
          node={node}
          isActive={isCurrent}
          isExpanded={isOpen}
          onSelect={onToggle}
          onFocus={onFocus}
        />
      </motion.div>

      <AnimatePresence mode="wait" initial={false}>
        {!isOpen ? (
          <motion.div
            key="concept-collapsed"
            initial={{ opacity: 0, y: fadeDistance }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -fadeDistance }}
            transition={sharedTransition}
            className="flex max-w-4xl flex-col items-center gap-6 text-center sm:gap-8"
          >
            <h2
              className="font-title text-4xl uppercase leading-[1.05] tracking-[0em] text-white sm:text-5xl md:text-6xl"
              style={{
                textShadow:
                  '0 0 22px rgba(255,255,255,0.95), 0 0 48px rgba(255,255,255,0.55), 0 14px 38px rgba(0,0,0,0.6)',
              }}
            >
              {node.title}
            </h2>

            <p
              className="max-w-3xl whitespace-pre-line text-sm uppercase tracking-[0.24em] text-white/80 sm:text-base"
              style={{ textShadow: '0 12px 32px rgba(0,0,0,0.55)' }}
            >
              {node.description}
            </p>

            <Button
              type="button"
              aria-expanded={isOpen}
              aria-controls={`concept-detail-${node.id}`}
              className="group relative inline-flex items-center justify-center gap-4 overflow-hidden rounded-full border border-white/25 bg-white/10 px-12 py-4 font-display text-[11px] uppercase tracking-[0.5em] text-white transition-colors duration-300 [transition-timing-function:var(--bee-ease)] hover:border-white/60 hover:bg-white/15 focus-visible:ring-[#f6c452]/35"
              onClick={onToggle}
            >
              <span
                aria-hidden
                className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-[#f6c452bf] to-transparent opacity-0 transition-transform duration-500 group-hover:translate-x-full group-hover:opacity-100"
              />
              <span className="relative">Discover</span>
            </Button>
          </motion.div>
        ) : (
          <motion.div
            key="concept-expanded"
            initial={{ opacity: 0, y: fadeDistance }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -fadeDistance }}
            transition={sharedTransition}
            className="flex w-full flex-col items-center gap-8 text-center sm:gap-10"
          >
            <h3
              className="font-title text-4xl normal-case leading-[1.05] text-white sm:text-5xl md:text-6xl"
              style={{
                textShadow:
                  '0 0 22px rgba(255,255,255,0.95), 0 0 48px rgba(255,255,255,0.55), 0 14px 38px rgba(0,0,0,0.6)',
              }}
            >
              {node.openTitle}
            </h3>

            <ConceptDetailsPanel node={node} />

            <Button
              type="button"
              aria-expanded={isOpen}
              aria-controls={`concept-detail-${node.id}`}
              className="group relative inline-flex items-center justify-center gap-4 overflow-hidden rounded-full border border-white/25 bg-white/10 px-12 py-4 font-display text-[11px] uppercase tracking-[0.5em] text-white transition-colors duration-300 [transition-timing-function:var(--bee-ease)] hover:border-white/60 hover:bg-white/15 focus-visible:ring-[#f6c452]/35"
              onClick={onToggle}
            >
              <span
                aria-hidden
                className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-[#f6c452bf] to-transparent opacity-0 transition-transform duration-500 group-hover:translate-x-full group-hover:opacity-100"
              />
              <span className="relative">Close</span>
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ConceptDetailsPanel({ node }: { node: ConceptNode }) {
  if (!node.details?.length) {
    return null;
  }

  const detailCount = node.details.length;

  const columnClass =
    detailCount === 1
      ? 'sm:grid-cols-1 lg:grid-cols-1'
      : detailCount === 2
        ? 'sm:grid-cols-2 lg:grid-cols-2'
        : 'sm:grid-cols-2 lg:grid-cols-3';

  return (
    <div id={`concept-detail-${node.id}`} className="w-full max-w-6xl p-2 sm:p-4">
      <div className={`grid justify-items-center gap-8 ${columnClass}`}>
        {node.details.map((detail, detailIndex) => (
          <div
            key={`${node.id}-detail-${detailIndex}`}
            className="flex flex-col items-center gap-5 text-center"
            style={{ transitionDelay: `${detailIndex * 90}ms` }}
          >
            <span className="bg-white/12 inline-flex h-20 w-20 items-center justify-center rounded-full shadow-[0_0_52px_rgba(246,196,82,0.45)]">
              <Image
                src={detail.icon}
                alt=""
                width={68}
                height={68}
                className="h-14 w-14 object-contain drop-shadow-[0_0_24px_rgba(246,196,82,0.85)] sm:h-16 sm:w-16"
                aria-hidden
              />
            </span>

            <p className="text-sm leading-relaxed text-white/90 sm:text-base">{detail.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function NavArrow({
  direction,
  disabled,
  onClick,
}: {
  direction: 'left' | 'right';
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={direction === 'left' ? 'Previous concept' : 'Next concept'}
      onClick={onClick}
      disabled={disabled}
      className="pointer-events-auto flex h-12 w-12 items-center justify-center rounded-full bg-black/35 text-white shadow-[0_20px_40px_rgba(0,0,0,0.35)] transition hover:bg-black/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 disabled:cursor-not-allowed disabled:opacity-35 sm:h-14 sm:w-14"
      style={{ transitionTimingFunction: 'var(--bee-ease)' }}
    >
      <svg
        aria-hidden
        viewBox="0 0 24 24"
        className="h-6 w-6"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {direction === 'left' ? <path d="M15 18l-6-6 6-6" /> : <path d="M9 6l6 6-6 6" />}
      </svg>
    </button>
  );
}

function BackgroundCanvas({
  background,
  prefersReducedMotion,
}: {
  background: ConceptNode['background'];
  prefersReducedMotion: boolean;
}) {
  const posterSrc =
    background.type === 'video' ? (background.poster ?? background.src) : background.src;
  const shouldUseImage = prefersReducedMotion || background.type === 'image';

  return (
    <div className="absolute inset-0" aria-hidden>
      <div className="relative h-full w-full bg-black">
        {shouldUseImage ? (
          <Image src={posterSrc} alt="" fill priority sizes="100vw" className="object-cover" />
        ) : (
          <SmartVideo
            wrapperClassName="absolute inset-0"
            className="h-full w-full object-cover"
            sources={[{ src: background.src, type: 'video/mp4' }]}
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

        <div className="from-black/72 via-black/38 to-black/32 absolute inset-0 bg-gradient-to-b" />
      </div>
    </div>
  );
}
