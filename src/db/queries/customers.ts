import { db } from '@/src/db';
import { customersTable } from '@/src/db/schema';
import { eq, and, desc } from 'drizzle-orm';
import type { NewCustomer } from '@/src/db/schema';
import { getTenantIdForRequest } from '@/lib/tenant-context';

/**
 * CREATE - Create a new customer account
 */
export async function createCustomer(data: Omit<NewCustomer, 'tenantId'>, tenantId?: string) {
  const tid = tenantId ?? await getTenantIdForRequest();
  const [customer] = await db
    .insert(customersTable)
    .values({ ...data, tenantId: tid })
    .returning();
  if (!customer) throw new Error('Failed to create customer');
  return customer;
}

/**
 * READ - Get customer by email (for login)
 */
export async function getCustomerByEmail(email: string, tenantId?: string) {
  const tid = tenantId ?? await getTenantIdForRequest();
  const [customer] = await db
    .select()
    .from(customersTable)
    .where(and(
      eq(customersTable.tenantId, tid),
      eq(customersTable.email, email)
    ));
  return customer ?? null;
}

/**
 * READ - Get customer by ID
 */
export async function getCustomerById(customerId: number, tenantId?: string) {
  const tid = tenantId ?? await getTenantIdForRequest();
  const [customer] = await db
    .select()
    .from(customersTable)
    .where(and(
      eq(customersTable.id, customerId),
      eq(customersTable.tenantId, tid)
    ));
  return customer ?? null;
}

/**
 * UPDATE - Update customer profile
 */
export async function updateCustomer(
  customerId: number,
  data: Partial<Omit<NewCustomer, 'email' | 'tenantId'>>,
  tenantId?: string
) {
  const tid = tenantId ?? await getTenantIdForRequest();
  const [updated] = await db
    .update(customersTable)
    .set({ ...data, updatedAt: new Date() })
    .where(and(eq(customersTable.id, customerId), eq(customersTable.tenantId, tid)))
    .returning();
  
  if (!updated) {
    throw new Error('Failed to update customer');
  }
  
  return updated;
}

/**
 * UPDATE - Update last login timestamp
 */
export async function updateLastLogin(customerId: number, tenantId?: string) {
  const tid = tenantId ?? await getTenantIdForRequest();
  await db
    .update(customersTable)
    .set({ lastLoginAt: new Date() })
    .where(and(eq(customersTable.id, customerId), eq(customersTable.tenantId, tid)));
}

/**
 * UPDATE - Update password
 */
export async function updateCustomerPassword(customerId: number, newPasswordHash: string, tenantId?: string) {
  const tid = tenantId ?? await getTenantIdForRequest();
  const [updated] = await db
    .update(customersTable)
    .set({ passwordHash: newPasswordHash, updatedAt: new Date() })
    .where(and(eq(customersTable.id, customerId), eq(customersTable.tenantId, tid)))
    .returning();
  
  if (!updated) {
    throw new Error('Failed to update password');
  }
  
  return updated;
}

/**
 * UPDATE - Toggle newsletter subscription
 */
export async function updateNewsletterPreference(customerId: number, optIn: boolean, tenantId?: string) {
  const tid = tenantId ?? await getTenantIdForRequest();
  await db
    .update(customersTable)
    .set({ newsletterOptIn: optIn, updatedAt: new Date() })
    .where(and(eq(customersTable.id, customerId), eq(customersTable.tenantId, tid)));
}

/**
 * READ - Get all customers with newsletter opt-in (for admin)
 */
export async function getNewsletterSubscribers(tenantId?: string) {
  const tid = tenantId ?? await getTenantIdForRequest();
  return await db
    .select({
      id: customersTable.id,
      email: customersTable.email,
      fullName: customersTable.fullName,
      createdAt: customersTable.createdAt,
    })
    .from(customersTable)
    .where(and(eq(customersTable.tenantId, tid), eq(customersTable.newsletterOptIn, true)))
    .orderBy(desc(customersTable.createdAt));
}

/**
 * READ - Get all customers (for admin - paginated)
 */
export async function getAllCustomers(limit: number = 50, offset: number = 0, tenantId?: string) {
  const tid = tenantId ?? await getTenantIdForRequest();
  return await db
    .select({
      id: customersTable.id,
      email: customersTable.email,
      fullName: customersTable.fullName,
      phoneNumber: customersTable.phoneNumber,
      newsletterOptIn: customersTable.newsletterOptIn,
      isActive: customersTable.isActive,
      createdAt: customersTable.createdAt,
      lastLoginAt: customersTable.lastLoginAt,
    })
    .from(customersTable)
    .where(eq(customersTable.tenantId, tid))
    .orderBy(desc(customersTable.createdAt))
    .limit(limit)
    .offset(offset);
}

/**
 * DELETE - Deactivate customer account (soft delete)
 */
export async function deactivateCustomer(customerId: number, tenantId?: string) {
  const tid = tenantId ?? await getTenantIdForRequest();
  await db
    .update(customersTable)
    .set({ isActive: false, updatedAt: new Date() })
    .where(and(eq(customersTable.id, customerId), eq(customersTable.tenantId, tid)));
}

/**
 * DELETE - Permanently delete customer (GDPR compliance)
 */
export async function deleteCustomer(customerId: number, tenantId?: string) {
  const tid = tenantId ?? await getTenantIdForRequest();
  await db
    .delete(customersTable)
    .where(and(eq(customersTable.id, customerId), eq(customersTable.tenantId, tid)));
}
