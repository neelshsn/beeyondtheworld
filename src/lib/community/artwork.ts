import { assets } from './horizon';
import type { Project } from './types';
import examples from '@/data/community-examples.json';
export function journeyArtwork(
  project: Pick<Project, 'id' | 'territory'> | undefined,
  key = 'landscape'
) {
  const place = project?.territory.toLowerCase();
  if (place?.includes('namib')) return '/assets/community/namibia.webp';
  if (place && ['ibiza', 'switzerland', 'greece', 'kenya'].includes(place)) {
    if (['landscape', 'frame-arch', 'frame-shadow', 'field', 'craft'].includes(key))
      return `/assets/community/horizon/${place}-landscape.webp`;
    return `/assets/community/horizon/${place}-look.webp`;
  }
  if (project && project.territory !== 'Morocco')
    return examples.find((e) => e.id === project.id)?.cover || assets.landscape;
  return assets[key] || assets.landscape;
}
