'use client';

import { createContext, useContext } from 'react';

export const TenantContext = createContext<string | null>(null);

/**
 * Hook for Client Components that need the current tenant ID.
 * Returns null if not in a tenant context.
 */
export function useTenantId(): string | null {
  return useContext(TenantContext);
}

interface TenantProviderProps {
  tenantId: string | null;
  children: React.ReactNode;
}

/**
 * Provides tenant ID to Client Components.
 * Used by layout after resolving tenant from request headers.
 */
export function TenantProvider({ tenantId, children }: TenantProviderProps) {
  return (
    <TenantContext.Provider value={tenantId}>
      {children}
    </TenantContext.Provider>
  );
}
