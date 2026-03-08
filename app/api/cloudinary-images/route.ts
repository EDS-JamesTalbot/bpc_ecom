import { NextRequest, NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary - DO NOT use hardcoded fallbacks
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function GET(request: NextRequest) {
  try {
    // Verify admin authentication
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized: You must be signed in' },
        { status: 401 }
      );
    }
    
    // Verify admin role
    const client = await clerkClient();
    const user = await client.users.getUser(userId);
    
    if (user.publicMetadata?.role !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden: Admin access required' },
        { status: 403 }
      );
    }
    
    // Verify Cloudinary credentials are configured
    if (!process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 
        !process.env.CLOUDINARY_API_KEY || 
        !process.env.CLOUDINARY_API_SECRET) {
      return NextResponse.json(
        { error: 'Cloudinary credentials not configured. Add them to your .env file.' },
        { status: 500 }
      );
    }
    
    const searchParams = request.nextUrl.searchParams;
    const nextCursor = searchParams.get('next_cursor');
    
    // Fetch images from Cloudinary
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
