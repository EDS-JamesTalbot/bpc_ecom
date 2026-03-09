import { cache } from 'react';
import { headers } from 'next/headers';
import {
  getTenantBySlug,
  getTenantByDomain,
  getDefaultTenant,
} from '@/src/db/queries/tenants';

/**
 * Resolve tenant ID from request headers (Host).
 * Supports:
 * - Custom domain (e.g. store.acme.com → tenants.custom_domain)
 * - Subdomain (e.g. acme.yourplatform.com → tenant slug 'acme')
 * - Fallback to default tenant (localhost, www, or unknown)
 */
export async function getTenantFromHeaders(
  headersList: Headers
): Promise<string | null> {
  const host = headersList.get('host') || '';
  const hostname = (host.split(':')[0] ?? '').toLowerCase();

  // 1. Custom domain lookup
  const byDomain = await getTenantByDomain(hostname);
  if (byDomain) return byDomain.id;

  // 2. Subdomain resolution
  const baseDomain =
    process.env.NEXT_PUBLIC_BASE_DOMAIN || 'localhost';
  const isBaseDomain = hostname === baseDomain || hostname.endsWith(`.${baseDomain}`);

  if (isBaseDomain) {
    const parts = hostname.replace(`.${baseDomain}`, '').split('.');
    const subdomain = parts[0];
    if (subdomain && subdomain !== 'www') {
      const bySlug = await getTenantBySlug(subdomain);
      if (bySlug) return bySlug.id;
    }
  }

  // 3. localhost without subdomain → default
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    const defaultTenant = await getDefaultTenant();
    return defaultTenant?.id ?? null;
  }

  // 4. Unknown host → default
  const defaultTenant = await getDefaultTenant();
  return defaultTenant?.id ?? null;
}

/**
 * Get tenant ID for the current request (cached per-request).
 * Use in Server Components and Server Actions.
 * Falls back to default tenant when not in request context (e.g. seed scripts).
 */
export const getTenantIdForRequest = cache(async (): Promise<string> => {
  try {
    const headersList = await headers();
    const id = await getTenantFromHeaders(headersList);
    if (id) return id;
  } catch {
    // Not in request context (e.g. seed script, cron)
  }
  const defaultTenant = await getDefaultTenant();
  if (!defaultTenant) {
    throw new Error('Default tenant not found. Run: npm run db:migrate:multi-tenant');
  }
  return defaultTenant.id;
});
