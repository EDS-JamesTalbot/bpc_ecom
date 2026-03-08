'use server';

import { z } from 'zod';
import { requireCustomerAuth } from '@/lib/customer-auth';
import { updateCustomer, getCustomerByEmail } from '@/src/db/queries/customers';
import { revalidatePath } from 'next/cache';

/**
 * Customer Profile Update Schema
 */
const updateProfileSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  phoneNumber: z.string().min(5, 'Phone number is required').optional().or(z.literal('')),
  email: z.string().email('Please enter a valid email address'),
  dateOfBirth: z.string().optional().or(z.literal('')),
  gender: z.string().optional().or(z.literal('')),
  newsletterOptIn: z.boolean(),
});

type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

/**
 * Update Customer Profile Action
 */
export async function updateCustomerProfile(input: UpdateProfileInput) {
  try {
    // Require authentication
    const session = await requireCustomerAuth();
    
    // Validate input
    const validated = updateProfileSchema.parse(input);
    
    // If email is being changed, check if new email is already in use by another customer
    if (validated.email !== session.email) {
      const existingCustomer = await getCustomerByEmail(validated.email);
      if (existingCustomer && existingCustomer.id !== session.customerId) {
        return {
          success: false,
          error: 'This email is already in use by another account.',
        };
      }
    }
    
    // Update customer profile
    await updateCustomer(session.customerId, {
      fullName: validated.fullName,
      phoneNumber: validated.phoneNumber || null,
      dateOfBirth: validated.dateOfBirth ? new Date(validated.dateOfBirth) : null,
      gender: validated.gender || null,
      newsletterOptIn: validated.newsletterOptIn,
      marketingOptIn: validated.newsletterOptIn, // Keep in sync
    });
    
    // Note: Email update requires re-authentication in a real system
    // For now, we'll allow it but in production you'd want email verification
    
    // Revalidate the account page
    revalidatePath('/my-account');
    
    return {
      success: true,
      message: 'Profile updated successfully',
    };
  } catch (error) {
    console.error('Profile update error:', error);
    
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.issues[0]?.message || 'Validation error',
      };
    }
    
    return {
      success: false,
      error: 'Failed to update profile. Please try again.',
    };
  }
}
