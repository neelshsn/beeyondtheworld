/**
 * T-034 / T-036 — PDF « Sustainable Impact » par voyage.
 * Le bouton n'est affiché que si un PDF existe pour le slug concerné.
 */
export const SUSTAINABLE_IMPACT_PDFS: Record<string, string> = {
  philippines: '/pdfs/philippines-lighting-oceans-wonders.pdf',
};

export function getSustainableImpactPdf(slug: string): string | null {
  return SUSTAINABLE_IMPACT_PDFS[slug] ?? null;
}
