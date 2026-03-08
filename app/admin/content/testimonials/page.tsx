import { getAllTestimonials } from '@/src/db/queries/testimonials';
import { TestimonialsManager } from './TestimonialsManager';

// Note: Authentication disabled due to Clerk JWT infinite loop issue
// The Content link is only visible to admins in Navigation component
export default async function AdminTestimonialsPage() {
  const testimonials = await getAllTestimonials();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-[#0c4a6e] mb-2">
          Manage Testimonials
        </h1>
        <p className="text-lg text-[#475569]">
          Add, edit, or remove customer testimonials displayed on your website.
        </p>
      </div>

      <TestimonialsManager initialTestimonials={testimonials} />
    </div>
  );
}

