import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getPageSectionByKey } from "@/src/db/queries/page-sections";

export default async function Home() {
  // Fetch page sections from database
  const heroSection = await getPageSectionByKey('home_hero');
  const aboutSection = await getPageSectionByKey('home_about');
  const whyChooseSection = await getPageSectionByKey('home_why_choose');
  const ctaSection = await getPageSectionByKey('home_cta');
  
  // Parse content with fallbacks
  let heroContent = {
    heading: "Welcome to Our Store",
    subheading: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor.",
    buttonText: "Shop Now",
    buttonLink: "/shop"
  };
  
  let aboutContent = {
    heading: "Our Story",
    paragraphs: [
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.",
      "Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit."
    ]
  };
  
  let whyChooseContent = {
    heading: "Why Customers Choose Us",
    features: [
      { icon: "🌿", title: "Feature One", description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore." },
      { icon: "✨", title: "Feature Two", description: "Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo." },
      { icon: "💙", title: "Feature Three", description: "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur." }
    ]
  };
  
  let ctaContent = {
    heading: "Experience the Difference Yourself",
    text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore",
    buttonText: "Shop Now",
    buttonLink: "/shop"
  };
  
  try {
    if (heroSection?.content) {
      const parsed = JSON.parse(heroSection.content);
      // Update individual fields if they exist
      if (parsed.heading) heroContent.heading = parsed.heading;
      if (parsed.subheading) heroContent.subheading = parsed.subheading;
      if (parsed.buttonText) heroContent.buttonText = parsed.buttonText;
      if (parsed.buttonLink) heroContent.buttonLink = parsed.buttonLink;
    }
    
    if (aboutSection?.content) {
      const parsed = JSON.parse(aboutSection.content);
      
      // Handle heading
      if (parsed.heading) {
        aboutContent.heading = parsed.heading;
      }
      
      // Handle paragraphs - accept both array and single string
      if (parsed.paragraphs) {
        if (Array.isArray(parsed.paragraphs)) {
          aboutContent.paragraphs = parsed.paragraphs;
        } else if (typeof parsed.paragraphs === 'string') {
          // Convert single string to array
          aboutContent.paragraphs = [parsed.paragraphs];
        }
      }
    }
    
    if (whyChooseSection?.content) {
      const parsed = JSON.parse(whyChooseSection.content);
      
      // Handle heading
      if (parsed.heading) {
        whyChooseContent.heading = parsed.heading;
      }
      
      // Handle features - must be an array of objects
      if (parsed.features && Array.isArray(parsed.features)) {
        whyChooseContent.features = parsed.features;
      }
    }
    
    if (ctaSection?.content) {
      const parsed = JSON.parse(ctaSection.content);
      // Update individual fields if they exist
      if (parsed.heading) ctaContent.heading = parsed.heading;
      if (parsed.text) ctaContent.text = parsed.text;
      if (parsed.buttonText) ctaContent.buttonText = parsed.buttonText;
      if (parsed.buttonLink) ctaContent.buttonLink = parsed.buttonLink;
    }
  } catch (error) {
    console.error('Error parsing page sections:', error);
    // Use defaults if JSON parsing fails
  }
  return (
    <div className="px-4 pt-6 pb-4 xl:pb-6 bg-gradient-to-br from-blue-50 via-sky-50 to-cyan-50 min-h-screen">
      <div className="mx-auto h-full max-w-[1800px]">
        
        {/* HERO SECTION */}
        <section className="mb-12 rounded-2xl overflow-hidden shadow-xl">
          <div className="bg-gradient-to-br from-[#e0f2fe] to-[#bfdbfe] px-6 py-8 md:px-8 md:py-10 flex flex-col items-center justify-center text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-[#0c4a6e] mb-3 md:mb-4 whitespace-nowrap">
              {heroContent.heading}
            </h1>
            <p className="text-lg md:text-xl text-[#475569] mb-5 md:mb-6 whitespace-nowrap">
              {heroContent.subheading}
            </p>
            <Link href={heroContent.buttonLink}>
              <Button 
                size="lg" 
                className="bg-[#1DA1F9] text-white hover:bg-[#0c4a6e] text-lg md:text-xl px-8 py-4 md:px-10 md:py-5 transition-colors"
              >
                {heroContent.buttonText}
              </Button>
            </Link>
          </div>
        </section>

        {/* ABOUT SECTION */}
        <section className="mb-12">
          <div className="rounded-2xl bg-white p-12 shadow-lg text-center">
            <h2 className="text-4xl font-bold text-[#0c4a6e] mb-6">
              {aboutContent.heading}
            </h2>
            <div className="space-y-6">
              {aboutContent.paragraphs.map((paragraph, index) => (
                <p key={index} className="text-xl leading-relaxed text-[#475569]">
                  {paragraph}
              </p>
              ))}
            </div>
          </div>
        </section>

        {/* WHY CHOOSE US SECTION */}
        <section className="mb-12">
          <div className="rounded-2xl bg-gradient-to-br from-[#e0f2fe] to-[#bfdbfe] p-12 shadow-lg">
            <h2 className="text-4xl font-bold text-[#0c4a6e] mb-8 text-center">
              {whyChooseContent.heading}
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              {whyChooseContent.features.map((feature, index) => (
                <div 
                  key={index}
                  className="rounded-xl bg-white/70 p-8 shadow-md border-2 border-blue-300/50 hover:border-blue-400/70 transition-all backdrop-blur-sm"
                >
                <h3 className="text-2xl font-semibold text-[#0c4a6e] mb-4">
                    {feature.icon} {feature.title}
                </h3>
                <p className="text-lg leading-relaxed text-[#475569]">
                    {feature.description}
                </p>
              </div>
              ))}
            </div>
          </div>
        </section>

        {/* CUSTOMER FAVORITE PRODUCTS */}
        <section className="mb-12">
          <div className="rounded-2xl bg-white p-12 shadow-lg">
            <h2 className="text-4xl font-bold text-[#0c4a6e] mb-8 text-center">
              Customer Favorite Products
            </h2>
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <div className="rounded-xl bg-gradient-to-br from-slate-50 to-blue-50 p-6 shadow-md border-2 border-blue-300/50 hover:border-blue-400/70 transition-all">
                <h3 className="text-2xl font-semibold text-[#0c4a6e] mb-3">
                  Product One
                </h3>
                <p className="text-lg leading-relaxed text-[#475569] mb-3">
                  "Lorem ipsum dolor sit amet, consectetur adipiscing."
                </p>
                <p className="text-lg leading-relaxed text-[#475569] italic">
                  Sed do eiusmod tempor incididunt ut labore
                </p>
              </div>

              <div className="rounded-xl bg-gradient-to-br from-slate-50 to-blue-50 p-6 shadow-md border-2 border-blue-300/50 hover:border-blue-400/70 transition-all">
                <h3 className="text-2xl font-semibold text-[#0c4a6e] mb-3">
                  Product Two
                </h3>
                <p className="text-lg leading-relaxed text-[#475569] mb-3">
                  "Ut enim ad minim veniam, quis nostrud."
                </p>
                <p className="text-lg leading-relaxed text-[#475569] italic">
                  Excepteur sint occaecat cupidatat non proident
                </p>
              </div>

              <div className="rounded-xl bg-gradient-to-br from-slate-50 to-blue-50 p-6 shadow-md border-2 border-blue-300/50 hover:border-blue-400/70 transition-all">
                <h3 className="text-2xl font-semibold text-[#0c4a6e] mb-3">
                  Product Three
                </h3>
                <p className="text-lg leading-relaxed text-[#475569] mb-3">
                  "Duis aute irure dolor in reprehenderit."
                </p>
                <p className="text-lg leading-relaxed text-[#475569] italic">
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
              {ctaContent.heading}
            </h2>
            <p className="text-xl text-[#475569] mb-8 max-w-2xl mx-auto">
              {ctaContent.text}
            </p>
            <Link href={ctaContent.buttonLink}>
              <Button 
                size="lg" 
                className="bg-[#1DA1F9] text-white hover:bg-[#0c4a6e] text-xl px-12 py-6 transition-colors"
              >
                {ctaContent.buttonText}
              </Button>
            </Link>
          </div>
        </section>

      </div>
    </div>
  );
}
