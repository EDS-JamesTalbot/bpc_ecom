/**
 * Seed Lovey's Soap "Why Customers Choose Us" content into the loveys-soap tenant.
 * Run: npx tsx scripts/seed-loveys-why-choose.ts
 */
import 'dotenv/config';
import { db } from '@/src/db';
import { pageSectionsTable } from '@/src/db/schema';
import { eq, and } from 'drizzle-orm';
import { getTenantBySlug } from '@/src/db/queries/tenants';

const LOVEYSOAP_WHY_CHOOSE = {
  heading: "Why Customers Choose Lovey's Soap",
  features: [
    { icon: "🌿", title: "Natural Ingredients", description: "Only four simple ingredients, including botanicals grown in our own garden in Rarotonga" },
    { icon: "💚", title: "Gentle on Sensitive Skin", description: "Perfect for eczema, irritation, and everyday use. No harsh chemicals or synthetic additives" },
    { icon: "✨", title: "Silky, Velvety Texture", description: "Customers describe our soaps as smooth, nourishing, and incredibly hydrating" },
    { icon: "🧼", title: "Long-Lasting Lather", description: "Rich, creamy lather that outlasts commercial soaps while being gentle on your skin" },
    { icon: "🏝️", title: "Made in the Cook Islands", description: "Handcrafted in small batches in Rarotonga with love and care in every bar" },
    { icon: "🌟", title: "Visible Results", description: "Many customers report not needing moisturizer and seeing improvements in skin tone" }
  ]
};

async function main() {
  const tenant = await getTenantBySlug('loveys-soap');
  if (!tenant) {
    console.error('Loveys Soap tenant not found.');
    process.exit(1);
  }

  const existing = await db
    .select()
    .from(pageSectionsTable)
    .where(and(
      eq(pageSectionsTable.tenantId, tenant.id),
      eq(pageSectionsTable.sectionKey, 'home_why_choose')
    ));

  if (existing.length > 0) {
    await db
      .update(pageSectionsTable)
      .set({
        content: JSON.stringify(LOVEYSOAP_WHY_CHOOSE),
        title: "Home - Why Choose Us",
        updatedAt: new Date(),
      })
      .where(eq(pageSectionsTable.id, existing[0]!.id));
    console.log("✅ Updated Lovey's Soap 'Why Customers Choose Us' section");
  } else {
    await db.insert(pageSectionsTable).values({
      tenantId: tenant.id,
      sectionKey: 'home_why_choose',
      page: 'home',
      title: 'Home - Why Choose Us',
      content: JSON.stringify(LOVEYSOAP_WHY_CHOOSE),
      isActive: true,
    });
    console.log("✅ Created Lovey's Soap 'Why Customers Choose Us' section");
  }
  console.log("\nVisit /loveys-soap/admin/content/page-sections to view or edit.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
