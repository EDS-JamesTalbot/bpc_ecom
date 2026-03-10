/**
 * Run the multi-tenant migration (0010) directly.
 * Use this if db:migrate fails due to migration state (e.g. schema was applied via db:push).
 *
 * Run: npx tsx scripts/migrate-multi-tenant.ts
 */
import 'dotenv/config';
import { Pool } from '@neondatabase/serverless';

const MIGRATION_SQL = `
-- Phase 1: Create tenants and tenant_config tables
CREATE TABLE IF NOT EXISTS "tenants" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "slug" varchar(50) NOT NULL,
  "name" varchar(255) NOT NULL,
  "custom_domain" varchar(255),
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS "tenants_slug_unique" ON "tenants" USING btree ("slug");
CREATE INDEX IF NOT EXISTS "tenants_slug_idx" ON "tenants" USING btree ("slug");

CREATE TABLE IF NOT EXISTS "tenant_config" (
  "id" serial PRIMARY KEY NOT NULL,
  "tenant_id" uuid NOT NULL,
  "tenant_name" varchar(255),
  "config_key" varchar(100) NOT NULL,
  "config_value" text NOT NULL
);
DO $$ BEGIN
  ALTER TABLE "tenant_config" ADD CONSTRAINT "tenant_config_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
CREATE UNIQUE INDEX IF NOT EXISTS "tenant_config_tenant_key_unique" ON "tenant_config" USING btree ("tenant_id","config_key");
CREATE INDEX IF NOT EXISTS "tenant_config_tenant_id_idx" ON "tenant_config" USING btree ("tenant_id");

INSERT INTO "tenants" ("slug", "name") VALUES ('default', 'Default Store') ON CONFLICT ("slug") DO NOTHING;

-- Phase 2: Add tenant_id columns (nullable first for backfill)
ALTER TABLE "customers" ADD COLUMN IF NOT EXISTS "tenant_id" uuid;
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "tenant_id" uuid;
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "tenant_id" uuid;
ALTER TABLE "testimonials" ADD COLUMN IF NOT EXISTS "tenant_id" uuid;
ALTER TABLE "page_sections" ADD COLUMN IF NOT EXISTS "tenant_id" uuid;
ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "tenant_id" uuid;

-- Phase 3: Backfill tenant_id with default tenant
UPDATE "customers" SET "tenant_id" = (SELECT "id" FROM "tenants" WHERE "slug" = 'default' LIMIT 1) WHERE "tenant_id" IS NULL;
UPDATE "products" SET "tenant_id" = (SELECT "id" FROM "tenants" WHERE "slug" = 'default' LIMIT 1) WHERE "tenant_id" IS NULL;
UPDATE "orders" SET "tenant_id" = (SELECT "id" FROM "tenants" WHERE "slug" = 'default' LIMIT 1) WHERE "tenant_id" IS NULL;
UPDATE "testimonials" SET "tenant_id" = (SELECT "id" FROM "tenants" WHERE "slug" = 'default' LIMIT 1) WHERE "tenant_id" IS NULL;
UPDATE "page_sections" SET "tenant_id" = (SELECT "id" FROM "tenants" WHERE "slug" = 'default' LIMIT 1) WHERE "tenant_id" IS NULL;
UPDATE "site_settings" SET "tenant_id" = (SELECT "id" FROM "tenants" WHERE "slug" = 'default' LIMIT 1) WHERE "tenant_id" IS NULL;

-- Phase 4: Drop old unique constraints
ALTER TABLE "customers" DROP CONSTRAINT IF EXISTS "customers_email_unique";
ALTER TABLE "page_sections" DROP CONSTRAINT IF EXISTS "page_sections_section_key_unique";
ALTER TABLE "site_settings" DROP CONSTRAINT IF EXISTS "site_settings_setting_key_unique";

-- Phase 5: Add FK constraints and set NOT NULL
ALTER TABLE "customers" DROP CONSTRAINT IF EXISTS "customers_tenant_id_tenants_id_fk";
ALTER TABLE "customers" ADD CONSTRAINT "customers_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "customers" ALTER COLUMN "tenant_id" SET NOT NULL;

ALTER TABLE "products" DROP CONSTRAINT IF EXISTS "products_tenant_id_tenants_id_fk";
ALTER TABLE "products" ADD CONSTRAINT "products_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "products" ALTER COLUMN "tenant_id" SET NOT NULL;

ALTER TABLE "orders" DROP CONSTRAINT IF EXISTS "orders_tenant_id_tenants_id_fk";
ALTER TABLE "orders" ADD CONSTRAINT "orders_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "orders" ALTER COLUMN "tenant_id" SET NOT NULL;

ALTER TABLE "testimonials" DROP CONSTRAINT IF EXISTS "testimonials_tenant_id_tenants_id_fk";
ALTER TABLE "testimonials" ADD CONSTRAINT "testimonials_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "testimonials" ALTER COLUMN "tenant_id" SET NOT NULL;

ALTER TABLE "page_sections" DROP CONSTRAINT IF EXISTS "page_sections_tenant_id_tenants_id_fk";
ALTER TABLE "page_sections" ADD CONSTRAINT "page_sections_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "page_sections" ALTER COLUMN "tenant_id" SET NOT NULL;

ALTER TABLE "site_settings" DROP CONSTRAINT IF EXISTS "site_settings_tenant_id_tenants_id_fk";
ALTER TABLE "site_settings" ADD CONSTRAINT "site_settings_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "site_settings" ALTER COLUMN "tenant_id" SET NOT NULL;

-- Phase 6: Add new composite unique constraints and indexes
CREATE UNIQUE INDEX IF NOT EXISTS "customers_tenant_email_unique" ON "customers" USING btree ("tenant_id","email");
CREATE INDEX IF NOT EXISTS "customers_tenant_id_idx" ON "customers" USING btree ("tenant_id");
CREATE INDEX IF NOT EXISTS "products_tenant_id_idx" ON "products" USING btree ("tenant_id");
CREATE INDEX IF NOT EXISTS "orders_tenant_id_idx" ON "orders" USING btree ("tenant_id");
CREATE UNIQUE INDEX IF NOT EXISTS "page_sections_tenant_key_unique" ON "page_sections" USING btree ("tenant_id","section_key");
CREATE INDEX IF NOT EXISTS "page_sections_tenant_id_idx" ON "page_sections" USING btree ("tenant_id");
CREATE UNIQUE INDEX IF NOT EXISTS "site_settings_tenant_key_unique" ON "site_settings" USING btree ("tenant_id","setting_key");
CREATE INDEX IF NOT EXISTS "site_settings_tenant_id_idx" ON "site_settings" USING btree ("tenant_id");
CREATE INDEX IF NOT EXISTS "testimonials_tenant_id_idx" ON "testimonials" USING btree ("tenant_id");
`;

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error('DATABASE_URL is not set');
    process.exit(1);
  }

  const pool = new Pool({ connectionString: url });
  const client = await pool.connect();

  try {
    console.log('Running multi-tenant migration...');
    await client.query(MIGRATION_SQL);
    console.log('Migration completed successfully.');
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

main();
