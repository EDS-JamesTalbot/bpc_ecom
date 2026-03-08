'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
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
  upsertPageSectionAction,
  updatePageSectionAction,
  deletePageSectionAction,
  togglePageSectionActiveAction,
} from '@/app/actions/content-actions';
import type { PageSection } from '@/src/db/schema';
import { Trash2, Plus } from 'lucide-react';

interface PageSectionsManagerProps {
  initialPageSections: PageSection[];
}

interface ContentField {
  key: string;
  value: string;
}

const PAGES = ['home', 'testimonials', 'contact', 'shop', 'help']; // Display order

export function PageSectionsManager({ initialPageSections }: PageSectionsManagerProps) {
  const [pageSections, setPageSections] = useState(initialPageSections);
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [selectedPage, setSelectedPage] = useState<string>('all');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [sectionToDelete, setSectionToDelete] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    sectionKey: '',
    page: 'home',
    title: '',
    isActive: true,
  });
  const [contentFields, setContentFields] = useState<ContentField[]>([{ key: '', value: '' }]);

  function parseJsonToFields(jsonString: string): ContentField[] {
    try {
      const parsed = JSON.parse(jsonString);
      if (typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed)) {
        const fields = Object.entries(parsed).map(([key, value]) => {
          let stringValue: string;
          
          if (Array.isArray(value)) {
            // Convert array to multi-line string (one item per line)
            stringValue = value.map(item => {
              if (typeof item === 'object') {
                return JSON.stringify(item);
              }
              return String(item);
            }).join('\n');
          } else if (typeof value === 'object' && value !== null) {
            // Convert object to JSON string
            stringValue = JSON.stringify(value);
          } else {
            stringValue = String(value);
          }
          
          return { key, value: stringValue };
        });
        return fields.length > 0 ? fields : [{ key: '', value: '' }];
      }
    } catch {
      // If parsing fails, return empty field
    }
    return [{ key: '', value: '' }];
  }

  function fieldsToJson(fields: ContentField[]): string {
    const obj: Record<string, any> = {};
    
    fields.forEach(field => {
      if (field.key.trim()) {
        const key = field.key.trim();
        const value = field.value.trim();
        
        // Check if value contains multiple lines (likely an array)
        if (value.includes('\n')) {
          const lines = value.split('\n').map(line => line.trim()).filter(line => line.length > 0);
          
          // Try to parse each line as JSON (for array of objects)
          const parsedLines = lines.map(line => {
            try {
              return JSON.parse(line);
            } catch {
              return line; // Keep as string if not valid JSON
            }
          });
          
          obj[key] = parsedLines;
        } else {
          // Try to parse as JSON (for single objects)
          try {
            obj[key] = JSON.parse(value);
          } catch {
            // Keep as string if not valid JSON
            obj[key] = value;
          }
        }
      }
    });
    
    return JSON.stringify(obj, null, 2);
  }

  function resetForm() {
    setFormData({
      sectionKey: '',
      page: 'home',
      title: '',
      isActive: true,
    });
    setContentFields([{ key: '', value: '' }]);
    setIsCreating(false);
    setEditingId(null);
  }

  function handleEdit(section: PageSection) {
    setFormData({
      sectionKey: section.sectionKey,
      page: section.page,
      title: section.title,
      isActive: section.isActive,
    });
    setContentFields(parseJsonToFields(section.content));
    setEditingId(section.id);
    setIsCreating(false);
  }

  function addContentField() {
    setContentFields([...contentFields, { key: '', value: '' }]);
  }

  function removeContentField(index: number) {
    if (contentFields.length > 1) {
      setContentFields(contentFields.filter((_, i) => i !== index));
    }
  }

  function updateContentField(index: number, field: 'key' | 'value', newValue: string) {
    const updated = [...contentFields];
    if (updated[index]) {
      updated[index][field] = newValue;
      setContentFields(updated);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    // Convert fields to JSON
    const jsonContent = fieldsToJson(contentFields);

    const submitData = {
      ...formData,
      content: jsonContent,
    };

    if (editingId) {
      const result = await updatePageSectionAction(editingId, submitData);
      if (result.success && result.data) {
        setPageSections(pageSections.map(s => s.id === editingId ? result.data! : s));
        resetForm();
      }
    } else {
      const result = await upsertPageSectionAction(submitData);
      if (result.success && result.data) {
        // Check if it was an update or create
        const exists = pageSections.find(s => s.sectionKey === result.data!.sectionKey);
        if (exists) {
          setPageSections(pageSections.map(s => s.sectionKey === result.data!.sectionKey ? result.data! : s));
        } else {
          setPageSections([...pageSections, result.data]);
        }
        resetForm();
      } else {
        alert(result.error || 'Failed to save page section');
      }
    }
  }

  function openDeleteDialog(id: number) {
    setSectionToDelete(id);
    setDeleteDialogOpen(true);
  }

  async function confirmDelete() {
    if (sectionToDelete === null) return;

    const result = await deletePageSectionAction(sectionToDelete);
    if (result.success) {
      setPageSections(pageSections.filter(s => s.id !== sectionToDelete));
      if (editingId === sectionToDelete) resetForm();
    }
    
    setDeleteDialogOpen(false);
    setSectionToDelete(null);
  }

  async function handleToggleActive(id: number) {
    const result = await togglePageSectionActiveAction(id);
    if (result.success && result.data) {
      setPageSections(pageSections.map(s => s.id === id ? result.data! : s));
    }
  }

  // Define page order
  const pageOrder = ['home', 'testimonials', 'contact', 'shop', 'help'];
  
  const filteredSections = selectedPage === 'all'
    ? pageSections.sort((a, b) => {
        const orderA = pageOrder.indexOf(a.page);
        const orderB = pageOrder.indexOf(b.page);
        // Sort by page order first, then by title
        if (orderA !== orderB) return orderA - orderB;
        return a.title.localeCompare(b.title);
      })
    : pageSections.filter(s => s.page === selectedPage).sort((a, b) => a.title.localeCompare(b.title));

  return (
    <div className="space-y-8">
      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Page Section</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this page section? This action cannot be undone and will remove the content from your database.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setDeleteDialogOpen(false);
                setSectionToDelete(null);
              }}
              className="hover:bg-[#0c4a6e] hover:text-white hover:border-[#0c4a6e]"
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
            {editingId ? 'Edit Page Section' : 'Create New Page Section'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="page">Page *</Label>
                <Select
                  value={formData.page}
                  onValueChange={(value) => setFormData({ ...formData, page: value })}
                  disabled={!!editingId}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    {PAGES.map(page => (
                      <SelectItem key={page} value={page}>
                        {page.charAt(0).toUpperCase() + page.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="sectionKey">Section Key * (e.g., home_hero)</Label>
                <Input
                  id="sectionKey"
                  value={formData.sectionKey}
                  onChange={(e) => setFormData({ ...formData, sectionKey: e.target.value })}
                  placeholder="home_hero"
                  required
                  disabled={!!editingId}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="title">Title (Admin Display) *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Hero Section"
                required
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Content Fields</Label>
                <Button
                  type="button"
                  size="sm"
                  onClick={addContentField}
                  className="gap-1 bg-[#1DA1F9] hover:bg-[#0c4a6e] text-white"
                >
                  <Plus className="h-4 w-4" />
                  Add Field
                </Button>
              </div>
              
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-200 text-sm text-gray-700 space-y-1">
                <p className="font-semibold text-[#0c4a6e]">💡 How to enter content:</p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li><strong>Single value:</strong> Just type normally (e.g., "Welcome to our website")</li>
                  <li><strong>Multiple items (array):</strong> Put each item on a new line (press Enter between items)</li>
                  <li><strong>Complex items:</strong> For features with icon/title/description, use JSON format like: {`{"icon": "🌿", "title": "Feature", "description": "Text"}`}</li>
                </ul>
              </div>
              
              <div className="space-y-3">
                {contentFields.map((field, index) => (
                  <div key={index} className="border rounded-lg p-3 bg-gray-50">
                    <div className="flex gap-2 items-start">
                      <div className="flex-1">
                        <Label className="text-xs mb-1">Field Name</Label>
                        <Input
                          placeholder="e.g., heading, paragraphs, features"
                          value={field.key}
                          onChange={(e) => updateContentField(index, 'key', e.target.value)}
                          className="font-mono text-sm"
                        />
                      </div>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => removeContentField(index)}
                        disabled={contentFields.length === 1}
                        className="text-red-600 hover:bg-red-600 hover:text-white mt-5"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="mt-2">
                      <Label className="text-xs mb-1">Field Value</Label>
                      <Textarea
                        placeholder="Enter value (use multiple lines for arrays)"
                        value={field.value}
                        onChange={(e) => updateContentField(index, 'value', e.target.value)}
                        rows={4}
                        className="font-sans"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Switch
                id="isActive"
                checked={formData.isActive}
                onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                className={formData.isActive ? 'data-[state=checked]:bg-green-600' : 'bg-amber-500'}
              />
              <Label htmlFor="isActive" className="font-medium text-[#0c4a6e]">
                {formData.isActive ? 'Active (shown on website)' : 'Inactive (hidden from website)'}
              </Label>
            </div>

            <div className="flex gap-2 pt-4">
              <Button type="submit" className="bg-[#1DA1F9] hover:bg-[#0c4a6e] text-white">
                {editingId ? 'Update' : 'Save'} Section
              </Button>
              <Button type="button" variant="outline" onClick={resetForm} className="hover:bg-[#0c4a6e] hover:text-white hover:border-[#0c4a6e]">
                Cancel
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Filter and Create Button */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Label htmlFor="pageFilter">Filter by page:</Label>
          <Select value={selectedPage} onValueChange={setSelectedPage}>
            <SelectTrigger className="w-[200px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-white">
              <SelectItem value="all">All Pages</SelectItem>
              {PAGES.map(page => (
                <SelectItem key={page} value={page}>
                  {page.charAt(0).toUpperCase() + page.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {!isCreating && !editingId && (
          <Button
            onClick={() => setIsCreating(true)}
            className="bg-[#1DA1F9] hover:bg-[#0c4a6e] text-white"
          >
            + Add New Section
          </Button>
        )}
      </div>

      {/* Page Sections List */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-[#0c4a6e]">
          Page Sections ({filteredSections.length})
        </h2>

        {filteredSections.length === 0 ? (
          <div className="rounded-2xl bg-white p-8 shadow-lg text-center text-[#475569]">
            No page sections found. {selectedPage !== 'all' && 'Try selecting a different page or'} Create your first one!
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredSections.map((section) => (
              <div
                key={section.id}
                className={`rounded-2xl bg-white p-6 shadow-lg border-2 ${
                  section.isActive ? 'border-green-300/50' : 'border-gray-300/50 opacity-60'
                }`}
              >
                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      section.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {section.isActive ? 'Active' : 'Inactive'}
                    </span>
                    <span className="px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800">
                      {section.page}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-[#0c4a6e] mb-1">{section.title}</h3>
                  <p className="text-sm text-gray-600 font-mono">{section.sectionKey}</p>
                  <div className="mt-3 p-3 bg-gray-50 rounded space-y-2">
                    <p className="text-xs font-semibold text-gray-700 mb-2">Content:</p>
                    {(() => {
                      try {
                        const parsed = JSON.parse(section.content);
                        return Object.entries(parsed).map(([key, value]) => (
                          <div key={key} className="text-sm mb-2">
                            <span className="font-mono font-semibold text-[#0c4a6e]">{key}:</span>{' '}
                            {Array.isArray(value) ? (
                              <div className="ml-4 mt-1 space-y-1">
                                {value.map((item, idx) => (
                                  <div key={idx} className="text-gray-700">
                                    • {typeof item === 'object' ? JSON.stringify(item) : String(item)}
                                  </div>
                                ))}
                              </div>
                            ) : typeof value === 'object' ? (
                              <span className="text-gray-700 font-mono text-xs">{JSON.stringify(value)}</span>
                            ) : (
                              <span className="text-gray-700">{String(value)}</span>
                            )}
                          </div>
                        ));
                      } catch {
                        return <pre className="text-xs font-mono whitespace-pre-wrap break-words">{section.content}</pre>;
                      }
                    })()}
                  </div>
                </div>

                <div className="flex gap-2 pt-4 border-t">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEdit(section)}
                    className="hover:bg-[#0c4a6e] hover:text-white"
                  >
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleToggleActive(section.id)}
                    className="hover:bg-[#0c4a6e] hover:text-white"
                  >
                    {section.isActive ? 'Deactivate' : 'Activate'}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => openDeleteDialog(section.id)}
                    className="text-red-600 hover:bg-red-600 hover:text-white"
                  >
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

