/**
 * Add home_favorite_products page section to tenants that don't have it.
 * Run: npx tsx scripts/add-home-favorite-products.ts
 * Or for specific tenant: npx tsx scripts/add-home-favorite-products.ts loveys-soap
 */
import 'dotenv/config';
import { db } from '@/src/db';
import { pageSectionsTable } from '@/src/db/schema';
import { eq, and } from 'drizzle-orm';
import { getAllTenants, getTenantBySlug } from '@/src/db/queries/tenants';

const DEFAULT_CONTENT = {
  heading: "Customer Favorite Products",
  products: [
    { title: "Product One", quote: "Lorem ipsum dolor sit amet, consectetur adipiscing.", description: "Sed do eiusmod tempor incididunt ut labore" },
    { title: "Product Two", quote: "Ut enim ad minim veniam, quis nostrud.", description: "Excepteur sint occaecat cupidatat non proident" },
    { title: "Product Three", quote: "Duis aute irure dolor in reprehenderit.", description: "Nemo enim ipsam voluptatem quia voluptas" }
  ]
};

async function main() {
  const targetSlug = process.argv[2];
  const tenants = targetSlug
    ? [await getTenantBySlug(targetSlug)].filter(Boolean)
    : await getAllTenants();

  if (tenants.length === 0) {
    console.error(targetSlug ? `Tenant "${targetSlug}" not found.` : 'No tenants found.');
    process.exit(1);
  }

  let added = 0;
  for (const tenant of tenants) {
    if (!tenant) continue;
    const existing = await db
      .select()
      .from(pageSectionsTable)
      .where(and(
        eq(pageSectionsTable.tenantId, tenant.id),
        eq(pageSectionsTable.sectionKey, 'home_favorite_products')
      ));

    if (existing.length === 0) {
      await db.insert(pageSectionsTable).values({
        tenantId: tenant.id,
        sectionKey: 'home_favorite_products',
        page: 'home',
        title: 'Home - Customer Favorite Products',
        content: JSON.stringify(DEFAULT_CONTENT),
        isActive: true,
      });
      console.log(`✅ Added to ${tenant.name} (${tenant.slug})`);
      added++;
    } else {
      console.log(`⏭️  ${tenant.name} already has home_favorite_products`);
    }
  }
  console.log(`\nDone. ${added} tenant(s) updated.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
