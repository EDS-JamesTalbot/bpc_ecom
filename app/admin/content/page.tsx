import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { requireAdminWithTenantAccess } from '@/lib/admin-auth';
import { getAllProducts } from '@/src/db/queries/products';
import { getAllTestimonials } from '@/src/db/queries/testimonials';
import { getAllPageSections } from '@/src/db/queries/page-sections';
import { getAllSiteSettings } from '@/src/db/queries/site-settings';

export default async function AdminContentDashboard() {
  try {
    await requireAdminWithTenantAccess();
  } catch {
    redirect('/shop');
  }
  let products, testimonials, pageSections, siteSettings;
  
  try {
    [products, testimonials, pageSections, siteSettings] = await Promise.all([
      getAllProducts(),
      getAllTestimonials(),
      getAllPageSections(),
      getAllSiteSettings(),
    ]);
  } catch (error) {
    console.error('Error loading content dashboard data:', error);
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="rounded-2xl bg-red-50 p-8 border-2 border-red-200">
          <h1 className="text-2xl font-bold text-red-600 mb-2">Error Loading Content</h1>
          <p className="text-red-800">Failed to load dashboard data. Check the console for details.</p>
          <p className="text-sm text-red-600 mt-2">{error instanceof Error ? error.message : 'Unknown error'}</p>
        </div>
      </div>
    );
  }

  const activeProducts = products.filter(p => p.isActive).length;
  const activeTestimonials = testimonials.filter(t => t.isActive).length;
  const activeSections = pageSections.filter(s => s.isActive).length;
  const themeSettings = siteSettings.filter(s => s.category === 'theme').length;
  const nonThemeSettings = siteSettings.filter(s => s.category !== 'theme').length;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-secondary-foreground mb-2">
          Content Management Dashboard
        </h1>
        <p className="text-lg text-muted-foreground">
          Manage all content on your website from this central dashboard.
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Shop Card */}
        <div className="rounded-2xl bg-white p-8 shadow-lg border-2 border-blue-300/50 flex flex-col">
          <div className="mb-4 flex-1">
            <h2 className="text-2xl font-bold text-secondary-foreground mb-2">
              Shop
            </h2>
            <p className="text-sm text-muted-foreground mb-4 min-h-[2.5rem]">
              Add, edit, and manage products in your store
            </p>
            <div className="flex gap-4 text-sm">
              <div>
                <span className="font-semibold">{products.length}</span> Total
              </div>
              <div>
                <span className="font-semibold text-green-600">{activeProducts}</span> Active
              </div>
            </div>
          </div>
          <Link href="/shop">
            <Button className="w-full !bg-primary hover:!bg-secondary-foreground !text-white shadow">
              Manage Products
            </Button>
          </Link>
        </div>

        {/* Testimonials Card */}
        <div className="rounded-2xl bg-white p-8 shadow-lg border-2 border-blue-300/50 flex flex-col">
          <div className="mb-4 flex-1">
            <h2 className="text-2xl font-bold text-secondary-foreground mb-2">
              Testimonials
            </h2>
            <p className="text-sm text-muted-foreground mb-4 min-h-[2.5rem]">
              Manage customer reviews and testimonials
            </p>
            <div className="flex gap-4 text-sm">
              <div>
                <span className="font-semibold">{testimonials.length}</span> Total
              </div>
              <div>
                <span className="font-semibold text-green-600">{activeTestimonials}</span> Active
              </div>
            </div>
          </div>
          <Link href="/admin/content/testimonials">
            <Button className="w-full !bg-primary hover:!bg-secondary-foreground !text-white shadow">
              Manage Testimonials
            </Button>
          </Link>
        </div>

        {/* Page Sections Card */}
        <div className="rounded-2xl bg-white p-8 shadow-lg border-2 border-blue-300/50 flex flex-col">
          <div className="mb-4 flex-1">
            <h2 className="text-2xl font-bold text-secondary-foreground mb-2">
              Page Sections
            </h2>
            <p className="text-sm text-muted-foreground mb-4 min-h-[2.5rem]">
              Edit content for home, contact, and other pages
            </p>
            <div className="flex gap-4 text-sm">
              <div>
                <span className="font-semibold">{pageSections.length}</span> Total
              </div>
              <div>
                <span className="font-semibold text-green-600">{activeSections}</span> Active
              </div>
            </div>
          </div>
          <Link href="/admin/content/page-sections">
            <Button className="w-full !bg-primary hover:!bg-secondary-foreground !text-white shadow">
              Manage Page Sections
            </Button>
          </Link>
        </div>

        {/* Site Settings Card */}
        <div className="rounded-2xl bg-white p-8 shadow-lg border-2 border-blue-300/50 flex flex-col">
          <div className="mb-4 flex-1">
            <h2 className="text-2xl font-bold text-secondary-foreground mb-2">
              Site Settings
            </h2>
            <p className="text-sm text-muted-foreground mb-4 min-h-[2.5rem]">
              Update contact info, social links, and more
            </p>
            <div className="flex gap-4 text-sm">
              <div>
                <span className="font-semibold">{nonThemeSettings}</span> Settings
              </div>
            </div>
          </div>
          <Link href="/admin/content/site-settings">
            <Button className="w-full !bg-primary hover:!bg-secondary-foreground !text-white shadow">
              Manage Settings
            </Button>
          </Link>
        </div>

        {/* Sales Card */}
        <div className="rounded-2xl bg-white p-8 shadow-lg border-2 border-green-300/50 flex flex-col">
          <div className="mb-4 flex-1">
            <h2 className="text-2xl font-bold text-secondary-foreground mb-2">
              Sales
            </h2>
            <p className="text-sm text-muted-foreground mb-4 min-h-[2.5rem]">
              View product sales summary, top customers, and trends
            </p>
          </div>
          <Link href="/admin/sales">
            <Button className="w-full !bg-primary hover:!bg-secondary-foreground !text-white shadow">
              View Sales
            </Button>
          </Link>
        </div>

        {/* Theme Editor Card */}
        <div className="rounded-2xl bg-gradient-to-br from-purple-50 to-pink-50 p-8 shadow-lg border-2 border-purple-300/50 flex flex-col">
          <div className="mb-4 flex-1">
            <h2 className="text-2xl font-bold text-purple-900 mb-2 flex items-center gap-2">
              🎨 Theme Editor
            </h2>
            <p className="text-sm text-purple-700 mb-4 min-h-[2.5rem]">
              Change colours and fonts — webpage, header, buttons, menus, product cards
            </p>
            <div className="flex gap-4 text-sm">
              <div>
                <span className="font-semibold">{themeSettings}</span> Theme Settings
              </div>
            </div>
          </div>
          <Link href="/admin/content/theme-editor">
            <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white">
              Edit Theme
            </Button>
          </Link>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="rounded-2xl bg-secondary p-8 shadow-lg">
        <h2 className="text-2xl font-bold text-secondary-foreground mb-4">
          Quick Stats
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-6 gap-6">
          <div className="text-center">
            <div className="text-4xl font-bold text-secondary-foreground">{products.length}</div>
            <div className="text-sm text-muted-foreground">Total Products</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-secondary-foreground">{testimonials.length}</div>
            <div className="text-sm text-muted-foreground">Total Testimonials</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-secondary-foreground">{pageSections.length}</div>
            <div className="text-sm text-muted-foreground">Page Sections</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-secondary-foreground">{nonThemeSettings}</div>
            <div className="text-sm text-muted-foreground">Site Settings</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-purple-600">{themeSettings}</div>
            <div className="text-sm text-muted-foreground">Theme Variables</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-green-600">{activeProducts}</div>
            <div className="text-sm text-muted-foreground">Active Products</div>
          </div>
        </div>
      </div>

      {/* Help Section */}
      <div className="mt-8 rounded-2xl bg-white p-8 shadow-lg">
        <h2 className="text-2xl font-bold text-secondary-foreground mb-4">
          Getting Started
        </h2>
        <div className="space-y-3 text-muted-foreground">
          <p className="flex items-start gap-2">
            <span className="flex-shrink-0">🛍️</span>
            <span><strong>Shop:</strong> Add, edit, or remove products from your store. Manage pricing, images, descriptions, and product availability.</span>
          </p>
          <p className="flex items-start gap-2">
            <span className="flex-shrink-0">📝</span>
            <span><strong>Testimonials:</strong> Add, edit, or remove customer testimonials. Toggle them active/inactive to control visibility.</span>
          </p>
          <p className="flex items-start gap-2">
            <span className="flex-shrink-0">📄</span>
            <span><strong>Page Sections:</strong> Edit content sections for your home page, testimonials page, and contact page. Content is stored as JSON for flexibility.</span>
          </p>
          <p className="flex items-start gap-2">
            <span className="flex-shrink-0">⚙️</span>
            <span><strong>Site Settings:</strong> Update global settings like contact email, phone number, and other site-wide information.</span>
          </p>
          <p className="flex items-start gap-2">
            <span className="flex-shrink-0">🎨</span>
            <span><strong>Theme Editor:</strong> Change colours (webpage background, header bar, buttons, text, borders, etc.) and fonts for buttons, menus, and product cards. No coding — pick colours and choose fonts from dropdowns, then save.</span>
          </p>
        </div>
      </div>
    </div>
  );
}

