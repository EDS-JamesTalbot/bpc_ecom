"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Store } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type Tenant = { id: string; name: string; slug: string };

/**
 * Modal for super-admins to select which tenant/store to work on.
 * Fetches tenants from API, sets cookie on select, then refreshes.
 */
export function TenantSelectorModal({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const router = useRouter();
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(false);
  const [selecting, setSelecting] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setLoading(true);
      fetch("/api/super-admin/tenants")
        .then((res) => res.json())
        .then((data) => {
          setTenants(data.tenants ?? []);
        })
        .catch(() => setTenants([]))
        .finally(() => setLoading(false));
    }
  }, [open]);

  async function handleSelect(tenantId: string) {
    setSelecting(tenantId);
    try {
      const res = await fetch("/api/super-admin/select-tenant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tenantId }),
      });
      if (res.ok) {
        onOpenChange(false);
        router.refresh();
      }
    } finally {
      setSelecting(null);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Store className="h-5 w-5" />
            Switch store
          </DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">
          Select the tenant/store you want to work on.
        </p>
        {loading ? (
          <p className="text-sm text-muted-foreground">Loading tenants…</p>
        ) : tenants.length === 0 ? (
          <p className="text-sm text-muted-foreground">No tenants found.</p>
        ) : (
          <ul className="space-y-2">
            <li>
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start text-muted-foreground"
                onClick={() => handleSelect('')}
                disabled={!!selecting}
              >
                {selecting === '' ? "Clearing…" : "Clear selection (use URL default)"}
              </Button>
            </li>
            {tenants.map((t) => (
              <li key={t.id}>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => handleSelect(t.id)}
                  disabled={!!selecting}
                >
                  {selecting === t.id ? "Switching…" : t.name}
                  {t.slug && (
                    <span className="ml-2 text-muted-foreground text-xs">
                      ({t.slug})
                    </span>
                  )}
                </Button>
              </li>
            ))}
          </ul>
        )}
      </DialogContent>
    </Dialog>
  );
}
