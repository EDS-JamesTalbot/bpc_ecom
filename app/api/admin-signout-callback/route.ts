/**
 * Called when admin signs out via Clerk.
 * Clears admin_active_at so the site returns to normal for all users.
 */

import { NextResponse } from 'next/server';
import { clearAdminActive } from '@/lib/admin-session';

export async function GET(request: Request) {
  await clearAdminActive();

  const url = new URL(request.url);
  return NextResponse.redirect(new URL('/', url.origin));
}
