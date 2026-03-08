import { db } from '@/src/db';
import { testimonialsTable, type Testimonial, type NewTestimonial } from '@/src/db/schema';
import { eq, and, desc, asc } from 'drizzle-orm';
import { getTenantIdForRequest } from '@/lib/tenant-context';

// ============================================
// READ QUERIES
// ============================================

/**
 * Get all active testimonials ordered by sort order
 */
export async function getActiveTestimonials(tenantId?: string): Promise<Testimonial[]> {
  const tid = tenantId ?? await getTenantIdForRequest();
  return await db
    .select()
    .from(testimonialsTable)
    .where(and(eq(testimonialsTable.tenantId, tid), eq(testimonialsTable.isActive, true)))
    .orderBy(asc(testimonialsTable.sortOrder), desc(testimonialsTable.createdAt));
}

/**
 * Get all testimonials (including inactive) for admin
 */
export async function getAllTestimonials(tenantId?: string): Promise<Testimonial[]> {
  const tid = tenantId ?? await getTenantIdForRequest();
  return await db
    .select()
    .from(testimonialsTable)
    .where(eq(testimonialsTable.tenantId, tid))
    .orderBy(asc(testimonialsTable.sortOrder), desc(testimonialsTable.createdAt));
}

/**
 * Get a single testimonial by ID
 */
export async function getTestimonialById(id: number, tenantId?: string): Promise<Testimonial | null> {
  const tid = tenantId ?? await getTenantIdForRequest();
  const [testimonial] = await db
    .select()
    .from(testimonialsTable)
    .where(and(eq(testimonialsTable.id, id), eq(testimonialsTable.tenantId, tid)));
  return testimonial ?? null;
}

// ============================================
// MUTATION QUERIES
// ============================================

/**
 * Create a new testimonial
 */
export async function createTestimonial(
  data: Omit<NewTestimonial, 'createdAt' | 'updatedAt' | 'tenantId'>,
  tenantId?: string
): Promise<Testimonial> {
  const tid = tenantId ?? await getTenantIdForRequest();
  const [newTestimonial] = await db
    .insert(testimonialsTable)
    .values({ ...data, tenantId: tid })
    .returning();
  if (!newTestimonial) throw new Error('Failed to create testimonial');
  return newTestimonial;
}

/**
 * Update a testimonial
 */
export async function updateTestimonial(
  id: number,
  data: Partial<Omit<NewTestimonial, 'createdAt' | 'updatedAt' | 'tenantId'>>,
  tenantId?: string
): Promise<Testimonial | null> {
  const tid = tenantId ?? await getTenantIdForRequest();
  const [updatedTestimonial] = await db
    .update(testimonialsTable)
    .set({ ...data, updatedAt: new Date() })
    .where(and(eq(testimonialsTable.id, id), eq(testimonialsTable.tenantId, tid)))
    .returning();
  return updatedTestimonial ?? null;
}

/**
 * Delete a testimonial
 */
export async function deleteTestimonial(id: number, tenantId?: string): Promise<void> {
  const tid = tenantId ?? await getTenantIdForRequest();
  await db
    .delete(testimonialsTable)
    .where(and(eq(testimonialsTable.id, id), eq(testimonialsTable.tenantId, tid)));
}

/**
 * Toggle testimonial active status
 */
export async function toggleTestimonialActive(id: number, tenantId?: string): Promise<Testimonial | null> {
  const testimonial = await getTestimonialById(id, tenantId);
  if (!testimonial) return null;
  return await updateTestimonial(id, { isActive: !testimonial.isActive }, tenantId);
}

