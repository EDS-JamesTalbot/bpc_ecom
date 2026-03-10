/**
 * Tenant-specific email/Resend config.
 * Keys: resend_api_key, email_from_address, email_from_name, business_owner_email
 * Falls back to env vars when not set per tenant.
 */

import { getTenantConfigByKeys } from '@/src/db/queries/tenant-config';

export type TenantEmailConfig = {
  resendApiKey: string;
  fromAddress: string;
  fromName: string;
  businessOwnerEmail: string | null;
};

export async function getTenantEmailConfig(tenantId: string): Promise<TenantEmailConfig> {
  const keys = [
    'resend_api_key',
    'email_from_address',
    'email_from_name',
    'business_owner_email',
  ];
  const tc = await getTenantConfigByKeys(keys, tenantId);
  return {
    resendApiKey: tc.resend_api_key ?? process.env.RESEND_API_KEY ?? '',
    fromAddress: tc.email_from_address ?? process.env.EMAIL_FROM_ADDRESS ?? '',
    fromName: tc.email_from_name ?? process.env.EMAIL_FROM_NAME ?? 'Your Store',
    businessOwnerEmail: tc.business_owner_email ?? process.env.BUSINESS_OWNER_EMAIL ?? null,
  };
}
