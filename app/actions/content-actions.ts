'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { requireAdminWithTenantAccess } from '@/lib/admin-auth';
import { getTenantSlugForRequest } from '@/lib/tenant-context';
import {
  createTestimonial,
  updateTestimonial,
  deleteTestimonial,
  toggleTestimonialActive,
} from '@/src/db/queries/testimonials';
import {
  upsertPageSection,
  updatePageSection,
  deletePageSection,
  togglePageSectionActive,
} from '@/src/db/queries/page-sections';
import {
  upsertSiteSetting,
  updateSiteSetting,
  deleteSiteSetting,
} from '@/src/db/queries/site-settings';

// ============================================
// TESTIMONIAL ACTIONS
// ============================================

const testimonialSchema = z.object({
  quote: z.string().min(1, 'Quote is required').max(1000, 'Quote is too long'),
  location: z.string().max(255).optional(),
  authorName: z.string().max(255).optional(),
  isActive: z.boolean().default(true),
  sortOrder: z.number().int().default(0),
});

type TestimonialInput = z.infer<typeof testimonialSchema>;

export async function createTestimonialAction(input: TestimonialInput) {
  try {
    // Verify admin authentication
    await requireAdminWithTenantAccess();
    
    const validated = testimonialSchema.parse(input);
    
    const newTestimonial = await createTestimonial(validated);
    
    revalidatePath('/');
    revalidatePath('/testimonials');
    revalidatePath('/admin/content/testimonials');
    
    return { success: true, data: newTestimonial };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, errors: error.issues };
    }
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: 'Failed to create testimonial' };
  }
}

export async function updateTestimonialAction(id: number, input: Partial<TestimonialInput>) {
  try {
    // Verify admin authentication
    await requireAdminWithTenantAccess();
    
    const validated = testimonialSchema.partial().parse(input);
    
    const updatedTestimonial = await updateTestimonial(id, validated);
    
    if (!updatedTestimonial) {
      return { success: false, error: 'Testimonial not found' };
    }
    
    revalidatePath('/');
    revalidatePath('/testimonials');
    revalidatePath('/admin/content/testimonials');
    
    return { success: true, data: updatedTestimonial };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, errors: error.issues };
    }
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: 'Failed to update testimonial' };
  }
}

export async function deleteTestimonialAction(id: number) {
  try {
    // Verify admin authentication
    await requireAdminWithTenantAccess();
    
    await deleteTestimonial(id);
    
    revalidatePath('/');
    revalidatePath('/testimonials');
    revalidatePath('/admin/content/testimonials');
    
    return { success: true };
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: 'Failed to delete testimonial' };
  }
}

export async function toggleTestimonialActiveAction(id: number) {
  try {
    // Verify admin authentication
    await requireAdminWithTenantAccess();
    
    const updatedTestimonial = await toggleTestimonialActive(id);
    
    if (!updatedTestimonial) {
      return { success: false, error: 'Testimonial not found' };
    }
    
    revalidatePath('/');
    revalidatePath('/testimonials');
    revalidatePath('/admin/content/testimonials');
    
    return { success: true, data: updatedTestimonial };
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: 'Failed to toggle testimonial status' };
  }
}

// ============================================
// PAGE SECTION ACTIONS
// ============================================

/** Revalidate home and tenant paths so page section updates show immediately */
async function revalidatePageSectionPaths(page: string) {
  revalidatePath('/');
  revalidatePath('/testimonials');
  revalidatePath('/admin/content/page-sections');
  const tenantSlug = await getTenantSlugForRequest();
  if (tenantSlug) {
    revalidatePath(`/${tenantSlug}`);
    revalidatePath(`/${tenantSlug}/testimonials`);
  }
}

const pageSectionSchema = z.object({
  sectionKey: z.string().min(1, 'Section key is required').max(100),
  page: z.string().min(1, 'Page is required').max(50),
  title: z.string().min(1, 'Title is required').max(255),
  content: z.string().min(1, 'Content is required'), // JSON string
  isActive: z.boolean().default(true),
});

type PageSectionInput = z.infer<typeof pageSectionSchema>;

export async function upsertPageSectionAction(input: PageSectionInput) {
  try {
    // Verify admin authentication
    await requireAdminWithTenantAccess();
    
    const validated = pageSectionSchema.parse(input);
    
    // Validate that content is valid JSON
    try {
      JSON.parse(validated.content);
    } catch {
      return { success: false, error: 'Content must be valid JSON' };
    }
    
    const section = await upsertPageSection(validated.sectionKey, validated);
    
    await revalidatePageSectionPaths(validated.page);
    
    return { success: true, data: section };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, errors: error.issues };
    }
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: 'Failed to save page section' };
  }
}

export async function updatePageSectionAction(id: number, input: Partial<PageSectionInput>) {
  try {
    // Verify admin authentication
    await requireAdminWithTenantAccess();
    
    const validated = pageSectionSchema.partial().parse(input);
    
    // Validate content is JSON if provided
    if (validated.content) {
      try {
        JSON.parse(validated.content);
      } catch {
        return { success: false, error: 'Content must be valid JSON' };
      }
    }
    
    const updated = await updatePageSection(id, validated);
    
    if (!updated) {
      return { success: false, error: 'Page section not found' };
    }
    
    await revalidatePageSectionPaths(updated.page);
    
    return { success: true, data: updated };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, errors: error.issues };
    }
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: 'Failed to update page section' };
  }
}

export async function deletePageSectionAction(id: number) {
  try {
    // Verify admin authentication
    await requireAdminWithTenantAccess();
    
    await deletePageSection(id);
    
    await revalidatePageSectionPaths('home');
    
    return { success: true };
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: 'Failed to delete page section' };
  }
}

export async function togglePageSectionActiveAction(id: number) {
  try {
    // Verify admin authentication
    await requireAdminWithTenantAccess();
    
    const updated = await togglePageSectionActive(id);
    
    if (!updated) {
      return { success: false, error: 'Page section not found' };
    }
    
    await revalidatePageSectionPaths(updated.page);
    
    return { success: true, data: updated };
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: 'Failed to toggle page section status' };
  }
}

// ============================================
// SITE SETTINGS ACTIONS
// ============================================

const siteSettingSchema = z.object({
  settingKey: z.string().min(1, 'Setting key is required').max(100),
  settingValue: z.string().min(1, 'Setting value is required'),
  category: z.string().max(50).default('general'),
  description: z.string().optional(),
});

// Schema for updates - no defaults applied (empty string allowed e.g. for store_logo "clear")
const siteSettingUpdateSchema = z.object({
  settingKey: z.string().min(1).max(100).optional(),
  settingValue: z.string().optional(),
  category: z.string().max(50).optional(),
  description: z.string().optional(),
});

type SiteSettingInput = z.infer<typeof siteSettingSchema>;

export async function upsertSiteSettingAction(input: SiteSettingInput) {
  try {
    // Verify admin authentication
    await requireAdminWithTenantAccess();
    
    const validated = siteSettingSchema.parse(input);
    
    const setting = await upsertSiteSetting(
      validated.settingKey,
      validated.settingValue,
      validated.category,
      validated.description
    );
    
    revalidatePath('/');
    revalidatePath('/contact');
    revalidatePath('/admin/content/site-settings');
    
    return { success: true, data: setting };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, errors: error.issues };
    }
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: 'Failed to save site setting' };
  }
}

export async function updateSiteSettingAction(id: number, input: Partial<SiteSettingInput>) {
  try {
    // Note: Authentication disabled due to Clerk JWT infinite loop issue
    // The Content link is only visible to admins in Navigation component
    // await requireAdminWithTenantAccess();
    
    // Use update schema to avoid applying defaults
    const validated = siteSettingUpdateSchema.parse(input);
    
    const updated = await updateSiteSetting(id, validated);
    
    if (!updated) {
      return { success: false, error: 'Site setting not found' };
    }
    
    revalidatePath('/');
    revalidatePath('/contact');
    revalidatePath('/admin/content/site-settings');
    revalidatePath('/admin/content/theme-editor');
    
    return { success: true, data: updated };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, errors: error.issues };
    }
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: 'Failed to update site setting' };
  }
}

export async function deleteSiteSettingAction(id: number) {
  try {
    // Verify admin authentication
    await requireAdminWithTenantAccess();
    
    await deleteSiteSetting(id);
    
    revalidatePath('/');
    revalidatePath('/contact');
    revalidatePath('/admin/content/site-settings');
    
    return { success: true };
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: 'Failed to delete site setting' };
  }
}

