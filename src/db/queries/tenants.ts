import { cache } from 'react';
import { db } from '@/src/db';
import { tenantsTable, type Tenant } from '@/src/db/schema';
import { eq, asc } from 'drizzle-orm';

// ============================================
// READ QUERIES
// ============================================

/**
 * Get tenant by slug (e.g. 'default', 'acme')
 */
export async function getTenantBySlug(slug: string): Promise<Tenant | null> {
  const [tenant] = await db
    .select()
    .from(tenantsTable)
    .where(eq(tenantsTable.slug, slug));
  return tenant ?? null;
}

/**
 * Get tenant by ID
 */
export async function getTenantById(id: string): Promise<Tenant | null> {
  const [tenant] = await db
    .select()
    .from(tenantsTable)
    .where(eq(tenantsTable.id, id));
  return tenant ?? null;
}

/**
 * Get tenant by custom domain
 */
export async function getTenantByDomain(domain: string): Promise<Tenant | null> {
  const [tenant] = await db
    .select()
    .from(tenantsTable)
    .where(eq(tenantsTable.customDomain, domain));
  return tenant ?? null;
}

/**
 * Get all tenants (for super-admin selector)
 */
export async function getAllTenants(): Promise<Tenant[]> {
  return await db
    .select()
    .from(tenantsTable)
    .orderBy(asc(tenantsTable.name));
}

/**
 * Get the default tenant (slug = 'default')
 * Use this for single-tenant mode until Phase 2 tenant resolution is wired
 */
export async function getDefaultTenant(): Promise<Tenant | null> {
  return getTenantBySlug('default');
}

/**
 * Get default tenant ID (cached per-request via React cache)
 * Use when tenantId is not yet available from middleware
 */
export const getDefaultTenantId = cache(async (): Promise<string> => {
  const tenant = await getDefaultTenant();
  if (!tenant) {
    throw new Error('Default tenant not found. Run: npm run db:migrate:multi-tenant');
  }
  return tenant.id;
});

/**
 * Create a new tenant (1 client = 1 tenant)
 * Call this when onboarding a new client.
 */
export async function createTenant(slug: string, name: string, customDomain?: string): Promise<Tenant> {
  const [tenant] = await db
    .insert(tenantsTable)
    .values({
      slug,
      name,
      customDomain: customDomain ?? null,
    })
    .returning();

  if (!tenant) {
    throw new Error('Failed to create tenant');
  }

  return tenant;
}
