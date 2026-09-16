import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import React from 'react';

vi.stubGlobal('React', React);
const upload = vi.hoisted(() => vi.fn());
vi.mock('@vercel/blob/client', () => ({ upload }));

import { JourneysManager } from '@/app/admin/journeys/_components/journeys-manager';
import { MediaUploadField } from '@/app/admin/_components/media-upload-field';

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.stubGlobal('React', React);
});
beforeEach(() => upload.mockReset());

async function openLegacyLocation() {
  const location = {
    id: 71,
    journeyId: 7,
    name: 'Palawan',
    subtitle: 'Twin Lagoon',
    leftTitle: ['Palawan'],
    narrative: 'Existing story',
    image: '/card.jpg',
    video: '/background.mp4',
    seasonTags: null,
    media: [],
    position: 0,
    published: true,
  };
  const journey = {
    id: 7,
    slug: 'philippines',
    title: 'Philippines',
    season: 'spring-summer',
    seasonTags: ['spring-summer', 'fall-winter'],
    seasonVisuals: {},
    dateLabel: '',
    dateFrom: null,
    dateTo: null,
    location: 'Philippines',
    image: '/journey.jpg',
    backgroundVideo: null,
    sustainablePdf: null,
    position: 0,
    published: true,
    locations: [location],
  };
  const saved: Record<string, unknown>[] = [];
  vi.stubGlobal(
    'fetch',
    vi.fn(async (url: string, init?: RequestInit) => {
      if (url === '/api/admin/locations/71' && init?.method === 'PATCH') {
        const body = JSON.parse(String(init.body));
        saved.push(body);
        Object.assign(location, body);
        return { ok: true, json: async () => ({ location }) };
      }
      return { ok: true, json: async () => ({ journeys: [journey] }) };
    })
  );
  render(<JourneysManager />);
  fireEvent.click(await screen.findByRole('button', { name: 'Modifier les Locations (1)' }));
  fireEvent.click(screen.getByText('Modifier cette Location'));
  return saved;
}

describe('Location settings in the editor', () => {
  it('shows the historical season and preserves it and the background when renaming an old Location', async () => {
    const saved = await openLegacyLocation();
    expect(screen.getByLabelText('SS · Spring Summer')).toBeChecked();
    expect(screen.getByLabelText('FW · Fall Winter')).not.toBeChecked();
    fireEvent.change(screen.getByLabelText('Nom', { exact: true }), {
      target: { value: 'Renamed Palawan' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Enregistrer cette Location' }));
    await waitFor(() => expect(saved).toHaveLength(1));
    expect(saved[0]).toMatchObject({
      name: 'Renamed Palawan',
      seasonTags: ['spring-summer'],
      video: '/background.mp4',
      image: '/card.jpg',
    });
  });

  it('saves FW and a photo background without changing the main image', async () => {
    const saved = await openLegacyLocation();
    fireEvent.click(screen.getByLabelText('FW · Fall Winter'));
    fireEvent.click(screen.getByLabelText('SS · Spring Summer'));
    expect(screen.getByLabelText('FW · Fall Winter')).toBeDisabled();
    fireEvent.change(
      screen.getByLabelText('Adresse existante pour Fond de la Location · photo ou vidéo'),
      {
        target: { value: '/photo-background.webp' },
      }
    );
    expect(
      screen.getByAltText('Aperçu du média choisi pour Fond de la Location · photo ou vidéo')
    ).toHaveAttribute('src', '/photo-background.webp');
    fireEvent.click(screen.getByRole('button', { name: 'Enregistrer cette Location' }));
    await waitFor(() => expect(saved).toHaveLength(1));
    expect(saved[0]).toMatchObject({
      seasonTags: ['fall-winter'],
      video: '/photo-background.webp',
      image: '/card.jpg',
    });
  });
});

describe('Background file upload and preview', () => {
  function BackgroundField() {
    const [value, setValue] = React.useState('');
    return <MediaUploadField label="Fond" value={value} onChange={setValue} kind="visual" />;
  }

  it('accepts a photo then a video and previews each with its correct media element', async () => {
    upload
      .mockResolvedValueOnce({ url: '/photo.jpg' })
      .mockResolvedValueOnce({ url: '/clip.mp4?download=1' });
    const { container } = render(<BackgroundField />);
    const input = container.querySelector('input[type="file"]')!;
    fireEvent.change(input, {
      target: { files: [new File(['photo'], 'photo.jpg', { type: 'image/jpeg' })] },
    });
    expect(await screen.findByAltText('Aperçu du média choisi pour Fond')).toHaveAttribute(
      'src',
      '/photo.jpg'
    );
    fireEvent.change(input, {
      target: { files: [new File(['video'], 'clip.mp4', { type: 'video/mp4' })] },
    });
    expect(await screen.findByLabelText('Aperçu vidéo pour Fond')).toHaveAttribute(
      'src',
      '/clip.mp4?download=1'
    );
    expect(screen.queryByAltText('Aperçu du média choisi pour Fond')).not.toBeInTheDocument();
    expect(upload).toHaveBeenCalledTimes(2);
  });

  it('rejects documents in the background field before upload', async () => {
    const { container } = render(<BackgroundField />);
    fireEvent.change(container.querySelector('input[type="file"]')!, {
      target: { files: [new File(['pdf'], 'document.pdf', { type: 'application/pdf' })] },
    });
    expect(await screen.findByRole('alert')).toHaveTextContent('Choisis un fichier Photo');
    expect(upload).not.toHaveBeenCalled();
  });
});
