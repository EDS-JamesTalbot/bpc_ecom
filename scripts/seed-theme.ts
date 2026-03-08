import 'dotenv/config';
import { upsertSiteSetting } from '@/src/db/queries/site-settings';

const THEME_SETTINGS = [
  // Brand Colors
  {
    key: 'theme_primary',
    value: '#1DA1F9',
    category: 'theme',
    description: 'Primary brand color - used for buttons, links, and key UI elements',
  },
  {
    key: 'theme_primary_foreground',
    value: '#ffffff',
    category: 'theme',
    description: 'Text color on primary colored backgrounds',
  },
  {
    key: 'theme_secondary',
    value: '#e0f2fe',
    category: 'theme',
    description: 'Secondary accent color - lighter shade for backgrounds',
  },
  {
    key: 'theme_secondary_foreground',
    value: '#0c4a6e',
    category: 'theme',
    description: 'Text color on secondary colored backgrounds',
  },
  {
    key: 'theme_accent',
    value: '#0ea5e9',
    category: 'theme',
    description: 'Accent color for highlights and interactive elements',
  },
  {
    key: 'theme_accent_foreground',
    value: '#ffffff',
    category: 'theme',
    description: 'Text color on accent colored backgrounds',
  },
  
  // Background & Foreground
  {
    key: 'theme_background',
    value: '#f0f9ff',
    category: 'theme',
    description: 'Webpage background colour (main area behind all content)',
  },
  {
    key: 'theme_header_background',
    value: '#ffffff',
    category: 'theme',
    description: 'Header bar background (top of every page)',
  },
  {
    key: 'theme_foreground',
    value: '#0c1929',
    category: 'theme',
    description: 'Main text color',
  },
  
  // Card Colors
  {
    key: 'theme_card',
    value: '#ffffff',
    category: 'theme',
    description: 'Card and panel background color',
  },
  {
    key: 'theme_card_foreground',
    value: '#1e293b',
    category: 'theme',
    description: 'Text color on cards and panels',
  },
  
  // Muted/Subtle Colors
  {
    key: 'theme_muted',
    value: '#f1f5f9',
    category: 'theme',
    description: 'Muted background color for less prominent elements',
  },
  {
    key: 'theme_muted_foreground',
    value: '#64748b',
    category: 'theme',
    description: 'Muted text color for secondary information',
  },
  
  // UI Elements
  {
    key: 'theme_border',
    value: '#cbd5e1',
    category: 'theme',
    description: 'Border color for inputs, cards, and dividers',
  },
  {
    key: 'theme_input',
    value: '#e2e8f0',
    category: 'theme',
    description: 'Background color for input fields',
  },
  {
    key: 'theme_ring',
    value: '#1DA1F9',
    category: 'theme',
    description: 'Focus ring color for keyboard navigation',
  },
  
  // Popover/Dropdown
  {
    key: 'theme_popover',
    value: '#ffffff',
    category: 'theme',
    description: 'Background color for popovers and dropdowns',
  },
  {
    key: 'theme_popover_foreground',
    value: '#1e293b',
    category: 'theme',
    description: 'Text color in popovers and dropdowns',
  },
  
  // Tagline Color
  {
    key: 'theme_tagline',
    value: '#817F7E',
    category: 'theme',
    description: 'Color for your store tagline in the header',
  },
  
  // Border Radius
  {
    key: 'theme_radius',
    value: '0.625rem',
    category: 'theme',
    description: 'Border radius for rounded corners (e.g., 0.5rem, 1rem)',
  },

  // Fonts (layman-friendly: buttons, menus, product cards)
  {
    key: 'theme_font_buttons',
    value: 'var(--font-geist-sans)',
    category: 'theme',
    description: 'Font used for buttons',
  },
  {
    key: 'theme_font_menus',
    value: 'var(--font-geist-sans)',
    category: 'theme',
    description: 'Font used for menus and navigation links',
  },
  {
    key: 'theme_font_product_cards',
    value: 'var(--font-geist-sans)',
    category: 'theme',
    description: 'Font used for product card text (shop)',
  },

  // Menu Navigation
  {
    key: 'theme_nav_link',
    value: '#64748b',
    category: 'theme',
    description: 'Inactive navigation link colour',
  },
  {
    key: 'theme_nav_link_active_bg',
    value: '#1DA1F9',
    category: 'theme',
    description: 'Active navigation tab background',
  },
  {
    key: 'theme_nav_link_active_text',
    value: '#ffffff',
    category: 'theme',
    description: 'Active navigation tab text colour',
  },
  {
    key: 'theme_nav_link_active_hover',
    value: '#0c4a6e',
    category: 'theme',
    description: 'Active tab hover background (darker)',
  },
];

async function seedThemeSettings() {
  console.log('🎨 Seeding theme settings...');
  
  try {
    for (const setting of THEME_SETTINGS) {
      await upsertSiteSetting(setting.key, setting.value, setting.category, setting.description);
      console.log(`✅ Created/updated: ${setting.key}`);
    }
    
    console.log('\n📊 Summary:');
    console.log(`   - Total theme settings: ${THEME_SETTINGS.length}`);
    console.log('\n✅ Theme settings seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding theme settings:', error);
    process.exit(1);
  }
}

seedThemeSettings();
