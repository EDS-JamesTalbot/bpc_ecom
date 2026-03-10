/**
 * Called when admin signs out via Clerk.
 * Clears admin_active_at so the site returns to normal for all users.
 * Redirects back to the page they were on (preserving tenant) when possible.
 */

import { NextResponse } from 'next/server';
import { clearAdminActive } from '@/lib/admin-session';

export async function GET(request: Request) {
  await clearAdminActive();

  const url = new URL(request.url);
  const returnTo = url.searchParams.get('returnTo');
  // Preserve tenant: redirect back to the page they were on (e.g. /loveys-soap/shop)
  if (returnTo && returnTo.startsWith('/') && !returnTo.startsWith('//')) {
    return NextResponse.redirect(new URL(returnTo, url.origin));
  }
  const referer = request.headers.get('referer');
  if (referer) {
    try {
      const refUrl = new URL(referer);
      if (refUrl.origin === url.origin && refUrl.pathname && refUrl.pathname !== '/') {
        return NextResponse.redirect(refUrl);
      }
    } catch {
      // Invalid referer, fall through to default
    }
  }
  return NextResponse.redirect(new URL('/', url.origin));
}
