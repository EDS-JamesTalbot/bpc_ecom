import 'dotenv/config';
import { eq } from 'drizzle-orm';
import { db } from './index';
import { productsTable } from './schema';
import { getDefaultTenantId } from './queries/tenants';

const initialProducts = [
  {
    name: "Product One",
    price: "12.00",
    description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
    image: "/globe.svg",
    isActive: true,
  },
  {
    name: "Product Two",
    price: "11.00",
    description: "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
    image: "/file.svg",
    isActive: true,
  },
  {
    name: "Product Three",
    price: "13.00",
    description: "Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.",
    image: "/next.svg",
    isActive: true,
  },
  {
    name: "Product Four",
    price: "10.00",
    description: "Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt.",
    image: "/vercel.svg",
    isActive: true,
  },
  {
    name: "Bundle Set",
    price: "40.00",
    description: "At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti quos dolores et quas molestias excepturi sint occaecati cupiditate non provident.",
    image: "/window.svg",
    isActive: true,
  },
];

async function seed() {
  try {
    console.log('🌱 Seeding database...');

    const tenantId = await getDefaultTenantId();

    // Check if products already exist
    const existingProducts = await db.select().from(productsTable).where(eq(productsTable.tenantId, tenantId));
    
    if (existingProducts.length > 0) {
      console.log(`⚠️  Database already has ${existingProducts.length} products. Skipping seed.`);
      console.log('   Run this script with --force to re-seed.');
      return;
    }

    // Insert products
    await db.insert(productsTable).values(initialProducts.map(p => ({ ...p, tenantId })));

    console.log('✅ Successfully seeded database with products!');
    console.log(`   Added ${initialProducts.length} products.`);
    
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  } finally {
    process.exit(0);
  }
}

seed();

