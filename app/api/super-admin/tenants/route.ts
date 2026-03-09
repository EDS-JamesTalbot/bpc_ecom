import { auth, clerkClient } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { getAllTenants } from '@/src/db/queries/tenants';

/**
 * GET /api/super-admin/tenants
 * Returns all tenants. Super-admin only (role: admin, no tenantId in metadata).
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
    const userTenantId = user.publicMetadata?.tenantId as string | undefined;
    const isSuperAdmin = role === 'admin' && !userTenantId;

    if (!isSuperAdmin) {
      return NextResponse.json({ error: 'Super-admin only' }, { status: 403 });
    }

    const tenants = await getAllTenants();
    return NextResponse.json({ tenants });
  } catch (error) {
    console.error('super-admin tenants error:', error);
    return NextResponse.json({ error: 'Failed to fetch tenants' }, { status: 500 });
  }
}
