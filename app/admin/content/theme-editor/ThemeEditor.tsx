'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { updateSiteSettingAction } from '@/app/actions/content-actions';
import type { SiteSetting } from '@/src/db/schema';
import { Palette, RotateCcw, Save } from 'lucide-react';

interface ThemeEditorProps {
  initialSettings: SiteSetting[];
}

interface ThemeGroup {
  title: string;
  description: string;
  settings: SiteSetting[];
}

const DEFAULT_THEME_VALUES: Record<string, string> = {
  theme_primary: '#1DA1F9',
  theme_primary_foreground: '#ffffff',
  theme_secondary: '#e0f2fe',
  theme_secondary_foreground: '#0c4a6e',
  theme_accent: '#0ea5e9',
  theme_accent_foreground: '#ffffff',
  theme_background: '#f0f9ff',
  theme_header_background: '#ffffff',
  theme_foreground: '#0c1929',
  theme_card: '#ffffff',
  theme_card_foreground: '#1e293b',
  theme_muted: '#f1f5f9',
  theme_muted_foreground: '#64748b',
  theme_border: '#cbd5e1',
  theme_input: '#e2e8f0',
  theme_ring: '#1DA1F9',
  theme_popover: '#ffffff',
  theme_popover_foreground: '#1e293b',
  theme_tagline: '#817F7E',
  theme_radius: '0.625rem',
  theme_font_buttons: 'var(--font-geist-sans)',
  theme_font_menus: 'var(--font-geist-sans)',
  theme_font_product_cards: 'var(--font-geist-sans)',
  theme_nav_link: '#64748b',
  theme_nav_link_active_bg: '#1DA1F9',
  theme_nav_link_active_text: '#ffffff',
  theme_nav_link_active_hover: '#0c4a6e',
};

const FONT_OPTIONS: { label: string; value: string }[] = [
  { label: 'Default (site font)', value: 'var(--font-geist-sans)' },
  { label: 'Arial', value: 'Arial, Helvetica, sans-serif' },
  { label: 'Georgia', value: 'Georgia, serif' },
  { label: 'Times New Roman', value: '"Times New Roman", Times, serif' },
  { label: 'System default', value: 'system-ui, -apple-system, sans-serif' },
  { label: 'Verdana', value: 'Verdana, Geneva, sans-serif' },
  { label: 'Trebuchet MS', value: '"Trebuchet MS", sans-serif' },
];
const FONT_KEYS = ['theme_font_buttons', 'theme_font_menus', 'theme_font_product_cards'];

export function ThemeEditor({ initialSettings }: ThemeEditorProps) {
  const [settings, setSettings] = useState(initialSettings);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);
  const [successDialogOpen, setSuccessDialogOpen] = useState(false);
  const [errorDialogOpen, setErrorDialogOpen] = useState(false);
  const [dialogMessage, setDialogMessage] = useState('');
  const [dialogAction, setDialogAction] = useState<'save' | 'reset' | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  // Group settings by category (colors and radius only — no code, layman-friendly)
  const groups: ThemeGroup[] = [
    {
      title: 'Webpage and header background',
      description: 'The main page area and the top header bar',
      settings: settings.filter(s =>
        ['theme_background', 'theme_header_background'].includes(s.settingKey)
      ),
    },
    {
      title: 'Menu Navigation',
      description: 'Colours for the main navigation links in the header',
      settings: settings.filter(s =>
        ['theme_nav_link', 'theme_nav_link_active_bg', 'theme_nav_link_active_text', 'theme_nav_link_active_hover'].includes(s.settingKey)
      ),
    },
    {
      title: 'Main brand colours',
      description: 'The main colours for buttons, links, and key parts of your site',
      settings: settings.filter(s =>
        ['theme_primary', 'theme_primary_foreground', 'theme_secondary', 'theme_secondary_foreground', 'theme_accent', 'theme_accent_foreground'].includes(s.settingKey)
      ),
    },
    {
      title: 'Page and card colours',
      description: 'Text and card backgrounds (cards, panels)',
      settings: settings.filter(s =>
        ['theme_foreground', 'theme_card', 'theme_card_foreground'].includes(s.settingKey)
      ),
    },
    {
      title: 'Softer colours',
      description: 'Lighter colours used for less prominent text and areas',
      settings: settings.filter(s =>
        ['theme_muted', 'theme_muted_foreground', 'theme_tagline'].includes(s.settingKey)
      ),
    },
    {
      title: 'Borders and boxes',
      description: 'Colours for borders, input fields, and dropdowns',
      settings: settings.filter(s =>
        ['theme_border', 'theme_input', 'theme_ring', 'theme_popover', 'theme_popover_foreground'].includes(s.settingKey)
      ),
    },
    {
      title: 'Border Radius',
      description: 'How rounded the corners are on buttons, cards, and boxes',
      settings: settings.filter(s => s.settingKey === 'theme_radius'),
    },
    {
      title: 'Fonts',
      description: 'Font for buttons, menus, and product cards',
      settings: settings.filter(s => FONT_KEYS.includes(s.settingKey)),
    },
  ];

  function handleChange(id: number, newValue: string) {
    setSettings(settings.map(s => 
      s.id === id ? { ...s, settingValue: newValue } : s
    ));
    setHasChanges(true);
  }

  async function handleSave() {
    setIsSaving(true);
    try {
      // Update all changed settings
      for (const setting of settings) {
        const original = initialSettings.find(s => s.id === setting.id);
        if (original && original.settingValue !== setting.settingValue) {
          console.log(`Saving ${setting.settingKey}: ${setting.settingValue}`);
          const result = await updateSiteSettingAction(setting.id, {
            settingValue: setting.settingValue,
          });
          console.log(`Result for ${setting.settingKey}:`, result);
          
          if (!result.success) {
            throw new Error(result.error || 'Failed to save');
          }
        }
      }
      
      setHasChanges(false);
      setDialogAction('save');
      setDialogMessage('Theme saved successfully! The page will refresh to apply your new theme.');
      setSuccessDialogOpen(true);
    } catch (error) {
      console.error('Failed to save theme:', error);
      setDialogMessage('Failed to save theme. Please try again.');
      setErrorDialogOpen(true);
      setIsSaving(false);
    }
  }

  function handleReset() {
    setIsResetDialogOpen(true);
  }

  async function confirmReset() {
    setIsResetDialogOpen(false);
    setIsSaving(true);
    
    try {
      // Reset all settings to defaults
      for (const setting of settings) {
        const defaultValue = DEFAULT_THEME_VALUES[setting.settingKey];
        if (defaultValue) {
          await updateSiteSettingAction(setting.id, {
            settingValue: defaultValue,
          });
        }
      }
      
      setDialogAction('reset');
      setDialogMessage('Theme reset to defaults successfully! The page will refresh to apply the default theme.');
      setSuccessDialogOpen(true);
    } catch (error) {
      console.error('Failed to reset theme:', error);
      setDialogMessage('Failed to reset theme. Please try again.');
      setErrorDialogOpen(true);
      setIsSaving(false);
    }
  }

  function handleSuccessClose() {
    setSuccessDialogOpen(false);
    // Reload page after closing success dialog
    window.location.reload();
  }

  function handleErrorClose() {
    setErrorDialogOpen(false);
  }

  // Layman-friendly labels (colour names only, no jargon)
  const FRIENDLY_LABELS: Record<string, string> = {
    theme_primary: 'Main buttons and links',
    theme_primary_foreground: 'Text on main buttons',
    theme_secondary: 'Secondary buttons and highlights',
    theme_secondary_foreground: 'Text on secondary buttons',
    theme_accent: 'Accent colour (highlights)',
    theme_accent_foreground: 'Text on accent areas',
    theme_background: 'Webpage background',
    theme_header_background: 'Header bar background',
    theme_foreground: 'Main text colour',
    theme_card: 'Card and panel background',
    theme_card_foreground: 'Text on cards',
    theme_muted: 'Muted background areas',
    theme_muted_foreground: 'Muted or secondary text',
    theme_tagline: 'Tagline text (under store name)',
    theme_border: 'Borders and dividers',
    theme_input: 'Input field background',
    theme_ring: 'Focus outline (when tabbing)',
    theme_popover: 'Dropdown and popover background',
    theme_popover_foreground: 'Text in dropdowns',
    theme_radius: 'Corner roundness (e.g. 0.5rem)',
    theme_font_buttons: 'Buttons',
    theme_font_menus: 'Menus and navigation',
    theme_font_product_cards: 'Product cards (shop)',
    theme_nav_link: 'Inactive link colour',
    theme_nav_link_active_bg: 'Active tab background',
    theme_nav_link_active_text: 'Active tab text',
    theme_nav_link_active_hover: 'Active tab hover (darker)',
  };

  function formatLabel(key: string): string {
    return FRIENDLY_LABELS[key] ?? key.replace('theme_', '').split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  }

  return (
    <div className="space-y-6">
      {/* Reset Confirmation Dialog */}
      <AlertDialog open={isResetDialogOpen} onOpenChange={setIsResetDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reset Theme to Defaults?</AlertDialogTitle>
            <AlertDialogDescription>
              This will reset all {settings.length} theme settings back to their original values. 
              Your current custom theme will be lost. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel className="hover:bg-secondary-foreground hover:text-white hover:border-secondary-foreground">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmReset}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Reset to Defaults
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Success Dialog */}
      <AlertDialog open={successDialogOpen} onOpenChange={setSuccessDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <span className="text-2xl">✅</span>
              Success!
            </AlertDialogTitle>
            <AlertDialogDescription>
              {dialogMessage}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction
              onClick={handleSuccessClose}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              Refresh Now
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Error Dialog */}
      <AlertDialog open={errorDialogOpen} onOpenChange={setErrorDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <span className="text-2xl">❌</span>
              Error
            </AlertDialogTitle>
            <AlertDialogDescription>
              {dialogMessage}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction
              onClick={handleErrorClose}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Close
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Action Buttons */}
      <div className="flex justify-between items-center sticky top-0 bg-background py-4 z-10 border-b">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Palette className="h-4 w-4" />
          {hasChanges ? (
            <span className="text-amber-600 font-medium">Unsaved changes</span>
          ) : (
            <span>All changes saved</span>
          )}
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={handleReset}
            disabled={isSaving}
            className="inline-flex items-center justify-center gap-2 rounded-lg text-lg font-semibold transition-all h-10 px-4 py-2 border-2 disabled:opacity-50 disabled:pointer-events-none"
            style={{
              borderColor: '#0c4a6e',
              color: '#0c4a6e',
              backgroundColor: 'transparent',
            }}
            onMouseEnter={(e) => {
              if (!isSaving) {
                e.currentTarget.style.backgroundColor = '#0c4a6e';
                e.currentTarget.style.color = 'white';
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = '#0c4a6e';
            }}
          >
            <RotateCcw className="h-4 w-4" />
            Reset to Defaults
          </button>
          <button
            onClick={handleSave}
            disabled={!hasChanges || isSaving}
            ref={(el) => {
              if (el) {
                el.style.setProperty('background-color', '#1DA1F9', 'important');
              }
            }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              borderRadius: '0.5rem',
              fontSize: '1.125rem',
              lineHeight: '1.75rem',
              fontWeight: '600',
              padding: '0.5rem 1rem',
              color: 'white',
              border: 'none',
              transition: 'background-color 0.2s ease',
              cursor: (!hasChanges || isSaving) ? 'not-allowed' : 'pointer',
              pointerEvents: (!hasChanges || isSaving) ? 'none' : 'auto',
            }}
            onMouseEnter={(e) => {
              if (!isSaving && hasChanges) {
                e.currentTarget.style.setProperty('background-color', '#0c4a6e', 'important');
              }
            }}
            onMouseLeave={(e) => {
              if (hasChanges && !isSaving) {
                e.currentTarget.style.setProperty('background-color', '#1DA1F9', 'important');
              }
            }}
          >
            <Save className="h-4 w-4" />
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      {/* Theme Groups */}
      {groups.map((group) => (
        <Card key={group.title} className="border-2 border-blue-300/50">
          <CardHeader>
            <CardTitle className="text-2xl text-secondary-foreground">{group.title}</CardTitle>
            <CardDescription>{group.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              {group.settings.map((setting) => {
                const isFont = FONT_KEYS.includes(setting.settingKey);
                const isColor = !isFont && setting.settingKey !== 'theme_radius';

                return (
                  <div key={setting.id} className="space-y-2">
                    <Label htmlFor={`setting-${setting.id}`} className="text-base font-medium">
                      {formatLabel(setting.settingKey)}
                    </Label>

                    {setting.description && (
                      <p className="text-sm text-muted-foreground mb-2">
                        {setting.description}
                      </p>
                    )}

                    {isFont ? (
                      mounted ? (
                        <Select
                          value={setting.settingValue}
                          onValueChange={(v) => handleChange(setting.id, v)}
                        >
                          <SelectTrigger id={`setting-${setting.id}`} className="bg-white">
                            <SelectValue placeholder="Choose font" />
                          </SelectTrigger>
                          <SelectContent className="bg-white">
                            {FONT_OPTIONS.map((opt) => (
                              <SelectItem key={opt.value} value={opt.value}>
                                {opt.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <div
                          className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-white px-3 py-2 text-sm"
                          aria-hidden
                        >
                          {FONT_OPTIONS.find((o) => o.value === setting.settingValue)?.label ?? 'Default (site font)'}
                        </div>
                      )
                    ) : (
                      <div className="flex gap-2 items-center">
                        {isColor && (
                          <div className="relative">
                            <input
                              type="color"
                              id={`setting-${setting.id}`}
                              value={setting.settingValue}
                              onChange={(e) => handleChange(setting.id, e.target.value)}
                              className="h-12 w-24 rounded cursor-pointer border-2 border-gray-300"
                            />
                          </div>
                        )}

                        <Input
                          type="text"
                          value={setting.settingValue}
                          onChange={(e) => handleChange(setting.id, e.target.value)}
                          placeholder={isColor ? '#000000' : '0.5rem'}
                          className="font-mono"
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Preview Note — simple instructions for non-technical users */}
      <Card className="border-2 border-amber-300/50 bg-amber-50">
        <CardHeader>
          <CardTitle className="text-xl text-amber-900 flex items-center gap-2">
            💡 Colours and fonts
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-amber-800">
          <p className="mb-2">
            Change colours with the colour boxes (e.g. <strong>Webpage background</strong>, <strong>Header bar background</strong>). Change fonts for buttons, menus, and product cards using the dropdowns in the Fonts section.
          </p>
          <ol className="list-decimal list-inside space-y-1 ml-2">
            <li>Pick colours and/or fonts above</li>
            <li>Click <strong>Save Changes</strong> when you’re done</li>
            <li>The page will refresh so you can see your changes</li>
          </ol>
          <p className="mt-3 font-medium">
            Not happy? Click <strong>Reset to Defaults</strong> to restore everything.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
