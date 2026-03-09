"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { useTenantId } from "./TenantProvider";
import { useTenantSlug } from "@/app/hooks/useTenantSlug";
import { withTenantPrefix } from "@/lib/tenant-utils";

export function Navigation() {
  const pathname = usePathname();
  const tenantSlug = useTenantSlug();
  const { user } = useUser();
  const tenantId = useTenantId();
  const userTenantId = user?.publicMetadata?.tenantId as string | undefined;

  // Admin with tenant access (1 client = 1 tenant)
  const isAdmin = user?.publicMetadata?.role === 'admin' && (
    !userTenantId || (tenantId && userTenantId === tenantId)
  );

  const links = [
    { href: "/", label: "Home" },
    { href: "/shop", label: "Shop" },
    { href: "/testimonials", label: "Testimonials" },
    { href: "/contact", label: "Contact" },
    { href: "/admin/content", label: "Content", adminOnly: true }, // Admin content dashboard
    { href: "/admin/sales", label: "Sales", adminOnly: true }, // Admin sales dashboard
    { href: "/help", label: "Help", adminOnly: true }, // Admin help guide
  ];

  return (
    <nav className="site-nav flex gap-8" style={{ fontFamily: 'var(--font_menus)' }}>
      {links.map((link) => {
        // Skip admin-only links if user is not an admin
        if (link.adminOnly && !isAdmin) {
          return null;
        }

        const href = withTenantPrefix(link.href, tenantSlug);
        // For home, exact match; for others, check if pathname starts with the link href
        const isActive = link.href === "/" 
          ? pathname === "/" || pathname === `/${tenantSlug}` || pathname === `/${tenantSlug}/`
          : pathname.startsWith(href);
        
        return (
          <Link
            key={link.href}
            href={href}
            className={`
              text-lg font-semibold transition-colors px-4 py-2 rounded-lg
              ${
                isActive
                  ? "bg-[var(--nav_link_active_bg)] text-[var(--nav_link_active_text)] hover:bg-[var(--nav_link_active_hover)]"
                  : "text-[var(--nav_link)] hover:!text-primary hover:!bg-white"
              }
            `}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}

