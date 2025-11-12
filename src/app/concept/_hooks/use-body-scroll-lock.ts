'use client';

import { useEffect } from 'react';

type DocumentLike = Pick<Document, 'body'>;

type StyleLike = { overflow: string };

type BodyLike = { style: StyleLike };

function normalizeDocument(target: DocumentLike | undefined | null): BodyLike | null {
  if (!target || !target.body || !target.body.style) {
    return null;
  }

  return target.body as BodyLike;
}

export function applyBodyScrollLock(targetDocument: DocumentLike) {
  const body = normalizeDocument(targetDocument);
  if (!body) {
    return () => {};
  }

  const previousOverflow = body.style.overflow;
  body.style.overflow = 'hidden';

  return () => {
    body.style.overflow = previousOverflow;
  };
}

export function useBodyScrollLock() {
  useEffect(() => {
    if (typeof document === 'undefined') {
      return () => {};
    }

    return applyBodyScrollLock(document);
  }, []);
}
