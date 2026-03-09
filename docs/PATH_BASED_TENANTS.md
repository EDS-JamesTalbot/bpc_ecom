# Path-Based Tenant URLs

Tenants are now resolved from the URL path, so you can use clean URLs like:

- `bpc-ecom.vercel.app/loveys-soap` – Loveys Soap store
- `bpc-ecom.vercel.app/loveys-soap/shop` – Loveys Soap shop
- `bpc-ecom.vercel.app/default` – Default store
- `bpc-ecom.vercel.app/default/shop` – Default store shop

## How It Works

1. **Proxy** – The first path segment is treated as the tenant slug (unless it’s a reserved route like `shop`, `admin`, `contact`, etc.).
2. **Rewrite** – `/loveys-soap/shop` is rewritten to `/shop` with an `x-tenant-slug` header.
3. **Tenant resolution** – `getTenantIdForRequest()` reads the header and resolves the tenant from the database.

## URL Patterns

| URL | Tenant | Page |
|-----|--------|------|
| `/` | default | Home |
| `/shop` | default | Shop |
| `/loveys-soap` | loveys-soap | Home |
| `/loveys-soap/shop` | loveys-soap | Shop |
| `/default` | default | Home |
| `/default/shop` | default | Shop |

## Reserved Paths (Not Tenant Slugs)

These first path segments are treated as routes, not tenant slugs:

`admin`, `shop`, `contact`, `help`, `testimonials`, `maintenance`, `order-confirmation`, `payment-failed`, `customer-login`, `my-account`, `sign-in`, `sign-up`, `api`

## Adding a New Tenant

1. Create the tenant in the database (e.g. via Drizzle Studio or `createTenant()`).
2. Ensure the tenant has a unique `slug` (e.g. `loveys-soap`).
3. Use URLs like `bpc-ecom.vercel.app/loveys-soap` and `bpc-ecom.vercel.app/loveys-soap/shop`.

## For Developers

- **Server Components**: Use `getTenantSlugForRequest()` and `withTenantPrefix(path, tenantSlug)` for links.
- **Client Components**: Use `useTenantSlug()` and `withTenantPrefix(path, tenantSlug)` for links and `router.push()`.
- **Invalid tenant slug**: Visiting `/invalid-tenant/shop` returns 404 if no tenant exists with that slug.
