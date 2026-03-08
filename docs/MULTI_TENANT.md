# Multi-Tenant Setup

## Phase 2: Tenant Resolution

Tenant is resolved from the request `Host` header:

1. **Custom domain** – `tenants.custom_domain` (e.g. `store.acme.com`)
2. **Subdomain** – tenant slug (e.g. `acme.yourplatform.com` → slug `acme`)
3. **Fallback** – default tenant (localhost, www, unknown)

## Environment Variables

Add to `.env` for production:

```env
# Base domain for subdomain resolution (e.g. yourplatform.com)
# Omit for localhost - defaults to "localhost"
NEXT_PUBLIC_BASE_DOMAIN=yourplatform.com
```

## Adding a New Tenant

1. Insert into `tenants`:

```sql
INSERT INTO tenants (slug, name, custom_domain) 
VALUES ('acme', 'Acme Store', NULL);
```

2. For subdomain: visit `acme.yourplatform.com` (with `NEXT_PUBLIC_BASE_DOMAIN` set)
3. For custom domain: set `custom_domain = 'store.acme.com'` and point DNS to your app

## Vercel Domain Setup

- Add `yourplatform.com` and `*.yourplatform.com` in Vercel project settings
- Subdomains will resolve to the same deployment
