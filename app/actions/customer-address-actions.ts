'use server';

import { z } from 'zod';
import { requireCustomerAuth } from '@/lib/customer-auth';
import { updateCustomer } from '@/src/db/queries/customers';
import { revalidatePath } from 'next/cache';

/**
 * Customer Address Update Schema
 */
const updateAddressSchema = z.object({
  defaultShippingAddress: z.string().optional().or(z.literal('')),
  defaultShippingIsland: z.string().optional().or(z.literal('')),
  defaultShippingCountry: z.string().optional().or(z.literal('')),
});

type UpdateAddressInput = z.infer<typeof updateAddressSchema>;

/**
 * Update Customer Default Shipping Address Action
 */
export async function updateCustomerAddress(input: UpdateAddressInput) {
  try {
    // Require authentication
    const session = await requireCustomerAuth();
    
    // Validate input
    const validated = updateAddressSchema.parse(input);
    
    // Update customer address
    await updateCustomer(session.customerId, {
      defaultShippingAddress: validated.defaultShippingAddress || null,
      defaultShippingIsland: validated.defaultShippingIsland || null,
      defaultShippingCountry: validated.defaultShippingCountry || null,
    });
    
    // Revalidate the account page
    revalidatePath('/my-account');
    
    return {
      success: true,
      message: 'Address updated successfully',
    };
  } catch (error) {
    console.error('Address update error:', error);
    
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.issues[0]?.message || 'Validation error',
      };
    }
    
    return {
      success: false,
      error: 'Failed to update address. Please try again.',
    };
  }
}
