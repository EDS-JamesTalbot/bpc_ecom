/**
 * Server Action Utilities
 * Standardized patterns for server actions
 */

import { z } from 'zod';

/**
 * Standard action result type
 */
export type ActionResult<T> = 
  | { success: true; data: T }
  | { success: false; error: string };

/**
 * Standardized error handler for server actions
 * Converts various error types into consistent error responses
 * 
 * @param error - The error to handle
 * @returns Standardized error response
 */
export function handleActionError(error: unknown): { success: false; error: string } {
  // Zod validation errors
  if (error instanceof z.ZodError) {
    return { 
      success: false, 
      error: error.issues[0]?.message || 'Validation error' 
    };
  }
  
  // Standard Error objects
  if (error instanceof Error) {
    return { 
      success: false, 
      error: error.message 
    };
  }
  
  // Unknown error type
  return { 
    success: false, 
    error: 'An unexpected error occurred' 
  };
}

/**
 * Wrap an async action function with standardized error handling
 * 
 * @param action - The action function to wrap
 * @returns Wrapped action with error handling
 */
export function withErrorHandling<T, Args extends any[]>(
  action: (...args: Args) => Promise<T>
) {
  return async (...args: Args): Promise<ActionResult<T>> => {
    try {
      const data = await action(...args);
      return { success: true, data };
    } catch (error) {
      return handleActionError(error);
    }
  };
}

