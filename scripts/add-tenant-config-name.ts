/**
 * Add tenant_name column to tenant_config for ease of viewing in DB tools.
 * Run: npx tsx scripts/add-tenant-config-name.ts
 */
import 'dotenv/config';
import { Pool } from '@neondatabase/serverless';

const SQL = `
ALTER TABLE "tenant_config" ADD COLUMN IF NOT EXISTS "tenant_name" varchar(255);

UPDATE "tenant_config" tc
SET "tenant_name" = t."name"
FROM "tenants" t
WHERE tc."tenant_id" = t."id" AND (tc."tenant_name" IS NULL OR tc."tenant_name" = '');
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
    console.log('Adding tenant_name column to tenant_config...');
    await client.query(SQL);
    console.log('Done.');
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

main();
