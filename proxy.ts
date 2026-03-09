import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { isReservedPathSegment } from '@/lib/tenant-utils';

// Path-based tenant: /loveys-soap/shop → tenant slug in header, rewrite to /shop
function handlePathBasedTenant(req: Request): NextResponse | null {
  const url = new URL(req.url);
  const pathname = url.pathname;
  const segments = pathname.split('/').filter(Boolean);
  const first = segments[0];

  if (!first) return null; // "/" - no tenant in path
  if (isReservedPathSegment(first)) return null; // "/shop", "/admin" etc - no tenant

  // First segment is tenant slug: /loveys-soap or /loveys-soap/shop
  const tenantSlug = first;
  const restPath = '/' + segments.slice(1).join('/') || '/';
  const rewriteUrl = new URL(restPath, url.origin);
  rewriteUrl.search = url.search;

  const requestHeaders = new Headers(req.headers);
  requestHeaders.set('x-tenant-slug', tenantSlug);

  return NextResponse.rewrite(rewriteUrl, {
    request: { headers: requestHeaders },
  });
}

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
  // Path-based tenant: /loveys-soap/shop → rewrite + set header
  const tenantResponse = handlePathBasedTenant(req);
  if (tenantResponse) return tenantResponse;

  const { userId } = await auth();
  
  // Skip auth protection for public routes (including admin/content temporarily)
  if (isPublicRoute(req)) {
    return NextResponse.next();
  }
  
  // Protect admin routes
  if (isAdminRoute(req)) {
    // If not signed in, redirect to shop page (preserve tenant if path-based)
    if (!userId) {
      const pathSlug = req.headers.get('x-tenant-slug');
      const shopPath = pathSlug ? `/${pathSlug}/shop` : '/shop';
      const signInUrl = new URL(shopPath, req.url);
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
