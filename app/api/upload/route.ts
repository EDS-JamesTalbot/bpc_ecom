/**
 * Cloudinary Upload API Route (Secured with Clerk Authentication)
 *
 * Generates a signed upload URL for secure image uploads.
 * Requires admin authentication.
 * Pass X-Tenant-Slug header for tenant-specific Cloudinary config.
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';
import { generateSignature, getCloudinaryConfig } from '@/lib/cloudinary';
import { getTenantBySlug } from '@/src/db/queries/tenants';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized: You must be signed in' }, { status: 401 });
    }

    const client = await clerkClient();
    const user = await client.users.getUser(userId);
    if (user.publicMetadata?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const tenantSlug = request.headers.get('x-tenant-slug');
    const tenant = tenantSlug ? await getTenantBySlug(tenantSlug) : null;
    const tenantId = tenant?.id;

    const config = await getCloudinaryConfig(tenantId);
    if (!config.cloudName || !config.apiKey || !config.apiSecret) {
      return NextResponse.json(
        { error: 'Cloudinary credentials not configured. Add them to .env or tenant_config.' },
        { status: 500 }
      );
    }

    const timestamp = Math.round(new Date().getTime() / 1000);
    const folder = tenantSlug ? `${tenantSlug}/products` : 'BPC_Ecom/products';
    const paramsToSign = { timestamp, folder };
    const signature = await generateSignature(paramsToSign, tenantId);

    return NextResponse.json({
      signature,
      timestamp,
      folder,
      cloudName: config.cloudName,
      apiKey: config.apiKey,
    });
  } catch (error) {
    console.error('Upload signature generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate upload signature' },
      { status: 500 }
    );
  }
}
