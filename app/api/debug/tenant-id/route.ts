import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { getTenantIdForRequest } from '@/lib/tenant-context';
import { clerkClient } from '@clerk/nextjs/server';

/**
 * Debug endpoint: returns the current tenant ID for the request.
 * Use this to get the correct tenantId to put in Clerk Public metadata.
 * Only accessible to users with role: admin.
 *
 * GET /api/debug/tenant-id
 */
export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const client = await clerkClient();
    const user = await client.users.getUser(userId);
    const role = user.publicMetadata?.role as string | undefined;

    if (role !== 'admin') {
      return NextResponse.json({ error: 'Admin only' }, { status: 403 });
    }

    const tenantId = await getTenantIdForRequest();

    return NextResponse.json({
      tenantId,
      message: 'Add this tenantId to Clerk Public metadata: {"role": "admin", "tenantId": "' + tenantId + '"}',
    });
  } catch (error) {
    console.error('tenant-id debug error:', error);
    return NextResponse.json({ error: 'Failed to get tenant ID' }, { status: 500 });
  }
}
