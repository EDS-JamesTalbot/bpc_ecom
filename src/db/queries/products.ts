import { db } from '@/src/db';
import { productsTable, type Product, type NewProduct } from '@/src/db/schema';
import { eq, and, sql } from 'drizzle-orm';
import { getTenantIdForRequest } from '@/lib/tenant-context';

/**
 * Get all products for a tenant
 */
export async function getAllProducts(tenantId?: string): Promise<Product[]> {
  const tid = tenantId ?? await getTenantIdForRequest();
  return await db
    .select()
    .from(productsTable)
    .where(eq(productsTable.tenantId, tid))
    .orderBy(productsTable.id);
}

/**
 * Get a single product by ID
 */
export async function getProductById(productId: number, tenantId?: string): Promise<Product | null> {
  const tid = tenantId ?? await getTenantIdForRequest();
  const [product] = await db
    .select()
    .from(productsTable)
    .where(and(
      eq(productsTable.id, productId),
      eq(productsTable.tenantId, tid)
    ));
  return product ?? null;
}

/**
 * Create a new product
 */
export async function createProduct(data: Omit<NewProduct, 'tenantId'>, tenantId?: string): Promise<Product> {
  const tid = tenantId ?? await getTenantIdForRequest();
  const [newProduct] = await db
    .insert(productsTable)
    .values({ ...data, tenantId: tid })
    .returning();
  if (!newProduct) throw new Error('Failed to create product');
  return newProduct;
}

/**
 * Update a product
 */
export async function updateProduct(
  productId: number,
  data: Partial<Omit<Product, 'id' | 'createdAt' | 'tenantId'>>,
  tenantId?: string
): Promise<Product | null> {
  const tid = tenantId ?? await getTenantIdForRequest();
  const [updatedProduct] = await db
    .update(productsTable)
    .set({ ...data, updatedAt: new Date() })
    .where(and(
      eq(productsTable.id, productId),
      eq(productsTable.tenantId, tid)
    ))
    .returning();
  return updatedProduct ?? null;
}

/**
 * Delete a product
 */
export async function deleteProduct(productId: number, tenantId?: string): Promise<void> {
  const tid = tenantId ?? await getTenantIdForRequest();
  await db
    .delete(productsTable)
    .where(and(
      eq(productsTable.id, productId),
      eq(productsTable.tenantId, tid)
    ));
}

/**
 * Get paginated products (active only for public view)
 */
export async function getPaginatedProducts(
  page: number = 1,
  pageSize: number = 8,
  tenantId?: string
): Promise<{ products: Product[]; totalCount: number }> {
  const tid = tenantId ?? await getTenantIdForRequest();
  const offset = (page - 1) * pageSize;
  
  const products = await db
    .select()
    .from(productsTable)
    .where(and(
      eq(productsTable.tenantId, tid),
      eq(productsTable.isActive, true)
    ))
    .orderBy(productsTable.id)
    .limit(pageSize)
    .offset(offset);
  
  const countResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(productsTable)
    .where(and(
      eq(productsTable.tenantId, tid),
      eq(productsTable.isActive, true)
    ));
  
  const totalCount = Number(countResult[0]?.count ?? 0);
  return { products, totalCount };
}

