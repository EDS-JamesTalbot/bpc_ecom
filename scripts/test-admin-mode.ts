/**
 * Test script for admin-exclusive mode.
 * Run: npx tsx scripts/test-admin-mode.ts [activate|deactivate]
 * - activate: Sets admin_active_at to now (simulates admin logged in)
 * - deactivate: Clears admin_active_at (simulates admin logged out)
 */

import 'dotenv/config';
import { upsertSiteSetting, getSiteSettingByKey } from '../src/db/queries/site-settings';
import { db } from '../src/db';
import { siteSettingsTable } from '../src/db/schema';
import { eq } from 'drizzle-orm';

const ADMIN_ACTIVE_KEY = 'admin_active_at';

async function activate() {
  await upsertSiteSetting(
    ADMIN_ACTIVE_KEY,
    new Date().toISOString(),
    'system',
    'Test: admin active'
  );
  console.log('✓ Admin mode ACTIVATED (simulated admin logged in)');
}

async function deactivate() {
  const setting = await getSiteSettingByKey(ADMIN_ACTIVE_KEY);
  if (setting) {
    await db.delete(siteSettingsTable).where(eq(siteSettingsTable.settingKey, ADMIN_ACTIVE_KEY));
    console.log('✓ Admin mode DEACTIVATED');
  } else {
    console.log('Admin mode was not active');
  }
}

async function status() {
  const setting = await getSiteSettingByKey(ADMIN_ACTIVE_KEY);
  if (!setting) {
    console.log('Status: Admin NOT active');
    return;
  }
  const lastActive = new Date(setting.settingValue);
  const now = new Date();
  const diffMs = now.getTime() - lastActive.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const ttlMins = 5;
  const active = diffMs < ttlMins * 60 * 1000;
  console.log(`Status: Admin ${active ? 'ACTIVE' : 'NOT active'}`);
  console.log(`  Last active: ${lastActive.toISOString()} (${diffMins} min ago)`);
  console.log(`  TTL: ${ttlMins} minutes`);
}

const cmd = process.argv[2] || 'status';
(async () => {
  try {
    if (cmd === 'activate') await activate();
    else if (cmd === 'deactivate') await deactivate();
    else if (cmd === 'status') await status();
    else console.log('Usage: npx tsx scripts/test-admin-mode.ts [activate|deactivate|status]');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();
