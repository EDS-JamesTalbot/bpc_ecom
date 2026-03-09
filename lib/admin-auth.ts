import { auth, clerkClient } from '@clerk/nextjs/server';
import { getTenantIdForRequest } from '@/lib/tenant-context';

export type AdminAuthResult = {
  userId: string;
  tenantId: string;
  isSuperAdmin: boolean;
};

/**
 * Ensures 1 client = 1 tenant:
 * - Client admins: publicMetadata has { role: "admin", tenantId: "uuid" } → can only access their tenant
 * - Super-admin (you): publicMetadata has { role: "admin" } (no tenantId) → can access any tenant
 *
 * @throws Error if not authenticated, not admin, or tenant access denied
 */
export async function requireAdminWithTenantAccess(): Promise<AdminAuthResult> {
  const { userId } = await auth();

  if (!userId) {
    throw new Error('Unauthorized: You must be signed in to perform this action');
  }

  const client = await clerkClient();
  const user = await client.users.getUser(userId);
  const role = user.publicMetadata?.role as string | undefined;
  const userTenantId = user.publicMetadata?.tenantId as string | undefined;

  if (role !== 'admin') {
    throw new Error('Forbidden: Admin access required');
  }

  const requestTenantId = await getTenantIdForRequest();

  // Super-admin: no tenantId in metadata → can access any tenant
  if (!userTenantId) {
    return { userId, tenantId: requestTenantId, isSuperAdmin: true };
  }

  // Client admin: must match their assigned tenant
  if (userTenantId !== requestTenantId) {
    throw new Error('Forbidden: You do not have access to this store');
  }

  return { userId, tenantId: requestTenantId, isSuperAdmin: false };
}

/**
 * Check if the current user can access admin for the current tenant.
 * Used to show/hide Admin button in the UI.
 * Returns true for super-admins; for client admins, only if tenant matches.
 */
export async function canAccessAdminForCurrentTenant(): Promise<boolean> {
  try {
    await requireAdminWithTenantAccess();
    return true;
  } catch {
    return false;
  }
}
