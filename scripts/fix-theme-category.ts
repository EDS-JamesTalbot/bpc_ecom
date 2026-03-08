import 'dotenv/config';
import { db } from '@/src/db';
import { siteSettingsTable } from '@/src/db/schema';
import { like } from 'drizzle-orm';

async function fixThemeCategory() {
  console.log('🔧 Fixing theme settings category...\n');
  
  try {
    // Update all settings with 'theme_' prefix to have category 'theme'
    const result = await db
      .update(siteSettingsTable)
      .set({ category: 'theme' })
      .where(like(siteSettingsTable.settingKey, 'theme_%'));
    
    console.log('✅ Updated all theme settings to category "theme"\n');
    
    // Verify the fix
    const themeSettings = await db
      .select()
      .from(siteSettingsTable)
      .where(like(siteSettingsTable.settingKey, 'theme_%'));
    
    console.log(`📊 Verified: ${themeSettings.length} theme settings now have correct category\n`);
    
    themeSettings.slice(0, 3).forEach(setting => {
      console.log(`✅ ${setting.settingKey} → category: "${setting.category}"`);
    });
    
    console.log(`... and ${themeSettings.length - 3} more\n`);
    console.log('🎉 Theme category fixed successfully!');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

fixThemeCategory();
