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
        'relative grid size-[136px] place-items-center rounded-full transition duration-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/75 sm:size-[152px]',
        isOpen
          ? 'bg-transparent opacity-100 shadow-[0_26px_60px_rgba(0,0,0,0.35)]'
          : 'bg-transparent opacity-100 shadow-[0_16px_36px_rgba(0,0,0,0.25)]'
      )}
      style={{ transitionTimingFunction: 'var(--bee-ease)' }}
    >
      <span
        className={cn(
          'relative flex size-[100px] items-center justify-center rounded-full text-white/90 transition-all duration-700 sm:size-[110px]',
          isOpen ? 'scale-[1.04]' : 'scale-[0.98]'
        )}
        style={{ transitionTimingFunction: 'var(--bee-ease)' }}
      >
        <Image
          src={node.icon}
          alt={`${node.title} icon`}
          width={110}
          height={110}
          className={cn(
            'h-20 w-20 object-contain drop-shadow-[0_14px_28px_rgba(0,0,0,0.48)] transition-transform duration-700 sm:h-[88px] sm:w-[88px]',
            isOpen ? 'scale-105' : 'scale-100'
          )}
          style={{ transitionTimingFunction: 'var(--bee-ease)' }}
        />
      </span>
    </button>
  );
});
