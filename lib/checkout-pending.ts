/**
 * Tracks when a customer has a payment transaction in progress.
 * Blocks admin login until the transaction completes (success, failure, or timeout).
 */

import { upsertSiteSetting, getSiteSettingByKey } from '@/src/db/queries/site-settings';
import { db } from '@/src/db';
import { siteSettingsTable } from '@/src/db/schema';
import { eq } from 'drizzle-orm';

const CHECKOUT_PENDING_KEY = 'checkout_pending_at';
const PENDING_TTL_MS = 30 * 60 * 1000; // 30 minutes - consider stale after this

/**
 * Set checkout as pending (call when customer submits checkout and gets payment URL)
 */
export async function setCheckoutPending(): Promise<void> {
  await upsertSiteSetting(
    CHECKOUT_PENDING_KEY,
    new Date().toISOString(),
    'system',
    'Timestamp when customer started payment - blocks admin login until complete'
  );
}

/**
 * Clear checkout pending (call when payment completes, fails, or is cancelled)
 */
export async function clearCheckoutPending(): Promise<void> {
  await db.delete(siteSettingsTable).where(eq(siteSettingsTable.settingKey, CHECKOUT_PENDING_KEY));
}

/**
 * Check if a checkout/payment is currently in progress
 */
export async function isCheckoutPending(): Promise<boolean> {
  const setting = await getSiteSettingByKey(CHECKOUT_PENDING_KEY);
  if (!setting?.settingValue) return false;

  const pendingAt = new Date(setting.settingValue).getTime();
  const now = Date.now();
  return now - pendingAt < PENDING_TTL_MS;
}
