/**
 * BPC Payment Gateway API client (eCommerce API v2 - Redirect integration)
 * Docs: https://dev.bpcbt.com/en/integration/apiv2/structure/redirect-integration-apiv2.html
 *
 * Config resolution: tenant_config (DB) overrides env vars. Use tenant_config for
 * per-tenant BPC_API_KEY, BPC_GATEWAY_URL, BPC_CURRENCY. Keys: bpc_api_key, bpc_gateway_url, bpc_currency.
 */

import { getTenantConfigByKeys } from '@/src/db/queries/tenant-config';

const BPC_API_VERSION = '2023-10-31';

export type CreateSessionParams = {
  amount: number; // minor units (e.g. cents)
  currency: string; // ISO 4217 e.g. USD, EUR
  successUrl: string;
  failureUrl: string;
  merchantReferenceId?: string; // optional order reference
};

export type BpcSession = {
  id: string;
  amount: number;
  currency: string;
  paymentUrl: string;
  status: string;
  paymentStatus: string;
  successUrl: string;
  failureUrl: string;
  expiresAt?: string;
  created?: string;
};

async function getConfig(tenantId?: string) {
  const keys = ['bpc_api_key', 'bpc_gateway_url', 'bpc_currency'];
  const tenantConfig = tenantId ? await getTenantConfigByKeys(keys, tenantId) : {};
  const baseUrl = (tenantConfig.bpc_gateway_url ?? process.env.BPC_GATEWAY_URL)?.replace(/\/$/, '') || 'https://dev.bpcbt.com/api2';
  const apiKey = tenantConfig.bpc_api_key ?? process.env.BPC_API_KEY ?? '';
  const isSandbox = baseUrl.includes('dev.bpcbt.com');
  const currency = tenantConfig.bpc_currency ?? process.env.BPC_CURRENCY ?? (isSandbox ? 'EUR' : undefined);
  return { baseUrl, apiKey, currency, isSandbox };
}

export type CreateSessionResult =
  | { success: true; session: BpcSession }
  | { success: false; error: string };

/**
 * Create a BPC payment session for redirect flow.
 * Returns session id and paymentUrl to redirect the customer.
 * Pass tenantId to use tenant-specific BPC config from tenant_config table.
 */
export async function createSession(params: CreateSessionParams, tenantId?: string): Promise<CreateSessionResult> {
  const { baseUrl, apiKey, currency: configCurrency, isSandbox } = await getConfig(tenantId);
  if (!apiKey) {
    console.error('BPC_API_KEY is not set');
    return { success: false, error: 'BPC_API_KEY is not configured. Please add it to your .env file.' };
  }

  // Use BPC_CURRENCY env override, or EUR for sandbox (required by BPC - sandbox only supports EUR)
  const currency = (configCurrency || params.currency).toUpperCase();

  const body: Record<string, unknown> = {
    amount: params.amount,
    currency,
    successUrl: params.successUrl,
    failureUrl: params.failureUrl,
  };
  if (params.merchantReferenceId) {
    body.merchantReferenceId = params.merchantReferenceId;
  }

  const res = await fetch(`${baseUrl}/sessions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Api-Key': apiKey,
      'X-Version': BPC_API_VERSION,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    console.error('BPC createSession failed:', res.status, text);
    let errorMessage = 'Payment service is temporarily unavailable. Please try again.';
    try {
      const errJson = JSON.parse(text) as { message?: string; error?: string; errors?: unknown };
      const msg = errJson.message || errJson.error || (Array.isArray(errJson.errors) ? errJson.errors[0] : null);
      if (msg && typeof msg === 'string') errorMessage = msg;
      else if (msg && typeof msg === 'object' && msg !== null && 'message' in msg) {
        errorMessage = (msg as { message: string }).message;
      }
    } catch {
      // Fallback for non-JSON or parse failure
    }
    if (res.status === 401) errorMessage = 'Invalid payment gateway credentials. Please check BPC_API_KEY in .env';
    else if (res.status === 403) errorMessage = 'Payment gateway access denied. Please verify your BPC account.';
    else if (res.status === 412) {
      errorMessage = 'Redirect URLs rejected (412). Add http://localhost:3000 to allowed URLs in your BPC Cabinet, or use BPC_REDIRECT_BASE_URL with an ngrok/public URL.';
    }
    return { success: false, error: errorMessage };
  }

  const data = (await res.json()) as BpcSession;
  if (!data?.paymentUrl) {
    console.error('BPC createSession: response missing paymentUrl', data);
    return { success: false, error: 'Payment gateway returned an invalid response. Please try again.' };
  }
  return { success: true, session: data };
}

/**
 * Get a session by ID (for verify-on-return when webhooks are not available, e.g. localhost).
 * Returns the session object including paymentStatus.
 * Pass tenantId to use tenant-specific BPC config from tenant_config table.
 */
export async function getSession(sessionId: string, tenantId?: string): Promise<BpcSession | null> {
  const { baseUrl, apiKey } = await getConfig(tenantId);
  if (!apiKey) return null;

  const res = await fetch(`${baseUrl}/sessions/${sessionId}`, {
    method: 'GET',
    headers: {
      'X-Api-Key': apiKey,
      'X-Version': BPC_API_VERSION,
    },
  });

  if (!res.ok) {
    const text = await res.text();
    console.error('BPC getSession failed:', res.status, text);
    return null;
  }

  const data = (await res.json()) as BpcSession;
  return data;
}
