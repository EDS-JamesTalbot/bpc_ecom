/**
 * Rate Limiting Utility
 * Protects against brute force attacks, spam, and abuse
 * Uses LRU cache to track request counts per identifier (IP address)
 */

import { LRUCache } from 'lru-cache';

type RateLimitOptions = {
  uniqueTokenPerInterval?: number;
  interval?: number;
};

type RateLimitResult = 
  | { success: true }
  | { success: false; error: string };

/**
 * Create a rate limiter instance
 * 
 * @param options Configuration options
 * @param options.uniqueTokenPerInterval Maximum unique tokens to track (default: 500)
 * @param options.interval Time window in milliseconds (default: 60000 = 1 minute)
 * @returns Rate limiter with check method
 * 
 * @example
 * const limiter = rateLimit({ interval: 60 * 1000 }); // 1 minute window
 * const result = limiter.check(ipAddress, 5); // Allow 5 requests per minute
 */
export function rateLimit(options?: RateLimitOptions) {
  const tokenCache = new LRUCache<string, number[]>({
    max: options?.uniqueTokenPerInterval || 500,
    ttl: options?.interval || 60000, // Default: 1 minute
  });

  return {
    /**
     * Check if a request should be allowed
     * 
     * @param token Unique identifier (usually IP address)
     * @param limit Maximum requests allowed in the time window
     * @returns Success if allowed, error if rate limit exceeded
     */
    check: (token: string, limit: number): RateLimitResult => {
      const tokenCount = tokenCache.get(token) || [0];
      const currentCount = tokenCount[0] ?? 0;
      
      if (currentCount === 0) {
        // First request from this token
        tokenCache.set(token, [1]);
        return { success: true };
      }
      
      if (currentCount >= limit) {
        // Rate limit exceeded
        return { 
          success: false, 
          error: `Rate limit exceeded. Maximum ${limit} requests allowed. Please try again later.`,
        };
      }
      
      // Increment count and allow request
      tokenCache.set(token, [currentCount + 1]);
      return { success: true };
    },
  };
}

/**
 * Get client IP address from headers
 * Works with various hosting providers (Vercel, Cloudflare, etc.)
 * 
 * @param headers Request headers object
 * @returns IP address or 'unknown'
 */
export function getClientIp(headers: Headers): string {
  return (
    headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    headers.get('x-real-ip') ||
    headers.get('cf-connecting-ip') || // Cloudflare
    'unknown'
  );
}

