'use client';

import Image from 'next/image';

import { cn } from '@/lib/utils';

import type { ConceptNode } from '@content/concept';

import { forwardRef, useCallback } from 'react';

export type IconoProps = {
  node: ConceptNode;
  isActive: boolean;
  isExpanded?: boolean;
  onSelect: () => void;
  onFocus?: () => void;
};

export const Icono = forwardRef<HTMLButtonElement, IconoProps>(function Icono(
  { node, isActive, isExpanded = false, onSelect, onFocus },
  ref
) {
  const isOpen = isExpanded;

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLButtonElement>) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        onSelect();
      }
    },
    [onSelect]
  );

  return (
    <button
      ref={ref}
      type="button"
      aria-label={`Select ${node.title}`}
      aria-pressed={isActive}
      onClick={onSelect}
      onKeyDown={handleKeyDown}
      onFocus={onFocus}
      className={cn(
        'relative grid size-[168px] place-items-center rounded-full transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/75 sm:size-[190px]',
        isOpen
          ? 'supports-backdrop:bg-white/6 bg-white/10 opacity-100 shadow-[0_0_90px_rgba(246,196,82,0.45)] backdrop-blur-xl'
          : 'bg-transparent opacity-100 shadow-none'
      )}
      style={{ transitionTimingFunction: 'var(--bee-ease)' }}
    >
      {isOpen && (
        <span
          aria-hidden
          className="pointer-events-none absolute -inset-12 scale-105 rounded-full blur-3xl opacity-95 transition-all [transition-duration:1400ms] animate-[pulse_7s_ease-in-out_infinite]"
          style={{
            background:
              'radial-gradient(circle at 50% 50%, rgba(246, 196, 82, 0.58), rgba(246, 196, 82, 0) 72%)',
            transitionTimingFunction: 'var(--bee-ease)',
          }}
        />
      )}

      {isOpen && (
        <span
          aria-hidden
          className="from-white/8 pointer-events-none absolute inset-[8%] scale-105 rounded-full bg-gradient-to-br via-transparent to-transparent opacity-85 transition-all duration-700"
          style={{ transitionTimingFunction: 'var(--bee-ease)' }}
        />
      )}

      <span
        className={cn(
          'relative flex size-[124px] items-center justify-center rounded-full text-white/90 transition-transform duration-700 sm:size-[138px]',
          isOpen
            ? 'bg-white/12 scale-[1.06] shadow-[0_0_120px_rgba(246,196,82,0.58)] backdrop-blur-lg supports-backdrop:bg-white/10'
            : 'bg-transparent shadow-none'
        )}
        style={{ transitionTimingFunction: 'var(--bee-ease)' }}
      >
        <Image
          src={node.icon}
          alt={`${node.title} icon`}
          width={132}
          height={132}
          className={cn(
            'h-24 w-24 object-contain sm:h-[110px] sm:w-[110px]',
            isOpen && 'drop-shadow-[0_0_26px_rgba(246,196,82,0.72)]'
          )}
        />
      </span>
    </button>
  );
});
