'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { auth, clerkClient } from '@clerk/nextjs/server';
import { 
  getAllProducts, 
  getProductById, 
  updateProduct as updateProductQuery,
  createProduct as createProductQuery,
  deleteProduct as deleteProductQuery,
  getPaginatedProducts
} from '@/src/db/queries/products';
import type { Product } from '@/src/db/schema';

/**
 * Helper function to check if user is admin
 * Throws error if not authenticated or not admin
 */
async function requireAdminAuth() {
  const { userId } = await auth();
  
  if (!userId) {
    throw new Error('Unauthorized: You must be signed in to perform this action');
  }
  
  // Fetch user data directly from Clerk to get publicMetadata
  const client = await clerkClient();
  const user = await client.users.getUser(userId);
  
  const userRole = user.publicMetadata?.role;
  
  if (userRole !== 'admin') {
    throw new Error('Forbidden: Admin access required');
  }
}

/**
 * Validation Schemas (adminPassword removed - using Clerk authentication)
 */
const updateProductSchema = z.object({
  productId: z.number().int().positive(),
  name: z.string().min(1, 'Product name is required').max(255).optional(),
  price: z.number().min(0, 'Price must be positive').optional(),
  description: z.string().max(1000).optional(),
  image: z.string().min(1, 'Image is required').optional(),
  isActive: z.boolean().optional(),
});

const createProductSchema = z.object({
  name: z.string().min(1, 'Product name is required').max(255),
  price: z.number().min(0, 'Price must be positive'),
  description: z.string().max(1000).optional(),
  image: z.string().min(1, 'Image is required'),
  isActive: z.boolean().default(true),
});

const deleteProductSchema = z.object({
  productId: z.number().int().positive(),
});

type UpdateProductInput = z.infer<typeof updateProductSchema>;
type CreateProductInput = z.infer<typeof createProductSchema>;
type DeleteProductInput = z.infer<typeof deleteProductSchema>;

/**
 * Get all products from the database (public - no auth required)
 */
export async function getProducts(): Promise<Product[]> {
  try {
    return await getAllProducts();
  } catch (error) {
    throw new Error('Failed to fetch products');
  }
}

/**
 * Get a single product by ID (public - no auth required)
 */
export async function getProduct(productId: number): Promise<Product | null> {
  try {
    return await getProductById(productId);
  } catch (error) {
    throw new Error('Failed to fetch product');
  }
}

/**
 * Get paginated products (public - no auth required)
 */
export async function getPaginatedProductsAction(
  page: number = 1,
  pageSize: number = 8
): Promise<{ products: Product[]; totalCount: number; totalPages: number }> {
  try {
    const { products, totalCount } = await getPaginatedProducts(page, pageSize);
    const totalPages = Math.ceil(totalCount / pageSize);
    
    return { products, totalCount, totalPages };
  } catch (error) {
    throw new Error('Failed to fetch paginated products');
  }
}

/**
 * Update a product
 * Requires admin authentication via Clerk
 */
export async function updateProduct(input: UpdateProductInput): Promise<Product | null> {
  try {
    // 1. Validate input with Zod
    const validated = updateProductSchema.parse(input);
    
    // 2. Verify admin authentication via Clerk
    await requireAdminAuth();
    
    // 3. Prepare update data (type-safe)
    type ProductUpdateData = Partial<Pick<Product, 'name' | 'description' | 'image' | 'isActive'>> & {
      price?: string;
    };
    
    const updateData: ProductUpdateData = {};
    if (validated.name !== undefined) updateData.name = validated.name;
    if (validated.description !== undefined) updateData.description = validated.description;
    if (validated.image !== undefined) updateData.image = validated.image;
    if (validated.price !== undefined) updateData.price = validated.price.toString();
    if (validated.isActive !== undefined) updateData.isActive = validated.isActive;
    
    // 4. Update product in database
    const updatedProduct = await updateProductQuery(validated.productId, updateData);
    
    if (!updatedProduct) {
      throw new Error('Failed to update product - no product returned from database');
    }
    
    // 5. Revalidate the shop page to show updated data
    revalidatePath('/shop');
    
    return updatedProduct;
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error(`Validation error: ${error.issues[0]?.message || 'Validation error'}`);
    }
    throw error;
  }
}

/**
 * Create a new product
 * Requires admin authentication via Clerk
 */
export async function createProduct(input: CreateProductInput): Promise<Product> {
  try {
    // 1. Validate input with Zod
    const validated = createProductSchema.parse(input);
    
    // 2. Verify admin authentication via Clerk
    await requireAdminAuth();
    
    // 3. Create product in database
    const newProduct = await createProductQuery({
      name: validated.name,
      price: validated.price.toString(),
      description: validated.description,
      image: validated.image,
      isActive: validated.isActive,
    });
    
    // 4. Revalidate the shop page
    revalidatePath('/shop');
    
    return newProduct;
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error(`Validation error: ${error.issues[0]?.message || 'Validation error'}`);
    }
    throw error;
  }
}

/**
 * Delete a product
 * Requires admin authentication via Clerk
 */
export async function deleteProduct(input: DeleteProductInput): Promise<void> {
  try {
    // 1. Validate input with Zod
    const validated = deleteProductSchema.parse(input);
    
    // 2. Verify admin authentication via Clerk
    await requireAdminAuth();
    
    // 3. Delete product from database
    await deleteProductQuery(validated.productId);
    
    // 4. Revalidate the shop page
    revalidatePath('/shop');
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error(`Validation error: ${error.issues[0]?.message || 'Validation error'}`);
    }
    throw error;
  }
}
