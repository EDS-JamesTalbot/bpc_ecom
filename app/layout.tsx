import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";

import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from '@clerk/nextjs';
import { auth, clerkClient } from '@clerk/nextjs/server';
import { CartProvider } from "./components/CartContext";
import { CartButton } from "./components/CartButton";
import { CartView } from "./components/CartView";
import { Navigation } from "./components/Navigation";
import { HeaderAdminButton } from "./components/HeaderAdminButton";
import { CustomerAccountButton } from "./components/CustomerAccountButton";
import { MaintenanceGate } from "./components/MaintenanceGate";
import { getSiteSettingByKey, getSiteSettingsByCategory } from "@/src/db/queries/site-settings";
import { setAdminActive, isAdminActive, clearAdminActive } from "@/lib/admin-session";
import { getTenantIdForRequest, getTenantSlugForRequest } from "@/lib/tenant-context";
import { TenantProvider } from "./components/TenantProvider";
import { redirect, notFound } from "next/navigation";

/* FONT SETUP */
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

/* META */
export const metadata: Metadata = {
  title: "E-Commerce Template",
  description: "Modern e-commerce website template with Next.js and BPC Payment Gateway.",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Admin-exclusive mode: when admin is logged in, all other users see maintenance
  const { userId } = await auth();
  let isAdmin = false;
  if (userId) {
    try {
      const client = await clerkClient();
      const user = await client.users.getUser(userId);
      isAdmin = (user.publicMetadata?.role as string) === 'admin';
    } catch {
      // If we can't fetch user, treat as non-admin
    }
  }

  // Resolve tenant from request (path, subdomain, custom domain, or default)
  let tenantId: string;
  try {
    tenantId = await getTenantIdForRequest();
  } catch (err) {
    if (err instanceof Error && err.message === 'TENANT_NOT_FOUND') {
      notFound();
    }
    throw err;
  }

  const tenantSlug = await getTenantSlugForRequest();
  const homeHref = tenantSlug ? `/${tenantSlug}` : '/';

  if (isAdmin) {
    await setAdminActive();
  } else {
    // Non-admin: clear admin state (handles sign-out when callback doesn't run)
    await clearAdminActive();
    const adminActive = await isAdminActive();
    if (adminActive) {
      redirect('/maintenance');
    }
  }

  // Fetch branding settings
  const storeNameSetting = await getSiteSettingByKey('store_name');
  const storeTaglineSetting = await getSiteSettingByKey('store_tagline');
  const storeLogoSetting = await getSiteSettingByKey('store_logo');
  
  const storeName = storeNameSetting?.settingValue || 'YOUR STORE';
  const storeTagline = storeTaglineSetting?.settingValue || 'Your tagline goes here';
  const storeLogo = storeLogoSetting?.settingValue || '';
  
  // Fetch theme settings (colour and radius only — no custom CSS)
  const themeSettings = await getSiteSettingsByCategory('theme');
  const themeCss = themeSettings
    .filter(s => s.settingKey !== 'theme_custom_css')
    .map(setting => {
      const cssVarName = setting.settingKey.replace('theme_', '--');
      return `${cssVarName}: ${setting.settingValue};`;
    })
    .join('\n    ');

  return (
    <ClerkProvider
      appearance={{
        elements: {
          // Main card container
          card: 'bg-gradient-to-br from-[#e0f2fe] to-[#bfdbfe] border-2 border-[#1DA1F9] shadow-lg',
          
          // Header styling
          headerTitle: 'text-[#0c4a6e] font-bold text-2xl',
          headerSubtitle: 'text-[#475569]',
          
          // Primary buttons (Continue, Sign In, etc.)
          formButtonPrimary: '!bg-[#1DA1F9] hover:!bg-[#0c4a6e] !text-white !font-semibold !shadow-md !transition-all',
          
          // Social login buttons (Google, GitHub)
          socialButtonsBlockButton: 'border-2 border-[#1DA1F9] bg-white hover:bg-[#e0f2fe] text-[#0c4a6e] font-medium transition-all',
          socialButtonsBlockButtonText: 'text-[#0c4a6e] font-medium',
          
          // Form inputs
          formFieldInput: 'border-2 border-[#1DA1F9] focus:border-[#0c4a6e] focus:ring-[#1DA1F9] bg-white text-[#0c4a6e]',
          formFieldLabel: 'text-[#0c4a6e] font-semibold',
          
          // Links (Sign up, Forgot password, etc.)
          footerActionLink: 'text-[#1DA1F9] hover:text-[#0c4a6e] font-semibold',
          
          // Divider text ("or")
          dividerText: 'text-[#64748b]',
          dividerLine: 'bg-[#bfdbfe]',
          
          // User button (avatar menu)
          userButtonPopoverCard: 'bg-gradient-to-br from-[#e0f2fe] to-[#bfdbfe] border-2 border-[#1DA1F9] shadow-lg',
          userButtonPopoverActionButton: 'hover:!bg-[#0c4a6e] !text-[#0c4a6e] hover:!text-white !transition-all !rounded-lg',
          userButtonPopoverActionButtonText: '!text-[#0c4a6e] !font-medium',
          userButtonPopoverActionButtonIcon: '!text-[#1DA1F9]',
          userButtonPopoverFooter: 'bg-[#e0f2fe] border-t-2 border-[#1DA1F9]',
          
          // User profile section in dropdown
          userPreviewMainIdentifier: 'text-[#0c4a6e] font-semibold',
          userPreviewSecondaryIdentifier: 'text-[#475569]',
          
          // Modal backdrop
          modalBackdrop: 'bg-[#0c4a6e]/50',
        },
      }}
    >
      <html lang="en">
        <head>
          {/* Dynamic Theme Variables */}
          <style dangerouslySetInnerHTML={{
            __html: `:root {
    ${themeCss}
  }`
          }} />
        </head>
        <body
          className={`
            ${geistSans.variable}
            ${geistMono.variable}
            text-foreground antialiased
          `}
        >
          <TenantProvider tenantId={tenantId}>
          <CartProvider>
            <MaintenanceGate />
            <div className="flex min-h-screen flex-col">

            {/* HEADER */}
            <header className="site-header sticky top-0 z-50 border-b border-border">
              <div className="mx-auto w-full max-w-[2400px] px-4 py-6 text-foreground sm:px-6">
                <div className="flex items-center justify-between gap-4">
                  {/* LOGO + BRAND */}
                  <Link href={homeHref} className="flex items-center gap-4 text-2xl font-semibold">
                    {storeLogo ? (
                      <img 
                        src={storeLogo} 
                        alt="Store Logo" 
                        className="h-20 w-auto object-contain rounded-lg"
                      />
                    ) : (
                      <div className="flex items-center justify-center bg-primary text-white font-bold text-xl h-20 w-30 rounded-lg">
                        LOGO
                      </div>
                    )}
                    <div className="leading-tight">
                      <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:gap-4">
                        <p className="text-5xl md:text-5xl font-semibold text-primary whitespace-nowrap">
                          {storeName}
                        </p>
                        <p className="text-2xl font-semibold uppercase tracking-[0.3em] text-[--tagline] whitespace-nowrap">
                          {storeTagline}
                        </p>
                      </div>
                    </div>
                  </Link>
                </div>

                {/* NAVIGATION + CUSTOMER ACCOUNT + CART BUTTON + ADMIN BUTTON */}
                <div className="mt-4 relative flex items-center justify-center">
                  <Navigation />
                  <div className="customer-account-position">
                    <CustomerAccountButton />
                  </div>
                  <div className="cart-button-position">
                    <CartButton />
                  </div>
                  <div className="admin-button-position">
                    <HeaderAdminButton />
                  </div>
                </div>
              </div>
            </header>

            {/* MAIN CONTENT */}
            <main className="flex-1">{children}</main>

            {/* FOOTER */}
            <footer className="bg-white border-t border-border py-6 text-center">
              <p className="text-sm text-[#64748b]">
                © {new Date().getFullYear()}{" "}
                <a 
                  href={`mailto:${process.env.BUSINESS_OWNER_EMAIL || 'contact@example.com'}`}
                  className="text-[#1DA1F9] hover:text-[#0c4a6e] hover:underline transition-colors"
                >
                  Easy Digital Solutions
                </a>
                . All rights reserved.
              </p>
            </footer>

            {/* CART VIEW */}
            <CartView />
          </div>
          </CartProvider>
          </TenantProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}


