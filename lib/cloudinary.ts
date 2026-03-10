/**
 * Cloudinary Server-Side Configuration
 *
 * Supports tenant-specific config via tenant_config table.
 * Keys: cloudinary_cloud_name, cloudinary_api_key, cloudinary_api_secret
 * Falls back to env vars when not set per tenant.
 */

import { v2 as cloudinary } from 'cloudinary';
import { getTenantConfigByKeys } from '@/src/db/queries/tenant-config';

// Default config (env vars)
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export type CloudinaryConfig = {
  cloudName: string;
  apiKey: string;
  apiSecret: string;
};

/**
 * Get Cloudinary config for a tenant. Falls back to env vars.
 */
export async function getCloudinaryConfig(tenantId?: string): Promise<CloudinaryConfig> {
  const keys = ['cloudinary_cloud_name', 'cloudinary_api_key', 'cloudinary_api_secret'];
  const tc = tenantId ? await getTenantConfigByKeys(keys, tenantId) : {};
  return {
    cloudName: tc.cloudinary_cloud_name ?? process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ?? '',
    apiKey: tc.cloudinary_api_key ?? process.env.CLOUDINARY_API_KEY ?? '',
    apiSecret: tc.cloudinary_api_secret ?? process.env.CLOUDINARY_API_SECRET ?? '',
  };
}

/**
 * Generate a signature for secure uploads.
 * Pass tenantId for tenant-specific Cloudinary; omit for global config.
 */
export async function generateSignature(
  paramsToSign: Record<string, string | number>,
  tenantId?: string
): Promise<string> {
  const config = await getCloudinaryConfig(tenantId);
  return cloudinary.utils.api_sign_request(paramsToSign, config.apiSecret);
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

