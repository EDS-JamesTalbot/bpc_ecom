/**
 * Callback for Clerk after sign-in. Preserves tenant path when NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL
 * is set to this route. Set cookie before opening sign-in (see AdminButton).
 *
 * In Vercel env vars, set: NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/api/after-sign-in
 * (and NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/api/after-sign-in if users can sign up)
 */

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const COOKIE_NAME = 'redirect_after_signin';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const cookieStore = await cookies();
  const redirectPath = cookieStore.get(COOKIE_NAME)?.value;

  const response = redirectPath && redirectPath.startsWith('/') && !redirectPath.startsWith('//')
    ? NextResponse.redirect(new URL(redirectPath, url.origin))
    : NextResponse.redirect(new URL('/', url.origin));

  // Clear the cookie
  response.cookies.set(COOKIE_NAME, '', { maxAge: 0, path: '/' });

  return response;
}
