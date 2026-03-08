/**
 * Returns whether the current user should see the maintenance page.
 * Used by MaintenanceGate for client-side navigation checks.
 */

import { auth, clerkClient } from '@clerk/nextjs/server';
import { isAdminActive } from '@/lib/admin-session';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const { userId } = await auth();
    let isAdmin = false;

    if (userId) {
      const client = await clerkClient();
      const user = await client.users.getUser(userId);
      isAdmin = (user.publicMetadata?.role as string) === 'admin';
    }

    if (isAdmin) {
      return NextResponse.json({ showMaintenance: false });
    }

    const adminActive = await isAdminActive();
    return NextResponse.json({ showMaintenance: adminActive });
  } catch {
    return NextResponse.json({ showMaintenance: false });
  }
}
