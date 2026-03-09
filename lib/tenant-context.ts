import { cache } from 'react';
import { headers, cookies } from 'next/headers';
import { auth, clerkClient } from '@clerk/nextjs/server';
import {
  getTenantBySlug,
  getTenantByDomain,
  getTenantById,
  getDefaultTenant,
} from '@/src/db/queries/tenants';

export const SUPER_ADMIN_TENANT_COOKIE = 'super_admin_tenant_id';

export { isReservedPathSegment } from './tenant-utils';

/**
 * Resolve tenant ID from request headers.
 * Supports (in order):
 * - Path-based: /loveys-soap/shop → tenant slug 'loveys-soap' (set by proxy via x-tenant-slug)
 * - Custom domain: store.acme.com → tenants.custom_domain
 * - Subdomain: acme.yourplatform.com → tenant slug 'acme'
 * - Fallback: default tenant
 */
export async function getTenantFromHeaders(
  headersList: Headers
): Promise<string | null> {
  // 1. Path-based tenant (e.g. /loveys-soap/shop)
  const pathSlug = headersList.get('x-tenant-slug');
  if (pathSlug) {
    const bySlug = await getTenantBySlug(pathSlug);
    if (bySlug) return bySlug.id;
    // Invalid tenant slug in path → signal 404 (caller should handle)
    throw new Error('TENANT_NOT_FOUND');
  }

  const host = headersList.get('host') || '';
  const hostname = (host.split(':')[0] ?? '').toLowerCase();

  // 2. Custom domain lookup
  const byDomain = await getTenantByDomain(hostname);
  if (byDomain) return byDomain.id;

  // 3. Subdomain resolution
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

  // 4. localhost without subdomain → default
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    const defaultTenant = await getDefaultTenant();
    return defaultTenant?.id ?? null;
  }

  // 5. Unknown host → default
  const defaultTenant = await getDefaultTenant();
  return defaultTenant?.id ?? null;
}

/**
 * Get tenant ID for the current request (cached per-request).
 * Use in Server Components and Server Actions.
 * Super-admins can override via cookie (super_admin_tenant_id).
 * Falls back to default tenant when not in request context (e.g. seed scripts).
 */
export const getTenantIdForRequest = cache(async (): Promise<string> => {
  try {
    const { userId } = await auth();
    if (userId) {
      const client = await clerkClient();
      const user = await client.users.getUser(userId);
      const role = user.publicMetadata?.role as string | undefined;
      const userTenantId = user.publicMetadata?.tenantId as string | undefined;
      const isSuperAdmin = role === 'admin' && !userTenantId;

      if (isSuperAdmin) {
        const cookieStore = await cookies();
        const overrideId = cookieStore.get(SUPER_ADMIN_TENANT_COOKIE)?.value;
        if (overrideId) {
          const tenant = await getTenantById(overrideId);
          if (tenant) return tenant.id;
        }
      }
    }
  } catch {
    // Auth/cookies not available (e.g. seed script)
  }

  try {
    const headersList = await headers();
    const id = await getTenantFromHeaders(headersList);
    if (id) return id;
  } catch (err) {
    if (err instanceof Error && err.message === 'TENANT_NOT_FOUND') {
      throw err; // Re-throw so layout can call notFound()
    }
    // Not in request context (e.g. seed script, cron)
  }
  const defaultTenant = await getDefaultTenant();
  if (!defaultTenant) {
    throw new Error('Default tenant not found. Run: npm run db:migrate:multi-tenant');
  }
  return defaultTenant.id;
});

/**
 * Get tenant slug for the current request (for building links in Server Components).
 * Returns the path-based tenant slug when present (x-tenant-slug header), else null.
 * Use null for default tenant (no path prefix).
 */
export const getTenantSlugForRequest = cache(async (): Promise<string | null> => {
  try {
    const headersList = await headers();
    const pathSlug = headersList.get('x-tenant-slug');
    if (pathSlug) return pathSlug;
  } catch {
    // Not in request context
  }
  return null;
});
