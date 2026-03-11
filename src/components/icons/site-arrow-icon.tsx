'use client';

import clsx from 'clsx';

type SiteArrowDirection = 'right' | 'left' | 'up' | 'down' | 'up-right';

const ARROW_MASK_CLASS =
  '[mask-image:url(/assets/icones/site-arrow.svg)] [mask-position:center] [mask-repeat:no-repeat] [mask-size:contain] [-webkit-mask-image:url(/assets/icones/site-arrow.svg)] [-webkit-mask-position:center] [-webkit-mask-repeat:no-repeat] [-webkit-mask-size:contain]';

const DIRECTION_CLASS: Record<SiteArrowDirection, string> = {
  right: '',
  left: 'rotate-180',
  up: '-rotate-90',
  down: 'rotate-90',
  'up-right': '-rotate-45',
};

export function SiteArrowIcon({
  className,
  direction = 'right',
  title,
}: {
  className?: string;
  direction?: SiteArrowDirection;
  title?: string;
}) {
  return (
    <span
      aria-hidden={title ? undefined : true}
      title={title}
      className={clsx(
        'relative inline-block shrink-0 origin-center scale-[4.5] align-middle transition-colors',
        DIRECTION_CLASS[direction],
        className
      )}
    >
      <span
        className={clsx(
          'bg-black/72 opacity-82 absolute inset-0 translate-y-[8%] blur-[0.05em]',
          ARROW_MASK_CLASS
        )}
      />
      <span
        className={clsx('opacity-62 absolute inset-0 bg-current blur-[0.1em]', ARROW_MASK_CLASS)}
      />
      <span className={clsx('absolute inset-0 bg-current', ARROW_MASK_CLASS)} />
    </span>
  );
}
