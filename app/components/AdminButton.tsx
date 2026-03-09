"use client";

import { useState, useRef } from "react";
import { SignInButton, SignedIn, SignedOut, UserButton, useUser } from "@clerk/nextjs";
import { Lock, Unlock, Clock } from "lucide-react";
import { useTenantId } from "./TenantProvider";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

/**
 * AdminButton Component
 * Uses Clerk for secure authentication
 * 
 * Shows:
 * - "Admin Login" button when user is not signed in
 * - User avatar + "Admin" badge when admin is signed in
 * - User avatar only when non-admin is signed in
 * 
 * Blocks admin login when a customer payment is in progress.
 * 
 * Admin Role Configuration:
 * - Set in Clerk Dashboard → Users → [User] → Metadata
 * - Add: { "role": "admin" } to Public Metadata
 */
export function AdminButton() {
  const { user } = useUser();
  const [showPendingModal, setShowPendingModal] = useState(false);
  const signInTriggerRef = useRef<HTMLButtonElement>(null);
  
  // Check if user has admin role AND tenant access (1 client = 1 tenant)
  const tenantId = useTenantId();
  const userTenantId = user?.publicMetadata?.tenantId as string | undefined;
  const isAdmin = user?.publicMetadata?.role === 'admin' && (
    !userTenantId || (tenantId && userTenantId === tenantId)
  );

  const handleAdminLoginClick = async () => {
    try {
      const res = await fetch('/api/checkout-pending');
      const { pending } = await res.json();
      if (pending) {
        setShowPendingModal(true);
      } else {
        signInTriggerRef.current?.click();
      }
    } catch {
      signInTriggerRef.current?.click();
    }
  };

  return (
    <>
      {/* User is NOT signed in */}
      <SignedOut>
        <SignInButton mode="modal">
          <button
            ref={signInTriggerRef}
            type="button"
            className="hidden"
            aria-hidden
          />
        </SignInButton>
        <Button
          variant="outline"
          size="sm"
          className="rounded-full gap-2 border-2 border-[#1DA1F9] bg-[#1DA1F9] text-white hover:bg-[#0c4a6e] hover:border-[#0c4a6e]"
          onClick={handleAdminLoginClick}
        >
          <Lock className="h-4 w-4" />
          Admin Login
        </Button>
      </SignedOut>

      {/* Modal: transaction pending - admin must wait */}
      <Dialog open={showPendingModal} onOpenChange={setShowPendingModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-amber-500" />
              Please wait
            </DialogTitle>
          </DialogHeader>
          <p className="text-muted-foreground">
            A customer transaction is currently in progress. Please wait until it has finished before signing in as admin.
          </p>
        </DialogContent>
      </Dialog>

      {/* User IS signed in */}
      <SignedIn>
        <div className="flex items-center gap-2">
          {/* Show admin status badge if user has admin role */}
          {isAdmin && (
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-[#1DA1F9] text-white text-sm font-semibold shadow-lg border-2 border-[#1DA1F9]">
              <Unlock className="h-4 w-4" />
              Admin
            </div>
          )}
          
          {/* Clerk's built-in user menu button */}
          <UserButton 
            afterSignOutUrl="/api/admin-signout-callback"
            appearance={{
              elements: {
                avatarBox: "h-9 w-9 rounded-full border-2 border-[#1DA1F9]",
              },
            }}
          />
        </div>
      </SignedIn>
    </>
  );
}
