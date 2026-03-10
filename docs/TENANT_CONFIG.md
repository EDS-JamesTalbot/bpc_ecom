# Tenant-Specific Configuration

Environment variables are global per deployment—you can only have one value per key. For tenant-specific values (BPC API keys, URLs, Cloudinary, etc.), store them in the **`tenant_config`** table instead.

The `tenant_name` column is denormalized from the tenants table for ease of viewing in DB tools (Drizzle Studio, etc.)—no join needed.

## How It Works

| Config Key | Env Var Fallback | Description |
|------------|------------------|-------------|
| `bpc_api_key` | `BPC_API_KEY` | BPC payment gateway API key |
| `bpc_gateway_url` | `BPC_GATEWAY_URL` | BPC API base URL (e.g. `https://dev.bpcbt.com/api2`) |
| `bpc_currency` | `BPC_CURRENCY` | Currency override (e.g. `EUR` for sandbox) |
| `cloudinary_cloud_name` | `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name |
| `cloudinary_api_key` | `CLOUDINARY_API_KEY` | Cloudinary API key |
| `cloudinary_api_secret` | `CLOUDINARY_API_SECRET` | Cloudinary API secret |
| `resend_api_key` | `RESEND_API_KEY` | Resend API key for transactional email |
| `email_from_address` | `EMAIL_FROM_ADDRESS` | From email address |
| `email_from_name` | `EMAIL_FROM_NAME` | From display name |
| `business_owner_email` | `BUSINESS_OWNER_EMAIL` | Business notification email |

**Resolution order:** tenant_config (DB) → env var. If a tenant has a value in `tenant_config`, it overrides the env var. Otherwise the env var is used (global default).

**Important:** Use lowercase snake_case for `config_key` (e.g. `bpc_gateway_url`, not `BPC_GATEWAY_URL`).

## Adding Tenant Config

### Via SQL

```sql
-- Get tenant ID for your store (e.g. loveys-soap)
SELECT id, slug, name FROM tenants WHERE slug = 'loveys-soap';

-- Insert tenant-specific BPC config
INSERT INTO tenant_config (tenant_id, config_key, config_value)
VALUES (
  'your-tenant-uuid-here',
  'bpc_api_key',
  'your-bpc-api-key'
)
ON CONFLICT (tenant_id, config_key) DO UPDATE SET config_value = EXCLUDED.config_value;

INSERT INTO tenant_config (tenant_id, config_key, config_value)
VALUES (
  'your-tenant-uuid-here',
  'bpc_gateway_url',
  'https://dev.bpcbt.com/api2'
)
ON CONFLICT (tenant_id, config_key) DO UPDATE SET config_value = EXCLUDED.config_value;
```

### Via Drizzle Studio

1. Run `npm run db:studio`
2. Open `tenant_config` table
3. Add rows with `tenant_id`, `config_key`, `config_value`

### Via Script

```typescript
import { setTenantConfig } from '@/src/db/queries/tenant-config';
import { getTenantBySlug } from '@/src/db/queries/tenants';

const tenant = await getTenantBySlug('loveys-soap');
if (tenant) {
  await setTenantConfig('bpc_api_key', 'your-key', tenant.id);
  await setTenantConfig('bpc_gateway_url', 'https://dev.bpcbt.com/api2', tenant.id);
}
```

## Extending to Other Services

The same pattern works for Cloudinary, Resend, webhook secrets, etc. Add a new config key and query it in your code:

```typescript
// In your service (e.g. lib/cloudinary.ts)
import { getTenantConfigByKey } from '@/src/db/queries/tenant-config';

const apiKey = await getTenantConfigByKey('cloudinary_api_key', tenantId)
  ?? process.env.CLOUDINARY_API_KEY;
```

## Security Notes

- `tenant_config` stores secrets. Restrict access to the database.
- Use env vars for global defaults (e.g. dev/sandbox). Use tenant_config for production tenant-specific values.
- Never expose tenant config keys to the client in `NEXT_PUBLIC_*` vars.
