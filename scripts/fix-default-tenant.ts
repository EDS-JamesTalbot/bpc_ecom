/**
 * Make Loveys Soap the default tenant for the main site.
 * Run: npx tsx scripts/fix-default-tenant.ts
 *
 * This swaps slugs so that:
 * - Loveys Soap (id ending ...77777e) gets slug "default" → main site resolves to it
 * - Default Store (id ending ...a624f50d) gets slug "legacy-default" → no longer the default
 */
import 'dotenv/config';
import { db } from '../src/db';
import { tenantsTable } from '../src/db/schema';
import { eq } from 'drizzle-orm';

async function main() {
  // Step 1: Free up "default" by renaming Default Store first
  await db
    .update(tenantsTable)
    .set({ slug: 'legacy-default', updatedAt: new Date() })
    .where(eq(tenantsTable.id, '2077d79f-5130-452d-bf02-ca6ea624f50d'));

  // Step 2: Make Loveys Soap the default
  await db
    .update(tenantsTable)
    .set({ slug: 'default', updatedAt: new Date() })
    .where(eq(tenantsTable.id, '2077d79f-5130-452d-bf02-77777777777e'));

  console.log('Done. Loveys Soap is now the default tenant. The main site will resolve to it.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
