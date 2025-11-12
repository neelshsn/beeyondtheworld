import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';

import { useBodyScrollLock } from '../_hooks/use-body-scroll-lock';

describe('useBodyScrollLock', () => {
  beforeEach(() => {
    document.body.style.overflow = 'auto';
  });

  it('locks scroll on mount and restores on unmount', () => {
    const { unmount } = renderHook(() => useBodyScrollLock());

    expect(document.body.style.overflow).toBe('hidden');

    unmount();

    expect(document.body.style.overflow).toBe('auto');
  });
});
