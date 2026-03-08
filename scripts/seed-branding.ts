import 'dotenv/config';
import { upsertSiteSetting } from '@/src/db/queries/site-settings';

async function seedBrandingSettings() {
  console.log('🌱 Seeding branding settings...');
  
  try {
    await upsertSiteSetting('store_name', 'YOUR STORE', 'branding', 'The name of your store displayed in the header');
    console.log('✅ Created/updated store_name setting');
    
    await upsertSiteSetting('store_tagline', 'Your tagline goes here', 'branding', 'The tagline displayed below your store name in the header');
    console.log('✅ Created/updated store_tagline setting');
    
    await upsertSiteSetting('store_logo', '', 'branding', 'URL to your store logo image (leave empty to show text "LOGO")');
    console.log('✅ Created/updated store_logo setting');
    
    console.log('✅ Branding settings seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding branding settings:', error);
    process.exit(1);
  }
}

seedBrandingSettings();
