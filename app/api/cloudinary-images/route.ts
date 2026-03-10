import { NextRequest, NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';
import { v2 as cloudinary } from 'cloudinary';
import { getCloudinaryConfig } from '@/lib/cloudinary';
import { getTenantBySlug } from '@/src/db/queries/tenants';

export async function GET(request: NextRequest) {
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
    const config = await getCloudinaryConfig(tenant?.id);

    if (!config.cloudName || !config.apiKey || !config.apiSecret) {
      return NextResponse.json(
        { error: 'Cloudinary credentials not configured. Add them to .env or tenant_config.' },
        { status: 500 }
      );
    }

    cloudinary.config({
      cloud_name: config.cloudName,
      api_key: config.apiKey,
      api_secret: config.apiSecret,
    });

    const searchParams = request.nextUrl.searchParams;
    const nextCursor = searchParams.get('next_cursor');

    const result = await cloudinary.api.resources({
      resource_type: 'image',
      type: 'upload',
      max_results: 30,
      next_cursor: nextCursor || undefined,
    });

    return NextResponse.json({
      images: result.resources.map((resource: any) => ({
        id: resource.public_id,
        url: resource.secure_url,
        thumbnail: cloudinary.url(resource.public_id, {
          transformation: [
            { width: 200, height: 200, crop: 'fill', quality: 'auto' }
          ]
        }),
        width: resource.width,
        height: resource.height,
        format: resource.format,
        created_at: resource.created_at,
      })),
      next_cursor: result.next_cursor,
      total: result.total_count,
    });
  } catch (error) {
    console.error('Error fetching Cloudinary images:', error);
    return NextResponse.json(
      { error: 'Failed to fetch images from Cloudinary' },
      { status: 500 }
    );
  }
}
