'use server';

import { requireCustomerAuth, clearCustomerSession } from '@/lib/customer-auth';
import { deactivateCustomer } from '@/src/db/queries/customers';
import { redirect } from 'next/navigation';

/**
 * Delete (deactivate) Customer Account Action
 * This deactivates the account instead of hard deleting to preserve order history
 */
export async function deleteCustomerAccount() {
  try {
    // Require authentication
    const session = await requireCustomerAuth();
    
    // Deactivate the customer account (soft delete)
    await deactivateCustomer(session.customerId);
    
    // Clear the customer session
    await clearCustomerSession();
    
    return {
      success: true,
      message: 'Account deleted successfully',
    };
  } catch (error) {
    console.error('Account deletion error:', error);
    
    return {
      success: false,
      error: 'Failed to delete account. Please try again.',
    };
  }
}
