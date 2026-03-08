/**
 * Admin Session Tracking
 * When admin is logged in, the site is in "admin-exclusive" mode.
 * All other users see a maintenance message and are logged out.
 */

import { upsertSiteSetting, getSiteSettingByKey } from '@/src/db/queries/site-settings';
import { db } from '@/src/db';
import { siteSettingsTable } from '@/src/db/schema';
import { eq } from 'drizzle-orm';

const ADMIN_ACTIVE_KEY = 'admin_active_at';
const ADMIN_ACTIVE_TTL_MS = 5 * 60 * 1000; // 5 minutes - admin considered "active" if they made a request within this window

/**
 * Update the admin active timestamp (call when admin loads any page)
 */
export async function setAdminActive(): Promise<void> {
  await upsertSiteSetting(
    ADMIN_ACTIVE_KEY,
    new Date().toISOString(),
    'system',
    'Timestamp of last admin activity - when admin is active, other users see maintenance'
  );
}

/**
 * Check if admin is currently active (made a request within TTL window)
 */
export async function isAdminActive(): Promise<boolean> {
  const setting = await getSiteSettingByKey(ADMIN_ACTIVE_KEY);
  if (!setting?.settingValue) return false;

  const lastActive = new Date(setting.settingValue).getTime();
  const now = Date.now();
  return now - lastActive < ADMIN_ACTIVE_TTL_MS;
}

/**
 * Clear admin active state (call when admin signs out)
 */
export async function clearAdminActive(): Promise<void> {
  await db.delete(siteSettingsTable).where(eq(siteSettingsTable.settingKey, ADMIN_ACTIVE_KEY));
}
