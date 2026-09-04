import type { CSSProperties } from 'react';

import { cn } from '@/lib/utils';

type MaskedIconProps = {
  src: string;
  className?: string;
  label?: string;
};

export function MaskedIcon({ src, className, label }: MaskedIconProps) {
  const maskStyles: CSSProperties = {
    WebkitMaskImage: `url("${src}")`,
    maskImage: `url("${src}")`,
    WebkitMaskPosition: 'center',
    maskPosition: 'center',
    WebkitMaskRepeat: 'no-repeat',
    maskRepeat: 'no-repeat',
    WebkitMaskSize: 'contain',
    maskSize: 'contain',
  };

  return (
    <span
      aria-hidden={label ? undefined : true}
      aria-label={label}
      role={label ? 'img' : undefined}
      className={cn('inline-block shrink-0 bg-current', className)}
      style={maskStyles}
    />
  );
}
