import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

// Define public routes (accessible without sign-in)
const isPublicRoute = createRouteMatcher([
  '/',
  '/shop(.*)',
  '/contact(.*)',
  '/testimonials(.*)',
  '/help(.*)',
  '/admin/content(.*)',  // Temporarily public due to Clerk JWT issues
  '/maintenance(.*)',   // Maintenance page when admin is logged in
  '/order-confirmation(.*)',
  '/payment-failed(.*)',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/api/webhooks(.*)',
]);

// Define admin routes that require authentication and admin role
const isAdminRoute = createRouteMatcher([
  '/admin(.*)',
  '/api/upload(.*)',
  '/api/cloudinary-images(.*)',
]);

export default clerkMiddleware(async (auth, req) => {
  const { userId } = await auth();
  
  // Skip auth protection for public routes (including admin/content temporarily)
  if (isPublicRoute(req)) {
    return NextResponse.next();
  }
  
  // Protect admin routes
  if (isAdminRoute(req)) {
    // If not signed in, redirect to shop page
    if (!userId) {
      const signInUrl = new URL('/shop', req.url);
      return NextResponse.redirect(signInUrl);
    }
    
    // Note: Additional admin role check is performed in the routes themselves
    // using clerkClient to fetch publicMetadata
    // This middleware provides the first layer of protection
  }
  
  // Allow access to all other routes
  return NextResponse.next();
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
