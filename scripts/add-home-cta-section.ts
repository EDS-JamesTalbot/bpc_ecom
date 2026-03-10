/**
 * Add home_cta (Experience the Difference) page section to tenants that don't have it.
 * Run: npx tsx scripts/add-home-cta-section.ts
 */
import 'dotenv/config';
import { db } from '@/src/db';
import { pageSectionsTable } from '@/src/db/schema';
import { eq, and } from 'drizzle-orm';
import { getAllTenants, getTenantBySlug } from '@/src/db/queries/tenants';

const DEFAULT_CTA = {
  heading: "Experience the Difference Yourself",
  text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore",
  buttonText: "Shop Now",
  buttonLink: "/shop"
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
        eq(pageSectionsTable.sectionKey, 'home_cta')
      ));

    if (existing.length === 0) {
      await db.insert(pageSectionsTable).values({
        tenantId: tenant.id,
        sectionKey: 'home_cta',
        page: 'home',
        title: 'Home - Call to Action',
        content: JSON.stringify(DEFAULT_CTA),
        isActive: true,
      });
      console.log(`✅ Added home_cta to ${tenant.name} (${tenant.slug})`);
      added++;
    } else {
      console.log(`⏭️  ${tenant.name} already has home_cta`);
    }
  }
  console.log(`\nDone. ${added} tenant(s) updated.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
