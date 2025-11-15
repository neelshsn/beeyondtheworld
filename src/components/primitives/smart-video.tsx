'use client';

import Image from 'next/image';
import { useReducedMotion } from 'framer-motion';
import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';

import { usePrefersReducedData } from '@/lib/hooks/use-prefers-reduced-data';
import { cn } from '@/lib/utils';

type SmartVideoSource = {
  src: string;
  type?: string;
};

export interface SmartVideoProps
  extends Omit<React.VideoHTMLAttributes<HTMLVideoElement>, 'children' | 'preload'> {
  sources?: SmartVideoSource[];
  fallbackImage?: string;
  wrapperClassName?: string;
  priority?: boolean;
}

export const SmartVideo = forwardRef<HTMLVideoElement, SmartVideoProps>(function SmartVideo(
  {
    sources,
    fallbackImage,
    wrapperClassName,
    className,
    priority = false,
    autoPlay = true,
    loop = true,
    muted = true,
    playsInline = true,
    poster,
    controls = false,
    onError,
    src,
    ...rest
  },
  ref
) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const prefersReducedMotion = useReducedMotion();
  const prefersReducedData = usePrefersReducedData();
  const [isInView, setIsInView] = useState(priority);
  const [hasError, setHasError] = useState(false);

  useImperativeHandle(ref, () => videoRef.current as HTMLVideoElement);

  const shouldRenderVideo = !hasError && (priority || isInView);
  const resolvedAutoPlay = autoPlay && !prefersReducedMotion;
  const posterOrFallback = poster ?? fallbackImage;
  const preloadStrategy = prefersReducedData ? 'metadata' : resolvedAutoPlay ? 'auto' : 'metadata';

  useEffect(() => {
    if (priority || isInView) {
      return;
    }

    const node = wrapperRef.current;
    if (!node || typeof IntersectionObserver === 'undefined') {
      setIsInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { rootMargin: '250px' }
    );

    observer.observe(node);

    return () => observer.disconnect();
  }, [priority, isInView]);

  return (
    <div ref={wrapperRef} className={cn('relative', wrapperClassName)}>
      {shouldRenderVideo ? (
        <video
          {...rest}
          ref={videoRef}
          className={className}
          autoPlay={resolvedAutoPlay}
          muted={muted || resolvedAutoPlay}
          loop={loop}
          playsInline={playsInline}
          controls={controls}
          poster={posterOrFallback}
          preload={preloadStrategy}
          onError={(event) => {
            setHasError(true);
            onError?.(event);
          }}
        >
          {sources?.map((source) => (
            <source key={source.src} src={source.src} type={source.type} />
          ))}
          {!sources && src ? <source src={src} /> : null}
        </video>
      ) : posterOrFallback ? (
        <Image
          src={posterOrFallback}
          alt="Video placeholder"
          fill
          sizes="100vw"
          priority={priority}
          className={cn('object-cover', className)}
        />
      ) : (
        <div className={cn('h-full w-full bg-black/50', className)} aria-hidden />
      )}
    </div>
  );
});
