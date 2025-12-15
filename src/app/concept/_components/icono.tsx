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
  const isElevated = isActive || isExpanded;

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
        'supports-backdrop:bg-white/6 relative grid size-[168px] place-items-center rounded-full bg-white/10 backdrop-blur-xl transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/75 sm:size-[190px]',
        isElevated
          ? 'opacity-100 shadow-[0_0_90px_rgba(246,196,82,0.45)]'
          : 'opacity-85 hover:opacity-100'
      )}
      style={{ transitionTimingFunction: 'var(--bee-ease)' }}
    >
      <span
        aria-hidden
        className={cn(
          'pointer-events-none absolute -inset-12 rounded-full blur-3xl transition-all [transition-duration:1400ms]',
          isExpanded
            ? 'scale-105 animate-[pulse_7s_ease-in-out_infinite] opacity-95'
            : isElevated
              ? 'scale-100 opacity-85'
              : 'scale-95 opacity-45'
        )}
        style={{
          background:
            'radial-gradient(circle at 50% 50%, rgba(246, 196, 82, 0.58), rgba(246, 196, 82, 0) 72%)',
          transitionTimingFunction: 'var(--bee-ease)',
        }}
      />

      <span
        aria-hidden
        className={cn(
          'from-white/8 pointer-events-none absolute inset-[8%] rounded-full bg-gradient-to-br via-transparent to-transparent transition-all duration-700',
          isExpanded
            ? 'scale-105 opacity-85'
            : isElevated
              ? 'scale-100 opacity-65'
              : 'scale-95 opacity-35'
        )}
        style={{ transitionTimingFunction: 'var(--bee-ease)' }}
      />

      <span
        className={cn(
          'bg-white/12 relative flex size-[124px] items-center justify-center rounded-full text-white/90 shadow-[0_20px_55px_rgba(246,196,82,0.28)] backdrop-blur-lg transition-transform duration-700 supports-backdrop:bg-white/10 sm:size-[138px]',
          isExpanded
            ? 'scale-[1.06] shadow-[0_0_120px_rgba(246,196,82,0.58)]'
            : isActive
              ? 'shadow-[0_0_95px_rgba(246,196,82,0.38)]'
              : 'shadow-[0_0_70px_rgba(246,196,82,0.24)]'
        )}
        style={{ transitionTimingFunction: 'var(--bee-ease)' }}
      >
        <Image
          src={node.icon}
          alt={`${node.title} icon`}
          width={132}
          height={132}
          className="h-24 w-24 object-contain drop-shadow-[0_0_26px_rgba(246,196,82,0.72)] sm:h-[110px] sm:w-[110px]"
        />
      </span>
    </button>
  );
});
