/**
 * List content counts per tenant (diagnostic).
 * Run: npx tsx scripts/list-tenant-content.ts
 */
import 'dotenv/config';
import { db } from '@/src/db';
import {
  tenantsTable,
  productsTable,
  testimonialsTable,
  pageSectionsTable,
  siteSettingsTable,
} from '@/src/db/schema';
import { eq, sql } from 'drizzle-orm';

async function main() {
  const tenants = await db.select().from(tenantsTable).orderBy(tenantsTable.name);

  for (const tenant of tenants) {
    const [products] = await db
      .select({ count: sql<number>`count(*)` })
      .from(productsTable)
      .where(eq(productsTable.tenantId, tenant.id));
    const [testimonials] = await db
      .select({ count: sql<number>`count(*)` })
      .from(testimonialsTable)
      .where(eq(testimonialsTable.tenantId, tenant.id));
    const [pageSections] = await db
      .select({ count: sql<number>`count(*)` })
      .from(pageSectionsTable)
      .where(eq(pageSectionsTable.tenantId, tenant.id));
    const [siteSettings] = await db
      .select({ count: sql<number>`count(*)` })
      .from(siteSettingsTable)
      .where(eq(siteSettingsTable.tenantId, tenant.id));

    console.log(`\n${tenant.name} (${tenant.slug})`);
    console.log(`  Products: ${Number(products?.count ?? 0)}`);
    console.log(`  Testimonials: ${Number(testimonials?.count ?? 0)}`);
    console.log(`  Page Sections: ${Number(pageSections?.count ?? 0)}`);
    console.log(`  Site Settings: ${Number(siteSettings?.count ?? 0)}`);
  }
  console.log('');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
