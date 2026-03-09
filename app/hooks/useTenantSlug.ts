'use client';

import { usePathname } from 'next/navigation';
import { getTenantSlugFromPath } from '@/lib/tenant-utils';

/**
 * Returns the tenant slug from the current path when using path-based tenants.
 * e.g. /loveys-soap/shop → 'loveys-soap'
 * e.g. /shop → null (default tenant, no prefix)
 */
export function useTenantSlug(): string | null {
  const pathname = usePathname();
  return getTenantSlugFromPath(pathname ?? '');
}
