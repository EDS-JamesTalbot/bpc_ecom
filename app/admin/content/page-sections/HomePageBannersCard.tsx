'use client';

import { Button } from '@/components/ui/button';
import type { PageSection } from '@/src/db/schema';

const KEY_SECTIONS = [
  { key: 'home_why_choose', label: 'Why Customers Choose Us', description: 'Features with icons' },
  { key: 'home_favorite_products', label: 'Customer Favorite Products', description: 'Product highlights' },
  { key: 'home_cta', label: 'Experience the Difference', description: 'CTA banner (bottom of home & testimonials)' },
] as const;

interface HomePageBannersCardProps {
  pageSections: PageSection[];
  onEdit: (section: PageSection) => void;
  onCreate: (sectionKey: string) => void;
}

export function HomePageBannersCard({ pageSections, onEdit, onCreate }: HomePageBannersCardProps) {
  return (
    <div className="rounded-2xl bg-white p-8 shadow-lg border-2 border-blue-300/50 mb-8">
      <h2 className="text-2xl font-bold text-[#0c4a6e] mb-2">
        Home Page Banners
      </h2>
      <p className="text-sm text-[#475569] mb-6">
        Quick access to the main home page sections. Filter by &quot;Home&quot; below to see all.
      </p>
      <div className="grid gap-4 md:grid-cols-3">
        {KEY_SECTIONS.map(({ key, label, description }) => {
          const section = pageSections.find((s) => s.sectionKey === key);
          return (
            <div
              key={key}
              className="rounded-xl border-2 border-blue-200/50 p-4 flex flex-col"
            >
              <h3 className="font-semibold text-[#0c4a6e] mb-1">{label}</h3>
              <p className="text-xs text-[#475569] mb-3 flex-1">{description}</p>
              {section ? (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onEdit(section)}
                  className="hover:bg-[#0c4a6e] hover:text-white hover:border-[#0c4a6e]"
                >
                  Edit
                </Button>
              ) : (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onCreate(key)}
                  className="border-amber-400 text-amber-700 hover:bg-amber-50"
                >
                  Add Section
                </Button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
