/**
 * Cloudinary Server-Side Configuration
 * 
 * This file handles server-side Cloudinary operations like:
 * - Generating signed upload URLs
 * - Image transformations
 * - Secure API calls
 */

import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary with environment variables
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Generate a signature for secure uploads
 * This prevents unauthorized uploads to your Cloudinary account
 */
export function generateSignature(paramsToSign: Record<string, string | number>) {
  const signature = cloudinary.utils.api_sign_request(
    paramsToSign,
    process.env.CLOUDINARY_API_SECRET || ''
  );
  return signature;
}

/**
 * Helper to generate optimized image URLs
 * Applies automatic format and quality optimization
 */
export function getOptimizedImageUrl(publicId: string, options?: {
  width?: number;
  height?: number;
  crop?: 'fill' | 'fit' | 'scale' | 'crop';
  quality?: 'auto' | number;
  format?: 'auto' | 'webp' | 'jpg' | 'png';
}) {
  const {
    width,
    height,
    crop = 'fill',
    quality = 'auto',
    format = 'auto',
  } = options || {};

  return cloudinary.url(publicId, {
    transformation: [
      { width, height, crop, quality, fetch_format: format },
    ],
    secure: true,
  });
}

/**
 * Delete an image from Cloudinary
 * Useful when removing products
 */
export async function deleteImage(publicId: string) {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    console.error('Error deleting image from Cloudinary:', error);
    throw error;
  }
}

export default cloudinary;

