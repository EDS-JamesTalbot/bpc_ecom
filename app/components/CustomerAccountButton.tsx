'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { User, LogOut } from 'lucide-react';
import { useUser } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import { customerLogout } from '@/app/actions/customer-auth-actions';

export function CustomerAccountButton() {
  const { user } = useUser();
  const isAdmin = user?.publicMetadata?.role === 'admin';
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
  const pathname = usePathname();
  const router = useRouter();
  
  // Check authentication status
  const checkAuth = async () => {
    try {
      const response = await fetch('/api/customer-session-check', {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache',
        },
      });
      const data = await response.json();
      setIsLoggedIn(data.isLoggedIn);
    } catch (error) {
      setIsLoggedIn(false);
    }
  };
  
  useEffect(() => {
    checkAuth();
  }, [pathname]); // Re-check when pathname changes
  
  // Handle logout
  const handleLogout = async () => {
    try {
      await customerLogout();
      setIsLoggedIn(false);
      router.push('/');
      router.refresh();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };
  
  // Don't render until we know the auth state
  if (isLoggedIn === null) {
    return null;
  }
  
  if (isLoggedIn) {
    return (
      <div className="flex items-center gap-2">
        <Link href="/my-account">
          <Button
            variant="outline"
            className="gap-2 border-primary text-primary hover:bg-primary hover:text-white"
          >
            <User className="h-4 w-4" />
            My Account
          </Button>
        </Link>
        <Button
          onClick={handleLogout}
          variant="outline"
          className="gap-2 border-red-300 text-red-600 hover:bg-red-50 hover:text-red-700"
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </Button>
      </div>
    );
  }
  
  return (
    <Link href="/customer-login" className={isAdmin ? 'pointer-events-none' : ''}>
      <Button
        variant="outline"
        disabled={isAdmin}
        className="gap-2 border-primary text-primary hover:bg-primary hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <User className="h-4 w-4" />
        Sign In
      </Button>
    </Link>
  );
}
