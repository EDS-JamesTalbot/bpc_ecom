'use client';

/**
 * Client-side gate that redirects to maintenance on every navigation
 * when admin is active. Handles client-side Link clicks (which don't
 * trigger the layout's server-side redirect).
 */

import { usePathname } from 'next/navigation';
import { useEffect, useRef } from 'react';

export function MaintenanceGate() {
  const pathname = usePathname();
  const lastCheck = useRef<string | null>(null);

  useEffect(() => {
    // Skip if already on maintenance page
    if (pathname?.startsWith('/maintenance')) return;

    // Avoid duplicate checks for same pathname in quick succession
    const key = pathname ?? '';
    if (lastCheck.current === key) return;
    lastCheck.current = key;

    fetch('/api/maintenance-check')
      .then((res) => res.json())
      .then((data) => {
        if (data.showMaintenance) {
          window.location.href = '/maintenance';
        }
      })
      .catch(() => {});
  }, [pathname]);

  return null;
}
