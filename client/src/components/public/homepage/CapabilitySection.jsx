import {
  Globe,
  Code2,
  Sparkles,
  Cloud,
  Layers3,
  Database,
  Palette,
  HelpCircle,
  Smartphone,
  TrendingUp,
  Brush,
  Video,
  Settings,
  Server,
  ShoppingBag,
  Info,
} from "lucide-react";
import { cn } from "@/lib/utils";

const Icons = {
  Globe,
  Code2,
  Sparkles,
  Cloud,
  Layers3,
  Database,
  Palette,
  HelpCircle,
  Smartphone,
  TrendingUp,
  Brush,
  Video,
  Settings,
  Server,
  ShoppingBag,
  Info,
};

export function CapabilitySection() {
  const leftServices = [
    { title: "Business Websites", icon: "Globe", techs: ["React", "Next.js", "Node.js", "Tailwind CSS"] },
    { title: "Custom Software", icon: "Code2", techs: ["MongoDB", "Express", "APIs", "Automation"] },
    { title: "AI Solutions", icon: "Sparkles", techs: ["OpenAI", "RAG", "LangChain", "Vector Search"] },
    { title: "Cloud & DevOps", icon: "Cloud", techs: ["AWS", "Docker", "CI/CD", "Kubernetes"] },
    { title: "ERP, CRM & CMS", icon: "Layers3", techs: ["Odoo", "Zoho", "HubSpot", "Custom ERP"] },
    { title: "Database Solutions", icon: "Database", techs: ["MongoDB", "PostgreSQL", "MySQL", "Redis"] },
    { title: "UI/UX Design", icon: "Palette", techs: ["Figma", "Adobe XD", "Prototyping", "Wireframing"] }
  ];

  const rightServices = [
    { title: "Mobile Applications", icon: "Smartphone", techs: ["Flutter", "React Native", "Android", "iOS"] },
    { title: "SEO & Digital Marketing", icon: "TrendingUp", techs: ["Meta Ads", "Google Ads", "Search Console", "Analytics"] },
    { title: "Graphic Design", icon: "Brush", techs: ["Illustrator", "Photoshop", "Canva", "Branding"] },
    { title: "Video Editing", icon: "Video", techs: ["Premiere Pro", "DaVinci Resolve", "After Effects", "Motion Graphics"] },
    { title: "CMS Development", icon: "Settings", techs: ["WordPress", "Headless CMS", "REST API", "Strapi"] },
    { title: "Backend & APIs", icon: "Server", techs: ["Spring Boot", "Microservices", "Kafka", "GraphQL"] },
    { title: "E-Commerce Development", icon: "ShoppingBag", techs: ["WooCommerce", "Shopify", "Stripe", "Razorpay"] }
  ];

  // Double lists for seamless looping
  const leftList = [...leftServices, ...leftServices];
  const rightList = [...rightServices, ...rightServices];

  return (
    <div className="relative w-full h-[360px] sm:h-[400px] lg:h-[540px] lg:w-[580px] mx-auto flex flex-col justify-between overflow-hidden rounded-[28px] border border-[#C5B39C] bg-[#FCFBF9] p-5 shadow-[0_12px_40px_rgba(28,22,18,0.08)]">
      {/* Header of Marquee */}
      <div className="flex items-center justify-between border-b border-[#E8E2D9] pb-3.5 mb-3.5 z-10 bg-transparent shrink-0">
        <div className="flex items-center gap-1.5">
          <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
          <h4 className="font-display text-[10px] sm:text-xs font-bold text-[#1C1612] uppercase tracking-wider">Our Capabilities</h4>
        </div>
        <span className="text-[9px] font-bold text-[#3E332B] bg-[#F5EFE6] rounded-full px-3 py-1 border border-[#D8CFC4] tracking-tight">
          9 Services • 25+ Techs
        </span>
      </div>

      {/* Mask fade overlay */}
      <div
        className="relative flex-1 grid grid-cols-2 gap-4 overflow-hidden z-10 pause-on-hover"
        style={{
          maskImage: "linear-gradient(to bottom, transparent, white 8%, white 92%, transparent)",
          WebkitMaskImage: "linear-gradient(to bottom, transparent, white 8%, white 92%, transparent)"
        }}
      >
        {/* Left column - scrolls UP */}
        <div className="flex flex-col gap-4 animate-scroll-up">
          {leftList.map((s, idx) => {
            const Icon = Icons[s.icon] || Icons.HelpCircle;
            return (
              <div key={`l-${idx}`} className="flex flex-col gap-2 p-4 rounded-2xl border border-[#E8E2D9] bg-white shadow-[0_3px_15px_rgba(62,51,43,0.04)] hover:-translate-y-0.5 hover:shadow-[0_12px_24px_rgba(62,51,43,0.08)] hover:border-[#C5B39C] transition-all duration-300">
                <div className="flex items-center gap-3">
                  <div className="flex h-9.5 w-9.5 shrink-0 items-center justify-center rounded-xl bg-[#FAF8F5] border border-[#E8E2D9] text-primary">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h5 className="font-display text-xs sm:text-sm font-bold text-[#1C1612] leading-tight break-normal">{s.title}</h5>
                </div>
                {/* Container query chips wrapper */}
                <div className="flex flex-wrap gap-1.5 mt-1.5 capability-chips-wrapper">
                  {s.techs.map((t, tIdx) => (
                    <span
                      key={t}
                      className={cn(
                        "text-[7.5px] sm:text-[8.5px] font-bold px-2 py-0.5 rounded-md bg-[#FAF8F5] text-[#3E332B] border border-[#E8E2D9] tracking-tight truncate capability-chip",
                        tIdx === 2 && "hidden sm:inline-flex",
                        tIdx === 3 && "hidden lg:inline-flex"
                      )}
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Right column - scrolls DOWN */}
        <div className="flex flex-col gap-4 animate-scroll-down">
          {rightList.map((s, idx) => {
            const Icon = Icons[s.icon] || Icons.HelpCircle;
            return (
              <div key={`r-${idx}`} className="flex flex-col gap-2 p-4 rounded-2xl border border-[#E8E2D9] bg-white shadow-[0_3px_15px_rgba(62,51,43,0.04)] hover:-translate-y-0.5 hover:shadow-[0_12px_24px_rgba(62,51,43,0.08)] hover:border-[#C5B39C] transition-all duration-300">
                <div className="flex items-center gap-3">
                  <div className="flex h-9.5 w-9.5 shrink-0 items-center justify-center rounded-xl bg-[#FAF8F5] border border-[#E8E2D9] text-primary">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h5 className="font-display text-xs sm:text-sm font-bold text-[#1C1612] leading-tight break-normal">{s.title}</h5>
                </div>
                {/* Container query chips wrapper */}
                <div className="flex flex-wrap gap-1.5 mt-1.5 capability-chips-wrapper">
                  {s.techs.map((t, tIdx) => (
                    <span
                      key={t}
                      className={cn(
                        "text-[7.5px] sm:text-[8.5px] font-bold px-2 py-0.5 rounded-md bg-[#FAF8F5] text-[#3E332B] border border-[#E8E2D9] tracking-tight truncate capability-chip",
                        tIdx === 2 && "hidden sm:inline-flex",
                        tIdx === 3 && "hidden lg:inline-flex"
                      )}
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer of Marquee */}
      <div className="flex items-center justify-center border-t border-[#E8E2D9] pt-3.5 mt-3 z-10 bg-transparent shrink-0">
        <span className="text-[10px] font-bold text-[#3E332B] uppercase tracking-wider flex items-center gap-1.5">
          <Info className="h-3.5 w-3.5 text-primary shrink-0 animate-pulse" />
          Hover to pause · 25+ technologies across all services
        </span>
      </div>
    </div>
  );
}
