export const journeysQuery = `
*[_type == "journey" && defined(slug.current)] | order(orderRank asc) {
  "id": _id,
  "slug": slug.current,
  title,
  excerpt,
  location,
  accent,
  launchDate,
  "coverImage": {
    "id": coverImage.asset->_id,
    "kind": "image",
    "url": coverImage.asset->url,
    "alt": coalesce(coverImage.alt, title)
  },
  "teaserVideo": teaserVideo.asset->url
}`;

export const campaignsQuery = `
*[_type == "campaign" && defined(slug.current)]{
  "id": _id,
  "slug": slug.current,
  title,
  heroVideo,
  heroPoster,
  context,
  credits[] {
    role,
    value
  },
  impactHighlights,
  callToAction,
  "gallery": gallery[]{
    "id": @._key,
    "kind": type,
    "url": select(type == "image" => asset->url, type == "video" => asset->url),
    "alt": coalesce(asset->altText, title),
    poster,
    aspectRatio
  }
}`;

export const campaignBySlugQuery = `
*[_type == "campaign" && slug.current == $slug][0]{
  "id": _id,
  "slug": slug.current,
  title,
  heroVideo,
  heroPoster,
  context,
  credits[] {
    role,
    value
  },
  impactHighlights,
  callToAction,
  "gallery": gallery[]{
    "id": @._key,
    "kind": type,
    "url": select(type == "image" => asset->url, type == "video" => asset->url),
    "alt": coalesce(asset->altText, title),
    poster,
    aspectRatio
  }
}`;

export const conceptSectionsQuery = `
*[_type == "conceptSection"] | order(orderRank asc) {
  "id": _id,
  title,
  description,
  bulletPoints,
  media {
    "id": asset->_id,
    "kind": select(type == "video" => "video", "image"),
    "url": asset->url,
    "alt": coalesce(alt, title),
    aspectRatio,
    poster
  }
}`;

export const clientsQuery = `
*[_type == "clientLogo"] | order(orderRank asc) {
  name,
  "logoUrl": logo.asset->url
}`;
