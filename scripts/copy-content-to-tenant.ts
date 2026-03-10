/**
 * Copy all content (products, testimonials, page_sections, site_settings)
 * from a source tenant to a target tenant (e.g. Loveys Soap).
 *
 * Run: npm run db:copy-content loveys-soap
 * Or:  npx tsx scripts/copy-content-to-tenant.ts loveys-soap
 *
 * Options:
 *   --source <slug>  Source tenant slug (default: legacy-default if exists, else default)
 *   --replace        Clear target's content first (WARNING: deletes existing products, etc.)
 *
 * Examples:
 *   npx tsx scripts/copy-content-to-tenant.ts loveys-soap
 *   npx tsx scripts/copy-content-to-tenant.ts loveys-soap --source legacy-default
 *   npx tsx scripts/copy-content-to-tenant.ts loveys-soap --replace
 */
import 'dotenv/config';
import { db } from '@/src/db';
import {
  productsTable,
  testimonialsTable,
  pageSectionsTable,
  siteSettingsTable,
} from '@/src/db/schema';
import { eq } from 'drizzle-orm';
import { getDefaultTenant, getTenantBySlug } from '@/src/db/queries/tenants';

async function main() {
  const args = process.argv.slice(2).filter((a) => !a.startsWith('--'));
  const targetSlug = args[0] || process.env.TARGET_TENANT || 'loveys-soap';
  const replace = process.argv.includes('--replace');
  const sourceIdx = process.argv.indexOf('--source');
  const sourceSlug = sourceIdx >= 0 ? process.argv[sourceIdx + 1] : null;

  const sourceTenant = sourceSlug
    ? await getTenantBySlug(sourceSlug)
    : (await getTenantBySlug('legacy-default')) ?? (await getDefaultTenant());
  const targetTenant = await getTenantBySlug(targetSlug);

  if (!sourceTenant) {
    console.error(
      sourceSlug
        ? `Source tenant "${sourceSlug}" not found.`
        : 'Default tenant not found. Run npm run db:migrate:multi-tenant first.'
    );
    process.exit(1);
  }
  if (!targetTenant) {
    console.error(`Target tenant "${targetSlug}" not found.`);
    process.exit(1);
  }
  if (sourceTenant.id === targetTenant.id) {
    console.error('Source and target are the same tenant.');
    process.exit(1);
  }

  console.log(`Copying content from "${sourceTenant.name}" → "${targetTenant.name}" (${targetSlug})`);
  if (replace) console.log('(Replacing existing content)\n');

  if (replace) {
    await db.delete(productsTable).where(eq(productsTable.tenantId, targetTenant.id));
    await db.delete(testimonialsTable).where(eq(testimonialsTable.tenantId, targetTenant.id));
    await db.delete(pageSectionsTable).where(eq(pageSectionsTable.tenantId, targetTenant.id));
    await db.delete(siteSettingsTable).where(eq(siteSettingsTable.tenantId, targetTenant.id));
    console.log('Cleared existing content.\n');
  }

  // Products
  const products = await db.select().from(productsTable).where(eq(productsTable.tenantId, sourceTenant.id));
  if (products.length > 0) {
    await db.insert(productsTable).values(
      products.map(({ id, tenantId, ...p }) => ({ ...p, tenantId: targetTenant.id }))
    );
    console.log(`✅ Copied ${products.length} products`);
  }

  // Testimonials
  const testimonials = await db.select().from(testimonialsTable).where(eq(testimonialsTable.tenantId, sourceTenant.id));
  if (testimonials.length > 0) {
    await db.insert(testimonialsTable).values(
      testimonials.map(({ id, tenantId, ...t }) => ({ ...t, tenantId: targetTenant.id }))
    );
    console.log(`✅ Copied ${testimonials.length} testimonials`);
  }

  // Page sections
  const pageSections = await db.select().from(pageSectionsTable).where(eq(pageSectionsTable.tenantId, sourceTenant.id));
  if (pageSections.length > 0) {
    await db.insert(pageSectionsTable).values(
      pageSections.map(({ id, tenantId, ...s }) => ({ ...s, tenantId: targetTenant.id }))
    );
    console.log(`✅ Copied ${pageSections.length} page sections`);
  }

  // Site settings (upsert to overwrite existing)
  const siteSettings = await db.select().from(siteSettingsTable).where(eq(siteSettingsTable.tenantId, sourceTenant.id));
  if (siteSettings.length > 0) {
    for (const s of siteSettings) {
      await db
        .insert(siteSettingsTable)
        .values({
          tenantId: targetTenant.id,
          settingKey: s.settingKey,
          settingValue: s.settingValue,
          description: s.description,
          category: s.category,
        })
        .onConflictDoUpdate({
          target: [siteSettingsTable.tenantId, siteSettingsTable.settingKey],
          set: {
            settingValue: s.settingValue,
            description: s.description,
            category: s.category,
            updatedAt: new Date(),
          },
        });
    }
    console.log(`✅ Copied ${siteSettings.length} site settings`);
  }

  console.log(`\n🎉 Done. Visit /${targetSlug}/admin/content to see the content.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
