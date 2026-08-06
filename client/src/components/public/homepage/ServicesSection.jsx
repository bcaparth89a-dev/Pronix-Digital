import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import {
  Globe,
  Smartphone,
  Code2,
  TrendingUp,
  Palette,
  Fingerprint,
  Share2,
  Video,
  Zap,
  Layout,
  Sparkles,
  HelpCircle,
  X,
  ArrowRight,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { publicRoutes } from "@/config/navigation";
import { useServices } from "@/features/services/useServices";
import { FadeIn, FadeInItem, FadeInStagger } from "@/lib/motion";
import { cn } from "@/lib/utils";

const Icons = {
  Globe,
  Smartphone,
  Code2,
  TrendingUp,
  Palette,
  Fingerprint,
  Share2,
  Video,
  Zap,
  Layout,
  Sparkles,
  HelpCircle,
  X,
};

const SERVICES = [
  {
    icon: "Globe",
    title: "Business Websites",
    description: "High-performance websites that look premium, rank high on Google, and convert visitors into customers.",
    longDescription: "We build modern, high-performance web applications tailored to your business needs. Leveraging the latest standards in React, Next.js, Node.js, and cloud systems, our websites deliver lightning-fast load times, seamless responsiveness, and user experiences that capture visitors. We focus on search engine optimization (SEO), robust authentication, simple navigation, and secure payment integrations to ensure a smooth transition from visitors to active clients.",
  },
  {
    icon: "Smartphone",
    title: "Mobile Apps",
    description: "Beautiful, fast Android and iOS mobile applications tailored for your customers and employees.",
    longDescription: "Reach your customers wherever they are with premium cross-platform and native mobile applications. We design, prototype, and build beautiful mobile solutions using React Native, Flutter, and native mobile technologies. Our engineering covers offline capabilities, background sync, native push notifications, secure local storage, and integration with device features. We build with scale in mind, ensuring clean codebases and simple submission to the Google Play Store and Apple App Store.",
  },
  {
    icon: "Code2",
    title: "Software for business operations",
    description: "Bespoke internal systems, databases, automation, and workflow modernization.",
    longDescription: "Replace messy spreadsheets with custom internal applications tailored to your business workflows. From custom database tools and secure API endpoints to CRM structures and automated scheduling systems, we design software that saves hours of manual work. We prioritize clean architecture, strict security standards, automated testing, and detailed logging to ensure stability and reliability.",
  },
  {
    icon: "TrendingUp",
    title: "SEO & Digital Marketing",
    description: "Google rankings, Meta Ads, Google Ads, social media creatives, branding, and video editing — all in one place.",
    longDescription: "Grow your business with a complete digital presence strategy. From ranking on Google and running ad campaigns to creating engaging social media content, branding assets, and promotional videos, we help businesses attract customers and build trust online. Our team combines SEO, graphic design, video editing, and digital marketing into one streamlined growth system tailored for Indian businesses.",
  },
  {
    icon: "Palette",
    title: "Graphic Design",
    description: "Custom visual content, marketing brochures, presentation decks, and scale-ready export formats.",
  },
  {
    icon: "Fingerprint",
    title: "Brand Identity Design",
    description: "Distinct corporate voice, company branding marks, corporate styles, and guidelines.",
  },
  {
    icon: "Share2",
    title: "Social Media Design",
    description: "Professional custom post templates, banners, highlight covers, and profile kits.",
  },
  {
    icon: "Video",
    title: "Video Editing",
    description: "High-retention video cutting, color grading, subtitles, audio tuning, and ad creatives.",
  },
  {
    icon: "Zap",
    title: "Motion Graphics",
    description: "Animated explainers, logo reveals, custom visual transitions, and web animations.",
  },
  {
    icon: "Layout",
    title: "Product Visual Design",
    description: "Interactive wireframes, interface component libraries, and visual packaging blueprints.",
  },
  {
    icon: "Sparkles",
    title: "Marketing Creatives",
    description: "Ad creatives, email layouts, promotional banners, and click-through optimizations.",
  },
];

const PRINCIPLES = [
  "Experienced developers working directly on your project",
  "Built to scale as your business grows",
  "Weekly updates and transparent progress tracking",
  "Security, speed, and reliability built in from day one",
];

const cleanServiceData = (service) => {
  const title = service.title;
  let cleanTitle = title;
  let cleanDesc = service.description;

  if (title.toLowerCase().includes("web platform") || title.toLowerCase().includes("website") || title.toLowerCase().includes("web platform")) {
    cleanTitle = "Business Websites";
    cleanDesc = "High-performance websites that look premium, rank high on Google, and convert visitors into customers.";
  } else if (title.toLowerCase().includes("mobile product") || title.toLowerCase().includes("mobile app") || title.toLowerCase().includes("mobile product")) {
    cleanTitle = "Mobile Apps";
    cleanDesc = "Beautiful, fast Android and iOS mobile applications tailored for your customers and employees.";
  } else if (title.toLowerCase().includes("custom software") || title.toLowerCase().includes("operations") || title.toLowerCase().includes("custom software")) {
    cleanTitle = "Software for business operations";
    cleanDesc = "Bespoke internal systems, database management, and custom workflows to eliminate spreadsheets and save hours of manual work.";
  } else if (title.toLowerCase().includes("growth system") || title.toLowerCase().includes("seo") || title.toLowerCase().includes("marketing") || title.toLowerCase().includes("digital marketing")) {
    cleanTitle = "SEO & Digital Marketing";
    cleanDesc = "Google rankings, Meta Ads, Google Ads, social media creatives, branding, and video editing — all in one place.";
  }

  return {
    ...service,
    title: cleanTitle,
    description: cleanDesc,
  };
};

function SectionHeader({ eyebrow, title, description, action }) {
  return (
    <FadeIn className="mb-12 flex flex-col gap-6 md:mb-16 md:flex-row md:items-end md:justify-between text-left">
      <div className="max-w-2xl">
        <span className="section-tag mb-4">{eyebrow}</span>
        <h2 className="font-display text-3xl font-bold tracking-tight text-balance md:text-5xl">
          {title}
        </h2>
        {description && <p className="mt-4 max-w-xl text-xs sm:text-sm text-muted-foreground leading-relaxed">{description}</p>}
      </div>
      <div className="shrink-0">{action}</div>
    </FadeIn>
  );
}

export function ServicesSection() {
  const { data: servicesData } = useServices({ isActive: true });
  const [selectedService, setSelectedService] = useState(null);

  // Clean, unique-by-title, and slice to exactly the 4 main services for the home bento grid
  const services = (servicesData?.items?.length > 0 ? servicesData.items : SERVICES)
    .map(cleanServiceData)
    .filter((s, idx, self) => self.findIndex(x => x.title === s.title) === idx)
    .slice(0, 4);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setSelectedService(null);
      }
    };
    if (selectedService) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [selectedService]);

  return (
    <>
      <section className="py-20 md:py-28 relative overflow-hidden bg-mesh border-b border-border">
        <div className="container relative z-10 flex flex-col justify-center gap-6">
          <SectionHeader
            eyebrow="What we build"
            title="We take care of your digital needs."
            description="We combine custom interface design, reliable engineering, and launch execution into a single, experienced product team."
          />

          <FadeInStagger className="grid gap-6 grid-cols-1 lg:grid-cols-12 w-full">
            {services.map((service, idx) => {
              const Icon = Icons[service.icon] || Icons.HelpCircle;
              const colSpans = ["lg:col-span-7", "lg:col-span-5", "lg:col-span-5", "lg:col-span-7"];
              const colSpan = colSpans[idx] || "lg:col-span-6";

              return (
                <FadeInItem
                  key={service.id || service.title}
                  direction="scale"
                  className={cn("h-full", colSpan)}
                >
                  <div
                    onClick={() => setSelectedService(service)}
                    className="group relative block h-full rounded-[24px] border border-border/80 bg-[#FCFBF9] p-5 md:p-6 transition-all duration-350 hover:-translate-y-0.5 hover:border-primary/45 cursor-pointer text-left focus-within:ring-2 focus-within:ring-primary/40 hover:shadow-xl-soft flex flex-col justify-between overflow-hidden"
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        setSelectedService(service);
                      }
                    }}
                  >
                    {/* Subtle design SVG overlay pattern inside card */}
                    <div className="absolute inset-0 opacity-[0.02] group-hover:opacity-[0.04] transition-opacity pointer-events-none z-0">
                      <svg className="w-full h-full text-foreground" xmlns="http://www.w3.org/2000/svg">
                        <line x1="15%" y1="0" x2="15%" y2="100%" stroke="currentColor" strokeWidth="0.75" />
                        <line x1="85%" y1="0" x2="85%" y2="100%" stroke="currentColor" strokeWidth="0.75" />
                        <line x1="0" y1="30%" x2="100%" y2="30%" stroke="currentColor" strokeWidth="0.75" />
                        <line x1="0" y1="70%" x2="100%" y2="70%" stroke="currentColor" strokeWidth="0.75" />
                      </svg>
                    </div>

                    <div className="relative z-10 space-y-3">
                      {/* Inline Icon + Title Header Region */}
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#EEE7DD] text-primary transition-all duration-300 group-hover:bg-primary group-hover:text-primary-foreground">
                          <Icon className="h-4.5 w-4.5" />
                        </div>
                        <h3 className="font-display text-base md:text-lg font-bold text-foreground group-hover:text-primary transition-colors">{service.title}</h3>
                      </div>
                      <p className="text-xs md:text-sm leading-relaxed text-muted-foreground">{service.description}</p>
                    </div>

                    <div className="relative z-10 mt-6 pt-4 border-t border-border/40 flex items-center justify-between gap-2">
                      <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-primary">
                        Read details <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
                      </span>
                      <span className="text-[9px] font-bold text-stone-500 group-hover:text-primary transition-colors border border-border/80 rounded-full px-3 py-1 bg-white">
                        Learn More
                      </span>
                    </div>
                  </div>
                </FadeInItem>
              );
            })}
          </FadeInStagger>

          {/* Modal Popup for Service Details */}
          <AnimatePresence>
            {selectedService && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                {/* Backdrop Overlay */}
                <m.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setSelectedService(null)}
                  className="absolute inset-0 bg-background/80 backdrop-blur-sm"
                />

                {/* Modal Content Box */}
                <m.div
                  initial={{ opacity: 0, scale: 0.95, y: 15 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 15 }}
                  transition={{ duration: 0.25, ease: "easeOut" }}
                  className="relative w-full max-w-xl overflow-hidden rounded-[24px] border border-border bg-card p-6 md:p-8 shadow-2xl z-10"
                >
                  {/* Close Icon Button */}
                  <button
                    onClick={() => setSelectedService(null)}
                    className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-full bg-muted text-muted-foreground hover:text-foreground transition-colors border"
                    aria-label="Close modal"
                  >
                    <X className="h-4 w-4" />
                  </button>

                  {/* Icon/Logo inside popup */}
                  {(() => {
                    const SelectedIcon = Icons[selectedService.icon] || Icons.HelpCircle;
                    return (
                      <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-[#EEE7DD] text-primary">
                        <SelectedIcon className="h-6 w-6" />
                      </div>
                    );
                  })()}

                  {/* Title */}
                  <h3 className="font-display text-xl md:text-2xl font-bold tracking-tight text-foreground">
                    {selectedService.title}
                  </h3>

                  {/* Short description acts as Subtitle */}
                  <p className="mt-2 text-xs md:text-sm font-semibold text-primary uppercase tracking-wider">
                    {selectedService.description}
                  </p>

                  <div className="mt-4 border-t border-border/60 pt-4">
                    {/* Long description details */}
                    {selectedService.longDescription ? (
                      <p className="text-xs sm:text-sm leading-relaxed text-muted-foreground whitespace-pre-line">
                        {selectedService.longDescription}
                      </p>
                    ) : (
                      <p className="text-xs sm:text-sm leading-relaxed text-muted-foreground italic">
                        Full service capabilities analysis is currently being loaded. Please consult our expert developers for customization details.
                      </p>
                    )}
                  </div>

                  {/* Modal Action Footer */}
                  <div className="mt-6 flex justify-end gap-2 border-t border-border/60 pt-5">
                    <Button
                      variant="outline"
                      className="rounded-full px-5 text-xs h-9"
                      onClick={() => setSelectedService(null)}
                    >
                      Close Details
                    </Button>
                    <Button
                      className="rounded-full px-5 text-xs h-9 bg-primary hover:bg-[#5A3728] text-primary-foreground font-medium gap-1.5"
                      asChild
                    >
                      <Link to={publicRoutes.contact} onClick={() => setSelectedService(null)}>
                        Discuss Project <ArrowRight className="h-3 w-3" />
                      </Link>
                    </Button>
                  </div>
                </m.div>
              </div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* Operating Model / Principles Section */}
      <section className="relative overflow-hidden bg-[#EEE7DD]/20 py-20 md:py-28 border-y border-border bg-mesh">
        <div className="container relative z-10 grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <FadeIn>
            <span className="section-tag mb-4">How we work</span>
            <h2 className="font-display text-3xl font-bold tracking-tight text-balance md:text-5xl">
              Simple process. Direct results. No mystery in the middle.
            </h2>
            <p className="mt-5 text-xs sm:text-sm leading-relaxed text-muted-foreground">
              Working with us feels like adding senior team extensions rather than outsourcing: straightforward decisions, fast code reviews, and visible progress every single week.
            </p>
          </FadeIn>
          <FadeInStagger className="grid gap-3.5">
            {PRINCIPLES.map((principle, index) => (
              <FadeInItem key={principle}>
                <div className="flex items-center gap-4 rounded-xl border border-border bg-card p-4 hover:border-primary/20 transition-colors">
                  <span className="font-display text-xs font-semibold text-primary">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <p className="text-xs sm:text-sm font-semibold text-foreground">{principle}</p>
                </div>
              </FadeInItem>
            ))}
          </FadeInStagger>
        </div>
      </section>
    </>
  );
}
