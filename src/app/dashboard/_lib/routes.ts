export type RouteSearchParams = Record<string, string | string[] | undefined>;

export function withSearchParams(pathname: string, params: RouteSearchParams = {}) {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (Array.isArray(value)) value.forEach((item) => query.append(key, item));
    else if (value !== undefined) query.set(key, value);
  }
  const serialized = query.toString();
  return serialized ? `${pathname}?${serialized}` : pathname;
}

export function dashboardProjectHref(projectId: string, pageId = 'project') {
  return `/dashboard?project=${encodeURIComponent(projectId)}#${encodeURIComponent(pageId)}`;
}

export function dashboardProjectRouteHref(projectId: string) {
  return `/dashboard/projects/${encodeURIComponent(projectId)}#project`;
}
