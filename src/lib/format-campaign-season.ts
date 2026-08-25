export function formatCampaignSeason(value: string) {
  return value
    .replace(/\b20(\d{2})\b/g, '$1’')
    .replace(/\s+/g, ' ')
    .trim()
    .toUpperCase();
}
