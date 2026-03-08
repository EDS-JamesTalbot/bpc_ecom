/**
 * Customer Authentication Utilities
 * Separate from admin authentication (Clerk)
 * Uses JWT tokens stored in cookies
 */

import { cookies } from 'next/headers';
import { SignJWT, jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.CUSTOMER_JWT_SECRET || 'your-secret-key-change-in-production'
);

const COOKIE_NAME = 'customer_session';
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

export type CustomerSession = {
  customerId: number;
  email: string;
  fullName: string;
};

/**
 * Create a JWT session token for a customer
 */
export async function createCustomerSession(customer: CustomerSession): Promise<string> {
  return await new SignJWT({
    customerId: customer.customerId,
    email: customer.email,
    fullName: customer.fullName,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(JWT_SECRET);
}

/**
 * Verify and decode a customer JWT token
 */
export async function verifyCustomerToken(token: string): Promise<CustomerSession | null> {
  try {
    const verified = await jwtVerify(token, JWT_SECRET);
    return verified.payload as CustomerSession;
  } catch (error) {
    return null;
  }
}

/**
 * Set customer session cookie
 */
export async function setCustomerSession(customer: CustomerSession) {
  const token = await createCustomerSession(customer);
  const cookieStore = await cookies();
  
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: COOKIE_MAX_AGE,
    path: '/',
  });
}

/**
 * Get current customer session
 */
export async function getCustomerSession(): Promise<CustomerSession | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  
  if (!token) {
    return null;
  }
  
  return await verifyCustomerToken(token);
}

/**
 * Clear customer session (logout)
 */
export async function clearCustomerSession() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

/**
 * Require authenticated customer (throws if not logged in)
 */
export async function requireCustomerAuth(): Promise<CustomerSession> {
  const session = await getCustomerSession();
  
  if (!session) {
    throw new Error('Authentication required');
  }
  
  return session;
}
