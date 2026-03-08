'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  createTestimonialAction,
  updateTestimonialAction,
  deleteTestimonialAction,
  toggleTestimonialActiveAction,
} from '@/app/actions/content-actions';
import type { Testimonial } from '@/src/db/schema';

interface TestimonialsManagerProps {
  initialTestimonials: Testimonial[];
}

export function TestimonialsManager({ initialTestimonials }: TestimonialsManagerProps) {
  const [testimonials, setTestimonials] = useState(initialTestimonials);
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [testimonialToDelete, setTestimonialToDelete] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    quote: '',
    location: '',
    authorName: '',
    isActive: true,
    sortOrder: 0,
  });

  function resetForm() {
    setFormData({
      quote: '',
      location: '',
      authorName: '',
      isActive: true,
      sortOrder: 0,
    });
    setIsCreating(false);
    setEditingId(null);
  }

  function handleEdit(testimonial: Testimonial) {
    setFormData({
      quote: testimonial.quote,
      location: testimonial.location || '',
      authorName: testimonial.authorName || '',
      isActive: testimonial.isActive,
      sortOrder: testimonial.sortOrder,
    });
    setEditingId(testimonial.id);
    setIsCreating(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (editingId) {
      const result = await updateTestimonialAction(editingId, formData);
      if (result.success && result.data) {
        setTestimonials(testimonials.map(t => t.id === editingId ? result.data! : t));
        resetForm();
      }
    } else {
      const result = await createTestimonialAction(formData);
      if (result.success && result.data) {
        setTestimonials([...testimonials, result.data]);
        resetForm();
      }
    }
  }

  function openDeleteDialog(id: number) {
    setTestimonialToDelete(id);
    setDeleteDialogOpen(true);
  }

  async function confirmDelete() {
    if (testimonialToDelete === null) return;

    const result = await deleteTestimonialAction(testimonialToDelete);
    if (result.success) {
      setTestimonials(testimonials.filter(t => t.id !== testimonialToDelete));
      if (editingId === testimonialToDelete) resetForm();
    }
    
    setDeleteDialogOpen(false);
    setTestimonialToDelete(null);
  }

  async function handleToggleActive(id: number) {
    const result = await toggleTestimonialActiveAction(id);
    if (result.success && result.data) {
      setTestimonials(testimonials.map(t => t.id === id ? result.data! : t));
    }
  }

  return (
    <div className="space-y-8">
      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Testimonial</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this testimonial? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setDeleteDialogOpen(false);
                setTestimonialToDelete(null);
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
            {editingId ? 'Edit Testimonial' : 'Create New Testimonial'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="quote">Quote *</Label>
              <Textarea
                id="quote"
                value={formData.quote}
                onChange={(e) => setFormData({ ...formData, quote: e.target.value })}
                placeholder="Enter the testimonial quote..."
                rows={4}
                required
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="authorName">Author Name (Optional)</Label>
                <Input
                  id="authorName"
                  value={formData.authorName}
                  onChange={(e) => setFormData({ ...formData, authorName: e.target.value })}
                  placeholder="John Doe"
                />
              </div>

              <div>
                <Label htmlFor="location">Location (Optional)</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="City, Country"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="sortOrder">Sort Order</Label>
                <Input
                  id="sortOrder"
                  type="number"
                  value={formData.sortOrder}
                  onChange={(e) => setFormData({ ...formData, sortOrder: parseInt(e.target.value) })}
                />
              </div>

              <div className="flex items-center gap-2 pt-6">
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
            </div>

            <div className="flex gap-2 pt-4">
              <Button type="submit" className="bg-[#1DA1F9] hover:bg-[#0c4a6e] text-white">
                {editingId ? 'Update' : 'Create'} Testimonial
              </Button>
              <Button type="button" variant="outline" onClick={resetForm} className="hover:bg-[#0c4a6e] hover:text-white hover:border-[#0c4a6e]">
                Cancel
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Create Button */}
      {!isCreating && !editingId && (
        <Button
          onClick={() => setIsCreating(true)}
          className="bg-[#1DA1F9] hover:bg-[#0c4a6e] text-white"
        >
          + Add New Testimonial
        </Button>
      )}

      {/* Testimonials List */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-[#0c4a6e]">
          All Testimonials ({testimonials.length})
        </h2>

        {testimonials.length === 0 ? (
          <div className="rounded-2xl bg-white p-8 shadow-lg text-center text-[#475569]">
            No testimonials yet. Create your first one!
          </div>
        ) : (
          <div className="grid gap-4">
            {testimonials.map((testimonial) => (
              <div
                key={testimonial.id}
                className={`rounded-2xl bg-white p-6 shadow-lg border-2 ${
                  testimonial.isActive ? 'border-green-300/50' : 'border-gray-300/50 opacity-60'
                }`}
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        testimonial.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {testimonial.isActive ? 'Active' : 'Inactive'}
                      </span>
                      <span className="text-xs text-gray-500">Order: {testimonial.sortOrder}</span>
                    </div>
                    <p className="text-lg italic text-[#475569] mb-2">"{testimonial.quote}"</p>
                    {testimonial.authorName && (
                      <p className="text-sm font-medium text-[#0c4a6e]">— {testimonial.authorName}</p>
                    )}
                    {testimonial.location && (
                      <p className="text-sm text-gray-600">📍 {testimonial.location}</p>
                    )}
                  </div>
                </div>

                <div className="flex gap-2 pt-4 border-t">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEdit(testimonial)}
                    className="hover:bg-[#0c4a6e] hover:text-white"
                  >
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleToggleActive(testimonial.id)}
                    className="hover:bg-[#0c4a6e] hover:text-white"
                  >
                    {testimonial.isActive ? 'Deactivate' : 'Activate'}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => openDeleteDialog(testimonial.id)}
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

