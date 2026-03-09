import { auth, clerkClient } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { getTenantById } from '@/src/db/queries/tenants';
import { SUPER_ADMIN_TENANT_COOKIE } from '@/lib/tenant-context';

/**
 * POST /api/super-admin/select-tenant
 * Sets the super-admin tenant override cookie. Super-admin only.
 * Body: { tenantId: string }
 */
export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const tenantId = typeof body?.tenantId === 'string' ? body.tenantId.trim() : null;

    const response = NextResponse.json({ success: true });

    // Clear selection: remove cookie
    if (!tenantId) {
      response.cookies.set(SUPER_ADMIN_TENANT_COOKIE, '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 0,
        path: '/',
      });
      return response;
    }

    const tenant = await getTenantById(tenantId);
    if (!tenant) {
      return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });
    }

    response.cookies.set(SUPER_ADMIN_TENANT_COOKIE, tenantId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });
    return response;
  } catch (error) {
    console.error('super-admin select-tenant error:', error);
    return NextResponse.json({ error: 'Failed to select tenant' }, { status: 500 });
  }
}
