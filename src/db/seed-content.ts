/**
 * Database Seed Script for Content Management
 * 
 * This script populates the database with initial content for:
 * - Testimonials
 * - Page sections (home, testimonials, contact)
 * - Site settings (contact info)
 * 
 * Run this script ONCE after adding the new tables to your database:
 * npx tsx src/db/seed-content.ts
 */

// Load environment variables from .env file
import 'dotenv/config';
import { db } from '@/src/db';
import { testimonialsTable, pageSectionsTable } from '@/src/db/schema';
import { getDefaultTenantId } from '@/src/db/queries/tenants';
import { upsertSiteSetting } from '@/src/db/queries/site-settings';

async function seedContent() {
  console.log('🌱 Starting content seeding...\n');

  try {
    const tenantId = await getDefaultTenantId();

    // ============================================
    // SEED TESTIMONIALS
    // ============================================
    console.log('📝 Seeding testimonials...');
    
    const testimonials = [
      {
        quote: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
        location: "City, Country",
        authorName: null,
        isActive: true,
        sortOrder: 1,
      },
      {
        quote: "Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam.",
        location: "City, Country",
        authorName: null,
        isActive: true,
        sortOrder: 2,
      },
      {
        quote: "Quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
        location: "City, Country",
        authorName: null,
        isActive: true,
        sortOrder: 3,
      },
      {
        quote: "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.",
        location: "City, Country",
        authorName: null,
        isActive: true,
        sortOrder: 4,
      },
      {
        quote: "Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim.",
        location: "City, Country",
        authorName: null,
        isActive: true,
        sortOrder: 5,
      },
      {
        quote: "Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium.",
        location: "City, Country",
        authorName: null,
        isActive: true,
        sortOrder: 6,
      },
      {
        quote: "Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit.",
        location: "City, Country",
        authorName: null,
        isActive: true,
        sortOrder: 7,
      },
    ];

    await db.insert(testimonialsTable).values(testimonials.map(t => ({ ...t, tenantId })));
    console.log(`✅ Seeded ${testimonials.length} testimonials\n`);

    // ============================================
    // SEED PAGE SECTIONS
    // ============================================
    console.log('📄 Seeding page sections...');

    const pageSections = [
      // HOME PAGE SECTIONS
      {
        sectionKey: 'home_hero',
        page: 'home',
        title: 'Home - Hero Section',
        content: JSON.stringify({
          heading: "Welcome to Our Store",
          subheading: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor.",
          buttonText: "Shop Now",
          buttonLink: "/shop"
        }),
        isActive: true,
      },
      {
        sectionKey: 'home_about',
        page: 'home',
        title: 'Home - About Section',
        content: JSON.stringify({
          heading: "Our Story",
          paragraphs: [
            "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.",
            "Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit."
          ]
        }),
        isActive: true,
      },
      {
        sectionKey: 'home_why_choose',
        page: 'home',
        title: 'Home - Why Choose Us',
        content: JSON.stringify({
          heading: "Why Customers Choose Us",
          features: [
            {
              icon: "🌿",
              title: "Feature One",
              description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore."
            },
            {
              icon: "✨",
              title: "Feature Two",
              description: "Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo."
            },
            {
              icon: "💙",
              title: "Feature Three",
              description: "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur."
            }
          ]
        }),
        isActive: true,
      },
      {
        sectionKey: 'home_favorite_products',
        page: 'home',
        title: 'Home - Customer Favorite Products',
        content: JSON.stringify({
          heading: "Customer Favorite Products",
          products: [
            { title: "Product One", quote: "Lorem ipsum dolor sit amet, consectetur adipiscing.", description: "Sed do eiusmod tempor incididunt ut labore" },
            { title: "Product Two", quote: "Ut enim ad minim veniam, quis nostrud.", description: "Excepteur sint occaecat cupidatat non proident" },
            { title: "Product Three", quote: "Duis aute irure dolor in reprehenderit.", description: "Nemo enim ipsam voluptatem quia voluptas" }
          ]
        }),
        isActive: true,
      },
      {
        sectionKey: 'home_cta',
        page: 'home',
        title: 'Home - Call to Action',
        content: JSON.stringify({
          heading: "Experience the Difference Yourself",
          text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore",
          buttonText: "Shop Now",
          buttonLink: "/shop"
        }),
        isActive: true,
      },

      // TESTIMONIALS PAGE SECTIONS
      {
        sectionKey: 'testimonials_hero',
        page: 'testimonials',
        title: 'Testimonials - Hero Section',
        content: JSON.stringify({
          heading: "What Our Customers Say",
          subheading: "Lorem ipsum dolor sit amet, consectetur adipiscing elit sed do eiusmod"
        }),
        isActive: true,
      },

      // CONTACT PAGE SECTIONS
      {
        sectionKey: 'contact_header',
        page: 'contact',
        title: 'Contact - Header',
        content: JSON.stringify({
          heading: "Contact & Ordering Information",
          subheading: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor."
        }),
        isActive: true,
      },
      {
        sectionKey: 'contact_bulk_orders',
        page: 'contact',
        title: 'Contact - Bulk Orders',
        content: JSON.stringify({
          heading: "Bulk Orders",
          text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco."
        }),
        isActive: true,
      },
      {
        sectionKey: 'contact_shipping',
        page: 'contact',
        title: 'Contact - Shipping Options',
        content: JSON.stringify({
          heading: "Shipping Options",
          text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur."
        }),
        isActive: true,
      },
      {
        sectionKey: 'contact_international',
        page: 'contact',
        title: 'Contact - International Shipping',
        content: JSON.stringify({
          heading: "International Shipping",
          text: "Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium."
        }),
        isActive: true,
      },
    ];

    await db.insert(pageSectionsTable).values(pageSections.map(s => ({ ...s, tenantId })));
    console.log(`✅ Seeded ${pageSections.length} page sections\n`);

    // ============================================
    // SEED SITE SETTINGS
    // ============================================
    console.log('⚙️  Seeding site settings...');

    await upsertSiteSetting('contact_email', 'contact@example.com', 'contact', 'Primary contact email displayed on the contact page', tenantId);
    await upsertSiteSetting('contact_phone', '+1 (234) 567-890', 'contact', 'Primary contact phone number displayed on the contact page', tenantId);
    await upsertSiteSetting('business_name', 'Your Store Name', 'general', 'Business name displayed throughout the site', tenantId);
    console.log(`✅ Seeded 3 site settings\n`);

    console.log('🎉 Content seeding completed successfully!');
    console.log('\n📝 Next steps:');
    console.log('1. Visit /admin/content/testimonials to manage testimonials');
    console.log('2. Visit /admin/content/page-sections to edit page content');
    console.log('3. Visit /admin/content/site-settings to update contact info');

  } catch (error) {
    console.error('❌ Error seeding content:', error);
    throw error;
  }
}

// Run the seed script
seedContent()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

