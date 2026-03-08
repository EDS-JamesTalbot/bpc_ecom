import { getSiteSettingsByCategory, upsertSiteSetting } from '@/src/db/queries/site-settings';
import { ThemeEditor } from './ThemeEditor';

export const dynamic = 'force-dynamic';

const ENSURED_THEME_KEYS: { key: string; value: string; description: string }[] = [
  { key: 'theme_header_background', value: '#ffffff', description: 'Header bar background (top of every page)' },
  { key: 'theme_font_buttons', value: 'var(--font-geist-sans)', description: 'Font used for buttons' },
  { key: 'theme_font_menus', value: 'var(--font-geist-sans)', description: 'Font used for menus and navigation links' },
  { key: 'theme_font_product_cards', value: 'var(--font-geist-sans)', description: 'Font used for product card text (shop)' },
  { key: 'theme_nav_link', value: '#64748b', description: 'Inactive navigation link colour' },
  { key: 'theme_nav_link_active_bg', value: '#1DA1F9', description: 'Active navigation tab background' },
  { key: 'theme_nav_link_active_text', value: '#ffffff', description: 'Active navigation tab text colour' },
  { key: 'theme_nav_link_active_hover', value: '#0c4a6e', description: 'Active tab hover background (darker)' },
];

// Note: Authentication disabled due to Clerk JWT infinite loop issue
// The Content link is only visible to admins in Navigation component
export default async function ThemeEditorPage() {
  let themeSettings = await getSiteSettingsByCategory('theme');
  for (const { key, value, description } of ENSURED_THEME_KEYS) {
    if (!themeSettings.some(s => s.settingKey === key)) {
      await upsertSiteSetting(key, value, 'theme', description);
    }
  }
  themeSettings = await getSiteSettingsByCategory('theme');

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-secondary-foreground mb-2">
          Theme Editor
        </h1>
        <p className="text-lg text-muted-foreground">
          Change colours (webpage, header, buttons, text, and more) and fonts for buttons, menus, and product cards. No coding — just pick colours, choose fonts, and save.
        </p>
      </div>

      <ThemeEditor initialSettings={themeSettings} />
    </div>
  );
}
