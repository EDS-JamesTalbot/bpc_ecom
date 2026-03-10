'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { upsertSiteSettingAction } from '@/app/actions/content-actions';
import type { SiteSetting } from '@/src/db/schema';

interface StoreNameCardProps {
  storeNameSetting: SiteSetting | null;
  storeTaglineSetting: SiteSetting | null;
}

export function StoreNameCard({
  storeNameSetting,
  storeTaglineSetting,
}: StoreNameCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [storeName, setStoreName] = useState(storeNameSetting?.settingValue ?? '');
  const [storeTagline, setStoreTagline] = useState(storeTaglineSetting?.settingValue ?? '');
  const [isSaving, setIsSaving] = useState(false);

  async function handleSave() {
    setIsSaving(true);
    try {
      const nameResult = await upsertSiteSettingAction({
        settingKey: 'store_name',
        settingValue: storeName.trim() || 'My Store',
        category: 'branding',
        description: 'Store name shown in browser tab and header',
      });
      const taglineResult = await upsertSiteSettingAction({
        settingKey: 'store_tagline',
        settingValue: storeTagline.trim() || ' ',
        category: 'branding',
        description: 'Tagline shown below store name in header',
      });
      if (nameResult.success && taglineResult.success) {
        setIsEditing(false);
        window.location.reload(); // Refresh to show new tab title
      } else {
        alert(nameResult.error || taglineResult.error || 'Failed to save');
      }
    } catch (err) {
      alert('Failed to save');
    } finally {
      setIsSaving(false);
    }
  }

  const displayName = storeNameSetting?.settingValue || 'Not set';
  const displayTagline = storeTaglineSetting?.settingValue || '';

  return (
    <div className="rounded-2xl bg-white p-8 shadow-lg border-2 border-blue-300/50 mb-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#0c4a6e] mb-1">
            Store Name
          </h2>
          <p className="text-sm text-[#475569] mb-4">
            This appears in the <strong>browser tab</strong> and in the site header. Set it to &quot;Loveys Soap&quot; or your store name.
          </p>

          {isEditing ? (
            <div className="space-y-4 max-w-md">
              <div>
                <Label htmlFor="storeName">Store Name *</Label>
                <Input
                  id="storeName"
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  placeholder="e.g. Loveys Soap"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="storeTagline">Tagline (optional)</Label>
                <Input
                  id="storeTagline"
                  value={storeTagline}
                  onChange={(e) => setStoreTagline(e.target.value)}
                  placeholder="e.g. Handcrafted natural soaps"
                  className="mt-1"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={handleSave}
                  disabled={isSaving || !storeName.trim()}
                  className="!bg-primary hover:!bg-secondary-foreground !text-white"
                >
                  {isSaving ? 'Saving...' : 'Save'}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsEditing(false);
                    setStoreName(storeNameSetting?.settingValue ?? '');
                    setStoreTagline(storeTaglineSetting?.settingValue ?? '');
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-lg font-semibold text-[#0c4a6e]">
                {displayName}
              </p>
              {displayTagline && (
                <p className="text-sm text-[#475569]">{displayTagline}</p>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(true)}
                className="mt-2 hover:bg-secondary-foreground hover:text-white"
              >
                Edit Store Name
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
