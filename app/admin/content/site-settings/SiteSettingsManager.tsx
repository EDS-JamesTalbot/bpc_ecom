'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  upsertSiteSettingAction,
  updateSiteSettingAction,
  deleteSiteSettingAction,
} from '@/app/actions/content-actions';
import { UniversalImageUploader } from '@/app/components/UniversalImageUploader';
import type { SiteSetting } from '@/src/db/schema';

const STORE_LOGO_KEY = 'store_logo';

interface SiteSettingsManagerProps {
  initialSettings: SiteSetting[];
}

const CATEGORIES = ['branding', 'contact', 'social', 'general', 'business'];

export function SiteSettingsManager({ initialSettings }: SiteSettingsManagerProps) {
  const [settings, setSettings] = useState(initialSettings);
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [settingToDelete, setSettingToDelete] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    settingKey: '',
    settingValue: '',
    category: 'general',
    description: '',
  });

  function resetForm() {
    setFormData({
      settingKey: '',
      settingValue: '',
      category: 'general',
      description: '',
    });
    setIsCreating(false);
    setEditingId(null);
  }

  function handleEdit(setting: SiteSetting) {
    setFormData({
      settingKey: setting.settingKey,
      settingValue: setting.settingValue,
      category: setting.category,
      description: setting.description || '',
    });
    setEditingId(setting.id);
    setIsCreating(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (editingId) {
      const result = await updateSiteSettingAction(editingId, formData);
      if (result.success && result.data) {
        setSettings(settings.map(s => s.id === editingId ? result.data! : s));
        resetForm();
      } else {
        alert(result.error || 'Failed to update setting');
      }
    } else {
      const result = await upsertSiteSettingAction(formData);
      if (result.success && result.data) {
        const exists = settings.find(s => s.settingKey === result.data!.settingKey);
        if (exists) {
          setSettings(settings.map(s => s.settingKey === result.data!.settingKey ? result.data! : s));
        } else {
          setSettings([...settings, result.data]);
        }
        resetForm();
      } else {
        alert(result.error || 'Failed to save setting');
      }
    }
  }

  function openDeleteDialog(id: number) {
    setSettingToDelete(id);
    setDeleteDialogOpen(true);
  }

  async function confirmDelete() {
    if (settingToDelete === null) return;

    const result = await deleteSiteSettingAction(settingToDelete);
    if (result.success) {
      setSettings(settings.filter(s => s.id !== settingToDelete));
      if (editingId === settingToDelete) resetForm();
    }
    
    setDeleteDialogOpen(false);
    setSettingToDelete(null);
  }

  const filteredSettings = selectedCategory === 'all'
    ? settings
    : settings.filter(s => s.category === selectedCategory);

  // Group settings by category for display
  const settingsByCategory = filteredSettings.reduce((acc, setting) => {
    if (!acc[setting.category]) {
      acc[setting.category] = [];
    }
    acc[setting.category]!.push(setting);
    return acc;
  }, {} as Record<string, SiteSetting[]>);

  return (
    <div className="space-y-8">
      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Site Setting</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this site setting? This action cannot be undone and may affect how your website displays.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setDeleteDialogOpen(false);
                setSettingToDelete(null);
              }}
              className="hover:bg-secondary-foreground hover:text-white hover:border-secondary-foreground"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Create/Edit Form */}
      {(isCreating || editingId) && (
        <div className="rounded-2xl bg-white p-8 shadow-lg border-2 border-blue-300/50">
          <h2 className="text-2xl font-bold text-[#0c4a6e] mb-6">
            {editingId ? 'Edit Setting' : 'Create New Setting'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="settingKey">Setting Key * (e.g., contact_email)</Label>
                <Input
                  id="settingKey"
                  value={formData.settingKey}
                  onChange={(e) => setFormData({ ...formData, settingKey: e.target.value })}
                  placeholder="contact_email"
                  required
                  disabled={!!editingId}
                />
              </div>

              <div>
                <Label htmlFor="category">Category *</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    {CATEGORIES.map(cat => (
                      <SelectItem key={cat} value={cat}>
                        {cat.charAt(0).toUpperCase() + cat.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              {formData.settingKey === STORE_LOGO_KEY ? (
                <>
                  <Label>Store Logo</Label>
                  <p className="text-sm text-gray-600 mb-2">
                    Upload an image or paste a URL. Leave empty to show the text &quot;LOGO&quot; in the header.
                  </p>
                  <UniversalImageUploader
                    label=""
                    value={formData.settingValue}
                    onChange={(url) => setFormData({ ...formData, settingValue: url })}
                  />
                </>
              ) : (
                <>
                  <Label htmlFor="settingValue">Setting Value *</Label>
                  <Input
                    id="settingValue"
                    value={formData.settingValue}
                    onChange={(e) => setFormData({ ...formData, settingValue: e.target.value })}
                    placeholder="contact@example.com"
                    required
                  />
                </>
              )}
            </div>

            <div>
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Contact email displayed on the contact page"
                rows={2}
              />
            </div>

            <div className="flex gap-2 pt-4">
              <Button type="submit" className="!bg-primary hover:!bg-secondary-foreground !text-white shadow">
                {editingId ? 'Update' : 'Save'} Setting
              </Button>
              <Button type="button" variant="outline" onClick={resetForm} className="hover:bg-secondary-foreground hover:text-white hover:border-secondary-foreground">
                Cancel
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Filter and Create Button */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Label htmlFor="categoryFilter">Filter by category:</Label>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-[200px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-white">
              <SelectItem value="all">All Categories</SelectItem>
              {CATEGORIES.map(cat => (
                <SelectItem key={cat} value={cat}>
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {!isCreating && !editingId && (
          <Button
            onClick={() => setIsCreating(true)}
            className="!bg-primary hover:!bg-secondary-foreground !text-white shadow"
          >
            + Add New Setting
          </Button>
        )}
      </div>

      {/* Settings List Grouped by Category */}
      <div className="space-y-6">
        {Object.entries(settingsByCategory).length === 0 ? (
          <div className="rounded-2xl bg-white p-8 shadow-lg text-center text-[#475569]">
            No settings found. Create your first one!
          </div>
        ) : (
          Object.entries(settingsByCategory).map(([category, categorySettings]) => (
            <div key={category} className="space-y-4">
              <h2 className="text-2xl font-bold text-[#0c4a6e] capitalize">
                {category} ({categorySettings.length})
              </h2>

              <div className="grid gap-4">
                {categorySettings.map((setting) => (
                  <div
                    key={setting.id}
                    className="rounded-2xl bg-white p-6 shadow-lg border-2 border-blue-300/50"
                  >
                    <div className="mb-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-[#0c4a6e] mb-1 font-mono">
                            {setting.settingKey}
                          </h3>
                          {setting.description && (
                            <p className="text-sm text-gray-600 mb-2">{setting.description}</p>
                          )}
                          <div className="mt-2 p-3 bg-gray-50 rounded">
                            <p className="text-base text-[#475569] break-all">{setting.settingValue}</p>
                          </div>
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 mt-2">
                        Last updated: {new Date(setting.updatedAt).toLocaleString()}
                      </p>
                    </div>

                    <div className="flex gap-2 pt-4 border-t">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(setting)}
                        className="hover:bg-secondary-foreground hover:text-white"
                      >
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openDeleteDialog(setting.id)}
                        className="text-red-600 hover:bg-red-600 hover:text-white"
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

