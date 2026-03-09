/** Reserved path segments that are NOT tenant slugs */
const RESERVED_PATH_SEGMENTS = new Set([
  'admin', 'shop', 'contact', 'help', 'testimonials', 'maintenance',
  'order-confirmation', 'payment-failed', 'customer-login', 'my-account',
  'sign-in', 'sign-up', 'api', '_next',
]);

/** Check if a path segment is a reserved route (not a tenant slug) */
export function isReservedPathSegment(segment: string): boolean {
  return RESERVED_PATH_SEGMENTS.has(segment.toLowerCase());
}

/** Get tenant slug from pathname, or null if default tenant (no prefix) */
export function getTenantSlugFromPath(pathname: string): string | null {
  const segments = pathname.split('/').filter(Boolean);
  const first = segments[0];
  if (!first || isReservedPathSegment(first)) return null;
  return first;
}

/** Build a path with tenant prefix when needed */
export function withTenantPrefix(path: string, tenantSlug: string | null): string {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  if (!tenantSlug) return cleanPath;
  return `/${tenantSlug}${cleanPath === '/' ? '' : cleanPath}`;
}
