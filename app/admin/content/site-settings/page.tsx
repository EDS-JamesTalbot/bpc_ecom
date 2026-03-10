import { getAllSiteSettings, getSiteSettingByKey } from '@/src/db/queries/site-settings';
import { SiteSettingsManager } from './SiteSettingsManager';
import { StoreNameCard } from './StoreNameCard';

// Note: Authentication disabled due to Clerk JWT infinite loop issue
// The Content link is only visible to admins in Navigation component
export default async function AdminSiteSettingsPage() {
  const allSettings = await getAllSiteSettings();
  
  // Exclude theme settings - they have their own dedicated Theme Editor page
  const siteSettings = allSettings.filter(setting => setting.category !== 'theme');

  const storeNameSetting = await getSiteSettingByKey('store_name');
  const storeTaglineSetting = await getSiteSettingByKey('store_tagline');

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-[#0c4a6e] mb-2">
          Site Settings
        </h1>
        <p className="text-lg text-[#475569]">
          Manage global site settings like contact information, social links, and more.
        </p>
      </div>

      {/* Store Name - prominent for browser tab & header */}
      <StoreNameCard
        storeNameSetting={storeNameSetting}
        storeTaglineSetting={storeTaglineSetting}
      />

      <SiteSettingsManager initialSettings={siteSettings} />
    </div>
  );
}

