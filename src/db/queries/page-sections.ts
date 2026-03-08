import { db } from '@/src/db';
import { pageSectionsTable, type PageSection, type NewPageSection } from '@/src/db/schema';
import { eq, and } from 'drizzle-orm';
import { getTenantIdForRequest } from '@/lib/tenant-context';

// ============================================
// READ QUERIES
// ============================================

/**
 * Get all active page sections for a specific page
 */
export async function getPageSections(page: string, tenantId?: string): Promise<PageSection[]> {
  const tid = tenantId ?? await getTenantIdForRequest();
  return await db
    .select()
    .from(pageSectionsTable)
    .where(and(
      eq(pageSectionsTable.tenantId, tid),
      eq(pageSectionsTable.page, page),
      eq(pageSectionsTable.isActive, true)
    ));
}

/**
 * Get a single page section by section key
 */
export async function getPageSectionByKey(sectionKey: string, tenantId?: string): Promise<PageSection | null> {
  const tid = tenantId ?? await getTenantIdForRequest();
  const [section] = await db
    .select()
    .from(pageSectionsTable)
    .where(and(
      eq(pageSectionsTable.tenantId, tid),
      eq(pageSectionsTable.sectionKey, sectionKey)
    ));
  return section ?? null;
}

/**
 * Get all page sections (for admin)
 */
export async function getAllPageSections(tenantId?: string): Promise<PageSection[]> {
  const tid = tenantId ?? await getTenantIdForRequest();
  return await db
    .select()
    .from(pageSectionsTable)
    .where(eq(pageSectionsTable.tenantId, tid))
    .orderBy(pageSectionsTable.page, pageSectionsTable.sectionKey);
}

/**
 * Get page sections by page (for admin, includes inactive)
 */
export async function getPageSectionsByPage(page: string, tenantId?: string): Promise<PageSection[]> {
  const tid = tenantId ?? await getTenantIdForRequest();
  return await db
    .select()
    .from(pageSectionsTable)
    .where(and(eq(pageSectionsTable.tenantId, tid), eq(pageSectionsTable.page, page)));
}

// ============================================
// MUTATION QUERIES
// ============================================

/**
 * Create or update a page section (upsert)
 */
export async function upsertPageSection(
  sectionKey: string,
  data: Omit<NewPageSection, 'createdAt' | 'updatedAt' | 'tenantId'>,
  tenantId?: string
): Promise<PageSection> {
  const tid = tenantId ?? await getTenantIdForRequest();
  const existing = await getPageSectionByKey(sectionKey, tid);
  
  if (existing) {
    const [updated] = await db
      .update(pageSectionsTable)
      .set({ ...data, updatedAt: new Date() })
      .where(and(
        eq(pageSectionsTable.tenantId, tid),
        eq(pageSectionsTable.sectionKey, sectionKey)
      ))
      .returning();
    if (!updated) throw new Error('Failed to update page section');
    return updated;
  } else {
    const [created] = await db
      .insert(pageSectionsTable)
      .values({ ...data, sectionKey, tenantId: tid })
      .returning();
    if (!created) throw new Error('Failed to create page section');
    return created;
  }
}

/**
 * Update a page section by ID
 */
export async function updatePageSection(
  id: number,
  data: Partial<Omit<NewPageSection, 'createdAt' | 'updatedAt' | 'tenantId'>>,
  tenantId?: string
): Promise<PageSection | null> {
  const tid = tenantId ?? await getTenantIdForRequest();
  const [updated] = await db
    .update(pageSectionsTable)
    .set({ ...data, updatedAt: new Date() })
    .where(and(eq(pageSectionsTable.id, id), eq(pageSectionsTable.tenantId, tid)))
    .returning();
  return updated ?? null;
}

/**
 * Delete a page section
 */
export async function deletePageSection(id: number, tenantId?: string): Promise<void> {
  const tid = tenantId ?? await getTenantIdForRequest();
  await db
    .delete(pageSectionsTable)
    .where(and(eq(pageSectionsTable.id, id), eq(pageSectionsTable.tenantId, tid)));
}

/**
 * Toggle page section active status
 */
export async function togglePageSectionActive(id: number, tenantId?: string): Promise<PageSection | null> {
  const tid = tenantId ?? await getTenantIdForRequest();
  const [section] = await db
    .select()
    .from(pageSectionsTable)
    .where(and(eq(pageSectionsTable.id, id), eq(pageSectionsTable.tenantId, tid)));
  if (!section) return null;
  return await updatePageSection(id, { isActive: !section.isActive }, tid);
}

