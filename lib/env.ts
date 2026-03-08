/**
 * Environment Variable Validation
 * Validates required environment variables at application startup
 * Prevents runtime errors from missing or invalid configuration
 */

import { z } from 'zod';

/**
 * Environment variable schema
 * All required variables must be defined, optional ones can be undefined
 */
const envSchema = z.object({
  // Database
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  
  // BPC Payment Gateway
  BPC_GATEWAY_URL: z.string().optional(),
  BPC_API_KEY: z.string().min(1, 'BPC_API_KEY is required'),
  BPC_WEBHOOK_SECRET: z.string().optional(),
  
  // Clerk Authentication
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: z.string().min(1, 'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY is required'),
  CLERK_SECRET_KEY: z.string().min(1, 'CLERK_SECRET_KEY is required'),
  NEXT_PUBLIC_CLERK_SIGN_IN_URL: z.string().optional(),
  NEXT_PUBLIC_CLERK_SIGN_UP_URL: z.string().optional(),
  NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL: z.string().optional(),
  NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL: z.string().optional(),
  
  // Email (Resend)
  RESEND_API_KEY: z.string().min(1, 'RESEND_API_KEY is required'),
  BUSINESS_OWNER_EMAIL: z.string().email('BUSINESS_OWNER_EMAIL must be a valid email'),
  EMAIL_FROM_ADDRESS: z.string().email().optional().or(z.literal('')),
  EMAIL_FROM_NAME: z.string().optional().or(z.literal('')),
  
  // Cloudinary (Optional - can still use manual URLs)
  NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME: z.string().optional(),
  CLOUDINARY_API_KEY: z.string().optional(),
  CLOUDINARY_API_SECRET: z.string().optional(),
  
  // Node Environment
  NODE_ENV: z.enum(['development', 'production', 'test']).optional(),
});

/**
 * Validated environment variables
 * Use this instead of process.env for type-safe access
 */
export type Env = z.infer<typeof envSchema>;

/**
 * Validate environment variables
 * Call this at application startup to fail fast if config is invalid
 * 
 * @returns Validated environment object
 * @throws ZodError if validation fails
 */
export function validateEnv(): Env {
  try {
    return envSchema.parse(process.env);
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('❌ Environment variable validation failed:');
      error.issues.forEach(issue => {
        console.error(`   - ${issue.path.join('.')}: ${issue.message}`);
      });
      throw new Error('Invalid environment configuration. Please check your .env file.');
    }
    throw error;
  }
}

/**
 * Pre-validated environment variables
 * This will throw an error immediately if any required variables are missing
 * Use this in server-side code for type-safe env access
 * 
 * Note: Validation only runs on server-side (not in client bundles)
 */
export const env = typeof window === 'undefined' ? validateEnv() : ({} as Env);
