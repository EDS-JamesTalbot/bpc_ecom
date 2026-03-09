# Client Onboarding: 1 Client = 1 Tenant

This guide explains how to onboard a new client so they have their own isolated store (tenant) with admin access.

## How It Works

- **Tenant** = One client's store (products, orders, content, etc.)
- **Clerk user** = Admin who can edit that tenant's content
- **1 client = 1 tenant** = Each client gets one tenant and can only edit their own store

## Onboarding Steps

### 1. Create the Tenant

Add a new row to the `tenants` table. You can do this via:

**Option A: Drizzle Studio**
```bash
npm run db:studio
```
Then insert into `tenants` with: `slug`, `name`, `custom_domain` (optional).

**Option B: SQL**
```sql
INSERT INTO tenants (slug, name, custom_domain) 
VALUES ('acme', 'Acme Store', 'acme.yourdomain.com');
```

**Option C: Programmatically** (e.g. from a script or admin UI)
```typescript
import { createTenant } from '@/src/db/queries/tenants';

const tenant = await createTenant('acme', 'Acme Store', 'acme.yourdomain.com');
```

### 2. Client Signs Up in Clerk

The client signs up on your site using the Clerk sign-in modal (email/password or Google/GitHub).

### 3. Link Client to Tenant in Clerk

1. Go to [Clerk Dashboard](https://dashboard.clerk.com) → **Users**
2. Find the client's user
3. Click **Edit** → **Public metadata**
4. Add:
   ```json
   {
     "role": "admin",
     "tenantId": "THE_TENANT_UUID"
   }
   ```
5. Save

**To get the tenant UUID:**
- **Option A:** Visit `https://your-site.vercel.app/api/debug/tenant-id` while signed in as admin. Copy the `tenantId` from the response.
- **Option B:** Run `npm run db:studio`, open the `tenants` table, and copy the `id` (UUID) for the tenant.

**Important:** The tenantId in Clerk must match the tenant resolved from the URL the client visits. For the main site (e.g. bpc-ecom.vercel.app), that's the **default** tenant. Use the default tenant's UUID in Clerk for clients who edit the main site.

### 4. Configure Domain (if using subdomain or custom domain)

- **Subdomain:** Set `NEXT_PUBLIC_BASE_DOMAIN=yourplatform.com` in Vercel. Client visits `acme.yourplatform.com`.
- **Custom domain:** Set `custom_domain` on the tenant and configure DNS to point to your Vercel deployment.

### 5. Seed Content (optional)

If the tenant needs initial content (products, testimonials, page sections):

```bash
# Seed for a specific tenant (you'd need to modify the seed script to accept tenantId)
npm run db:seed
npm run db:seed:content
```

For new tenants, you may need to run seed scripts with the new tenant ID.

---

## Super-Admin (You)

To retain access to **all** tenants (e.g. for support or management):

- Set your Clerk Public metadata to: `{"role": "admin"}` (no `tenantId`)
- You can access any tenant's admin when visiting their domain/subdomain

---

## Summary

| Step | Action |
|------|--------|
| 1 | Create tenant (slug, name, domain) |
| 2 | Client signs up in Clerk |
| 3 | Add `{"role": "admin", "tenantId": "uuid"}` to client's Clerk metadata |
| 4 | Configure domain/subdomain |
| 5 | (Optional) Seed content |

After this, the client can only edit their own store. They will not see the Admin button when visiting another client's site.
