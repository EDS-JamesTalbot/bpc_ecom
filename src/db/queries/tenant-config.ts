import { db } from '@/src/db';
import { tenantConfigTable } from '@/src/db/schema';
import { eq, and } from 'drizzle-orm';
import { getTenantIdForRequest } from '@/lib/tenant-context';
import { getTenantById } from '@/src/db/queries/tenants';

/**
 * Get a tenant config value by key.
 * Use for tenant-specific secrets (BPC_API_KEY, BPC_GATEWAY_URL, Cloudinary, etc.)
 * Falls back to null if not set - caller can fall back to env vars.
 */
export async function getTenantConfigByKey(
  configKey: string,
  tenantId?: string
): Promise<string | null> {
  const tid = tenantId ?? await getTenantIdForRequest();
  const [row] = await db
    .select()
    .from(tenantConfigTable)
    .where(and(
      eq(tenantConfigTable.tenantId, tid),
      eq(tenantConfigTable.configKey, configKey)
    ));
  return row?.configValue ?? null;
}

/**
 * Get multiple tenant config values at once (e.g. bpc_api_key, bpc_gateway_url).
 * Returns a map of config_key -> config_value.
 */
export async function getTenantConfigByKeys(
  configKeys: string[],
  tenantId?: string
): Promise<Record<string, string>> {
  const tid = tenantId ?? await getTenantIdForRequest();
  const rows = await db
    .select()
    .from(tenantConfigTable)
    .where(eq(tenantConfigTable.tenantId, tid));
  const result: Record<string, string> = {};
  for (const row of rows) {
    if (configKeys.includes(row.configKey)) {
      result[row.configKey] = row.configValue;
    }
  }
  return result;
}

/**
 * Set or update a tenant config value.
 * Use snake_case keys (e.g. bpc_api_key, bpc_gateway_url) to match env var naming.
 * tenant_name is auto-populated from tenants table for ease of viewing in DB tools.
 */
export async function setTenantConfig(
  configKey: string,
  configValue: string,
  tenantId?: string
): Promise<void> {
  const tid = tenantId ?? await getTenantIdForRequest();
  const tenant = await getTenantById(tid);
  const tenantName = tenant?.name ?? null;
  await db
    .insert(tenantConfigTable)
    .values({ tenantId: tid, tenantName, configKey, configValue })
    .onConflictDoUpdate({
      target: [tenantConfigTable.tenantId, tenantConfigTable.configKey],
      set: { configValue, tenantName },
    });
}
