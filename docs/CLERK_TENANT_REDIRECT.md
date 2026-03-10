# Clerk Sign-In Redirect & Tenant Preservation

When an admin signs in from a tenant page (e.g. `/loveys-soap/shop`), Clerk can perform a delayed redirect that strips the tenant from the URL. This causes the admin to land on the default tenant's empty shop.

## Fix Applied

1. **Cookie + callback route**: Before opening the sign-in modal, we store the current path in a cookie. The `/api/after-sign-in` route reads it and redirects there after Clerk finishes.

2. **ClerkProvider fallback**: `signInFallbackRedirectUrl` and `signUpFallbackRedirectUrl` are set to `/api/after-sign-in` so Clerk uses our callback when no other redirect is specified.

## Vercel Environment Variables

If you still see a redirect to `/shop` (empty) after ~3 seconds, Clerk may be using a **force** redirect from env vars. Check Vercel → Settings → Environment Variables:

| Variable | Action |
|----------|--------|
| `NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL` | Remove it, or set to `/api/after-sign-in` |
| `NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL` | Remove it, or set to `/api/after-sign-in` |
| `NEXT_PUBLIC_CLERK_SIGN_IN_FORCE_REDIRECT_URL` | Remove it (or set to `/api/after-sign-in`) |
| `NEXT_PUBLIC_CLERK_SIGN_UP_FORCE_REDIRECT_URL` | Remove it (or set to `/api/after-sign-in`) |

Force redirect URLs override the component's `forceRedirectUrl` and can cause the delayed redirect to `/shop`. Removing them or pointing them to our callback fixes the issue.
