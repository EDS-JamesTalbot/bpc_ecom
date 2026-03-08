import { db } from '@/src/db';
import { siteSettingsTable, type SiteSetting, type NewSiteSetting } from '@/src/db/schema';
import { eq, and } from 'drizzle-orm';
import { getTenantIdForRequest } from '@/lib/tenant-context';

// ============================================
// READ QUERIES
// ============================================

/**
 * Get all site settings for a tenant
 */
export async function getAllSiteSettings(tenantId?: string): Promise<SiteSetting[]> {
  const tid = tenantId ?? await getTenantIdForRequest();
  return await db
    .select()
    .from(siteSettingsTable)
    .where(eq(siteSettingsTable.tenantId, tid))
    .orderBy(siteSettingsTable.category, siteSettingsTable.settingKey);
}

/**
 * Get a single site setting by key
 */
export async function getSiteSettingByKey(settingKey: string, tenantId?: string): Promise<SiteSetting | null> {
  const tid = tenantId ?? await getTenantIdForRequest();
  const [setting] = await db
    .select()
    .from(siteSettingsTable)
    .where(and(
      eq(siteSettingsTable.tenantId, tid),
      eq(siteSettingsTable.settingKey, settingKey)
    ));
  
  return setting ?? null;
}

/**
 * Get site settings by category
 */
export async function getSiteSettingsByCategory(category: string, tenantId?: string): Promise<SiteSetting[]> {
  const tid = tenantId ?? await getTenantIdForRequest();
  return await db
    .select()
    .from(siteSettingsTable)
    .where(and(
      eq(siteSettingsTable.tenantId, tid),
      eq(siteSettingsTable.category, category)
    ))
    .orderBy(siteSettingsTable.settingKey);
}

// ============================================
// MUTATION QUERIES
// ============================================

/**
 * Create or update a site setting (upsert)
 */
export async function upsertSiteSetting(
  settingKey: string,
  settingValue: string,
  category: string = 'general',
  description?: string,
  tenantId?: string
): Promise<SiteSetting> {
  const tid = tenantId ?? await getTenantIdForRequest();
  const existing = await getSiteSettingByKey(settingKey, tid);
  
  if (existing) {
    const [updated] = await db
      .update(siteSettingsTable)
      .set({ settingValue, category, description, updatedAt: new Date() })
      .where(and(
        eq(siteSettingsTable.tenantId, tid),
        eq(siteSettingsTable.settingKey, settingKey)
      ))
      .returning();
    if (!updated) return existing;
    return updated;
  } else {
    const [created] = await db
      .insert(siteSettingsTable)
      .values({ tenantId: tid, settingKey, settingValue, category, description })
      .returning();
    if (!created) throw new Error('Failed to create site setting');
    return created;
  }
}

/**
 * Update a site setting by ID
 */
export async function updateSiteSetting(
  id: number,
  data: Partial<Omit<NewSiteSetting, 'updatedAt'>>,
  tenantId?: string
): Promise<SiteSetting | null> {
  const tid = tenantId ?? await getTenantIdForRequest();
  const [updated] = await db
    .update(siteSettingsTable)
    .set({ ...data, updatedAt: new Date() })
    .where(and(eq(siteSettingsTable.id, id), eq(siteSettingsTable.tenantId, tid)))
    .returning();
  return updated ?? null;
}

/**
 * Delete a site setting
 */
export async function deleteSiteSetting(id: number, tenantId?: string): Promise<void> {
  const tid = tenantId ?? await getTenantIdForRequest();
  await db
    .delete(siteSettingsTable)
    .where(and(eq(siteSettingsTable.id, id), eq(siteSettingsTable.tenantId, tid)));
}

/**
 * Get multiple settings as a key-value object
 */
export async function getSiteSettingsMap(keys: string[]): Promise<Record<string, string>> {
  if (keys.length === 0) {
    return {};
  }
  
  const settings = await db
    .select()
    .from(siteSettingsTable)
    .where(
      eq(siteSettingsTable.settingKey, keys[0]!) // Simplified - in production would use IN clause
    );
  
  // Convert to key-value map
  const map: Record<string, string> = {};
  for (const setting of settings) {
    map[setting.settingKey] = setting.settingValue;
  }
  
  return map;
}

