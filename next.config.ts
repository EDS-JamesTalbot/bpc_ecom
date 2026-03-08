import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Turbopack configuration
  turbopack: {
    root: __dirname,
  },
  images: {
    // Allow images from multiple sources
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
      // Allow any HTTPS image source (Unsplash, Imgur, etc.)
      {
        protocol: 'https',
        hostname: '**',
      },
      // Uncomment if using Vercel Blob Storage
      // {
      //   protocol: 'https',
      //   hostname: '*.public.blob.vercel-storage.com',
      // },
    ],
    // Optimize images for better performance
    formats: ['image/webp', 'image/avif'],
    // Set reasonable size limits
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  // Increase body size limit for base64 image embeds
  experimental: {
    serverActions: {
      bodySizeLimit: '3mb', // Allow up to 3MB for base64-encoded images
    },
  },
};

export default nextConfig;
