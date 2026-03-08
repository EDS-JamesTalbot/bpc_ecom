import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getActiveTestimonials } from "@/src/db/queries/testimonials";
import { getPageSectionByKey } from "@/src/db/queries/page-sections";

/* ---------------------------------------------------------
   TESTIMONIALS PAGE COMPONENT
--------------------------------------------------------- */
export default async function TestimonialsPage() {
  // Fetch testimonials from database
  const testimonials = await getActiveTestimonials();
  
  // Fetch page sections
  const heroSection = await getPageSectionByKey('testimonials_hero');
  
  // Parse hero content with fallbacks
  let heroContent = {
    heading: "What Our Customers Say",
    subheading: "Lorem ipsum dolor sit amet, consectetur adipiscing elit sed do eiusmod"
  };
  
  if (heroSection?.content) {
    try {
      heroContent = JSON.parse(heroSection.content);
    } catch {
      // Use defaults if JSON parsing fails
    }
  }
  return (
    <div className="px-4 pt-6 pb-4 xl:pb-6 bg-gradient-to-br from-blue-50 via-sky-50 to-cyan-50 min-h-screen">
      <div className="mx-auto h-full max-w-[1800px]">

        {/* HERO SECTION */}
        <section className="mb-12 text-center">
          <div className="rounded-2xl bg-gradient-to-br from-[#e0f2fe] to-[#bfdbfe] p-12 shadow-xl">
            <h1 className="text-5xl font-bold text-[#0c4a6e] mb-6 whitespace-nowrap text-center">
              {heroContent.heading}
            </h1>
            <p className="text-2xl text-[#475569] leading-relaxed whitespace-nowrap text-center">
              {heroContent.subheading}
            </p>
          </div>
        </section>

        {/* TESTIMONIALS GRID */}
        <section className="mb-12">
          {testimonials.length === 0 ? (
            <div className="rounded-2xl bg-white p-12 shadow-lg text-center">
              <p className="text-xl text-[#475569]">
                No testimonials available at the moment.
              </p>
            </div>
          ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {testimonials.map((testimonial) => (
              <article
                key={testimonial.id}
                className="rounded-2xl bg-white/70 p-8 shadow-lg border-2 border-blue-300/50 hover:border-blue-400/70 transition-all backdrop-blur-sm"
              >
                <div className="mb-4 text-4xl text-primary">"</div>
                <p className="text-xl leading-relaxed text-[#475569] italic mb-6">
                  {testimonial.quote}
                </p>
                  {testimonial.authorName && (
                    <p className="text-lg font-semibold text-[#0c4a6e] mb-2">
                      — {testimonial.authorName}
                    </p>
                  )}
                  {testimonial.location && (
                <div className="flex items-center gap-2 text-primary font-semibold">
                  <span>📍</span>
                  <span>{testimonial.location}</span>
                </div>
                  )}
              </article>
            ))}
          </div>
          )}
        </section>

        {/* WHY CUSTOMERS LOVE US SECTION */}
        <section className="mb-12">
          <div className="rounded-2xl bg-gradient-to-br from-[#e0f2fe] to-[#bfdbfe] p-12 shadow-lg">
            <h2 className="text-4xl font-bold text-[#0c4a6e] mb-8 text-center">
              Why Customers Choose Us
            </h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="text-3xl">🌿</div>
                  <div>
                    <h3 className="text-xl font-semibold text-[#0c4a6e] mb-2">
                      Feature One
                    </h3>
                    <p className="text-xl leading-relaxed text-[#475569]">
                      Lorem ipsum dolor sit amet, consectetur adipiscing elit sed do eiusmod tempor
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="text-3xl">💙</div>
                  <div>
                    <h3 className="text-xl font-semibold text-[#0c4a6e] mb-2">
                      Feature Two
                    </h3>
                    <p className="text-xl leading-relaxed text-[#475569]">
                      Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="text-3xl">✨</div>
                  <div>
                    <h3 className="text-xl font-semibold text-[#0c4a6e] mb-2">
                      Feature Three
                    </h3>
                    <p className="text-xl leading-relaxed text-[#475569]">
                      Duis aute irure dolor in reprehenderit in voluptate velit esse cillum
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="text-3xl">🧼</div>
                  <div>
                    <h3 className="text-xl font-semibold text-[#0c4a6e] mb-2">
                      Feature Four
                    </h3>
                    <p className="text-xl leading-relaxed text-[#475569]">
                      Excepteur sint occaecat cupidatat non proident sunt in culpa qui officia
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="text-3xl">🏝️</div>
                  <div>
                    <h3 className="text-xl font-semibold text-[#0c4a6e] mb-2">
                      Feature Five
                    </h3>
                    <p className="text-xl leading-relaxed text-[#475569]">
                      Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="text-3xl">🌟</div>
                  <div>
                    <h3 className="text-xl font-semibold text-[#0c4a6e] mb-2">
                      Feature Six
                    </h3>
                    <p className="text-xl leading-relaxed text-[#475569]">
                      Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FEATURED PRODUCTS HIGHLIGHT */}
        <section className="mb-12">
          <div className="rounded-2xl bg-white p-12 shadow-lg">
            <h2 className="text-4xl font-bold text-[#0c4a6e] mb-8 text-center">
              Customer Favorite Products
            </h2>
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <div className="rounded-xl bg-gradient-to-br from-blue-50 to-sky-50/50 p-6 shadow-md border-2 border-blue-300/50">
                <h3 className="text-2xl font-semibold text-[#0c4a6e] mb-3">
                  Product One
                </h3>
                <p className="text-xl leading-relaxed text-[#475569] mb-3">
                  "Lorem ipsum dolor sit amet, consectetur adipiscing."
                </p>
                <p className="text-xl leading-relaxed text-[#475569] italic">
                  Sed do eiusmod tempor incididunt ut labore
                </p>
              </div>

              <div className="rounded-xl bg-gradient-to-br from-blue-50 to-sky-50/50 p-6 shadow-md border-2 border-blue-300/50">
                <h3 className="text-2xl font-semibold text-[#0c4a6e] mb-3">
                  Product Two
                </h3>
                <p className="text-xl leading-relaxed text-[#475569] mb-3">
                  "Ut enim ad minim veniam, quis nostrud."
                </p>
                <p className="text-xl leading-relaxed text-[#475569] italic">
                  Excepteur sint occaecat cupidatat non proident
                </p>
              </div>

              <div className="rounded-xl bg-gradient-to-br from-blue-50 to-sky-50/50 p-6 shadow-md border-2 border-blue-300/50">
                <h3 className="text-2xl font-semibold text-[#0c4a6e] mb-3">
                  Product Three
                </h3>
                <p className="text-xl leading-relaxed text-[#475569] mb-3">
                  "Duis aute irure dolor in reprehenderit."
                </p>
                <p className="text-xl leading-relaxed text-[#475569] italic">
                  Nemo enim ipsam voluptatem quia voluptas
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA SECTION */}
        <section className="text-center">
          <div className="rounded-2xl bg-gradient-to-br from-[#e0f2fe] to-[#bfdbfe] p-12 shadow-xl">
            <h2 className="text-4xl font-bold text-[#0c4a6e] mb-6">
              Experience the Difference Yourself
            </h2>
            <p className="text-xl text-[#475569] mb-8 max-w-2xl mx-auto">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore
            </p>
            <Link href="/shop">
              <Button 
                size="lg" 
                className="bg-[#1DA1F9] text-white hover:bg-[#0c4a6e] text-xl px-12 py-6 transition-colors"
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

