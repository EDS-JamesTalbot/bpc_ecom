import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getSiteSettingByKey } from "@/src/db/queries/site-settings";
import { getPageSectionByKey } from "@/src/db/queries/page-sections";
import { getTenantSlugForRequest } from "@/lib/tenant-context";
import { withTenantPrefix } from "@/lib/tenant-utils";

export default async function ContactPage() {
  const tenantSlug = await getTenantSlugForRequest();
  // Fetch site settings
  const contactEmail = await getSiteSettingByKey('contact_email');
  const contactPhone = await getSiteSettingByKey('contact_phone');
  
  // Fetch page sections
  const headerSection = await getPageSectionByKey('contact_header');
  const bulkOrdersSection = await getPageSectionByKey('contact_bulk_orders');
  const shippingSection = await getPageSectionByKey('contact_shipping');
  const internationalSection = await getPageSectionByKey('contact_international');
  
  // Parse content with fallbacks
  let headerContent = {
    heading: "Contact & Ordering Information",
    subheading: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor."
  };
  
  let bulkOrdersContent = {
    heading: "Bulk Orders",
    text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco."
  };
  
  let shippingContent = {
    heading: "Shipping Options",
    text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur."
  };
  
  let internationalContent = {
    heading: "International Shipping",
    text: "Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium."
  };
  
  try {
    if (headerSection?.content) headerContent = JSON.parse(headerSection.content);
    if (bulkOrdersSection?.content) bulkOrdersContent = JSON.parse(bulkOrdersSection.content);
    if (shippingSection?.content) shippingContent = JSON.parse(shippingSection.content);
    if (internationalSection?.content) internationalContent = JSON.parse(internationalSection.content);
  } catch {
    // Use defaults if JSON parsing fails
  }
  return (
    <div className="px-4 pt-6 pb-4 xl:pb-6 bg-gradient-to-br from-blue-50 via-sky-50 to-cyan-50 min-h-screen">
      <div className="mx-auto max-w-[1800px]">
        
        {/* HEADER BANNER */}
        <section className="mb-8">
          <div className="rounded-2xl bg-gradient-to-br from-[#e0f2fe] to-[#bfdbfe] p-8 md:p-12 shadow-lg text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-[#0c4a6e] mb-4">
              {headerContent.heading}
            </h1>
            <p className="text-xl text-[#475569]">
              {headerContent.subheading}
            </p>
          </div>
        </section>

        {/* CONTACT INFORMATION */}
        <section className="mb-8">
          <div className="rounded-2xl bg-white p-8 md:p-12 shadow-lg text-center">
            <h2 className="text-3xl font-bold text-[#0c4a6e] mb-6">
              Get In Touch
            </h2>
            <div className="space-y-4 mb-6">
              {contactEmail && (
              <div className="flex items-center justify-center gap-3">
                <span className="text-2xl">📧</span>
                <div>
                  <p className="text-lg font-medium text-[#0c4a6e] mb-1">Email</p>
                  <a 
                      href={`mailto:${contactEmail.settingValue}`}
                    className="text-xl text-primary hover:underline"
                  >
                      {contactEmail.settingValue}
                  </a>
                </div>
              </div>
              )}
              {contactPhone && (
              <div className="flex items-center justify-center gap-3">
                <span className="text-2xl">📞</span>
                <div>
                  <p className="text-lg font-medium text-[#0c4a6e] mb-1">Phone</p>
                  <a 
                      href={`tel:${contactPhone.settingValue.replace(/\s/g, '')}`}
                    className="text-xl text-primary hover:underline"
                  >
                      {contactPhone.settingValue}
                  </a>
                </div>
              </div>
              )}
              {!contactEmail && !contactPhone && (
                <p className="text-lg text-[#475569]">
                  Contact information will be displayed here once configured.
                </p>
              )}
            </div>
          </div>
        </section>

        {/* BULK ORDERS */}
        <section className="mb-8">
          <div className="rounded-2xl bg-gradient-to-br from-[#e0f2fe] to-[#bfdbfe] p-8 md:p-12 shadow-lg text-center">
            <h2 className="text-3xl font-bold text-[#0c4a6e] mb-4">
              {bulkOrdersContent.heading}
            </h2>
            <p className="text-xl leading-relaxed text-[#475569]">
              {bulkOrdersContent.text}
            </p>
          </div>
        </section>

        {/* SHIPPING OPTIONS */}
        <section className="mb-8">
          <div className="rounded-2xl bg-white p-8 md:p-12 shadow-lg text-center">
            <h2 className="text-3xl font-bold text-[#0c4a6e] mb-4">
              {shippingContent.heading}
            </h2>
            <p className="text-lg leading-relaxed text-[#475569]">
              {shippingContent.text}
            </p>
          </div>
        </section>

        {/* INTERNATIONAL SHIPPING */}
        <section className="mb-8">
          <div className="rounded-2xl bg-gradient-to-br from-[#e0f2fe] to-[#bfdbfe] p-8 md:p-12 shadow-lg text-center">
            <h2 className="text-3xl font-bold text-[#0c4a6e] mb-4">
              {internationalContent.heading}
            </h2>
            <p className="text-lg leading-relaxed text-[#475569]">
              {internationalContent.text}
            </p>
          </div>
        </section>

        {/* CTA SECTION */}
        <section className="text-center">
          <div className="rounded-2xl bg-white p-8 md:p-12 shadow-lg">
            <h2 className="text-3xl font-bold text-[#0c4a6e] mb-4">
              Ready to Order?
            </h2>
            <p className="text-xl text-[#475569] mb-6">
              Browse our selection of products
            </p>
            <Link href={withTenantPrefix('/shop', tenantSlug)}>
              <Button 
                size="lg" 
                className="bg-[#1DA1F9] text-white hover:bg-[#0c4a6e] text-xl px-10 py-6 transition-colors"
              >
                Shop Now
              </Button>
            </Link>
          </div>
        </section>

      </div>
    </div>
  );
}

