'use server';

import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { getCustomerByEmail, updateLastLogin } from '@/src/db/queries/customers';
import { setCustomerSession, clearCustomerSession } from '@/lib/customer-auth';
import { redirect } from 'next/navigation';

/**
 * Customer Login Schema
 */
const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

type LoginInput = z.infer<typeof loginSchema>;

/**
 * Customer Login Action
 */
export async function customerLogin(input: LoginInput) {
  try {
    const validated = loginSchema.parse(input);
    
    // Find customer by email
    const customer = await getCustomerByEmail(validated.email);
    
    if (!customer) {
      return {
        success: false,
        error: 'Invalid email or password',
      };
    }
    
    // Check if account is active
    if (!customer.isActive) {
      return {
        success: false,
        error: 'This account has been deactivated. Please contact support.',
      };
    }
    
    // Verify password
    const passwordMatch = await bcrypt.compare(validated.password, customer.passwordHash);
    
    if (!passwordMatch) {
      return {
        success: false,
        error: 'Invalid email or password',
      };
    }
    
    // Update last login timestamp
    await updateLastLogin(customer.id);
    
    // Create session
    await setCustomerSession({
      customerId: customer.id,
      email: customer.email,
      fullName: customer.fullName,
    });
    
    return {
      success: true,
      message: 'Login successful',
    };
  } catch (error) {
    console.error('Customer login error:', error);
    
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.issues[0]?.message || 'Validation error',
      };
    }
    
    return {
      success: false,
      error: 'Login failed. Please try again.',
    };
  }
}

/**
 * Customer Logout Action
 */
export async function customerLogout() {
  await clearCustomerSession();
  redirect('/shop');
}
