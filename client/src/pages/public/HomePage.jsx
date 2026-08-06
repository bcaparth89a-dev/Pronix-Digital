import { lazy, Suspense } from "react";
import { HeroSection } from "@/components/public/homepage/HeroSection";

const ServicesSection = lazy(() =>
  import("@/components/public/homepage/ServicesSection").then((m) => ({ default: m.ServicesSection }))
);
const PortfolioSection = lazy(() =>
  import("@/components/public/homepage/PortfolioSection").then((m) => ({ default: m.PortfolioSection }))
);
const FAQSection = lazy(() =>
  import("@/components/public/homepage/FAQSection").then((m) => ({ default: m.FAQSection }))
);
const ContactCTASection = lazy(() =>
  import("@/components/public/homepage/ContactCTASection").then((m) => ({ default: m.ContactCTASection }))
);
const TestimonialsSection = lazy(() =>
  import("@/components/public/homepage/TestimonialsSection").then((m) => ({ default: m.TestimonialsSection }))
);
const FoundersSection = lazy(() =>
  import("@/components/public/homepage/FoundersSection").then((m) => ({ default: m.FoundersSection }))
);

// Fallback spinner that matches the site style and avoids shifts
function LazyFallback() {
  return <div className="min-h-[200px]" />;
}

export function HomePage() {
  return (
    <>
      {/* Hero and Capability marquee load statically to render above-the-fold immediately */}
      <HeroSection />

      {/* Remaining sections are loaded lazily below the fold */}
      <Suspense fallback={<LazyFallback />}>
        <ServicesSection />
      </Suspense>

      <Suspense fallback={<LazyFallback />}>
        <PortfolioSection />
      </Suspense>

      <Suspense fallback={<LazyFallback />}>
        <TestimonialsSection />
      </Suspense>

      <Suspense fallback={<LazyFallback />}>
        <FAQSection />
      </Suspense>

      <Suspense fallback={<LazyFallback />}>
        <FoundersSection />
      </Suspense>

      <Suspense fallback={<LazyFallback />}>
        <ContactCTASection />
      </Suspense>
    </>
  );
}
