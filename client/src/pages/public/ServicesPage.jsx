import { Link } from "react-router-dom";
import { m as motion } from "framer-motion";
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
  CheckCircle2,
  ArrowRight,
  HelpCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn, optimizeImageUrl } from "@/lib/utils";
import { publicRoutes } from "@/config/navigation";
import { FadeIn, SlideIn, ScaleIn } from "@/lib/motion";
import { useServices } from "@/features/services/useServices";
import { ServicesHeroDots, ServicesBlockDots } from "@/components/public/DotGridBackground";
import { useSeoMetadata } from "@/lib/seo";

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
  CheckCircle2,
  ArrowRight,
  HelpCircle,
};

// --- Static Fallback Data -----------------------------------------------------

const SERVICES_DETAIL = [
  {
    id: "web",
    title: "Business Websites",
    icon: "Globe",
    description:
      "We create high-performance websites and responsive web applications designed to convert visitors into customers. From custom landing pages to e-commerce storefronts, we engineer for speed, accessibility, and clean layouts. Our team optimizes loading times to ensure you capture every lead and rank high on search engines.",
    features: [
      "Custom responsive design for mobile, tablet, and desktop",
      "React, Next.js, and modern frontend technologies",
      "Robust Node.js and Express backend API layers",
      "Secure payment processing and checkout integration",
      "Performance optimization for lightning-fast speeds",
      "Structured SEO setup built in from day one",
    ],
    techs: ["React", "Next.js", "Node.js", "TypeScript", "PostgreSQL", "AWS"],
    imageUrl: "/services/business_websites.webp",
  },
  {
    id: "app",
    title: "Mobile Apps",
    icon: "Smartphone",
    description:
      "We build mobile applications that feel native, fast, and simple. We specialize in cross-platform systems using React Native and Flutter, delivering consistent features to Android and iOS devices without doubling timelines. We handle the entire lifecycle, from screens layout to App Store and Google Play launches.",
    features: [
      "Simultaneous iOS and Android application builds",
      "React Native and Flutter development",
      "Native device features and hardware integration",
      "Offline data synchronization architecture",
      "Google Play and Apple App Store launch support",
      "Structured support and performance monitoring",
    ],
    techs: ["Flutter", "React Native", "Firebase", "Dart", "Swift", "Kotlin"],
    imageUrl: "/services/mobile_apps.webp",
  },
  {
    id: "software",
    title: "Software for business operations",
    icon: "Code2",
    description:
      "Replace spreadsheets and paper forms with custom internal applications tailored to your business operations. We build client dashboards, database tools, CRM integrations, and software bridges to automate manual tasks and save hours of work every day. Our team designs software around your actual daily workflows.",
    features: [
      "Automation of repetitive business operations",
      "Custom CRMs, internal tools, and database systems",
      "External API design and software integration bridges",
      "Legacy database refactoring and clean data migrations",
      "Enterprise security standards and custom user roles",
      "Dockerized deployments and microservices setups",
    ],
    techs: ["Python", "Django", "Node.js", "PostgreSQL", "Redis", "Docker"],
    imageUrl: "/services/business_operations.webp",
  },
  {
    id: "marketing",
    title: "SEO & Digital Marketing",
    icon: "TrendingUp",
    description:
      "Grow your business with a complete digital presence strategy. From ranking on Google and running ad campaigns to creating engaging social media content, branding assets, and promotional videos, we help businesses attract customers and build trust online. Our team combines SEO, graphic design, video editing, and digital marketing into one streamlined growth system tailored for Indian businesses.",
    features: [
      "Technical Search Engine Optimization (SEO) to rank on Google",
      "High-converting landing page layouts and copywriting",
      "Structured social presence",
      "Professional social media post design and branding creatives",
      "Video editing for reels, advertisements, and promotional campaigns",
      "Graphic design services for digital and print media",
      "Meta Ads campaign setup and management",
      "Google Ads setup and optimization",
      "Instagram and Facebook marketing creatives",
      "Business branding assets and visual identity design",
      "Marketing creatives for festivals, offers, and campaigns",
    ],
    techs: ["Adobe Photoshop", "Adobe Illustrator", "Adobe Premiere Pro", "Meta Ads", "Google Ads", "Canva", "DaVinci Resolve", "Google Analytics", "Search Console"],
    imageUrl: "/services/seo_digital_marketing.webp",
  },
  {
    id: "graphic-design",
    title: "Graphic Design",
    icon: "Palette",
    description:
      "We design custom visual content that communicates clearly and elevates your brand. From marketing brochures to digital presentation decks, we produce high-end design assets tailored to your business needs.",
    features: [
      "Custom vector illustrations and print assets",
      "Digital presentation decks and PDF resources",
      "Consistent typography, grid layouts, and color balances",
      "Scale-ready export formats for print and digital channels",
    ],
    techs: ["Adobe Photoshop", "Adobe Illustrator", "Canva", "Figma"],
    imageUrl: "https://images.unsplash.com/photo-1626785774573-4b799315345d?q=80&w=800&auto=format&fit=crop",
  },
  {
    id: "brand-identity",
    title: "Brand Identity Design",
    icon: "Fingerprint",
    description:
      "Establish a premium visual standard for your company. We design distinct brand marks, custom logos, visual identity guidelines, and corporate color rules to build immediate trust with your audience.",
    features: [
      "Custom logo systems and company branding marks",
      "Typography styling guides and visual stylebooks",
      "Print-ready stationary, brochures, and asset packages",
      "Brand style guidelines for digital and web outputs",
    ],
    techs: ["Adobe Illustrator", "Adobe Photoshop", "Figma"],
    imageUrl: "https://images.unsplash.com/photo-1611532736597-de2d4265fba3?q=80&w=800&auto=format&fit=crop",
  },
  {
    id: "social-media-design",
    title: "Social Media Design",
    icon: "Share2",
    description:
      "Grow your online presence with professional custom templates and social media assets. We build profile layouts, highlight covers, and consistent post/story frameworks to make your channels look polished.",
    features: [
      "Custom social post and story design layouts",
      "Reusable layout templates for Instagram, LinkedIn, and YouTube",
      "High-contrast channel banners and profile configurations",
      "Optimized export structures for multiple social networks",
    ],
    techs: ["Canva", "Adobe Photoshop", "Adobe Illustrator", "Figma"],
    imageUrl: "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?q=80&w=800&auto=format&fit=crop",
  },
  {
    id: "video-editing",
    title: "Video Editing",
    icon: "Video",
    description:
      "Turn raw footage into premium, high-retention video assets. We edit and assemble video assets for social channels, internal communication, online course platforms, and marketing advertisements.",
    features: [
      "Precise multi-cam editing and pacing adjustments",
      "Professional color grading and sound corrections",
      "Subtitles, caption overlays, and dynamic visual hooks",
      "Optimized format configurations for YouTube, Reels, and ads",
    ],
    techs: ["Adobe Premiere Pro", "DaVinci Resolve", "After Effects"],
    imageUrl: "https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?q=80&w=800&auto=format&fit=crop",
  },
  {
    id: "motion-graphics",
    title: "Motion Graphics",
    icon: "Zap",
    description:
      "Animate your messages with premium visual animations. We create logo reveals, explainer video animations, dynamic web micro-interactions, and visual transitions that capture attention.",
    features: [
      "Dynamic logo animations and title screens",
      "Vector and character-based explainer motion frames",
      "Dynamic visual overlays and transitions for videos",
      "Interactive SVG micro-animations for web layouts",
    ],
    techs: ["After Effects", "Adobe Premiere Pro", "DaVinci Resolve"],
    imageUrl: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=800&auto=format&fit=crop",
  },
  {
    id: "product-visual-design",
    title: "Product Visual Design",
    icon: "Layout",
    description:
      "Visualize your digital product interfaces before writing code. We create interactive screen wireframes, packaging models, product screenshots, and polished UI previews to validate user experiences.",
    features: [
      "Interactive digital product wireframes and layout screens",
      "Packaging graphics and product container designs",
      "Clean UI mockups and visual interface components",
      "Consistent library components for fast product iterations",
    ],
    techs: ["Figma", "Adobe Illustrator", "Adobe Photoshop"],
    imageUrl: "https://images.unsplash.com/photo-1581291518633-83b4ebd1d83e?q=80&w=800&auto=format&fit=crop",
  },
  {
    id: "marketing-creatives",
    title: "Marketing Creatives",
    icon: "Sparkles",
    description:
      "Improve conversion rates with high-end, conversion-focused promotional assets. We design high-converting ad layouts, newsletter graphics, print banners, and direct mail visuals.",
    features: [
      "Custom ad creatives optimized for conversion metrics",
      "Newsletter layouts and structured email graphics",
      "Direct promo banners and marketing collateral assets",
      "Performance-tracking design revisions to boost click-throughs",
    ],
    techs: ["Figma", "Adobe Photoshop", "Adobe Illustrator", "Canva"],
    imageUrl: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?q=80&w=800&auto=format&fit=crop",
  },
];

// --- Page ---------------------------------------------------------------------

export function ServicesPage() {
  const { data: servicesData, isLoading } = useServices({ isActive: true });

  const dbServices = servicesData?.items ?? [];

  // Map database services if loaded, otherwise fallback to static default template
  const servicesList = dbServices.length > 0
    ? dbServices.map((service, index) => {
        let cleanTitle = service.title;
        let cleanDesc = service.longDescription || service.description;

        if (cleanTitle.toLowerCase().includes("web platform") || cleanTitle.toLowerCase().includes("website") || cleanTitle.toLowerCase().includes("web platform")) {
          cleanTitle = "Business Websites";
          cleanDesc = cleanDesc || "We create high-performance websites and responsive web applications designed to convert visitors into customers.";
        } else if (cleanTitle.toLowerCase().includes("mobile product") || cleanTitle.toLowerCase().includes("mobile app") || cleanTitle.toLowerCase().includes("mobile product")) {
          cleanTitle = "Mobile Apps";
          cleanDesc = cleanDesc || "We build mobile applications that feel native, fast, and simple.";
        } else if (cleanTitle.toLowerCase().includes("custom software") || cleanTitle.toLowerCase().includes("operations") || cleanTitle.toLowerCase().includes("custom software")) {
          cleanTitle = "Software for business operations";
          cleanDesc = cleanDesc || "Replace spreadsheets and paper forms with custom internal applications tailored to your business operations.";
        } else if (cleanTitle.toLowerCase().includes("growth system") || cleanTitle.toLowerCase().includes("seo") || cleanTitle.toLowerCase().includes("marketing") || cleanTitle.toLowerCase().includes("digital marketing")) {
          cleanTitle = "SEO & Digital Marketing";
          cleanDesc = cleanDesc || "Grow your business with a complete digital presence strategy — SEO, Meta & Google Ads, social media creatives, branding, graphic design, and video editing.";
        }

        const staticMatch = SERVICES_DETAIL.find(
          (s) => s.title.toLowerCase() === cleanTitle.toLowerCase()
        );

        return {
          id: service.id || `service-${index}`,
          title: cleanTitle,
          iconName: service.icon,
          description: cleanDesc,
          imageUrl: staticMatch?.imageUrl || service.imageUrl || "",
          features: staticMatch?.features || [
            `Custom deployment and integration of ${cleanTitle}`,
            `Optimized performance, speed, and scalability tuning`,
            `Robust security auditing and data encryption standards`,
            `Seamless third-party API integration and backend logic`,
            `Workflow automation and legacy system modernization`,
            `Comprehensive telemetry, monitoring, and support`,
          ],
          techs: staticMatch?.techs || ["React", "Node.js", "TypeScript", "SQL Database", "Cloud Hosting", "REST APIs"],
        };
      })
    : SERVICES_DETAIL.map((s) => ({
        id: s.id,
        title: s.title,
        iconName: s.icon,
        description: s.description,
        imageUrl: s.imageUrl || "",
        features: s.features,
        techs: s.techs,
      }));

  useSeoMetadata({ serviceItems: servicesList });

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <>
      {/* -- Hero -- */}
      <section
        className="relative border-b border-border bg-background overflow-hidden bg-mesh"
        style={{ paddingTop: "clamp(6.5rem, 10vw, 9rem)", paddingBottom: "clamp(3rem, 6vw, 5rem)" }}
      >
        {/* Soft patterns */}
        <div className="absolute inset-0 bg-grid-pattern bg-grid-sm opacity-[0.02] pointer-events-none" aria-hidden="true" />
        
        <ServicesHeroDots />
        <FadeIn className="container text-center relative z-10">
          <span className="section-tag mb-4 block w-fit mx-auto">Our Offerings</span>
          <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-bold text-foreground tracking-tight text-balance leading-tight">
            Consulting &amp; <span className="italic text-primary font-normal">Engineering</span>
          </h1>
          <p className="mt-6 text-xs sm:text-sm leading-relaxed text-muted-foreground max-w-xl mx-auto">
            Bespoke software consultancy. We deliver strategic clarity, high-end design, and robust codebases from inception to deployment.
          </p>
          {/* Anchor nav pills */}
          <div className="mt-8 flex flex-wrap justify-center gap-2">
            {servicesList.map((service) => (
              <a
                key={service.id}
                href={`#${service.id}`}
                className="rounded-full border border-border bg-card px-4 py-1.5 text-xs font-semibold text-muted-foreground hover:bg-primary hover:text-primary-foreground transition-all duration-200"
              >
                {service.title}
              </a>
            ))}
          </div>
        </FadeIn>
      </section>

      {/* -- Service Sections - alternating layout -- */}
      {servicesList.map((service, index) => {
        const isEven = index % 2 === 0;
        const ServiceIcon = Icons[service.iconName] || Icons.HelpCircle;

        const ContentBlock = (
          <SlideIn from={isEven ? "left" : "right"}>
            <h2 className="font-display text-3xl md:text-4xl font-bold tracking-tight mb-5 text-balance text-foreground">
              {service.title}
            </h2>
            <p className="text-xs leading-relaxed text-muted-foreground mb-8">
              {service.description}
            </p>

            {/* Feature list */}
            <ul className="space-y-3.5 mb-8">
              {service.features.map((feature) => (
                <li key={feature} className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded-full bg-[#EEE7DD] text-primary">
                    <CheckCircle2 className="h-3 w-3" />
                  </div>
                  <span className="text-xs text-muted-foreground leading-relaxed">{feature}</span>
                </li>
              ))}
            </ul>

            {/* Tech badges */}
            <div className="flex flex-wrap gap-1.5 mb-8">
              {service.techs.map((tech) => (
                <span
                  key={tech}
                  className="rounded-full border border-border bg-card px-3 py-1 text-[10px] font-semibold text-muted-foreground"
                >
                  {tech}
                </span>
              ))}
            </div>

            <Button className="h-10 rounded-full bg-primary hover:bg-[#5A3728] text-primary-foreground text-xs px-5 shadow-none border-none font-medium gap-1.5" asChild>
              <Link to={publicRoutes.contact}>
                Start {service.title} engagement
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </Button>
          </SlideIn>
        );

        const VisualBlock = (
          <ScaleIn delay={0.15} className="w-full">
            <div className="relative rounded-[20px] border border-border bg-card group/visual overflow-hidden" style={{ height: "clamp(18rem, 30vw, 24rem)" }}>
              {/* Background grid */}
              <div className="absolute inset-0 bg-grid-pattern bg-grid-sm opacity-[0.03] pointer-events-none z-10" aria-hidden="true" />

              {/* Service Visual Image */}
              {service.imageUrl ? (
                <img
                  src={optimizeImageUrl(service.imageUrl, 800)}
                  alt={service.title}
                  width="800"
                  height="480"
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover/visual:scale-105"
                  loading="lazy"
                />
              ) : (
                <div className="absolute inset-0 bg-muted flex items-center justify-center">
                  <ServiceIcon className="h-10 w-10 text-muted-foreground/40" />
                </div>
              )}

              {/* Soft overlay gradient for branding text legibility */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent pointer-events-none z-10" />
            </div>
          </ScaleIn>
        );

        return (
          <section
            key={service.id}
            id={service.id}
            className={cn("relative overflow-hidden border-b border-border", index % 2 === 1 ? "bg-card" : "bg-background")}
            style={{ paddingBlock: "var(--space-section)" }}
          >
            <ServicesBlockDots isEven={isEven} />
            <div className="container relative z-10">
              <div className="flex flex-col items-center justify-between gap-10 lg:flex-row lg:gap-16">
                {isEven ? (
                  <>
                    <div className="flex w-full flex-col justify-center lg:w-[55%]">
                      {ContentBlock}
                    </div>
                    <div className="flex w-full flex-col justify-center lg:w-[45%]">
                      {VisualBlock}
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex w-full flex-col justify-center lg:w-[45%]">
                      {VisualBlock}
                    </div>
                    <div className="flex w-full flex-col justify-center lg:w-[55%]">
                      {ContentBlock}
                    </div>
                  </>
                )}
              </div>
            </div>
          </section>
        );
      })}

      {/* -- CTA -- */}
      <section className="bg-background" style={{ paddingBlock: "var(--space-section)" }}>
        <div className="container">
          <FadeIn className="overflow-hidden rounded-[20px] border border-[#4A4038] bg-dark-surface text-[#F6F2EC] text-center p-10 md:p-16">
            <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#BFA27A]/20 bg-[#BFA27A]/5 px-3.5 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-[#BFA27A] mx-auto w-fit">
              Get Started
            </span>
            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-5 tracking-tight text-balance">
              Not sure which service you need?
            </h2>
            <p className="text-xs sm:text-sm text-stone-300 max-w-lg mx-auto mb-10 leading-relaxed">
              We look at your problems holistically. Let's run a discovery session to align your business goals and configure the ideal roadmap.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button size="lg" className="h-11 rounded-full bg-primary hover:bg-[#5A3728] text-primary-foreground font-medium px-8 border-none shadow-none text-sm w-full sm:w-auto" asChild>
                <Link to={publicRoutes.contact}>Book a Free Consultation</Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="h-11 rounded-full border-[#4A4038] bg-transparent text-white hover:bg-[#4A4038] font-medium px-8 text-sm w-full sm:w-auto"
                asChild
              >
                <Link to={publicRoutes.portfolio}>
                  See Our Work <ArrowRight className="ml-1 h-3.5 w-3.5" />
                </Link>
              </Button>
            </div>
          </FadeIn>
        </div>
      </section>
    </>
  );
}
