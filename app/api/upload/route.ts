/**
 * Cloudinary Upload API Route (Secured with Clerk Authentication)
 * 
 * Generates a signed upload URL for secure image uploads
 * Requires admin authentication
 */

import { NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';
import { generateSignature } from '@/lib/cloudinary';

export async function POST() {
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
    
    // Check if Cloudinary credentials are configured
    if (!process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 
        !process.env.CLOUDINARY_API_KEY || 
        !process.env.CLOUDINARY_API_SECRET) {
      return NextResponse.json(
        { error: 'Cloudinary credentials not configured. Add them to your .env file.' },
        { status: 500 }
      );
    }

    // Generate upload parameters
    const timestamp = Math.round(new Date().getTime() / 1000);
    const folder = 'websitetemplate/products'; // Organize images in a folder
    
    const paramsToSign = {
      timestamp,
      folder,
    };
    
    // Generate signature
    const signature = generateSignature(paramsToSign);
    
    // Return signed parameters
    return NextResponse.json({
      signature,
      timestamp,
      folder,
      cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
      apiKey: process.env.CLOUDINARY_API_KEY,
    });
  } catch (error) {
    console.error('Upload signature generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate upload signature' },
      { status: 500 }
    );
  }
}
