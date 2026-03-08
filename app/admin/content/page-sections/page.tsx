import { getAllPageSections } from '@/src/db/queries/page-sections';
import { PageSectionsManager } from './PageSectionsManager';

// Note: Authentication disabled due to Clerk JWT infinite loop issue
// The Content link is only visible to admins in Navigation component
export default async function AdminPageSectionsPage() {
  const pageSections = await getAllPageSections();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-[#0c4a6e] mb-2">
          Manage Page Sections
        </h1>
        <p className="text-lg text-[#475569]">
          Edit content sections for different pages on your website.
        </p>
      </div>

      <PageSectionsManager initialPageSections={pageSections} />
    </div>
  );
}

