import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import React from 'react';

// The existing Vitest configuration compiles JSX with the classic runtime.
vi.stubGlobal('React', React);

vi.mock('next/image', () => ({
  // Native image is only a test stand-in for Next's optimized image.
  // eslint-disable-next-line @next/next/no-img-element
  default: ({ src, alt }: { src: string; alt: string }) => <img src={src} alt={alt} />,
}));

import { JourneyTaleMedia } from '@/app/journeys/[slug]/_sections/journey-tale-media';

afterEach(cleanup);

describe('Journey Tale media', () => {
  it('shows every saved image and video and wraps navigation', () => {
    render(
      <JourneyTaleMedia
        image="/fallback.jpg"
        alt="Place"
        media={[
          { type: 'image', url: '/first.jpg', alt: 'First image' },
          { type: 'video', url: '/clip.mp4', alt: 'Place video' },
          { type: 'image', url: '/last.jpg', alt: 'Last image' },
        ]}
      />
    );
    expect(screen.getByAltText('First image')).toHaveAttribute('src', '/first.jpg');
    fireEvent.click(screen.getByRole('button', { name: 'Next Tale media' }));
    expect(screen.getByLabelText('Place video')).toHaveAttribute('src', '/clip.mp4');
    expect(screen.getByLabelText('Place video')).toHaveAttribute('controls');
    fireEvent.click(screen.getByRole('button', { name: 'Next Tale media' }));
    expect(screen.getByAltText('Last image')).toHaveAttribute('src', '/last.jpg');
    fireEvent.click(screen.getByRole('button', { name: 'Next Tale media' }));
    expect(screen.getByAltText('First image')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Previous Tale media' }));
    expect(screen.getByAltText('Last image')).toBeInTheDocument();
  });

  it('preserves a legacy single-image Tale without gallery controls', () => {
    render(<JourneyTaleMedia image="/legacy.jpg" alt="Legacy place" />);
    expect(screen.getByAltText('Legacy place')).toHaveAttribute('src', '/legacy.jpg');
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
});
